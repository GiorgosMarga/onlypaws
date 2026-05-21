package domain

import (
	"context"
	"errors"
	"time"
)

var (
	ErrEmailExists        error = errors.New("email already exists")
	ErrInvalidCredentials error = errors.New("invalid credentials")
	ErrNotFound           error = errors.New("entity not found")
)

// used in authentication middleware
type ContextKey string
const ContextUserKey ContextKey = "user"

type Role string

const (
	RoleUser  Role = "USER"
	RoleAdmin Role = "ADMIN"
)

type UserModel struct {
	Id           string `json:"id,omitempty"`
	PasswordHash string `json:"password_hash,omitempty"`
	Email        string `json:"email"`
	Role         Role   `json:"role"`
	IsBanned     bool   `json:"is_banned"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt time.Time `json:"deleted_at"`
}
type AuthedUser struct {
	Id       string `json:"id"`
	Email    string `json:"email"`
	Role     Role   `json:"role"`
	IsBanned bool   `json:"is_banned"`
}
type UserCreateParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type UserLoginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type UserUpdateParams struct {
	Password *string `json:"password"`
}

type UserRepository interface {
	CreateUser(context.Context, *UserModel) error
	GetUserByEmail(context.Context, string) (*UserModel, error)
	GetUserById(context.Context, string) (*UserModel, error)
	DeleteUser(context.Context, string) error
	GetUsers(context.Context) ([]*UserModel, error)
	UpdateUser(context.Context, *UserModel) error
}

type UserService interface {
	RegisterUser(context.Context, *UserCreateParams) (*UserModel, error)
	LoginUser(context.Context, *UserLoginParams) (*UserModel, error)

	GetUser(context.Context, string) (*UserModel, error)
	GetUsers(context.Context) ([]*UserModel, error)
	UpdatePassword(context.Context, string, *UserUpdateParams) error
	DeleteUser(context.Context, string) error
}
