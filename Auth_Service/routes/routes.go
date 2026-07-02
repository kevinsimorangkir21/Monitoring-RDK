package routes

import (
	"net/http"

	"github.com/VYN2/Auth_Service/controllers"
	"github.com/VYN2/Auth_Service/middleware"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/gin-gonic/gin"
)

// Deps holds all controller dependencies wired in main.go.
type Deps struct {
	AuthCtrl            *controllers.AuthController
	DashboardCtrl       *controllers.DashboardController
	InboundCtrl         *controllers.InboundController
	OutboundCtrl        *controllers.OutboundController
	ReportDailyCtrl     *controllers.ReportDailyTransportController
	ScanOutDCCtrl       *controllers.ScanOutDCController
	ClaimVendorCtrl     *controllers.ClaimVendorController
	GantunganFakturCtrl *controllers.GantunganFakturController
	SetoranCtrl         *controllers.SetoranController
	WoWtCtrl            *controllers.WoWtController
	UserRepo            repositories.UserRepository
	// Google Sheets Sync — additive, nil-safe in Degraded Mode
	SyncCtrl *controllers.SyncController
}

// Register mounts all routes on the Gin engine.
func Register(r *gin.Engine, d Deps) {
	api := r.Group("/api")

	// ── Public ────────────────────────────────────────────────────────────────
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"service": "Monitoring Auth Service",
			"status":  "UP",
		})
	})

	auth := api.Group("/auth")
	{
		auth.POST("/login", d.AuthCtrl.Login)
	}

	// ── Protected (JWT required) ──────────────────────────────────────────────
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(d.UserRepo))

	// Dashboard
	dash := protected.Group("/dashboard")
	{
		dash.GET("/stats", d.DashboardCtrl.Stats)
		dash.GET("/activity", d.DashboardCtrl.RecentActivity)
	}

	// Admin routes (SUPER_ADMIN only)
	admin := protected.Group("/admin")
	admin.Use(middleware.RoleMiddleware)
	{
		admin.GET("/me", func(c *gin.Context) {
			claims, _ := c.Get("claims")
			c.JSON(http.StatusOK, gin.H{"success": true, "data": claims})
		})
	}

	// ── CRUD modules (all roles can read, write requires auth) ────────────────
	registerCRUD(protected.Group("/inbound"),
		d.InboundCtrl.List, d.InboundCtrl.GetByID,
		d.InboundCtrl.Create, d.InboundCtrl.Update, d.InboundCtrl.Delete)

	registerCRUD(protected.Group("/outbound"),
		d.OutboundCtrl.List, d.OutboundCtrl.GetByID,
		d.OutboundCtrl.Create, d.OutboundCtrl.Update, d.OutboundCtrl.Delete)

	registerCRUD(protected.Group("/report-daily"),
		d.ReportDailyCtrl.List, d.ReportDailyCtrl.GetByID,
		d.ReportDailyCtrl.Create, d.ReportDailyCtrl.Update, d.ReportDailyCtrl.Delete)

	registerCRUD(protected.Group("/scan-out-dc"),
		d.ScanOutDCCtrl.List, d.ScanOutDCCtrl.GetByID,
		d.ScanOutDCCtrl.Create, d.ScanOutDCCtrl.Update, d.ScanOutDCCtrl.Delete)

	registerCRUD(protected.Group("/claim-vendor"),
		d.ClaimVendorCtrl.List, d.ClaimVendorCtrl.GetByID,
		d.ClaimVendorCtrl.Create, d.ClaimVendorCtrl.Update, d.ClaimVendorCtrl.Delete)

	// Gantungan Faktur — extra /summary endpoint
	gf := protected.Group("/gantungan-faktur")
	{
		gf.GET("", d.GantunganFakturCtrl.List)
		gf.GET("/summary", d.GantunganFakturCtrl.Summary)
		gf.GET("/:id", d.GantunganFakturCtrl.GetByID)
		gf.POST("", d.GantunganFakturCtrl.Create)
		gf.PUT("/:id", d.GantunganFakturCtrl.Update)
		gf.DELETE("/:id", d.GantunganFakturCtrl.Delete)
	}

	// Setoran — extra /avg-durasi endpoint
	set := protected.Group("/setoran")
	{
		set.GET("", d.SetoranCtrl.List)
		set.GET("/avg-durasi", d.SetoranCtrl.AvgDurasi)
		set.GET("/:id", d.SetoranCtrl.GetByID)
		set.POST("", d.SetoranCtrl.Create)
		set.PUT("/:id", d.SetoranCtrl.Update)
		set.DELETE("/:id", d.SetoranCtrl.Delete)
	}

	registerCRUD(protected.Group("/wo-wt"),
		d.WoWtCtrl.List, d.WoWtCtrl.GetByID,
		d.WoWtCtrl.Create, d.WoWtCtrl.Update, d.WoWtCtrl.Delete)

	// ── Google Sheets Sync routes (nil-safe — skipped in Degraded Mode) ───────
	if d.SyncCtrl != nil {
		// POST /api/sync/google — no JWT (validated by webhook secret in body)
		api.POST("/sync/google", d.SyncCtrl.WebhookSync)

		// JWT-protected sync endpoints
		protected.POST("/import/google", d.SyncCtrl.ImportGoogle)
		protected.POST("/export/google", d.SyncCtrl.ExportGoogle)

		// SSE endpoint — JWT via query param ?token= (EventSource limitation)
		// Uses a special middleware that checks query param first, then header
		sseGroup := api.Group("/sse")
		sseGroup.Use(middleware.AuthMiddlewareSSE(d.UserRepo))
		sseGroup.GET("", d.SyncCtrl.SSEStream)
	}
}

// registerCRUD mounts standard 5-endpoint CRUD on a route group.
func registerCRUD(g *gin.RouterGroup,
	list, getByID gin.HandlerFunc,
	create, update, delete gin.HandlerFunc,
) {
	g.GET("", list)
	g.GET("/:id", getByID)
	g.POST("", create)
	g.PUT("/:id", update)
	g.DELETE("/:id", delete)
}
