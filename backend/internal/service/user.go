package service

import (
	"context"

	"github.com/onlypaws/backend/internal/domain"
	"github.com/onlypaws/backend/internal/utils"
)

type UserService struct {
	repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

func (s *UserService) RegisterUser(ctx context.Context, params *domain.UserCreateParams) (*domain.UserModel, error) {

	hashedPassword, err := utils.HashPassword(params.Password)
	if err != nil {
		return nil, err
	}
	user := &domain.UserModel{
		PasswordHash: hashedPassword,
		Email:        params.Email,
	}
	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}
func (s *UserService) LoginUser(ctx context.Context, params *domain.UserLoginParams) (*domain.UserModel, error) {
	user, err := s.repo.GetUserByEmail(ctx, params.Email)
	if err != nil {
		return nil, err
	}

	if !utils.CheckPasswordHash(params.Password, user.PasswordHash) {
		return nil, domain.ErrInvalidCredentials
	}

	// clear password
	user.PasswordHash = ""
	return user, nil
}

func (s *UserService) GetUser(ctx context.Context, id string) (*domain.UserModel, error) {
	return s.repo.GetUserById(ctx, id)
}
func (s *UserService) GetUsers(ctx context.Context) ([]*domain.UserModel, error) {
	return s.repo.GetUsers(ctx)
}
func (s *UserService) UpdatePassword(ctx context.Context, id string, params *domain.UserUpdateParams) error {
	user, err := s.repo.GetUserById(ctx, id)
	if err != nil {
		return err
	}

	newPasswordHash, err := utils.HashPassword(*params.Password)
	if err != nil {
		return err
	}

	user.PasswordHash = newPasswordHash
	// TODO: change this
	return s.repo.UpdateUser(ctx, user)
}

func (s *UserService) DeleteUser(ctx context.Context, id string) error {
	return s.repo.DeleteUser(ctx, id)
}
