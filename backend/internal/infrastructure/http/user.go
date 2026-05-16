package httphandler

import (
	"errors"
	"net/http"

	"github.com/onlypaws/internal/domain"
	httperrors "github.com/onlypaws/internal/errors"
	"github.com/onlypaws/internal/utils"
)

type userHandler struct {
	srv domain.UserService
}

func RegisterUserHandlers(mux *http.ServeMux, srv domain.UserService) {
	userHandler := userHandler{srv: srv}
	mux.HandleFunc("POST /api/v1/users/register", userHandler.registerUserHandler)
	mux.HandleFunc("POST /api/v1/users/login", userHandler.loginUserHandler)
}

func (h *userHandler) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	registerBody := &domain.UserCreateParams{}
	if err := utils.ReadJSON(r, &registerBody); err != nil {
		httperrors.BadRequestError(r, w, err)
		return
	}

	user, err := h.srv.RegisterUser(r.Context(), registerBody)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrEmailExists):
			httperrors.BadRequestError(r, w, err)
		default:
			httperrors.InternalServerError(r, w, err)
		}
		return
	}
	utils.WriteSuccess(w, http.StatusCreated, user)
}

func (h *userHandler) loginUserHandler(w http.ResponseWriter, r *http.Request) {
	body := &domain.UserLoginParams{}
	if err := utils.ReadJSON(r, &body); err != nil {
		httperrors.BadRequestError(r, w, err)
		return
	}

	user, err := h.srv.LoginUser(r.Context(), body)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidCredentials):
			httperrors.BadRequestError(r, w, err)
		default:
			httperrors.InternalServerError(r, w, err)
		}
		return
	}
	utils.WriteSuccess(w, http.StatusOK, user)
}
