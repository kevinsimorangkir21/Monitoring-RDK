package routes

import (
	"net/http"

	"github.com/VYN2/Auth_Service/controllers"
	"github.com/VYN2/Auth_Service/middleware"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/gin-gonic/gin"
)

// Register sets up all route groups on the given Gin engine.
func Register(r *gin.Engine, authCtrl *controllers.AuthController, userRepo repositories.UserRepository) {
	api := r.Group("/api")

	// Health check — public, no auth required.
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"service": "Monitoring Auth Service",
			"status":  "UP",
		})
	})

	// Public auth routes.
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/login", authCtrl.Login)
	}

	// Protected admin routes — require valid JWT + SUPER_ADMIN role.
	adminGroup := api.Group("/admin")
	adminGroup.Use(middleware.AuthMiddleware(userRepo))
	adminGroup.Use(middleware.RoleMiddleware)
	{
		// Placeholder — future admin endpoints mount here.
		adminGroup.GET("/me", func(c *gin.Context) {
			claims, _ := c.Get("claims")
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    claims,
			})
		})
	}
}
