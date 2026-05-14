package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func ReadJSON(r *http.Request, dst any) error {
	header := r.Header.Get("content-type")
	if header != "application/json" {
		return fmt.Errorf("invalid header: %s", header)
	}
	return json.NewDecoder(r.Body).Decode(&dst)
}

func WriteJSON(w http.ResponseWriter, status int, data any) error {
	w.Header().Add("content-type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}
