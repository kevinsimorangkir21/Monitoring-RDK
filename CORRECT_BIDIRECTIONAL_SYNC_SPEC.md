# Correct Bidirectional Sync Implementation

## 🎯 Requirement

1. **Dashboard CREATE → Spreadsheet**: User tambah data di dashboard, spreadsheet ikut bertambah
2. **Spreadsheet EDIT → Dashboard**: User edit di spreadsheet, dashboard ikut berubah

## 🏗️ Architecture (CORRECT)

```
React Dashboard ←→ Go Backend ←→ MySQL (SOURCE OF TRUTH)
                       ↓
                   Apps Script
                       ↓
              Google Spreadsheet (OPERATIONAL LOG)
```

## ✅ What To Keep

- MySQL as source of truth
- All existing CRUD endpoints
- Pagination, filtering, search
- Statistics, charts, aggregations
- JWT, roles, middleware
- Repository pattern
- Service pattern

## 🔄 Flow 1: Dashboard → Spreadsheet

```
User fills form in Dashboard
        ↓
POST /api/inbound
        ↓
INSERT INTO MySQL (primary operation)
        ↓
if success:
    async AppsScriptClient.CreateRow("IN", data)
        ↓
    Apps Script doPost()
        ↓
    sheet.appendRow()
```

**Important**: 
- MySQL INSERT must succeed first
- Apps Script sync is async (goroutine)
- If Apps Script fails, only log error, don't rollback MySQL
- Dashboard gets immediate response from MySQL

## 🔄 Flow 2: Spreadsheet → Dashboard

```
User edits cell in Spreadsheet
        ↓
Apps Script onEdit(e)
        ↓
POST /api/webhook/google
Headers: X-Webhook-Secret: xxx
Body: { sheet: "IN", row: 5, id: "123", data: {...} }
        ↓
Backend validates secret
        ↓
Parse sheet name → table name
        ↓
UPDATE MySQL
        ↓
Dashboard auto-refreshes (if needed)
```

## 📝 Implementation Tasks

### Task 1: Keep AppsScriptClient (Already Done ✅)
File: `Auth_Service/internal/syncsvc/apps_script_client.go`
- CreateRow() method for Dashboard → Spreadsheet
- Simple HTTP POST to Apps Script
- Already exists, no changes needed

### Task 2: Update 8 Controllers

Replace `syncSvc syncsvc.SyncService` with `appsScriptClient syncsvc.AppsScriptClient`:

**Files to update:**
1. `controllers/inbound_controller.go`
2. `controllers/outbound_controller.go`
3. `controllers/report_daily_transport_controller.go`
4. `controllers/scan_out_dc_controller.go`
5. `controllers/claim_vendor_controller.go`
6. `controllers/gantungan_faktur_controller.go`
7. `controllers/setoran_controller.go`
8. `controllers/wo_wt_controller.go`

**Changes per controller:**
```go
// Before:
type InboundController struct {
    svc     services.InboundService
    syncSvc syncsvc.SyncService
}

func (ctrl *InboundController) SetSyncService(syncSvc syncsvc.SyncService) {
    ctrl.syncSvc = syncSvc
}

// In Create():
if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
    go ctrl.syncSvc.SyncAfterCRUD("inbounds", syncsvc.OpCreate, m)
}

// After:
type InboundController struct {
    svc               services.InboundService
    appsScriptClient  syncsvc.AppsScriptClient
}

func (ctrl *InboundController) SetAppsScriptClient(client syncsvc.AppsScriptClient) {
    ctrl.appsScriptClient = client
}

// In Create():
if ctrl.appsScriptClient != nil {
    go func() {
        defer func() {
            if r := recover(); r != nil {
                log.Printf("[SYNC] panic recovered in CREATE IN: %v", r)
            }
        }()
        data := syncsvc.EntityToMap(m)
        if err := ctrl.appsScriptClient.CreateRow(context.Background(), "IN", data); err != nil {
            log.Printf("[SYNC] failed CREATE IN: %v", err)
        } else {
            log.Printf("[SYNC] CREATE IN success (ID=%d)", m.ID)
        }
    }()
}
```

**Sheet Name Mapping:**
- Inbound → "IN"
- Outbound → "OUT"
- ReportDailyTransport → "Daily"
- ScanOutDC → "Scan Out"
- ClaimVendor → "Claim"
- GantunganFaktur → "Faktur"
- Setoran → "Setoran"
- WoWt → "WO-WT"

**Note**: Only sync on CREATE, not UPDATE or DELETE (per user requirement)

### Task 3: Create Webhook Controller

File: `Auth_Service/controllers/webhook_controller.go`

```go
package controllers

import (
	"context"
	"log"

	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type WebhookController struct {
	// Inject all CRUD services for update
	inboundSvc           services.InboundService
	outboundSvc          services.OutboundService
	reportDailySvc       services.ReportDailyTransportService
	scanOutDCSvc         services.ScanOutDCService
	claimVendorSvc       services.ClaimVendorService
	gantunganSvc         services.GantunganFakturService
	setoranSvc           services.SetoranService
	woWtSvc              services.WoWtService
	webhookSecret        string
}

type GoogleSheetWebhookPayload struct {
	Sheet  string                 `json:"sheet"`
	RowNum int                    `json:"row"`
	ID     string                 `json:"id"`
	Data   map[string]interface{} `json:"data"`
}

func NewWebhookController(
	webhookSecret string,
	inboundSvc services.InboundService,
	outboundSvc services.OutboundService,
	reportDailySvc services.ReportDailyTransportService,
	scanOutDCSvc services.ScanOutDCService,
	claimVendorSvc services.ClaimVendorService,
	gantunganSvc services.GantunganFakturService,
	setoranSvc services.SetoranService,
	woWtSvc services.WoWtService,
) *WebhookController {
	return &WebhookController{
		webhookSecret:  webhookSecret,
		inboundSvc:     inboundSvc,
		outboundSvc:    outboundSvc,
		reportDailySvc: reportDailySvc,
		scanOutDCSvc:   scanOutDCSvc,
		claimVendorSvc: claimVendorSvc,
		gantunganSvc:   gantunganSvc,
		setoranSvc:     setoranSvc,
		woWtSvc:        woWtSvc,
	}
}

func (ctrl *WebhookController) HandleGoogleSheetEdit(c *gin.Context) {
	// 1. Validate webhook secret
	secret := c.GetHeader("X-Webhook-Secret")
	if secret != ctrl.webhookSecret {
		log.Printf("[WEBHOOK] Invalid secret from %s", c.ClientIP())
		utils.Unauthorized(c, "Invalid webhook secret")
		return
	}

	// 2. Parse payload
	var payload GoogleSheetWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	log.Printf("[WEBHOOK] Received edit from sheet=%s row=%d id=%s", payload.Sheet, payload.RowNum, payload.ID)

	// 3. Route to appropriate service based on sheet name
	ctx := context.Background()
	var err error

	switch payload.Sheet {
	case "IN":
		err = ctrl.updateInbound(ctx, payload)
	case "OUT":
		err = ctrl.updateOutbound(ctx, payload)
	case "Daily":
		err = ctrl.updateReportDaily(ctx, payload)
	case "Scan Out":
		err = ctrl.updateScanOutDC(ctx, payload)
	case "Claim":
		err = ctrl.updateClaimVendor(ctx, payload)
	case "Faktur":
		err = ctrl.updateGantunganFaktur(ctx, payload)
	case "Setoran":
		err = ctrl.updateSetoran(ctx, payload)
	case "WO-WT":
		err = ctrl.updateWoWt(ctx, payload)
	default:
		log.Printf("[WEBHOOK] Unknown sheet: %s", payload.Sheet)
		utils.BadRequest(c, "Unknown sheet")
		return
	}

	if err != nil {
		log.Printf("[WEBHOOK] Update failed: %v", err)
		utils.InternalError(c, err)
		return
	}

	log.Printf("[WEBHOOK] Update successful for sheet=%s id=%s", payload.Sheet, payload.ID)
	utils.OK(c, gin.H{"message": "Webhook processed successfully"})
}

// Helper methods for each entity type
func (ctrl *WebhookController) updateInbound(ctx context.Context, payload GoogleSheetWebhookPayload) error {
	// Parse ID, fetch existing record, update fields, save
	// Implementation details...
	return nil
}

// ... similar methods for other entities
```

### Task 4: Update Apps Script

File: `apps-script/onEdit.gs`

```javascript
/**
 * onEdit trigger - fires when user edits spreadsheet
 */
function onEdit(e) {
  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    
    // Only sync specific sheets
    var syncSheets = ["IN", "OUT", "Daily", "Scan Out", "Claim", "Faktur", "Setoran", "WO-WT"];
    if (syncSheets.indexOf(sheetName) === -1) {
      return; // Not a sync sheet
    }
    
    var row = range.getRow();
    if (row === 1) {
      return; // Header row, don't sync
    }
    
    // Get all values from the edited row
    var numColumns = sheet.getLastColumn();
    var rowData = sheet.getRange(row, 1, 1, numColumns).getValues()[0];
    
    // Get ID from first column
    var id = rowData[0];
    if (!id) {
      Logger.log("[WEBHOOK] No ID in row " + row + ", skipping");
      return;
    }
    
    // Map row to data object
    var data = rowToDataObject(sheetName, rowData);
    
    // Send webhook to backend
    var webhookUrl = PropertiesService.getScriptProperties().getProperty("WEBHOOK_URL");
    var webhookSecret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    
    if (!webhookUrl || !webhookSecret) {
      Logger.log("[WEBHOOK] Webhook not configured");
      return;
    }
    
    var payload = {
      sheet: sheetName,
      row: row,
      id: String(id),
      data: data
    };
    
    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "X-Webhook-Secret": webhookSecret
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(webhookUrl, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      Logger.log("[WEBHOOK] Success: " + sheetName + " row " + row);
    } else {
      Logger.log("[WEBHOOK] Failed: " + responseCode + " - " + response.getContentText());
    }
    
  } catch (error) {
    Logger.log("[WEBHOOK] Error: " + error.toString());
  }
}

function rowToDataObject(sheetName, rowData) {
  var obj = {};
  
  switch(sheetName) {
    case "IN":
      obj = {
        id: rowData[0],
        shifting: rowData[1],
        nomor_fo: rowData[2],
        nopol: rowData[3],
        plant_pabrik: rowData[4],
        jenis_bongkaran: rowData[5],
        total_box: rowData[6],
        nomor_gr: rowData[7],
        total_slipsheet: rowData[8]
      };
      break;
    // ... similar mappings for other sheets
  }
  
  return obj;
}
```

### Task 5: Update routes.go

Add webhook route:

```go
// Webhook endpoint (no auth required, validated by secret)
r.POST("/api/webhook/google", webhookCtrl.HandleGoogleSheetEdit)
```

### Task 6: Update main.go

```go
// Initialize Apps Script Client
appsClient := syncsvc.NewAppsScriptClient(config.AppConfig.GoogleAppsScriptURL)

// Inject into all CRUD controllers
deps.InboundCtrl.SetAppsScriptClient(appsClient)
deps.OutboundCtrl.SetAppsScriptClient(appsClient)
// ... etc for all 8 controllers

// Initialize Webhook Controller
webhookCtrl := controllers.NewWebhookController(
	config.AppConfig.GoogleWebhookSecret,
	inboundSvc,
	outboundSvc,
	reportDailySvc,
	scanOutDCSvc,
	claimVendorSvc,
	gantunganSvc,
	setoranSvc,
	woWtSvc,
)
```

## 🧪 Testing

### Test Flow 1: Dashboard → Spreadsheet
1. Create record in Dashboard
2. Check MySQL - record exists ✅
3. Check Spreadsheet - row appended ✅
4. Check logs - sync success ✅

### Test Flow 2: Spreadsheet → Dashboard  
1. Edit cell in Spreadsheet
2. onEdit() triggers
3. Webhook sent to backend
4. MySQL updated
5. Dashboard refreshes - shows new value ✅

## 📋 Success Criteria

- [ ] All 8 controllers updated
- [ ] Webhook controller created
- [ ] Apps Script onEdit() implemented
- [ ] routes.go updated
- [ ] main.go updated
- [ ] Build successful: `go build ./...`
- [ ] Tests passing: `go test ./...`
- [ ] Manual test Flow 1 passing
- [ ] Manual test Flow 2 passing

## 🚫 What NOT To Do

- ❌ Don't read from Spreadsheet in LIST endpoint
- ❌ Don't remove MySQL queries
- ❌ Don't remove pagination/filtering/search
- ❌ Don't remove statistics/aggregation endpoints
- ❌ Don't break existing frontend

## 📚 Final Architecture

```
Dashboard (React)
    ↓ HTTP
Backend (Go)
    ↓ SQL
MySQL ← SOURCE OF TRUTH
    ↓ Async HTTP (on CREATE only)
Apps Script
    ↓
Google Spreadsheet ← OPERATIONAL LOG

Google Spreadsheet
    ↓ onEdit() trigger
Apps Script
    ↓ Webhook HTTP
Backend (Go)
    ↓ SQL UPDATE
MySQL
    ↓
Dashboard (auto-refresh or manual)
```

---

**Status**: Spec Created  
**Next Step**: Execute implementation tasks 1-6
