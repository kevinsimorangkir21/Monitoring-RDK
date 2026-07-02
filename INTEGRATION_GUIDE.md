# Panduan Integrasi Google Sheets - Monitoring RDK

## Overview

Integrasi 2-arah antara Dashboard Monitoring RDK dan Google Spreadsheet.

### Flow 1: Spreadsheet → Dashboard
```
Operator edit Google Sheet
         ↓
onEdit() trigger
         ↓
Webhook ke Backend
         ↓
Upsert ke MySQL
         ↓
Dashboard menampilkan data terbaru
```

### Flow 2: Dashboard → Spreadsheet
```
User CRUD di Dashboard
         ↓
Insert/Update/Delete MySQL
         ↓
Backend panggil Apps Script doPost()
         ↓
Apps Script update Spreadsheet
```

## Konfigurasi

### 1. Environment Variables (Backend)

Tambahkan ke `.env`:

```env
# Google Sheets Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1jwYCwHn8VsPOwEPJ8J56UHnweOW1Sy-kQ859Dg0DVqk
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 2. Google Apps Script Setup

1. **Buka Spreadsheet** → Extensions → Apps Script

2. **Copy script dari** `apps-script/sync.gs`

3. **Konfigurasi Script Properties**:
   - File → Project Settings → Script Properties
   - Add property:
     - Key: `BACKEND_URL`
     - Value: `https://your-backend-url.com`

4. **Deploy as Web App**:
   - Click Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy Web App URL → masukkan ke `GOOGLE_APPS_SCRIPT_URL`

5. **Setup Trigger**:
   - Click Triggers (clock icon)
   - Add Trigger:
     - Function: `onEdit`
     - Event source: From spreadsheet
     - Event type: On edit

## Mapping Sheet ↔ Database

| Short Name | Sheet Name        | Database Table            | Key Column | Key Field        |
|------------|-------------------|---------------------------|------------|------------------|
| IN         | Inbound           | inbounds                  | C (2)      | nomor_fo         |
| OUT        | Outbound          | outbounds                 | B (1)      | freight_order    |
| Daily      | Report Daily      | report_daily_transports   | A (0)      | tanggal          |
| Scan Out   | Scan Out DC       | scan_out_dcs              | A (0)      | tanggal          |
| Claim      | Claim Vendor      | claim_vendors             | C (2)      | nomor_claim      |
| Faktur     | Gantungan Faktur  | gantungan_fakturs         | E (4)      | sd_document      |
| WO-WT      | WO-WT             | wo_wts                    | A (0)      | tanggal          |
| Setoran    | Setoran           | setorans                  | A (0)      | tanggal          |

## API Endpoints

### 1. Sync FROM Sheets (Spreadsheet → Dashboard)

**Endpoint:** `POST /api/sync/from-sheets`

**Request Body:**
```json
{
  "worksheet": "Inbound",
  "row": 5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "recordId": 123
}
```

### 2. Sync TO Sheets (Dashboard → Spreadsheet)

Backend otomatis memanggil Google Apps Script saat CRUD berhasil.

**Request yang dikirim ke Apps Script:**

**CREATE:**
```json
{
  "action": "create",
  "sheet": "IN",
  "data": {
    "tanggal": "2024-01-15",
    "shifting": "Pagi",
    "nomor_fo": "FO12345",
    "nopol": "B1234XYZ",
    ...
  }
}
```

**UPDATE:**
```json
{
  "action": "update",
  "sheet": "IN",
  "rowId": "FO12345",
  "data": {
    "tanggal": "2024-01-15",
    "shifting": "Siang",
    ...
  }
}
```

**DELETE:**
```json
{
  "action": "delete",
  "sheet": "IN",
  "rowId": "FO12345"
}
```

## Column Mapping Detail

### Inbound (9 kolom)
```
A: tanggal
B: shifting
C: nomor_fo (KEY)
D: nopol
E: plant_pabrik
F: jenis_bongkaran
G: total_box
H: nomor_gr
I: total_slipsheet
```

### Outbound (12 kolom)
```
A: tanggal
B: freight_order (KEY)
C: mobil_muat
D: status_fo
E: assign_job
F: jam_terima
G: status
H: selesai_muat
I: hari
J: putaran
K: sth2
L: jam_running
```

### Report Daily (4 kolom)
```
A: tanggal (KEY part 1)
B: division (KEY part 2)
C: report_type (KEY part 3)
D: qty
```

### Scan Out DC (7 kolom)
```
A: tanggal (KEY part 1)
B: vendor
C: nopol (KEY part 2)
D: driver
E: jam_scan
F: jam_keluar
G: status
```

### Claim Vendor (7 kolom)
```
A: tanggal
B: vendor
C: nomor_claim (KEY)
D: payment
E: outstanding
F: value
G: status
```

### Gantungan Faktur (8 kolom)
```
A: tanggal
B: pay_terms
C: customer
D: nama_toko
E: sd_document (KEY)
F: sales_doc
G: net_value
H: keterangan_transport
```

### Setoran (6 kolom)
```
A: tanggal (KEY part 1)
B: salesman (KEY part 2)
C: pulang_kunjungan
D: setoran_ke_kasir
E: durasi
F: bulan
```

### WO-WT (7 kolom)
```
A: tanggal (KEY part 1)
B: plant (KEY part 2)
C: zwp1
D: zwp2
E: zwp4
F: zwp5
G: global
```

## Testing

### Test Flow 1 (Spreadsheet → Dashboard)

1. Buka Google Spreadsheet
2. Edit sel di sheet "Inbound", misalnya ubah shifting dari "Pagi" ke "Siang"
3. Cek log Apps Script (Executions tab)
4. Cek backend log untuk confirm webhook diterima
5. Cek Dashboard, data harus berubah

### Test Flow 2 (Dashboard → Spreadsheet)

1. Buka Dashboard Monitoring RDK
2. Tambah/Edit/Hapus data di salah satu modul (misal Inbound)
3. Cek backend log untuk confirm request ke Apps Script
4. Cek Google Spreadsheet, data harus berubah

## Error Handling

### Backend
- Jika Google Sheets tidak dapat diakses: CRUD Dashboard tetap berhasil (async)
- Semua error dicatat di log dengan prefix `[SYNC TO GOOGLE SHEET]` atau `[SYNC FROM GOOGLE SHEET]`

### Apps Script
- Network error: dicatat di console, tidak throw exception
- Sheet not found: return error JSON
- Row not found untuk update/delete: return error JSON

## Troubleshooting

### Backend tidak bisa kirim ke Apps Script

1. **Cek GOOGLE_APPS_SCRIPT_URL** di `.env`
2. **Cek deployment Apps Script** masih aktif
3. **Cek log backend** untuk detail error

### Apps Script tidak bisa kirim webhook ke Backend

1. **Cek BACKEND_URL** di Script Properties
2. **Cek backend endpoint** `/api/sync/from-sheets` aktif
3. **Cek log Apps Script** di Executions tab

### Data tidak sinkron

1. **Cek primary key** sesuai dengan mapping di atas
2. **Cek format data** (tanggal, nomor, dll) sesuai dengan yang diharapkan
3. **Cek log** di kedua sisi (Backend & Apps Script)

## Performance Notes

- Sync ke Spreadsheet dilakukan **asynchronous** (tidak block response Dashboard)
- Rate limit Google Apps Script: 30,000 requests/day
- Rate limit Google Sheets API: 100 requests/100 seconds/user
- Untuk bulk operation, gunakan endpoint Import/Export yang sudah ada

## Security

- Backend menggunakan **Service Account** untuk akses Google Sheets API
- Apps Script endpoint menggunakan **HTTPS** wajib
- Webhook dari Spreadsheet **tidak memerlukan auth** (sudah validated by Google)
- Apps Script doPost() **tidak memerlukan secret** (hanya accessible via valid deployment URL)

## Maintenance

### Update Column Mapping

Jika ada perubahan struktur kolom:

1. **Update Apps Script** `dataToArray()` function
2. **Update Backend** `SheetMapper` di `Auth_Service/internal/syncsvc/sheet_mapper.go`
3. **Update dokumentasi** ini

### Update Sheet Names

Jika ada perubahan nama sheet:

1. **Update Apps Script** `mapSheetName()` function
2. **Update Backend** mapping di `sync_service.go`
3. **Update dokumentasi** ini
