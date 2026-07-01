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

	// ── 2. Load config ────────────────────────────────────────────────────────
	config.Load()

	// ── 3. Build the allowed-origins list from env ────────────────────────────
	// CORS_ORIGINS is a comma-separated list, e.g.:
	//   https://monitoring-rdk.netlify.app,http://localhost:3000
	//
	// Each entry is trimmed of whitespace and trailing slashes so that
	// typos in the Railway env variable cannot silently break CORS.
	raw := config.AppConfig.CORSOrigins
	fmt.Println("  Raw CORS    :", raw)

	allowedOrigins := make([]string, 0)
	for _, o := range strings.Split(raw, ",") {
		o = strings.TrimSpace(o)
		o = strings.TrimRight(o, "/")
		if o != "" {
			allowedOrigins = append(allowedOrigins, o)
		}
	}
	fmt.Printf("  Allowed CORS: %#v\n", allowedOrigins)

	// ── 4. Connect MySQL + AutoMigrate ────────────────────────────────────────
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

	// ── 8. Request logger — first middleware, logs every request ──────────────
	r.Use(func(c *gin.Context) {
		fmt.Println("================================")
		fmt.Printf("METHOD : %s\n", c.Request.Method)
		fmt.Printf("PATH   : %s\n", c.Request.URL.Path)
		fmt.Printf("ORIGIN : %s\n", c.Request.Header.Get("Origin"))
		fmt.Println("================================")
		c.Next()
	})

	// ── 9. CORS middleware ────────────────────────────────────────────────────
	//
	// WHY AllowOriginFunc instead of AllowOrigins:
	//   AllowOrigins does exact string comparison. Any whitespace, trailing
	//   slash, or case difference in the Railway env variable will cause Gin
	//   to return 403 for every cross-origin request — including preflight.
	//
	//   AllowOriginFunc gives us full control: we normalise the incoming
	//   origin, log the decision, and return true/false.
	//
	// NOTE: When AllowOriginFunc is set, AllowOrigins is ignored by gin-contrib/cors.
	corsConfig := cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Normalise the incoming origin exactly as we normalised the list.
			normalised := strings.TrimSpace(origin)
			normalised = strings.TrimRight(normalised, "/")

			for _, allowed := range allowedOrigins {
				if strings.EqualFold(normalised, allowed) {
					log.Printf("[CORS] ALLOW %s", origin)
					return true
				}
			}
			log.Printf("[CORS] BLOCK %s", origin)
			return false
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"X-CSRF-Token",
			"Authorization",
			"Accept",
			"X-Requested-With",
		},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	// ── 10. Global OPTIONS handler ────────────────────────────────────────────
	//
	// gin-contrib/cors handles OPTIONS automatically when AllowOriginFunc is
	// used, but we register an explicit wildcard handler as a safety net.
	// This guarantees that OPTIONS always returns 204 even if the CORS
	// middleware chain is bypassed for any reason.
	//
	// IMPORTANT: this must be registered AFTER cors.New() so that CORS headers
	// are written by the middleware before this handler responds.
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// ── 11. Register application routes ──────────────────────────────────────
	routes.Register(r, authCtrl, userRepo)

	// ── 12. NoMethod handler — return 405 with CORS headers ──────────────────
	r.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"success": false,
			"message": "Method not allowed",
		})
	})

	// ── 13. NoRoute handler — return 404 with CORS headers ───────────────────
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Route not found",
		})
	})

	// ── 14. Print startup diagnostics ────────────────────────────────────────
	printDiagnostics(r)

	// ── 15. Start HTTP server ─────────────────────────────────────────────────
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
