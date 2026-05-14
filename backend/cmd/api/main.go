package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"time"

	"github.com/onlypaws/backend/internal/domain"
	httphandler "github.com/onlypaws/backend/internal/infrastructure/http"
	"github.com/onlypaws/backend/internal/infrastructure/repository"
	"github.com/onlypaws/backend/internal/service"
	"github.com/onlypaws/backend/internal/utils"
)

type app struct {
	userService domain.UserService
	server      http.Server
}

type config struct {
	db struct {
		uri            string
		maxConnections int
	}
	addr string
}

func main() {
	cfg := config{}
	flag.StringVar(&cfg.db.uri, "DB_URI", utils.MustGetEnv("DB_URI"), "DB URI")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := utils.ConnectDB(ctx, cfg.db.uri, utils.DBConfig{})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	log.Println("Connected to DB...")

	userRepository := repository.NewUsersRepo(db)

	app := app{
		userService: service.NewUserService(userRepository),
		server: http.Server{
			Addr:              cfg.addr,
			Handler:           &http.ServeMux{},
			ReadHeaderTimeout: 5 * time.Second,
			WriteTimeout:      30 * time.Second,
			ReadTimeout:       15 * time.Second,
			IdleTimeout:       60 * time.Second,
		},
	}
	app.registerHandlers()

	log.Printf("API is listening on port: %s\n", app.server.Addr)
	app.server.ListenAndServe()
}

func (app *app) registerHandlers() {
	mux := &http.ServeMux{}
	httphandler.RegisterUserHandlers(mux, app.userService)
	app.server.Handler = mux
}
