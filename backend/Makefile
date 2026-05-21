app/run:
	@go run ./cmd/api/main.go 

db/create:
	@migrate create -ext sql -dir ./migrations/ -seq ${name}
db/up:
	@migrate -database "${ONLYPAWS_DB_URI}" -path migrations up