package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/onlypaws/internal/domain"
)

type ProfileRepository struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) *ProfileRepository {
	return &ProfileRepository{
		db: db,
	}
}

func (r *ProfileRepository) CreateProfile(ctx context.Context, profile *domain.ProfileModel) error {
	query := `INSERT INTO profiles(user_id,username,display_name,bio,location) VALUES($1,$2,$3,$4,$5)`
	args := []any{
		profile.UserId,
		profile.Username,
		profile.Username, // when creating the account the display_name is the same as the username. Later the user can change this.
		profile.Bio,
		profile.Location,
	}

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}
	return nil
}
func (r *ProfileRepository) UpdateProfile(ctx context.Context, profile *domain.ProfileModel) error {
	query := `UPDATE profiles SET username=$1 , display_name=$2 , bio=$3 , location=$4, updated_at=NOW() WHERE user_id=$5`
	args := []any{
		profile.Username,
		profile.DisplayName, // when creating the account the display_name is the same as the username. Later the user can change this.
		profile.Bio,
		profile.Location,
		profile.UserId,
	}

	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	affectedRows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if affectedRows == 0 {
		return domain.ErrNotFound
	}
	return nil
}
func (r *ProfileRepository) DeleteProfile(ctx context.Context, profileId string) error {
	query := `UPDATE profiles SET deleted_at=NOW() WHERE user_id=$1`
	args := []any{
		profileId,
	}
	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	affectedRows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if affectedRows == 0 {
		return domain.ErrNotFound
	}
	return nil
}
func (r *ProfileRepository) GetProfile(ctx context.Context, profileId string) (*domain.ProfileModel, error) {
	query := `SELECT user_id,username,display_name,bio,location,pfp_url FROM profiles WHERE user_id=$1`
	args := []any{
		profileId,
	}

	profile := &domain.ProfileModel{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&profile.UserId, &profile.Username, &profile.DisplayName, &profile.Bio, &profile.Location, &profile.PfpUrl)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, domain.ErrNotFound
		default:
			return nil, err
		}
	}
	return profile, nil
}

// TODO: add query params
func (r *ProfileRepository) GetProfiles(ctx context.Context) ([]*domain.ProfileModel, error) {
	query := `SELECT user_id,username,display_name,bio,location,pfp_url FROM profiles`

	cursor, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	profiles := make([]*domain.ProfileModel, 0)
	for cursor.Next() {
		profile := &domain.ProfileModel{}
		if err := cursor.Scan(&profile.UserId, &profile.Username, &profile.DisplayName, &profile.Bio, &profile.Location, &profile.PfpUrl); err != nil {
			return nil, err
		}
		profiles = append(profiles, profile)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return profiles, nil
}
