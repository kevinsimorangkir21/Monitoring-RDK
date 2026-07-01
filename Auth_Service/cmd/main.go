package main

import (
	"fmt"
	"log"
	"net/http"
	"runtime"
	"strings"
	"time"

	"github.com/VYN2/Auth_Service/config"
	"github.com/VYN2/Auth_Service/controllers"
	"github.com/VYN2/Auth_Service/database"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/routes"
	"github.com/VYN2/Auth_Service/seeders"
	"github.com/VYN2/Auth_Service/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	printBanner()

	// ── 1. Load .env ──────────────────────────────────────────────────────────
	if err := godotenv.Load(); err != nil {
		log.Println("[env] .env file not found, falling back to system environment")
	} else {
		fmt.Println("  Environment Loaded")
	}

	// ── 2. Load config (exits on missing required vars) ───────────────────────
	config.Load()

	// ── 3. Log CORS config so Railway logs show the parsed origins ────────────
	fmt.Println("  Raw CORS    :", config.AppConfig.CORSOrigins)
	parsedOrigins := strings.Split(config.AppConfig.CORSOrigins, ",")
	for i, o := range parsedOrigins {
		parsedOrigins[i] = strings.TrimSpace(o)
	}
	fmt.Printf("  Parsed CORS : %#v\n", parsedOrigins)

	// ── 4. Connect MySQL (with retry) + AutoMigrate ───────────────────────────
	database.Connect()
	fmt.Println("  Database Connected")
	fmt.Println("  Auto Migration Success")

	// ── 5. Run Seeder ─────────────────────────────────────────────────────────
	seeders.Seed(database.DB)
	fmt.Println("  Seeder Success")

	// ── 6. Wire dependencies ──────────────────────────────────────────────────
	userRepo := repositories.NewGormUserRepository(database.DB)
	authSvc := services.NewAuthService(userRepo)
	authCtrl := controllers.NewAuthController(authSvc)

	// ── 7. Create Gin engine ──────────────────────────────────────────────────
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// ── 8. Request logger — placed BEFORE CORS middleware ────────────────────
	r.Use(func(c *gin.Context) {
		fmt.Println("================================")
		fmt.Println("METHOD :", c.Request.Method)
		fmt.Println("PATH   :", c.Request.URL.Path)
		fmt.Println("ORIGIN :", c.Request.Header.Get("Origin"))
		fmt.Println("================================")
		c.Next()
	})

	// ── 9. CORS middleware — production-ready for Railway + Netlify ───────────
	corsConfig := cors.Config{
		AllowOrigins: parsedOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"X-CSRF-Token",
			"Authorization",
			"Accept",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	// ── 10. Global OPTIONS handler — ensures all preflight requests are answered
	// before reaching any route-level or group-level middleware.
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// ── 11. Register routes ───────────────────────────────────────────────────
	routes.Register(r, authCtrl, userRepo)

	// ── 12. Print startup diagnostics ────────────────────────────────────────
	printDiagnostics(r)

	// ── 13. Start HTTP server ─────────────────────────────────────────────────
	addr := ":" + config.AppConfig.Port
	fmt.Printf("\n  Server Listening on %s\n\n", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("[server] failed to start: %v", err)
	}
}

func printBanner() {
	fmt.Println()
	fmt.Println("====================================")
	fmt.Println("   Monitoring RDK Auth Service")
	fmt.Println("====================================")
	fmt.Println()
}

func printDiagnostics(r *gin.Engine) {
	cfg := config.AppConfig

	fmt.Println()
	fmt.Println("  ── Diagnostics ──────────────────────────")
	fmt.Printf("  Go Version   : %s\n", runtime.Version())
	fmt.Printf("  Port         : %s\n", cfg.Port)
	fmt.Printf("  Database     : %s@%s:%s/%s\n", cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)

	jwtLoaded := "Loaded"
	if cfg.JWTSecret == "" {
		jwtLoaded = "NOT SET — server will reject all tokens"
	}
	fmt.Printf("  JWT Secret   : %s\n", jwtLoaded)

	fmt.Println()
	fmt.Println("  ── Registered Routes ────────────────────")
	for _, info := range r.Routes() {
		fmt.Printf("  %-8s %s\n", info.Method, info.Path)
	}
}
