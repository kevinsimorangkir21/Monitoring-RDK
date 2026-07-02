# Bidirectional Sync Implementation - COMPLETE

## Summary

Implementasi bidirectional sync antara Dashboard (MySQL) dan Google Spreadsheet menggunakan arsitektur Apps Script-only **SELESAI**.

## Architecture

```
Flow 1: Dashboard → Spreadsheet
Dashboard → Backend → INSERT MySQL → Apps Script doPost() → appendRow() → Spreadsheet

Flow 2: Spreadsheet → Dashboard  
Spreadsheet edit → Apps Script onEdit() → POST webhook → Backend → UPDATE MySQL → Dashboard
```

**MySQL tetap menjadi source of truth.**

## Files Modified

### Backend Controllers (8 files)
1. `Auth_Service/controllers/inbound_controller.go` ✅
2. `Auth_Service/controllers/outbound_controller.go` ✅
3. `Auth_Service/controllers/report_daily_transport_controller.go` ✅
4. `Auth_Service/controllers/scan_out_dc_controller.go` ✅
5. `Auth_Service/controllers/claim_vendor_controller.go` ✅
6. `Auth_Service/controllers/gantungan_faktur_controller.go` ✅
7. `Auth_Service/controllers/setoran_controller.go` ✅
8. `Auth_Service/controllers/wo_wt_controller.go` ✅

**Changes:**
- Replaced `syncSvc syncsvc.SyncService` with `appsScriptClient syncsvc.AppsScriptClient`
- Replaced `SetSyncService()` with `SetAppsScriptClient()`
- Added async sync in `Create()` methods only (NOT in Update/Delete)
- Removed sync calls in `Update()` and `Delete()` methods
- Added panic recovery in goroutines

### New Files Created

#### Backend
1. **`Auth_Service/controllers/webhook_controller.go`** ✅
   - `HandleGoogleSheetEdit()` - handles webhooks from Google Sheets
   - Validates `X-Webhook-Secret` header
   - Routes to appropriate service based on sheet name
   - Updates MySQL with webhook data

2. **`Auth_Service/internal/syncsvc/apps_script_client.go`** (already exists) ✅
   - Simple HTTP client for Apps Script
   - `CreateRow()`, `UpdateRow()`, `DeleteRow()` methods
   - 10-second timeout
   - Noop client when URL not configured

3. **`Auth_Service/internal/syncsvc/entity_mapper.go`** (already exists) ✅
   - `EntityToMap()` converts structs to map for Apps Script

#### Apps Script
4. **`apps-script/onEdit.gs`** ✅
   - Trigger function for spreadsheet edits
   - Sends webhook to backend with sheet name, rowId, and data
   - Configuration via Script Properties

#### Configuration
5. **`Auth_Service/config/config.go`** ✅
   - Added `GoogleAppsScriptURL` field
   - Added `GOOGLE_APPS_SCRIPT_URL` environment variable

### Files Updated

1. **`Auth_Service/routes/routes.go`** ✅
   - Added `WebhookCtrl` to Deps
   - Added `POST /api/webhook/google` route

2. **`Auth_Service/cmd/main.go`** ✅
   - Initialize `AppsScriptClient` with `GOOGLE_APPS_SCRIPT_URL`
   - Inject `AppsScriptClient` into all 8 controllers
   - Initialize `WebhookController` with all 8 services

### Files Deleted
- `Auth_Service/controllers/sync_controller.go` ❌ (removed - used old SyncService)
- `Auth_Service/controllers/sync_controller_test.go` ❌ (removed - test for deleted controller)

## Environment Variables

Add to `Auth_Service/.env`:

```bash
# Apps Script URL for Dashboard→Spreadsheet sync
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Webhook secret for Spreadsheet→Dashboard sync
GOOGLE_WEBHOOK_SECRET=your-secret-here
```

## Sheet Name Mapping

| Controller | Sheet Name |
|------------|------------|
| InboundController | IN |
| OutboundController | OUT |
| ReportDailyTransportController | Daily |
| ScanOutDCController | Scan Out |
| ClaimVendorController | Claim |
| GantunganFakturController | Faktur |
| SetoranController | Setoran |
| WoWtController | WO-WT |

## API Endpoints

### Existing CRUD Endpoints (unchanged)
All existing endpoints remain functional:
- `GET /api/inbound` - List with pagination
- `GET /api/inbound/:id` - Get by ID
- `POST /api/inbound` - Create (now syncs to Spreadsheet)
- `PUT /api/inbound/:id` - Update (NO sync)
- `DELETE /api/inbound/:id` - Delete (NO sync)

Same pattern for: `/api/outbound`, `/api/report-daily`, `/api/scan-out-dc`, `/api/claim-vendor`, `/api/gantungan-faktur`, `/api/setoran`, `/api/wo-wt`

### New Webhook Endpoint
- `POST /api/webhook/google` - Receives edits from Google Sheets
  - Validates `X-Webhook-Secret` header
  - Updates MySQL based on sheet name and rowId

## Apps Script Setup

### 1. Deploy doPost.gs
```javascript
function doPost(e) {
  // Existing doPost implementation
  // Handles CREATE from Dashboard
}
```

### 2. Deploy onEdit.gs
```javascript
function onEdit(e) {
  // New trigger for spreadsheet edits
  // Sends webhook to backend
}
```

### 3. Configure Script Properties
Run `setupWebhook()` in Apps Script Editor:
```javascript
function setupWebhook() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('BACKEND_WEBHOOK_URL', 'https://your-backend-url.com/api/webhook/google');
  properties.setProperty('WEBHOOK_SECRET', 'your-webhook-secret-here');
}
```

### 4. Install onEdit Trigger
1. Apps Script Editor → Triggers (clock icon)
2. Add Trigger
3. Function: `onEdit`
4. Event source: From spreadsheet
5. Event type: On edit

## Testing

### Build
```bash
cd Auth_Service
go build ./...
```
Output: ✅ Success

### Tests
```bash
go test ./... -v
```
Output: ✅ All tests pass

## Behavior

### Dashboard → Spreadsheet (CREATE only)
1. User creates new record via Dashboard
2. Backend INSERT to MySQL
3. If MySQL INSERT succeeds:
   - Backend sends async POST to Apps Script `doPost()`
   - Apps Script appends row to Spreadsheet
   - If Apps Script fails, only logs error (does NOT rollback MySQL)

### Spreadsheet → Dashboard (EDIT only)
1. User edits cell in Google Spreadsheet
2. Apps Script `onEdit()` trigger fires
3. Apps Script sends POST webhook to Backend
4. Backend validates webhook secret
5. Backend fetches existing record from MySQL
6. Backend updates MySQL with spreadsheet data
7. Dashboard automatically shows updated data

### No Sync for UPDATE/DELETE
- `PUT /api/inbound/:id` - Updates MySQL only, does NOT sync to Spreadsheet
- `DELETE /api/inbound/:id` - Deletes from MySQL only, does NOT sync to Spreadsheet
- Reason: Spreadsheet is operational log/archive, not real-time mirror

## Architecture Decisions

### Why Apps Script Only?
- Simpler than Google Sheets API with Service Account
- No complex OAuth2 credential management
- No syncsvc.SyncService, google_client.go, sheet_service.go, etc.
- Just simple HTTP client + Apps Script

### Why MySQL is Source of Truth?
- Dashboard requires fast pagination, search, filtering
- MySQL provides ACID transactions
- Spreadsheet is operational view for non-technical users
- Spreadsheet edits flow back to MySQL via webhook

### Why Async Sync?
- Dashboard API must remain fast
- Apps Script can be slow (network latency)
- If Apps Script fails, Dashboard still works
- Logs errors without affecting user experience

### Why Only CREATE Syncs?
- CREATE = new operational data → should appear in Spreadsheet
- UPDATE = corrections/modifications → Spreadsheet is historical log
- DELETE = soft delete in app → Spreadsheet keeps archive

## Next Steps

1. ✅ All 8 controllers updated
2. ✅ WebhookController created
3. ✅ Apps Script onEdit() created
4. ✅ Routes updated
5. ✅ main.go updated
6. ✅ Build successful
7. ✅ Tests passing

### Deployment Checklist
- [ ] Update `Auth_Service/.env` with `GOOGLE_APPS_SCRIPT_URL`
- [ ] Update `Auth_Service/.env` with `GOOGLE_WEBHOOK_SECRET`
- [ ] Deploy `apps-script/doPost.gs` to Google Apps Script
- [ ] Deploy `apps-script/onEdit.gs` to Google Apps Script
- [ ] Run `setupWebhook()` in Apps Script to configure properties
- [ ] Install `onEdit` trigger in Apps Script
- [ ] Deploy Backend with updated code
- [ ] Test CREATE from Dashboard → verify row appears in Spreadsheet
- [ ] Test EDIT in Spreadsheet → verify MySQL updates and Dashboard shows change

## Troubleshooting

### Dashboard→Spreadsheet not working
- Check `GOOGLE_APPS_SCRIPT_URL` in `.env`
- Check Apps Script logs for errors
- Check Backend logs for `[SYNC]` messages

### Spreadsheet→Dashboard not working
- Check `GOOGLE_WEBHOOK_SECRET` matches in `.env` and Apps Script
- Check `onEdit` trigger is installed
- Check Backend logs for `[WEBHOOK]` messages
- Verify webhook endpoint is accessible from Google

### Sync fails but CRUD works
- This is expected behavior (fail-safe)
- Check logs to diagnose sync issues
- MySQL operations always succeed independently

## Summary

**Status: COMPLETE ✅**

- Architecture: MySQL-first dengan Spreadsheet sebagai operational view
- Flow 1 (Dashboard→Spreadsheet): CREATE only, async, fail-safe
- Flow 2 (Spreadsheet→Dashboard): EDIT only, webhook-based
- All 8 controllers updated
- WebhookController implemented
- Apps Script onEdit() trigger implemented
- Build: SUCCESS
- Tests: PASSING
- Breaking changes: NONE
- Frontend changes: NONE

**Implementation is production-ready.**
