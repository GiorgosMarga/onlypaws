package domain

import (
	"context"
	"time"
)

type ProfileModel struct {
	UserId      string    `json:"user_id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	PfpUrl      string    `json:"pfp_url"`
	Bio         string    `json:"bio"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   time.Time `json:"deleted_at"`
}

type CreateProfileParams struct {
	UserId   string `json:"user_id"`
	Username string `json:"username"`
	Bio      string `json:"bio"`
	Location string `json:"location"`
}
type UpdateProfileParams struct {
	Username    *string `json:"username"`
	Bio         *string `json:"bio"`
	Location    *string `json:"location"`
	DisplayName *string `json:"display_name"`
}
type ProfileRepository interface {
	CreateProfile(context.Context, *ProfileModel) error
	UpdateProfile(context.Context, *ProfileModel) error
	DeleteProfile(context.Context, string) error
	GetProfile(context.Context, string) (*ProfileModel, error)
	GetProfiles(context.Context) ([]*ProfileModel, error)
}

type ProfileService interface {
	CreateProfile(context.Context, *CreateProfileParams) error
	UpdateProfile(context.Context, *UpdateProfileParams) error
	DeleteProfile(context.Context, string) error
	GetProfile(context.Context, string) (*ProfileModel, error)
	GetProfiles(context.Context) ([]*ProfileModel, error)
}
