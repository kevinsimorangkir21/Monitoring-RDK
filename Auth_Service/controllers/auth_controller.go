package controllers

import (
	"errors"
	"net/http"

	"github.com/VYN2/Auth_Service/dto"
	"github.com/VYN2/Auth_Service/services"
	"github.com/gin-gonic/gin"
)

// AuthController handles HTTP requests related to authentication.
type AuthController struct {
	authService services.AuthService
}

// NewAuthController creates a new AuthController.
func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

// Login handles POST /api/auth/login.
// It binds the request body, delegates to AuthService, and writes the response.
func (ac *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Request tidak valid",
		})
		return
	}

	resp, err := ac.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Email atau Password salah.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login berhasil",
		"data":    resp,
	})
}
