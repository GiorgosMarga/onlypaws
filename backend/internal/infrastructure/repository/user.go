package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/onlypaws/internal/domain"
)

type UsersRepo struct {
	db *sql.DB
}

func NewUsersRepo(db *sql.DB) *UsersRepo {
	return &UsersRepo{
		db: db,
	}
}

func (r *UsersRepo) CreateUser(ctx context.Context, user *domain.UserModel) error {
	query := `INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id`

	args := []any{
		user.Email,
		user.PasswordHash,
	}

	return r.db.QueryRowContext(ctx, query, args...).Scan(&user.Id)
}
func (r *UsersRepo) GetUserByEmail(ctx context.Context, email string) (*domain.UserModel, error) {
	query := `SELECT id, email, password_hash, role, is_banned FROM users WHERE email = $1`
	args := []any{
		email,
	}
	user := &domain.UserModel{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&user.Id, &user.Email, &user.PasswordHash, &user.Role, &user.IsBanned)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, domain.ErrNotFound
		default:
			return nil, err
		}
	}
	return user, nil
}
func (r *UsersRepo) GetUserById(ctx context.Context, id string) (*domain.UserModel, error) {
	query := `SELECT id, email, password_hash, role, is_banned FROM users WHERE id = $1`
	args := []any{
		id,
	}
	user := &domain.UserModel{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&user.Id, &user.Email, &user.PasswordHash, &user.Role, &user.IsBanned)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, domain.ErrNotFound
		default:
			return nil, err
		}
	}
	return user, nil
}
func (r *UsersRepo) DeleteUser(ctx context.Context, id string) error {
	query := `UPDATE users SET deleted_at = NOW() WHERE id=$1`
	args := []any{
		id,
	}
	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}
func (r *UsersRepo) GetUsers(ctx context.Context) ([]*domain.UserModel, error) {
	query := `SELECT id, email, password_hash, role, is_banned FROM users`
	users := make([]*domain.UserModel, 0)
	cursor, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for cursor.Next() {
		user := &domain.UserModel{}
		if err := cursor.Scan(&user.Id, &user.Email, &user.PasswordHash, &user.Role, &user.IsBanned); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
func (r *UsersRepo) UpdateUser(ctx context.Context, user *domain.UserModel) error {
	query := `UPDATE users SET email = $1 AND password_hash=$2 AND updated_at=NOW()  WHERE id=$3`
	args := []any{
		user.Email,
		user.PasswordHash,
	}
	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}
