package httperrors

import (
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/onlypaws/internal/contracts"
	"github.com/onlypaws/internal/utils"
)

func logError(r *http.Request, err any) {
	log.Printf("%s\t%s\t%+v\n", r.Method, r.URL.String(), err)
}

func writeError(r *http.Request, w http.ResponseWriter, status int, err any) {
	errResponse := contracts.Response{
		Error: &contracts.Error{
			Id:  uuid.NewString(),
			Msg: err,
		},
	}

	if err := utils.WriteJSON(w, status, errResponse); err != nil {
		logError(r, errResponse)
	}
}
func InternalServerError(r *http.Request, w http.ResponseWriter, err any) {
	logError(r, err)
	writeError(r, w, http.StatusInternalServerError, err)
}

func BadRequestError(r *http.Request, w http.ResponseWriter, err any) {
	writeError(r, w, http.StatusBadGateway, err)
}
