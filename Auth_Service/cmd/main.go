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
	"github.com/VYN2/Auth_Service/internal/syncsvc"
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

	// ── 3. Build allowed-origins list ────────────────────────────────────────
	fmt.Println("  Raw CORS    :", config.AppConfig.CORSOrigins)
	allowedOrigins := make([]string, 0)
	for _, o := range strings.Split(config.AppConfig.CORSOrigins, ",") {
		o = strings.TrimSpace(o)
		o = strings.TrimRight(o, "/")
		if o != "" {
			allowedOrigins = append(allowedOrigins, o)
		}
	}
	fmt.Printf("  Allowed CORS: %#v\n", allowedOrigins)

	// ── 4. Connect MySQL + AutoMigrate all 10 tables ──────────────────────────
	database.Connect()
	fmt.Println("  Database Connected")
	fmt.Println("  Auto Migration Success")

	// ── 5. Seed default users ─────────────────────────────────────────────────
	seeders.Seed(database.DB)
	fmt.Println("  Seeder Success")

	// ── 6. Wire repositories ──────────────────────────────────────────────────
	db := database.DB
	actLogRepo := repositories.NewActivityLogRepository(db)
	userRepo := repositories.NewGormUserRepository(db)
	inboundRepo := repositories.NewInboundRepository(db)
	outboundRepo := repositories.NewOutboundRepository(db)
	reportDailyRepo := repositories.NewReportDailyTransportRepository(db)
	scanOutDCRepo := repositories.NewScanOutDCRepository(db)
	claimVendorRepo := repositories.NewClaimVendorRepository(db)
	gantunganRepo := repositories.NewGantunganFakturRepository(db)
	setoranRepo := repositories.NewSetoranRepository(db)
	woWtRepo := repositories.NewWoWtRepository(db)
	dashboardRepo := repositories.NewDashboardRepository(db)

	// ── 7. Wire services ──────────────────────────────────────────────────────
	authSvc := services.NewAuthService(userRepo)
	inboundSvc := services.NewInboundService(inboundRepo, actLogRepo)
	outboundSvc := services.NewOutboundService(outboundRepo, actLogRepo)
	reportDailySvc := services.NewReportDailyTransportService(reportDailyRepo, actLogRepo)
	scanOutDCSvc := services.NewScanOutDCService(scanOutDCRepo, actLogRepo)
	claimVendorSvc := services.NewClaimVendorService(claimVendorRepo, actLogRepo)
	gantunganSvc := services.NewGantunganFakturService(gantunganRepo, actLogRepo)
	setoranSvc := services.NewSetoranService(setoranRepo, actLogRepo)
	woWtSvc := services.NewWoWtService(woWtRepo, actLogRepo)
	dashboardSvc := services.NewDashboardService(dashboardRepo)

	// ── 8. Wire controllers ───────────────────────────────────────────────────
	deps := routes.Deps{
		AuthCtrl:            controllers.NewAuthController(authSvc),
		DashboardCtrl:       controllers.NewDashboardController(dashboardSvc),
		InboundCtrl:         controllers.NewInboundController(inboundSvc),
		OutboundCtrl:        controllers.NewOutboundController(outboundSvc),
		ReportDailyCtrl:     controllers.NewReportDailyTransportController(reportDailySvc),
		ScanOutDCCtrl:       controllers.NewScanOutDCController(scanOutDCSvc),
		ClaimVendorCtrl:     controllers.NewClaimVendorController(claimVendorSvc),
		GantunganFakturCtrl: controllers.NewGantunganFakturController(gantunganSvc),
		SetoranCtrl:         controllers.NewSetoranController(setoranSvc),
		WoWtCtrl:            controllers.NewWoWtController(woWtSvc),
		UserRepo:            userRepo,
	}

	// Wire Google Sheets sync (non-blocking — Degraded Mode if unconfigured)
	var googleClient syncsvc.GoogleClient
	gc, gcErr := syncsvc.NewGoogleClient(config.AppConfig)
	if gcErr != nil {
		log.Printf("[syncsvc] Google Sheets client init failed (Degraded Mode): %v", gcErr)
	} else {
		googleClient = gc
		log.Println("[syncsvc] Google Sheets client initialized")
	}

	sseHub := syncsvc.NewSSEHub()
	sheetMapper := syncsvc.NewSheetMapper()
	sheetSvc := syncsvc.NewSheetService(googleClient)
	conflictResolver := syncsvc.NewConflictResolver()
	syncSvc := syncsvc.NewSyncService(googleClient, sheetSvc, sheetMapper, conflictResolver, db, sseHub, config.AppConfig)
	deps.SyncCtrl = controllers.NewSyncController(syncSvc, sseHub)

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// ── 10. Request logger ────────────────────────────────────────────────────
	r.Use(func(c *gin.Context) {
		fmt.Printf("================================\nMETHOD : %s\nPATH   : %s\nORIGIN : %s\n================================\n",
			c.Request.Method, c.Request.URL.Path, c.Request.Header.Get("Origin"))
		c.Next()
	})

	// ── 11. CORS middleware ───────────────────────────────────────────────────
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			norm := strings.TrimRight(strings.TrimSpace(origin), "/")
			for _, allowed := range allowedOrigins {
				if strings.EqualFold(norm, allowed) {
					log.Printf("[CORS] ALLOW %s", origin)
					return true
				}
			}
			log.Printf("[CORS] BLOCK %s", origin)
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ── 12. Global OPTIONS handler ────────────────────────────────────────────
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// ── 13. Register all routes ───────────────────────────────────────────────
	routes.Register(r, deps)

	// ── 14. NoMethod / NoRoute ────────────────────────────────────────────────
	r.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"success": false, "message": "Method not allowed"})
	})
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Route not found"})
	})

	// ── 15. Print diagnostics ─────────────────────────────────────────────────
	printDiagnostics(r)

	// ── 16. Start server ──────────────────────────────────────────────────────
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
