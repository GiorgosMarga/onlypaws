package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/onlypaws/internal/domain"
	httphandler "github.com/onlypaws/internal/infrastructure/http"
	"github.com/onlypaws/internal/infrastructure/repository"
	"github.com/onlypaws/internal/service"
	"github.com/onlypaws/internal/utils"
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
	flag.StringVar(&cfg.db.uri, "DB_URI", utils.MustGetEnv("ONLYPAWS_DB_URI"), "DB URI")
	flag.StringVar(&cfg.addr, "ADDR", utils.GetEnv("ADDR", "3000"), "API port")
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
			Addr:              fmt.Sprintf(":%s", cfg.addr),
			ReadHeaderTimeout: 5 * time.Second,
			WriteTimeout:      30 * time.Second,
			ReadTimeout:       15 * time.Second,
			IdleTimeout:       60 * time.Second,
		},
	}
	app.registerHandlers()

	log.Printf("API is listening on port: %s\n", app.server.Addr)
	log.Fatal(app.server.ListenAndServe())
}

func (app *app) registerHandlers() {
	mux := &http.ServeMux{}
	httphandler.RegisterUserHandlers(mux, app.userService)
	app.server.Handler = mux
}
