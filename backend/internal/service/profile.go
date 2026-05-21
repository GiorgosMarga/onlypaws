package service

import (
	"context"

	"github.com/onlypaws/internal/domain"
)

type ProfileService struct {
	db domain.ProfileRepository
}

func NewProfileService(db domain.ProfileRepository) *ProfileService {
	return &ProfileService{
		db: db,
	}
}

func (s *ProfileService) CreateProfile(ctx context.Context, params *domain.CreateProfileParams) error {
	profile := &domain.ProfileModel{
		UserId:   params.UserId,
		Username: params.Username,
		Bio:      params.Bio,
		Location: params.Location,
	}
	return s.db.CreateProfile(ctx, profile)
}
func (s *ProfileService) UpdateProfile(ctx context.Context, profileId string, params *domain.UpdateProfileParams) (*domain.ProfileModel, error) {
	profile, err := s.db.GetProfile(ctx, profileId)
	if err != nil {
		return nil, err
	}
	if params.Bio != nil {
		profile.Bio = *params.Bio
	}
	if params.Location != nil {
		profile.Location = *params.Location
	}
	if params.Username != nil {
		profile.Username = *params.Username
	}
	if params.DisplayName != nil {
		profile.DisplayName = *params.DisplayName
	}
	return profile, s.db.UpdateProfile(ctx, profile)
}
func (s *ProfileService) DeleteProfile(ctx context.Context, profileId string) error {
	return s.db.DeleteProfile(ctx, profileId)
}
func (s *ProfileService) GetProfile(ctx context.Context, profileId string) (*domain.ProfileModel, error) {
	return s.db.GetProfile(ctx, profileId)
}
func (s *ProfileService) GetProfiles(ctx context.Context) ([]*domain.ProfileModel, error) {
	return s.db.GetProfiles(ctx)
}
