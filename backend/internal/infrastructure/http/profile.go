package httphandler

import (
	"errors"
	"net/http"

	"github.com/onlypaws/internal/domain"
	httperrors "github.com/onlypaws/internal/errors"
	"github.com/onlypaws/internal/utils"
)

type profileHandler struct {
	srv domain.ProfileService
}

func RegisterProfileHandlers(mux *http.ServeMux, srv domain.ProfileService) {
	profileHandler := profileHandler{srv: srv}
	mux.HandleFunc("POST /api/v1/profile", profileHandler.createUserProfileHandler)
	mux.HandleFunc("GET /api/v1/profile/${user_id}", profileHandler.getUserProfileHandler)
	mux.HandleFunc("DELETE /api/v1/profile/${user_id}", profileHandler.deleteUserProfileHandler)
	mux.HandleFunc("PUT /api/v1/profile/${user_id}", profileHandler.updateUserProfileHandler)
}

func (p *profileHandler) createUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	params := domain.CreateProfileParams{}
	if err := utils.ReadJSON(r, &params); err != nil {
		httperrors.BadRequestError(w, r, err)
		return
	}

	authedUser := utils.MustGetUser(r)
	params.UserId = authedUser.Id

	if err := p.srv.CreateProfile(r.Context(), &params); err != nil {
		httperrors.InternalServerError(w, r, err)
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, params)
}

func (p *profileHandler) updateUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	params := domain.UpdateProfileParams{}
	if err := utils.ReadJSON(r, &params); err != nil {
		httperrors.BadRequestError(w, r, err)
		return
	}

	authedUser := utils.MustGetUser(r)
	userId := utils.MustGetParam(r, "user_id")

	if userId != authedUser.Id && authedUser.Role != domain.RoleAdmin {
		httperrors.NotAuthorizedError(w, r)
		return
	}

	updatedProfile, err := p.srv.UpdateProfile(r.Context(), userId, &params)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			httperrors.NotFoundError(w, r, err)
		default:
			httperrors.InternalServerError(w, r, err)
		}
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, updatedProfile)
}

func (p *profileHandler) deleteUserProfileHandler(w http.ResponseWriter, r *http.Request) {

}

func (p *profileHandler) getUserProfileHandler(w http.ResponseWriter, r *http.Request) {

}
