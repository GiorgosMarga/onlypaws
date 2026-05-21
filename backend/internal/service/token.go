package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/onlypaws/internal/domain"
)

// TODO: PASS AUTHED user and not user model (probably rename authuser to something else)

type TokenService struct {
	db  domain.TokenRepository
	cfg *domain.TokenConfig
}

func NewTokenService(db domain.TokenRepository, cfg *domain.TokenConfig) *TokenService {
	return &TokenService{
		db:  db,
		cfg: cfg,
	}
}

func (s *TokenService) GenerateAccessToken(ctx context.Context, user *domain.UserModel) (string, error) {
	tokenId := uuid.New().String()
	now := time.Now()
	claims := domain.CustomClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        tokenId,
			Subject:   user.Id,
			Issuer:    s.cfg.Issuer,
			Audience:  s.cfg.Audience,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.AccessTokenTTL)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
		},
		AuthedUser: domain.AuthedUser{
			Id:       user.Id,
			Email:    user.Email,
			Role:     user.Role,
			IsBanned: user.IsBanned,
		},
		TokenType: "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.cfg.AccessTokenSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}
	return signedToken, nil
}
func (s *TokenService) GenerateRefreshToken(ctx context.Context, userId string) (string, error) {
	tokenId := uuid.New().String()
	now := time.Now()
	expiresAt := now.Add(s.cfg.RefreshTokenTTL) // seven days
	claims := domain.CustomClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        tokenId,
			Subject:   userId,
			Issuer:    s.cfg.Issuer,
			Audience:  s.cfg.Audience,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.RefreshTokenTTL)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
		},
		AuthedUser: domain.AuthedUser{
			Id: userId,
		},
		TokenType: "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.cfg.RefreshTokenSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}

	if err := s.db.StoreRefreshToken(ctx, signedToken, userId, expiresAt); err != nil {
		return "", err
	}

	return signedToken, nil
}
func (s *TokenService) GenerateTokenPair(ctx context.Context, user *domain.UserModel) (*domain.TokenPair, error) {

	accessToken, err := s.GenerateAccessToken(ctx, user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.GenerateRefreshToken(ctx, user.Id)
	if err != nil {
		return nil, err
	}

	return &domain.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(s.cfg.AccessTokenTTL),
	}, nil
}

func (s *TokenService) ValidateAccessToken(ctx context.Context, tokenString string) (*domain.CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &domain.CustomClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.cfg.AccessTokenSecret, nil
	},
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithIssuer(s.cfg.Issuer),
		jwt.WithAudience(s.cfg.Audience...),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, domain.ErrExpiredToken
		}
		return nil, err
	}

	claims, ok := token.Claims.(*domain.CustomClaims)
	if !ok || !token.Valid {
		return nil, domain.ErrInvalidClaims
	}

	if claims.TokenType != "access" {
		return nil, domain.ErrInvalidTokenType
	}

	return claims, nil
}

func (s *TokenService) RefreshTokens(ctx context.Context, refreshTokenString string, user *domain.UserModel) (*domain.TokenPair, error) {
	token, err := jwt.ParseWithClaims(refreshTokenString, &domain.CustomClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.cfg.RefreshTokenSecret, nil
	},
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithIssuer(s.cfg.Issuer),
		jwt.WithAudience(s.cfg.Audience[0]),
		jwt.WithExpirationRequired())

	if err != nil {
		return nil, fmt.Errorf("%w: %v", domain.ErrInvalidToken, err)
	}
	claims, ok := token.Claims.(*domain.CustomClaims)
	if !ok || !token.Valid {
		return nil, domain.ErrInvalidClaims
	}
	if claims.TokenType != "refresh" {
		return nil, domain.ErrInvalidTokenType
	}

	storedToken, err := s.db.GetRefreshToken(ctx, claims.ID)
	if err != nil {
		return nil, err
	}
	if storedToken.IsRevoked {
		_ = s.db.RevokeAllUserTokens(ctx, claims.AuthedUser.Id)
		return nil, domain.ErrTokenRevoked
	}

	if err := s.db.RevokeRefreshToken(ctx, claims.ID); err != nil {
		return nil, fmt.Errorf("failed to revoke old refresh token: %w", err)
	}
	return s.GenerateTokenPair(ctx, &domain.UserModel{
		Id: claims.AuthedUser.Id,
	})
}
