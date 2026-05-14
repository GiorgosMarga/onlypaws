package utils

import (
	"fmt"
	"os"
)

func GetEnv(key, dflt string) string {
	val := os.Getenv(key)
	if val == "" {
		return dflt
	}
	return val
}

func MustGetEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		panic(fmt.Sprintf("env variable '%s' was not provided\n", key))
	}
	return val
}
