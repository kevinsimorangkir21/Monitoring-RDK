package dto

// LoginRequest is the expected request body for POST /api/auth/login.
type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserInfo carries the public user fields returned after a successful login.
type UserInfo struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// LoginResponse is the data payload inside a successful login response.
type LoginResponse struct {
	Token string   `json:"token"`
	User  UserInfo `json:"user"`
}
