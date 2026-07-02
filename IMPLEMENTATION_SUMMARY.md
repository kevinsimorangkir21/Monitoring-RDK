# Summary Implementasi Google Sheets Sync - Monitoring RDK

## ✅ Yang Sudah Diimplementasikan

### 1. Google Apps Script (`apps-script/sync.gs`)

**File baru:** `apps-script/sync.gs`

**Fungsi:**
- ✅ `doPost()` - Menerima request dari Dashboard untuk update Spreadsheet
  - CREATE: Tambah baris baru dengan `appendRow()`
  - UPDATE: Cari row berdasarkan ID lalu update
  - DELETE: Cari row berdasarkan ID lalu hapus
  
- ✅ `onEdit()` - Kirim webhook ke Dashboard saat Spreadsheet diedit manual
  
- ✅ Helper functions:
  - `mapSheetName()` - Map short name (IN, OUT) ke full name (Inbound, Outbound)
  - `findRowById()` - Cari row berdasarkan unique ID
  - `getKeyColumnIndex()` - Get index kolom key untuk setiap sheet
  - `dataToArray()` - Convert object data ke array sesuai urutan kolom

**Semua 8 sheet didukung:**
- Inbound (IN)
- Outbound (OUT)
- Report Daily (Daily)
- Scan Out DC (Scan Out)
- Claim Vendor (Claim)
- Gantungan Faktur (Faktur)
- WO-WT
- Setoran

### 2. Backend Go - New Files

**File baru:** `Auth_Service/internal/syncsvc/sheets_client.go`

**Interface:**
```go
type SheetsClient interface {
    CreateRow(ctx, sheet, data) error
    UpdateRow(ctx, sheet, rowID, data) error
    DeleteRow(ctx, sheet, rowID) error
}
```

**Fungsi:**
- ✅ `CreateRow()` - Kirim request CREATE ke Apps Script
- ✅ `UpdateRow()` - Kirim request UPDATE ke Apps Script
- ✅ `DeleteRow()` - Kirim request DELETE ke Apps Script
- ✅ Logging dengan prefix `[SYNC TO GOOGLE SHEET]`
- ✅ Error handling yang proper
- ✅ Async execution (tidak block response CRUD)

### 3. Backend Go - Config Updates

**File updated:** `Auth_Service/config/config.go`

**Perubahan:**
```go
// Field baru
GoogleAppsScriptURL string // URL Apps Script Web App
```

**Environment variable baru:**
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 4. Documentation

**File baru:**
- `INTEGRATION_GUIDE.md` - Panduan lengkap setup dan konfigurasi
- `IMPLEMENTATION_SUMMARY.md` - Summary implementasi (file ini)

**Isi documentation:**
- ✅ Overview flow 2-arah
- ✅ Konfigurasi step-by-step
- ✅ Mapping lengkap Sheet ↔ Database
- ✅ API endpoint documentation
- ✅ Column mapping detail untuk semua 8 sheet
- ✅ Testing guide
- ✅ Error handling
- ✅ Troubleshooting
- ✅ Performance notes
- ✅ Security notes
- ✅ Maintenance guide

## 📋 Yang Perlu Dilakukan (Next Steps)

### 1. Wire SheetsClient ke Existing Controllers

Setiap controller yang sudah ada `syncSvc` perlu ditambahkan pemanggilan `sheetsClient`:

**Contoh untuk `inbound_controller.go`:**

```go
// Di Create handler, setelah syncSvc.SyncAfterCRUD
if ctrl.sheetsClient != nil {
    go func() {
        data := inboundToMap(result)
        if err := ctrl.sheetsClient.CreateRow(context.Background(), "IN", data); err != nil {
            log.Printf("[inbound] failed to sync create to sheets: %v", err)
        }
    }()
}
```

**Controllers yang perlu diupdate:**
- [ ] `inbound_controller.go`
- [ ] `outbound_controller.go`
- [ ] `report_daily_transport_controller.go`
- [ ] `scan_out_dc_controller.go`
- [ ] `claim_vendor_controller.go`
- [ ] `gantungan_faktur_controller.go`
- [ ] `setoran_controller.go`
- [ ] `wo_wt_controller.go`

### 2. Tambahkan Helper Functions untuk Model → Map

Setiap controller perlu helper untuk convert model ke map:

```go
// Contoh untuk Inbound
func inboundToMap(m *models.Inbound) map[string]interface{} {
    return map[string]interface{}{
        "tanggal":         m.Tanggal.Format("2006-01-02"),
        "shifting":        m.Shifting,
        "nomor_fo":        m.NomorFO,
        "nopol":           m.Nopol,
        "plant_pabrik":    m.PlantPabrik,
        "jenis_bongkaran": m.JenisBongkaran,
        "total_box":       m.TotalBox,
        "nomor_gr":        m.NomorGR,
        "total_slipsheet": m.TotalSlipsheet,
    }
}
```

### 3. Wire SheetsClient di main.go

**Update `Auth_Service/cmd/main.go`:**

```go
// Inisialisasi SheetsClient
var sheetsClient syncsvc.SheetsClient
if config.AppConfig.GoogleAppsScriptURL != "" {
    sheetsClient = syncsvc.NewSheetsClient(config.AppConfig)
    log.Println("[main] SheetsClient initialized")
} else {
    log.Println("[main] SheetsClient disabled (GOOGLE_APPS_SCRIPT_URL not set)")
}

// Wire ke semua controllers
inboundCtrl.SetSheetsClient(sheetsClient)
outboundCtrl.SetSheetsClient(sheetsClient)
// ... dst untuk semua controllers
```

### 4. Tambahkan SetSheetsClient Method ke Controllers

**Contoh untuk `inbound_controller.go`:**

```go
type InboundController struct {
    svc          services.InboundService
    syncSvc      syncsvc.SyncService
    sheetsClient syncsvc.SheetsClient // Field baru
}

func (ctrl *InboundController) SetSheetsClient(client syncsvc.SheetsClient) {
    ctrl.sheetsClient = client
}
```

### 5. Tambahkan Endpoint untuk Webhook FROM Sheets

**Create new handler di `sync_controller.go`:**

```go
// SyncFromSheets handles webhook from Google Apps Script onEdit()
func (ctrl *SyncController) SyncFromSheets(c *gin.Context) {
    var payload struct {
        Worksheet string `json:"worksheet"`
        Row       int    `json:"row"`
        Timestamp string `json:"timestamp"`
    }
    
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    log.Printf("[SYNC FROM GOOGLE SHEET] worksheet=%s row=%d", payload.Worksheet, payload.Row)
    
    if !ctrl.svc.IsConfigured() {
        c.JSON(503, gin.H{"error": "Google Sheets sync not configured"})
        return
    }
    
    // Process the webhook (already implemented in ProcessWebhook)
    ctx := c.Request.Context()
    webhookPayload := syncsvc.WebhookPayload{
        Worksheet: payload.Worksheet,
        Row:       payload.Row,
        Timestamp: payload.Timestamp,
    }
    
    if err := ctrl.svc.ProcessWebhook(ctx, webhookPayload); err != nil {
        log.Printf("[SYNC FROM GOOGLE SHEET] error: %v", err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{"success": true})
}
```

**Register route di `routes.go`:**

```go
// Webhook from Google Sheets (no auth required - validated by Google)
router.POST("/api/sync/from-sheets", deps.SyncCtrl.SyncFromSheets)
```

### 6. Testing

**Test Flow 1 (Spreadsheet → Dashboard):**
1. Edit cell di Google Spreadsheet
2. Cek log Apps Script
3. Cek backend log untuk confirm webhook diterima
4. Cek Dashboard untuk confirm data berubah

**Test Flow 2 (Dashboard → Spreadsheet):**
1. Create/Update/Delete di Dashboard
2. Cek backend log untuk confirm request ke Apps Script
3. Cek Google Spreadsheet untuk confirm data berubah

### 7. Build Verification

```bash
cd Auth_Service
go build ./...
```

## 🔧 Configuration Checklist

### Backend (.env)
- [ ] `GOOGLE_PROJECT_ID`
- [ ] `GOOGLE_CLIENT_EMAIL`
- [ ] `GOOGLE_PRIVATE_KEY`
- [ ] `GOOGLE_SPREADSHEET_ID`
- [ ] `GOOGLE_WEBHOOK_SECRET`
- [ ] `GOOGLE_APPS_SCRIPT_URL` ← **BARU**

### Google Apps Script (Script Properties)
- [ ] `BACKEND_URL` = https://your-backend-url.com

### Apps Script Deployment
- [ ] Deploy as Web App
- [ ] Execute as: Me
- [ ] Who has access: Anyone
- [ ] Copy Web App URL → `GOOGLE_APPS_SCRIPT_URL`

### Apps Script Triggers
- [ ] Add Trigger: `onEdit`
- [ ] Event source: From spreadsheet
- [ ] Event type: On edit

## 📊 Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Dashboard      │         │   Backend Go     │         │ Google Sheets   │
│  (Next.js)      │         │   (Gin + GORM)   │         │                 │
└────────┬────────┘         └────────┬─────────┘         └────────┬────────┘
         │                           │                            │
         │  1. CRUD Request          │                            │
         ├──────────────────────────>│                            │
         │                           │                            │
         │  2. Insert/Update MySQL   │                            │
         │                           ├────────┐                   │
         │                           │        │                   │
         │                           │<───────┘                   │
         │                           │                            │
         │  3. POST to Apps Script   │                            │
         │                           ├───────────────────────────>│
         │                           │   (SheetsClient.CreateRow) │
         │                           │                            │
         │                           │  4. Apps Script updates    │
         │                           │     Spreadsheet            │
         │                           │                            ├────────┐
         │                           │                            │        │
         │                           │                            │<───────┘
         │                           │                            │
         │                           │  5. onEdit() trigger       │
         │                           │<───────────────────────────┤
         │                           │   (Webhook)                │
         │                           │                            │
         │  6. Upsert MySQL          │                            │
         │                           ├────────┐                   │
         │                           │        │                   │
         │                           │<───────┘                   │
         │                           │                            │
         │  7. SSE broadcast         │                            │
         │<──────────────────────────┤                            │
         │                           │                            │
```

## 🎯 Key Features

✅ **2-way sync** - Dashboard ↔ Spreadsheet
✅ **Async operation** - Tidak block response CRUD
✅ **Degraded mode** - CRUD tetap jalan tanpa sync
✅ **Error handling** - Semua error di-log dengan jelas
✅ **No breaking changes** - Existing API tidak berubah
✅ **8 sheets supported** - Semua sheet didukung
✅ **Proper logging** - Prefix jelas untuk debugging

## 📝 Notes

- Sync ke Spreadsheet berjalan **asynchronous** - tidak mempengaruhi response time Dashboard
- Jika Apps Script URL tidak dikonfigurasi, sync ke Spreadsheet akan disabled tapi CRUD tetap jalan
- Jika Spreadsheet edit manual, otomatis update ke MySQL via webhook
- Semua error dicatat di log untuk debugging
- Tidak ada perubahan pada UI Dashboard
- Tidak ada perubahan pada endpoint CRUD yang sudah ada

## 🚀 Next Action

1. **Implement wiring** di semua 8 controllers (lihat section "Yang Perlu Dilakukan")
2. **Test Flow 1** (Spreadsheet → Dashboard)
3. **Test Flow 2** (Dashboard → Spreadsheet)
4. **Verify build** dengan `go build ./...`
5. **Deploy & Monitor**

Semua dokumentasi lengkap ada di `INTEGRATION_GUIDE.md`.
