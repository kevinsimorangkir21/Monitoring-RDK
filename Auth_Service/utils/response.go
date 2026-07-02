package utils

import (
	"log"

	"github.com/gin-gonic/gin"
)

// OK writes a 200 success envelope.
func OK(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{"success": true, "data": data})
}

// OKList writes a 200 success envelope with pagination meta.
func OKList(c *gin.Context, data interface{}, meta PaginationMeta) {
	c.JSON(200, gin.H{"success": true, "data": data, "meta": meta})
}

// Created writes a 201 success envelope.
func Created(c *gin.Context, data interface{}) {
	c.JSON(201, gin.H{"success": true, "data": data})
}

// BadRequest writes a 400 error envelope (safe to show to client).
func BadRequest(c *gin.Context, msg string) {
	c.JSON(400, gin.H{"success": false, "message": msg})
}

// NotFound writes a 404 error envelope.
func NotFound(c *gin.Context, msg string) {
	c.JSON(404, gin.H{"success": false, "message": msg})
}

// Unauthorized writes a 401 error envelope.
func Unauthorized(c *gin.Context, msg string) {
	c.JSON(401, gin.H{"success": false, "message": msg})
}

// Forbidden writes a 403 error envelope.
func Forbidden(c *gin.Context, msg string) {
	c.JSON(403, gin.H{"success": false, "message": msg})
}

// InternalError logs the real error server-side and returns a generic 500
// to the client — never leaks internal error details to the frontend.
func InternalError(c *gin.Context, err error) {
	log.Printf("[500] %s %s — %v", c.Request.Method, c.Request.URL.Path, err)
	c.JSON(500, gin.H{"success": false, "message": "Terjadi kesalahan pada server. Silakan coba lagi."})
}
