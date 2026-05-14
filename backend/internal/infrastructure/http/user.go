package httphandler

import (
	"errors"
	"net/http"

	"github.com/onlypaws/backend/internal/domain"
	"github.com/onlypaws/backend/internal/utils"
)

type userHandler struct {
	srv domain.UserService
}

func RegisterUserHandlers(mux *http.ServeMux, srv domain.UserService) {
	userHandler := userHandler{srv: srv}
	mux.HandleFunc("POST /api/v1/users", userHandler.registerUserHandler)
}

func (h *userHandler) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	registerBody := &domain.UserCreateParams{}
	if err := utils.ReadJSON(r, &registerBody); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, err)
		return
	}

	user, err := h.srv.RegisterUser(r.Context(), registerBody)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrEmailExists):
			utils.WriteJSON(w, http.StatusBadRequest, err)
		default:
			utils.WriteJSON(w, http.StatusInternalServerError, err)
		}
		return
	}

	utils.WriteJSON(w, http.StatusBadRequest, user)

}
