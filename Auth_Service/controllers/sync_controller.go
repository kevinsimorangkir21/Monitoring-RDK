package controllers

import (
	"crypto/subtle"
	"fmt"
	"io"
	"net/http"

	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SyncController handles Google Sheets sync endpoints and SSE streaming.
type SyncController struct {
	svc syncsvc.SyncService
	hub *syncsvc.SSEHub
}

// NewSyncController creates a SyncController.
func NewSyncController(svc syncsvc.SyncService, hub *syncsvc.SSEHub) *SyncController {
	return &SyncController{svc: svc, hub: hub}
}

// ── WebhookSync — POST /api/sync/google (no JWT) ──────────────────────────────

// WebhookSync handles Apps Script webhook calls.
// Security: validated via secret in payload body, NOT via JWT.
func (ctrl *SyncController) WebhookSync(c *gin.Context) {
	if !ctrl.svc.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "google sync not configured"})
		return
	}

	var payload syncsvc.WebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	// Validate webhook secret via constant-time comparison (Req 11.1)
	// If GOOGLE_WEBHOOK_SECRET is empty, reject all requests (Req 11.2)
	webhookSecret := getWebhookSecret(ctrl.svc)
	if webhookSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "webhook not configured"})
		return
	}

	if subtle.ConstantTimeCompare([]byte(payload.Secret), []byte(webhookSecret)) != 1 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := ctrl.svc.ProcessWebhook(c.Request.Context(), payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ── ImportGoogle — POST /api/import/google (JWT required) ────────────────────

func (ctrl *SyncController) ImportGoogle(c *gin.Context) {
	if !ctrl.svc.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "google sync not configured"})
		return
	}

	result, err := ctrl.svc.ImportAll(c.Request.Context())
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": result.Results})
}

// ── ExportGoogle — POST /api/export/google (JWT required) ────────────────────

func (ctrl *SyncController) ExportGoogle(c *gin.Context) {
	if !ctrl.svc.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "google sync not configured"})
		return
	}

	result, err := ctrl.svc.ExportAll(c.Request.Context())
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": result.Results, "errors": result.Errors})
}

// ── SSEStream — GET /api/sse (JWT via query param ?token=) ───────────────────

// SSEStream opens a Server-Sent Events connection for real-time Dashboard updates.
// JWT token is read from query param ?token= (browser EventSource doesn't support headers).
func (ctrl *SyncController) SSEStream(c *gin.Context) {
	if !ctrl.svc.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "google sync not configured"})
		return
	}

	clientID := uuid.NewString()
	ch := ctrl.hub.Register(clientID)
	defer ctrl.hub.Unregister(clientID)

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("X-Accel-Buffering", "no")
	c.Header("Connection", "keep-alive")

	// Send initial connected event
	writeSSEEvent(c.Writer, syncsvc.SSEEvent{Event: "connected", ClientID: clientID})
	c.Writer.Flush()

	for {
		select {
		case <-c.Request.Context().Done():
			return
		case evt, ok := <-ch:
			if !ok {
				return
			}
			if evt.Event == "keepalive" {
				// Send as SSE comment to prevent proxy timeout
				fmt.Fprint(c.Writer, ": keepalive\n\n")
			} else {
				writeSSEEvent(c.Writer, evt)
			}
			c.Writer.Flush()
		}
	}
}

// writeSSEEvent serialises an SSEEvent in the SSE wire format.
func writeSSEEvent(w io.Writer, evt syncsvc.SSEEvent) {
	data := fmt.Sprintf(`{"event":"%s"`, evt.Event)
	if evt.Worksheet != "" {
		data += fmt.Sprintf(`,"worksheet":"%s"`, evt.Worksheet)
	}
	if evt.ID != 0 {
		data += fmt.Sprintf(`,"id":%d`, evt.ID)
	}
	if evt.ClientID != "" {
		data += fmt.Sprintf(`,"clientId":"%s"`, evt.ClientID)
	}
	data += "}"
	fmt.Fprintf(w, "data: %s\n\n", data)
}

// getWebhookSecret extracts the webhook secret from the SyncService.
func getWebhookSecret(svc syncsvc.SyncService) string {
	type webhookSecreter interface {
		WebhookSecret() string
	}
	if ws, ok := svc.(webhookSecreter); ok {
		return ws.WebhookSecret()
	}
	return ""
}
