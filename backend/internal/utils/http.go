package utils

import (
	"fmt"
	"net/http"

	"github.com/onlypaws/internal/domain"
)

func MustGetUser(r *http.Request) *domain.AuthedUser {
	val := r.Context().Value(domain.ContextUserKey)
	if val == nil {
		panic("user not found")
	}

	authedUser, ok := val.(*domain.AuthedUser)

	if !ok {
		panic("invalid user structure")
	}

	return authedUser
}

func MustGetParam(r *http.Request, key string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		panic(fmt.Sprintf("key %q not provided", key))
	}
	return value
}
