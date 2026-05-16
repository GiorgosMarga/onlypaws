package contracts

type Response struct {
	Data  any    `json:"data,omitempty"`
	Error *Error `json:"error,omitempty"`
}

type Error struct {
	Id  string `json:"id"`
	Msg any    `json:"msg"`
}
