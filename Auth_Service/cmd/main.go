package main

import (
	"fmt"
	"log"
	"runtime"
	"strings"

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

	// ── 3. Connect MySQL (with retry) + AutoMigrate ───────────────────────────
	// database.Connect() prints connection details and retries before failing.
	database.Connect()
	fmt.Println("  Database Connected")
	fmt.Println("  Auto Migration Success")

	// ── 4. Run Seeder ─────────────────────────────────────────────────────────
	seeders.Seed(database.DB)
	fmt.Println("  Seeder Success")

	// ── 5. Wire dependencies ──────────────────────────────────────────────────
	userRepo := repositories.NewGormUserRepository(database.DB)
	authSvc := services.NewAuthService(userRepo)
	authCtrl := controllers.NewAuthController(authSvc)

	// ── 6. Create Gin engine and register CORS middleware ─────────────────────
	gin.SetMode(gin.ReleaseMode) // suppress Gin debug noise; routes are printed below
	r := gin.Default()

	corsOrigins := strings.Split(config.AppConfig.CORSOrigins, ",")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// ── 7. Register routes ────────────────────────────────────────────────────
	routes.Register(r, authCtrl, userRepo)

	// ── 8. Print startup diagnostics ─────────────────────────────────────────
	printDiagnostics(r)

	// ── 9. Start HTTP server ──────────────────────────────────────────────────
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
