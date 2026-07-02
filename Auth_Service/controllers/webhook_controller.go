package controllers

import (
	"log"

	"github.com/VYN2/Auth_Service/config"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type WebhookController struct {
	cfg                  *config.Config
	inboundSvc           services.InboundService
	outboundSvc          services.OutboundService
	reportDailySvc       services.ReportDailyTransportService
	scanOutDCSvc         services.ScanOutDCService
	claimVendorSvc       services.ClaimVendorService
	gantunganFakturSvc   services.GantunganFakturService
	setoranSvc           services.SetoranService
	woWtSvc              services.WoWtService
}

func NewWebhookController(
	cfg *config.Config,
	inboundSvc services.InboundService,
	outboundSvc services.OutboundService,
	reportDailySvc services.ReportDailyTransportService,
	scanOutDCSvc services.ScanOutDCService,
	claimVendorSvc services.ClaimVendorService,
	gantunganFakturSvc services.GantunganFakturService,
	setoranSvc services.SetoranService,
	woWtSvc services.WoWtService,
) *WebhookController {
	return &WebhookController{
		cfg:                cfg,
		inboundSvc:         inboundSvc,
		outboundSvc:        outboundSvc,
		reportDailySvc:     reportDailySvc,
		scanOutDCSvc:       scanOutDCSvc,
		claimVendorSvc:     claimVendorSvc,
		gantunganFakturSvc: gantunganFakturSvc,
		setoranSvc:         setoranSvc,
		woWtSvc:            woWtSvc,
	}
}

// WebhookPayload represents the data sent from Apps Script onEdit()
type WebhookPayload struct {
	Sheet  string                 `json:"sheet" binding:"required"`
	RowID  uint                   `json:"rowId" binding:"required"`
	Data   map[string]interface{} `json:"data" binding:"required"`
}

// HandleGoogleSheetEdit handles incoming webhooks from Google Sheets onEdit trigger
func (ctrl *WebhookController) HandleGoogleSheetEdit(c *gin.Context) {
	// Validate webhook secret
	secret := c.GetHeader("X-Webhook-Secret")
	if secret != ctrl.cfg.GoogleWebhookSecret {
		log.Printf("[WEBHOOK] Invalid webhook secret from IP: %s", c.ClientIP())
		utils.Unauthorized(c, "Invalid webhook secret")
		return
	}

	var payload WebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("[WEBHOOK] Invalid payload: %v", err)
		utils.BadRequest(c, "Invalid payload")
		return
	}

	log.Printf("[WEBHOOK] Received edit for sheet=%s, rowId=%d", payload.Sheet, payload.RowID)

	// Route to appropriate service based on sheet name
	var err error
	switch payload.Sheet {
	case "IN":
		err = ctrl.handleInboundUpdate(c, payload)
	case "OUT":
		err = ctrl.handleOutboundUpdate(c, payload)
	case "Daily":
		err = ctrl.handleReportDailyUpdate(c, payload)
	case "Scan Out":
		err = ctrl.handleScanOutDCUpdate(c, payload)
	case "Claim":
		err = ctrl.handleClaimVendorUpdate(c, payload)
	case "Faktur":
		err = ctrl.handleGantunganFakturUpdate(c, payload)
	case "Setoran":
		err = ctrl.handleSetoranUpdate(c, payload)
	case "WO-WT":
		err = ctrl.handleWoWtUpdate(c, payload)
	default:
		log.Printf("[WEBHOOK] Unknown sheet: %s", payload.Sheet)
		utils.BadRequest(c, "Unknown sheet name")
		return
	}

	if err != nil {
		log.Printf("[WEBHOOK] Failed to update sheet=%s, rowId=%d: %v", payload.Sheet, payload.RowID, err)
		utils.InternalError(c, err)
		return
	}

	log.Printf("[WEBHOOK] Successfully updated sheet=%s, rowId=%d", payload.Sheet, payload.RowID)
	utils.OK(c, gin.H{"message": "Webhook processed successfully"})
}

func (ctrl *WebhookController) handleInboundUpdate(c *gin.Context, payload WebhookPayload) error {
	// Get existing record
	existing, err := ctrl.inboundSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}

	// Map payload data to model (basic mapping, extend as needed)
	if shifting, ok := payload.Data["shifting"].(string); ok {
		existing.Shifting = shifting
	}
	if nomorFO, ok := payload.Data["nomor_fo"].(string); ok {
		existing.NomorFO = nomorFO
	}
	if nopol, ok := payload.Data["nopol"].(string); ok {
		existing.Nopol = nopol
	}
	// Add more field mappings as needed...

	// Update MySQL - using "webhook" as actor
	return ctrl.inboundSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleOutboundUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.outboundSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.outboundSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleReportDailyUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.reportDailySvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.reportDailySvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleScanOutDCUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.scanOutDCSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.scanOutDCSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleClaimVendorUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.claimVendorSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.claimVendorSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleGantunganFakturUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.gantunganFakturSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.gantunganFakturSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleSetoranUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.setoranSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.setoranSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}

func (ctrl *WebhookController) handleWoWtUpdate(c *gin.Context, payload WebhookPayload) error {
	existing, err := ctrl.woWtSvc.GetByID(c.Request.Context(), payload.RowID)
	if err != nil {
		return err
	}
	// Map fields from payload.Data to existing...
	return ctrl.woWtSvc.Update(c.Request.Context(), existing, "webhook", "0", c.ClientIP())
}
