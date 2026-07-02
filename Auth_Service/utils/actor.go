package utils

import "github.com/gin-gonic/gin"

// ActorFromContext extracts the actor name, actor ID, and client IP from the
// Gin context. Claims are stored by AuthMiddleware under key "claims".
// Returns empty strings when the request is unauthenticated.
func ActorFromContext(c *gin.Context) (name, id, ip string) {
	ip = c.ClientIP()
	raw, ok := c.Get("claims")
	if !ok {
		return
	}
	// We use type-assert to *Claims which is defined in jwt.go (same package).
	cl, ok := raw.(*Claims)
	if !ok {
		return
	}
	name = cl.Name
	id = cl.ID
	return
}
