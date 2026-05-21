package middlewares

import (
	"context"
	"net/http"
	"strings"

	"github.com/onlypaws/internal/domain"
	httperrors "github.com/onlypaws/internal/errors"
)

func authenticateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if header == "" {
			httperrors.BadRequestError(w, r, "bad header")
			return
		}
		splittedHeader := strings.Split(header, " ")
		if len(header) != 2 {
			httperrors.BadRequestError(w, r, "bad header")
			return
		}

		_ = splittedHeader[1]
		ctx := context.WithValue(r.Context(), domain.ContextUserKey, &domain.AuthedUser{})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
