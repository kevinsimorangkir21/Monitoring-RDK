# Spreadsheet-First Architecture

## 📋 Overview

**Google Spreadsheet adalah SOURCE OF TRUTH**, bukan MySQL.

Arsitektur ini mengubah paradigma dari database-first menjadi spreadsheet-first, di mana:
- ✅ Spreadsheet adalah sumber kebenaran utama
- ✅ Backend hanya MEMBACA dan MENAMBAH data
- ❌ Backend TIDAK PERNAH mengubah atau menghapus data yang sudah ada

## 🏗️ Architecture Flow

```
Dashboard (Frontend)
        ↓
Backend Go (Auth_Service)
        ↓
HTTP GET/POST
        ↓
Google Apps Script
        ↓
Google Spreadsheet (SOURCE OF TRUTH)
```

## 🔧 Components

### 1. Google Apps Script (`apps-script/spreadsheet-first.gs`)

**Endpoints:**
- `doGet(e)` - Membaca semua data dari sheet
  - URL: `https://script.google.com/.../exec?sheet=IN`
  - Response: `{ "success": true, "data": [...] }`

- `doPost(e)` - Menambah baris baru ke sheet (appendRow)
  - Payload: `{ "sheet": "IN", "data": {...} }`
  - Response: `{ "success": true, "message": "Row appended successfully" }`

**Supported Sheets:**
- `IN` - Inbound
- `OUT` - Outbound
- `Daily` - Report Daily Transport
- `Scan Out` - Scan Out DC
- `Claim` - Claim Vendor
- `Faktur` - Gantungan Faktur
- `Setoran` - Setoran
- `WO-WT` - WO WT

### 2. Backend Go Client (`Auth_Service/internal/syncsvc/spreadsheet_client.go`)

**Interface:**
```go
type SpreadsheetClient interface {
    GetAll(ctx context.Context, sheetName string) ([]map[string]interface{}, error)
    Append(ctx context.Context, sheetName string, data map[string]interface{}) error
}
```

**Features:**
- Timeout 30 detik untuk large sheets
- Error handling yang robust
- Logging lengkap untuk debugging

### 3. Controllers (`Auth_Service/controllers/*_controller.go`)

**8 Controllers direfactor:**
1. InboundController → sheet "IN"
2. OutboundController → sheet "OUT"
3. ReportDailyTransportController → sheet "Daily"
4. ScanOutDCController → sheet "Scan Out"
5. ClaimVendorController → sheet "Claim"
6. GantunganFakturController → sheet "Faktur"
7. SetoranController → sheet "Setoran"
8. WoWtController → sheet "WO-WT"

**Supported Operations:**
- ✅ `List()` - GET all data from spreadsheet
- ✅ `GetByID()` - GET single row by ID
- ✅ `Create()` - POST new row (appendRow)
- ❌ `Update()` - Returns 501 Not Implemented
- ❌ `Delete()` - Returns 501 Not Implemented

## 📝 API Behavior Changes

### Before (MySQL-First):
```
GET    /api/inbound        → Query MySQL
GET    /api/inbound/:id    → Query MySQL by ID
POST   /api/inbound        → INSERT into MySQL → Sync to Spreadsheet
PUT    /api/inbound/:id    → UPDATE MySQL → Sync to Spreadsheet
DELETE /api/inbound/:id    → DELETE from MySQL → Sync to Spreadsheet
```

### After (Spreadsheet-First):
```
GET    /api/inbound        → Read from Spreadsheet (GetAll)
GET    /api/inbound/:id    → Read from Spreadsheet + filter by ID
POST   /api/inbound        → Append to Spreadsheet ONLY
PUT    /api/inbound/:id    → 501 Not Implemented
DELETE /api/inbound/:id    → 501 Not Implemented
```

## 🚫 Removed Operations

### UPDATE Operations
**Reason:** Spreadsheet-First tidak mengubah data yang sudah ada.
**Response:** `HTTP 501 Not Implemented`
```json
{
  "success": false,
  "message": "Update operation not supported in Spreadsheet-First architecture"
}
```

### DELETE Operations
**Reason:** Spreadsheet-First tidak menghapus data yang sudah ada.
**Response:** `HTTP 501 Not Implemented`
```json
{
  "success": false,
  "message": "Delete operation not supported in Spreadsheet-First architecture"
}
```

### Aggregation Operations
- `GantunganFakturController.Summary()` → 501 Not Implemented
- `SetoranController.AvgDurasi()` → 501 Not Implemented

**Reason:** Data aggregation harus dilakukan di spreadsheet atau frontend.

## 🔄 Data Flow Examples

### Create New Record
```
1. User fills form in Dashboard
2. Dashboard sends POST /api/inbound
3. Backend validates data
4. Backend calls SpreadsheetClient.Append()
5. SpreadsheetClient sends HTTP POST to Apps Script
6. Apps Script calls sheet.appendRow()
7. Data berhasil ditambahkan ke Spreadsheet
8. Backend returns success to Dashboard
```

### Read Records
```
1. User opens page in Dashboard
2. Dashboard sends GET /api/inbound
3. Backend calls SpreadsheetClient.GetAll()
4. SpreadsheetClient sends HTTP GET to Apps Script
5. Apps Script reads all data from sheet
6. Apps Script returns JSON array
7. Backend returns data to Dashboard
8. Dashboard displays data in table
```

## 🗂️ File Structure

```
Auth_Service/
├── internal/syncsvc/
│   ├── spreadsheet_client.go    [NEW] SpreadsheetClient implementation
│   ├── apps_script_client.go    [DEPRECATED] Old sync client
│   └── entity_mapper.go          [DEPRECATED] Old mapper
├── controllers/
│   ├── inbound_controller.go           [REFACTORED]
│   ├── outbound_controller.go          [REFACTORED]
│   ├── report_daily_transport_controller.go  [REFACTORED]
│   ├── scan_out_dc_controller.go       [REFACTORED]
│   ├── claim_vendor_controller.go      [REFACTORED]
│   ├── gantungan_faktur_controller.go  [REFACTORED]
│   ├── setoran_controller.go           [REFACTORED]
│   └── wo_wt_controller.go             [REFACTORED]
├── utils/
│   └── response.go              [UPDATED] Added NotImplemented()
└── cmd/
    └── main.go                  [UPDATED] Initialize SpreadsheetClient

apps-script/
└── spreadsheet-first.gs         [NEW] Complete Apps Script implementation
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec

# Optional (for webhook, not used in Spreadsheet-First)
GOOGLE_WEBHOOK_SECRET=your-webhook-secret
```

### Removed Environment Variables
```bash
# These are NO LONGER needed
# GOOGLE_PROJECT_ID=...
# GOOGLE_CLIENT_EMAIL=...
# GOOGLE_PRIVATE_KEY=...
# GOOGLE_SPREADSHEET_ID=...
```

## 🧪 Testing

### Build Test
```bash
cd Auth_Service
go build ./...
```

### Unit Test
```bash
cd Auth_Service
go test ./...
```

### Manual API Test
```bash
# Get all inbound records
curl -X GET "http://localhost:8080/api/inbound" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single record
curl -X GET "http://localhost:8080/api/inbound/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new record
curl -X POST "http://localhost:8080/api/inbound" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shifting": "Pagi",
    "nomor_fo": "FO-001",
    "nopol": "B 1234 XYZ",
    "plant_pabrik": "Plant A",
    "jenis_bongkaran": "Manual",
    "total_box": 100,
    "nomor_gr": "GR-001",
    "total_slipsheet": 10
  }'

# Try update (will return 501)
curl -X PUT "http://localhost:8080/api/inbound/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total_box": 200}'

# Try delete (will return 501)
curl -X DELETE "http://localhost:8080/api/inbound/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ Benefits

1. **Spreadsheet sebagai Source of Truth**
   - Data tidak akan berubah tanpa intervensi manual di spreadsheet
   - Audit trail yang jelas melalui version history Google Sheets

2. **No Risk of Data Corruption**
   - Backend tidak pernah UPDATE atau DELETE
   - Data yang sudah ada di spreadsheet aman

3. **Simplified Architecture**
   - Tidak perlu dua arah sync yang kompleks
   - Tidak perlu conflict resolution
   - Tidak perlu Service Account

4. **Easy Maintenance**
   - Hanya 2 operasi: GET dan POST
   - Lebih mudah di-debug
   - Logging yang jelas

5. **Production Ready**
   - Aman untuk spreadsheet perusahaan
   - Error handling yang robust
   - Timeout protection

## 🚨 Limitations

1. **No UPDATE/DELETE from API**
   - User harus edit/delete manual di spreadsheet
   - Frontend perlu update UI untuk disable edit/delete button

2. **No Data Aggregation**
   - Summary dan statistics harus dilakukan di spreadsheet atau frontend
   - Endpoint seperti `/summary` dan `/avg-durasi` return 501

3. **Performance**
   - Setiap LIST operation membaca seluruh sheet
   - Tidak ada pagination di level spreadsheet
   - Untuk sheet besar (>1000 rows), perlu optimasi

4. **No Server-Side Filtering**
   - Filter, search, pagination dilakukan di frontend
   - Backend return semua data

## 🔮 Future Improvements

1. **Client-Side Caching**
   - Cache data di frontend untuk mengurangi API calls
   - Invalidate cache on CREATE

2. **Frontend Pagination**
   - Implement pagination di frontend
   - Virtual scrolling untuk large datasets

3. **Spreadsheet Formula for Aggregation**
   - Use Google Sheets formula untuk summary
   - Expose via separate sheet atau API endpoint

4. **Batch Operations**
   - Support bulk CREATE via single API call
   - Apps Script batch appendRow untuk performance

## 📚 Related Documentation

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Reference](https://developers.google.com/sheets/api)
- [Go HTTP Client Best Practices](https://go.dev/doc/effective_go)

## 👥 Migration Guide

### For Backend Developers
1. ✅ All 8 controllers refactored
2. ✅ SpreadsheetClient implemented
3. ✅ main.go updated
4. ✅ Build and test passed

### For Frontend Developers
1. ⚠️ **Action Required:** Disable EDIT button in all CRUD pages
2. ⚠️ **Action Required:** Disable DELETE button in all CRUD pages
3. ⚠️ **Action Required:** Update error handling for 501 responses
4. ⚠️ **Action Required:** Handle data filtering/sorting in frontend
5. ⚠️ **Action Required:** Remove calls to `/summary` and `/avg-durasi` endpoints

### For Apps Script Deployment
1. Deploy `apps-script/spreadsheet-first.gs` to Google Apps Script
2. Get the deployment URL
3. Set `GOOGLE_APPS_SCRIPT_URL` environment variable
4. Test with `testDoGet()` and `testDoPost()` functions

## 🎯 Success Criteria

- [x] Build successful: `go build ./...`
- [x] Tests passing: `go test ./...`
- [x] 8 controllers refactored
- [x] SpreadsheetClient implemented
- [x] Apps Script complete
- [x] Documentation written
- [ ] Frontend updated (pending)
- [ ] Apps Script deployed (pending)
- [ ] End-to-end testing (pending)

---

**Last Updated:** 2025-01-02
**Author:** Kiro AI Assistant
**Status:** Backend Implementation Complete ✅
