package middleware

import (
	"net/http"

	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

// RoleMiddleware enforces that the authenticated user holds the SUPER_ADMIN role.
// It must be placed after AuthMiddleware, which stores *utils.Claims in context.
func RoleMiddleware(c *gin.Context) {
	raw, exists := c.Get("claims")
	if !exists {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Token tidak valid atau sudah kadaluarsa",
		})
		return
	}

	claims, ok := raw.(*utils.Claims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Token tidak valid atau sudah kadaluarsa",
		})
		return
	}

	if claims.Role != "SUPER_ADMIN" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak",
		})
		return
	}

	c.Next()
}
