package domain

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidTokenType = errors.New("invalid token type")
	ErrInvalidToken     = errors.New("invalid token")
	ErrInvalidClaims    = errors.New("invalid claims")
	ErrExpiredToken     = errors.New("expired token")
	ErrTokenRevoked     = errors.New("revoked token")
)

type CustomClaims struct {
	jwt.RegisteredClaims
	AuthedUser
	TokenType string
}

type TokenConfig struct {
	Issuer             string
	Audience           jwt.ClaimStrings
	AccessTokenSecret  []byte
	RefreshTokenSecret []byte
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
}

type RefreshToken struct {
	Id        string
	UserId    string
	ExpiresAt time.Time
	IsRevoked bool
	CreatedAt time.Time
}
type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type TokenRepository interface {
	StoreRefreshToken(ctx context.Context, tokenId, userId string, expiresAt time.Time) error
	GetRefreshToken(ctx context.Context, tokenId string) (*RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, tokenId string) error
	RevokeAllUserTokens(ctx context.Context, userId string) error
}

type TokenService interface {
	GenerateAccessToken(ctx context.Context, user *UserModel) (string, error)
	GenerateRefreshToken(ctx context.Context, userId string) (string, error)
	GenerateTokenPair(ctx context.Context, user *UserModel) (*TokenPair, error)
	ValidateAccessToken(ctx context.Context, tokenString string) (*CustomClaims, error)
}
