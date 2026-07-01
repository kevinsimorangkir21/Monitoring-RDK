package middleware

import (
	"net/http"
	"strings"

	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the Authorization: Bearer <token> header.
// On success it stores the parsed *utils.Claims in the Gin context under the
// key "claims" so that downstream handlers and RoleMiddleware can read it.
// OPTIONS requests are always passed through to allow CORS preflight.
func AuthMiddleware(userRepo repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pass through preflight requests — CORS middleware handles them.
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token tidak valid atau sudah kadaluarsa",
			})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ParseToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token tidak valid atau sudah kadaluarsa",
			})
			return
		}

		// Verify that the user is still active in the database.
		user, err := userRepo.FindByID(claims.ID)
		if err != nil || user.Status != "ACTIVE" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Akun tidak aktif atau tidak ditemukan",
			})
			return
		}

		c.Set("claims", claims)
		c.Next()
	}
}
