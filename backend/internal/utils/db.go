package utils

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

type DBConfig struct {
	MaxIdleTime  time.Duration
	MaxLifeTime  time.Duration
	MaxIdleConns int
	MaxOpenConns int
}

func ConnectDB(ctx context.Context, uri string, cfg DBConfig) (*sql.DB, error) {
	db, err := sql.Open("postgres", uri)
	if err != nil {
		return nil, err
	}

	if cfg.MaxIdleConns > 0 {
		db.SetConnMaxIdleTime(cfg.MaxIdleTime)
	}
	if cfg.MaxLifeTime > 0 {
		db.SetConnMaxLifetime(cfg.MaxIdleTime)
	}
	if cfg.MaxIdleConns > 0 {
		db.SetMaxIdleConns(cfg.MaxIdleConns)
	}

	if cfg.MaxOpenConns > 0 {
		db.SetMaxOpenConns(cfg.MaxOpenConns)
	}
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}
