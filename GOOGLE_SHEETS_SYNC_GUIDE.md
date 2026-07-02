# 🚀 Google Sheets Sync - Quick Start Guide

Panduan lengkap untuk mengaktifkan sinkronisasi otomatis antara Dashboard dan Google Sheets menggunakan Apps Script.

---

## 📋 Prerequisites

- ✅ Backend sudah direfactor (Apps Script only)
- ✅ Google Spreadsheet sudah dibuat
- ✅ Google Account dengan akses ke Spreadsheet

---

## 🔧 Step 1: Setup Apps Script

### 1.1 Buka Google Apps Script Editor

1. Buka Google Spreadsheet Anda
2. Klik **Extensions** → **Apps Script**
3. Akan terbuka editor baru di tab baru

### 1.2 Copy Script Files

1. **Hapus code default** (`function myFunction()` ...)
2. Copy isi file `apps-script/doPost.gs` ke editor
3. Klik **Save** (Ctrl+S)

### 1.3 Deploy as Web App

1. Klik **Deploy** → **New deployment**
2. Klik ikon **⚙️ (gear)** → Pilih **Web app**
3. **Configuration:**
   - Description: `Monitoring RDK Sync v1`
   - Execute as: **Me** (your email)
   - Who has access: **Anyone**
4. Klik **Deploy**
5. **Authorize** jika diminta:
   - Review permissions
   - Click **Allow**
6. **Copy Web App URL** (ends with `/exec`)
   - Example: `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 🔑 Step 2: Generate Webhook Secret

Generate random secret untuk keamanan:

```bash
# Using OpenSSL (Linux/Mac)
openssl rand -hex 32

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Max 256}))

# Or use online generator
# https://www.random.org/strings/
```

**Copy the generated secret!**

---

## ⚙️ Step 3: Configure Backend

### 3.1 Edit `.env` File

```bash
cd Auth_Service
nano .env  # or use any text editor
```

### 3.2 Add Configuration

```env
# Google Sheets Sync via Apps Script
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_WEBHOOK_SECRET=your-generated-secret-here
```

**Replace:**
- `YOUR_SCRIPT_ID` with your actual Apps Script deployment URL
- `your-generated-secret-here` with the secret from Step 2

### 3.3 Restart Backend

```bash
# Stop current server (Ctrl+C)

# Start again
go run cmd/main.go

# Check logs for:
# [SYNC] Apps Script client initialized ✅
```

---

## 🧪 Step 4: Test the Integration

### Test 1: Create Data

```bash
# From Dashboard: Add new Inbound record
POST /api/inbound
{
  "shifting": "Pagi",
  "nomor_fo": "FO-TEST-001",
  "nopol": "B 1234 XYZ",
  "plant_pabrik": "Plant A",
  "jenis_bongkaran": "Manual",
  "total_box": 100,
  "nomor_gr": "GR-001",
  "total_slipsheet": 10
}

# Expected:
# 1. Backend log: [SYNC] CREATE IN success (ID=123)
# 2. Check Google Sheets "IN" tab → New row appears! ✅
```

### Test 2: Update Data

```bash
# From Dashboard: Edit existing record
PUT /api/setoran/1
{
  "nopol": "B 5678 ABC",
  "durasi": 120
}

# Expected:
# 1. Backend log: [SYNC] UPDATE Setoran success (ID=1)
# 2. Check Google Sheets "Setoran" tab → Row updated! ✅
```

### Test 3: Delete Data

```bash
# From Dashboard: Delete record
DELETE /api/claim-vendor/5

# Expected:
# 1. Backend log: [SYNC] DELETE Claim success (ID=5)
# 2. Check Google Sheets "Claim" tab → Row deleted! ✅
```

---

## 📊 Sheet Names & Mapping

Make sure your Google Spreadsheet has these tabs:

| Tab Name | Controller | Endpoint |
|----------|------------|----------|
| **IN** | Inbound | `/api/inbound` |
| **OUT** | Outbound | `/api/outbound` |
| **Daily** | Report Daily Transport | `/api/report-daily` |
| **Scan Out** | Scan Out DC | `/api/scan-out-dc` |
| **Claim** | Claim Vendor | `/api/claim-vendor` |
| **Faktur** | Gantungan Faktur | `/api/gantungan-faktur` |
| **Setoran** | Setoran | `/api/setoran` |
| **WO-WT** | WO WT | `/api/wo-wt` |

**Important:** Tab names must match exactly (case-sensitive)!

---

## 🐛 Troubleshooting

### Problem: Sync not working

**Check 1: Backend Logs**
```bash
# At startup, should see:
[SYNC] Apps Script client initialized

# After CRUD operation, should see:
[SYNC] CREATE IN success (ID=123)
```

**Check 2: Environment Variable**
```bash
# Verify .env has:
GOOGLE_APPS_SCRIPT_URL=https://...

# NOT empty or commented out
```

**Check 3: Apps Script Deployment**
```bash
# Open Apps Script editor
# Click Deploy → Manage deployments
# Verify status is "Active"
```

---

### Problem: `[SYNC] failed CREATE IN: ...`

**Possible Causes:**

**1. Wrong Apps Script URL**
```bash
# Check .env file
# URL must end with /exec
# NOT /dev or /edit
```

**2. Apps Script Not Deployed**
```bash
# Re-deploy:
# Deploy → New deployment → Web app
```

**3. Permission Issues**
```bash
# Re-deploy with:
# Execute as: Me
# Who has access: Anyone
```

**4. Sheet Name Mismatch**
```bash
# Backend sends: "IN"
# But Spreadsheet tab is: "Inbound" ❌

# Fix: Rename tab to "IN" ✅
```

---

### Problem: Data in MySQL but not in Sheets

**This is expected behavior!**

- Backend uses **database-first** strategy
- If Apps Script fails, CRUD still succeeds
- Check logs for sync error messages
- Fix the issue, data will sync on next operation

**Manual Sync Option:**
- Export current database to CSV
- Import to Google Sheets
- Or run manual sync script (not implemented yet)

---

### Problem: `[SYNC] panic recovered in CREATE ...`

**Possible Causes:**

**1. Invalid Data Structure**
```bash
# Apps Script expects certain fields
# Check dataToRow() function in doPost.gs
```

**2. Apps Script Bug**
```bash
# Open Apps Script editor
# View → Logs
# Check for errors
```

---

## 📈 Monitoring

### View Apps Script Logs

1. Open Apps Script editor
2. Click **View** → **Logs** (Ctrl+Enter)
3. Look for:
   ```
   [SYNC] CREATE success on sheet: IN
   [SYNC] UPDATE success on sheet: Setoran, ID: 123
   [SYNC] DELETE success on sheet: Claim, ID: 456
   ```

### View Backend Logs

```bash
# Terminal where backend is running
# Look for [SYNC] messages

# Success:
[SYNC] CREATE IN success (ID=123)

# Failure:
[SYNC] failed UPDATE OUT: request failed: context deadline exceeded
```

---

## 🔒 Security Notes

### Webhook Secret

The `GOOGLE_WEBHOOK_SECRET` is currently **not used** in this implementation.

In production, you should:
1. Send secret in payload from backend
2. Validate secret in Apps Script before processing
3. Reject requests with invalid/missing secret

**Example Enhancement:**
```javascript
// In doPost.gs
function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  
  // Validate secret
  var expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (payload.secret !== expectedSecret) {
    return createResponse(false, "Unauthorized");
  }
  
  // ... rest of the code
}
```

### Apps Script Permissions

Current setup: **"Anyone" can execute**

- Simpler setup (no OAuth required)
- Suitable for internal tools
- Apps Script URL is hard to guess (contains random ID)

For higher security:
- Change to "Only myself" or "Anyone within organization"
- Requires OAuth flow from backend

---

## ✅ Success Checklist

- [ ] Apps Script deployed and URL copied
- [ ] Webhook secret generated
- [ ] `.env` file updated with both values
- [ ] Backend restarted
- [ ] Backend logs show: `[SYNC] Apps Script client initialized`
- [ ] Google Sheets tabs named correctly (IN, OUT, Daily, etc.)
- [ ] Test CREATE: Dashboard → MySQL → Sheets ✅
- [ ] Test UPDATE: Dashboard → MySQL → Sheets ✅
- [ ] Test DELETE: Dashboard → MySQL → Sheets ✅

---

## 🎉 Congratulations!

Your Dashboard is now synced with Google Sheets!

**What You Achieved:**
- ✔️ Real-time sync from Dashboard to Sheets
- ✔️ No manual data entry needed
- ✔️ No Google API complexity
- ✔️ No Service Account required
- ✔️ Simple Apps Script bridge

**Next Steps:**
- Monitor sync logs for first few days
- Add more sheets if needed
- Customize Apps Script for your specific data structure
- Consider adding Sheets → Dashboard sync (reverse direction)

---

## 📞 Support

**Problems?**
1. Check troubleshooting section above
2. Review backend logs: `[SYNC]` messages
3. Review Apps Script logs: View → Logs
4. Check `.env` configuration
5. Verify Google Sheets tab names

**Still stuck?**
- Review `SYNC_IMPLEMENTATION_COMPLETE.md` for technical details
- Check Apps Script documentation
- Review controller code in `Auth_Service/controllers/*.go`
