# Design Document — Google Sheets Sync

## Overview

Fitur **Google Sheets Sync** menambahkan lapisan sinkronisasi dua arah antara MySQL (backend Go) dan Google Spreadsheet tanpa mengubah endpoint CRUD yang sudah ada. Sinkronisasi berjalan melalui dua jalur:

1. **Dashboard → Sheets**: Setelah operasi CRUD berhasil di MySQL, goroutine async mendorong perubahan ke Google Sheets via API.
2. **Sheets → Dashboard**: Apps Script `onEdit` trigger mengirim webhook ke backend, yang melakukan upsert ke MySQL dan menyiarkan event ke semua klien Dashboard melalui SSE.

Seluruh logika sinkronisasi dienkapsulasi dalam package baru `internal/syncsvc` (bukan `sync` untuk menghindari konflik dengan stdlib Go). Backend berjalan dalam **Degraded Mode** jika env vars Google tidak dikonfigurasi — endpoint CRUD tetap normal, endpoint sync mengembalikan 503.

### Keputusan Desain Utama

- **Package `syncsvc`** bukan `sync`: menghindari konflik nama dengan `sync` dari stdlib.
- **Goroutine async** untuk sync setelah CRUD: latency impact ≤50ms ke klien.
- **Last Write Wins** berbasis `updated_at`: resolusi konflik deterministik tanpa distributed lock.
- **SSE Hub** berbasis channel Go: broadcast ringan tanpa library tambahan.
- **`subtle.ConstantTimeCompare`** untuk validasi webhook secret: mencegah timing attack.
- **Service Account** dari env vars (bukan file JSON): aman untuk deployment container.

---

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js 15)"
        DASH[Dashboard UI]
        SSE_CLIENT[SSE Consumer Hook]
    end

    subgraph "Backend Go (Gin)"
        CRUD[Existing CRUD Controllers]
        SYNC_CTRL[SyncController]
        SSE_EP[GET /api/sse]
        
        subgraph "syncsvc Package"
            GC[GoogleClient]
            SS[SheetService]
            SM[SheetMapper]
            SVC[SyncService]
            CR[ConflictResolver]
        end
        
        SSE_HUB[SSE Hub]
        MW[JWT Middleware]
    end

    subgraph "External"
        MYSQL[(MySQL)]
        GSHEET[Google Sheets API]
        AS[Apps Script onEdit]
    end

    DASH -- "CRUD HTTP" --> CRUD
    CRUD -- "upsert/delete" --> MYSQL
    CRUD -- "go async" --> SVC
    SVC -- "read/write" --> SS
    SS -- "Sheets API" --> GC
    GC -- "OAuth2 SA" --> GSHEET
    SM -- "row ↔ struct" --> SVC

    DASH -- "SSE connect (JWT)" --> SSE_EP
    SSE_EP --> SSE_HUB
    SVC -- "notify" --> SSE_HUB
    SSE_HUB -- "broadcast" --> SSE_CLIENT

    AS -- "onEdit webhook" --> SYNC_CTRL
    SYNC_CTRL -- "validate secret" --> SVC
    SVC -- "upsert" --> MYSQL
    SVC -- "notify" --> SSE_HUB

    SYNC_CTRL -- "POST /api/sync/google\n(no JWT)" --> MW
    SSE_EP -- "GET /api/sse\n(JWT required)" --> MW
```

### Data Flow: Dashboard CRUD → MySQL → Google Sheets

```mermaid
sequenceDiagram
    participant DASH as Dashboard (Next.js)
    participant CTRL as CRUD Controller
    participant MYSQL as MySQL
    participant SVC as SyncService
    participant SS as SheetService
    participant GS as Google Sheets

    DASH->>CTRL: POST/PUT/DELETE /api/{entity}
    CTRL->>MYSQL: Create / Update / Delete
    MYSQL-->>CTRL: OK (rekord dengan updated_at)
    CTRL-->>DASH: 201/200 response (tidak tunggu sync)
    CTRL->>SVC: go SyncAfterCRUD(entity, op, record)
    Note over SVC: goroutine async, tidak block response
    SVC->>SS: AppendRow / UpdateRow / DeleteRow
    SS->>GS: batchUpdate / clear
    GS-->>SS: OK
    SS-->>SVC: OK
    Note over SVC: Jika gagal → log error, tidak notify client
```

### Data Flow: Apps Script Webhook → MySQL → SSE

```mermaid
sequenceDiagram
    participant GS as Google Sheets
    participant AS as Apps Script
    participant SYNC as POST /api/sync/google
    participant SVC as SyncService
    participant MYSQL as MySQL
    participant HUB as SSE Hub
    participant DASH as Dashboard (Next.js)

    GS->>AS: onEdit(e) trigger
    AS->>AS: cek e.value && e.oldValue
    AS->>SYNC: POST {worksheet, row, timestamp, secret}
    SYNC->>SVC: ValidateSecret (ConstantTimeCompare)
    alt secret tidak cocok
        SYNC-->>AS: 401 {"error":"unauthorized"}
    else secret valid
        SVC->>GS: ReadRow(worksheet, rowNum)
        GS-->>SVC: []string (nilai sel)
        SVC->>SVC: SheetMapper.RowToStruct
        SVC->>MYSQL: Upsert (ON DUPLICATE KEY UPDATE)
        MYSQL-->>SVC: OK (id rekord)
        SVC->>HUB: Notify(worksheet, id)
        HUB->>DASH: data: {"event":"sync","worksheet":"...","id":...}
        SYNC-->>AS: 200 {"ok":true}
    end
```

### Data Flow: Import (Sheets → MySQL)

```mermaid
sequenceDiagram
    participant CLIENT as Operator (JWT)
    participant IMPORT as POST /api/import/google
    participant SVC as SyncService
    participant SM as SheetMapper
    participant GS as Google Sheets
    participant MYSQL as MySQL

    CLIENT->>IMPORT: POST (JWT token)
    IMPORT->>SVC: ImportAll()
    loop setiap 8 worksheet
        SVC->>GS: ReadSheet(worksheetName)
        GS-->>SVC: [][]string (semua baris)
        SVC->>SM: RowsToStructs(rows[1:]) ← skip header
        SM-->>SVC: []Model + []SkippedRows
        SVC->>MYSQL: Upsert batch (created_by="google_import")
    end
    SVC-->>IMPORT: ImportResult{imported, skipped, errors}
    IMPORT-->>CLIENT: 200 {"results":[...]}
```

### Data Flow: Export (MySQL → Sheets)

```mermaid
sequenceDiagram
    participant CLIENT as Operator (JWT)
    participant EXPORT as POST /api/export/google
    participant SVC as SyncService
    participant SM as SheetMapper
    participant MYSQL as MySQL
    participant GS as Google Sheets

    CLIENT->>EXPORT: POST (JWT token)
    EXPORT->>SVC: ExportAll()
    loop setiap 8 tabel
        SVC->>MYSQL: SELECT * FROM table
        MYSQL-->>SVC: []Model
        SVC->>SM: StructsToRows(models)
        SM-->>SVC: [][]interface{}
        SVC->>GS: ClearSheet(worksheet, from row 2)
        SVC->>GS: batchUpdate(worksheet, rows, startRow=2)
        GS-->>SVC: OK
    end
    SVC-->>EXPORT: ExportResult{written, errors}
    EXPORT-->>CLIENT: 200 {"results":[...]}
```

---

## Components and Interfaces

### Package `internal/syncsvc`

#### `google_client.go` — GoogleClient

```go
// GoogleClient mengelola autentikasi Service Account dan akses ke Sheets API.
type GoogleClient interface {
    // GetSheetValues membaca semua baris dari worksheet yang disebutkan.
    // Mengembalikan error jika worksheet tidak ditemukan.
    GetSheetValues(ctx context.Context, worksheet string) ([][]string, error)

    // GetRow membaca satu baris berdasarkan nomor baris (1-based).
    GetRow(ctx context.Context, worksheet string, rowNum int) ([]string, error)

    // AppendRow menambahkan satu baris baru di akhir worksheet.
    AppendRow(ctx context.Context, worksheet string, values []interface{}) error

    // UpdateRow menimpa satu baris berdasarkan nomor baris (1-based).
    UpdateRow(ctx context.Context, worksheet string, rowNum int, values []interface{}) error

    // DeleteRow menghapus satu baris berdasarkan nomor baris dengan shiftRows=true.
    DeleteRow(ctx context.Context, worksheet string, rowNum int) error

    // BatchUpdateRows menulis banyak baris sekaligus menggunakan values.batchUpdate.
    BatchUpdateRows(ctx context.Context, worksheet string, startRow int, values [][]interface{}) error

    // ClearSheet menghapus konten mulai dari baris ke-2 (preserves header).
    ClearSheet(ctx context.Context, worksheet string) error

    // FindRowByKey mencari nomor baris (1-based) berdasarkan nilai di kolom kunci.
    // Mengembalikan 0 jika tidak ditemukan.
    FindRowByKey(ctx context.Context, worksheet, keyCol, keyValue string) (int, error)
}
```

**Catatan Implementasi:**
- Bangun kredensial dari `config.Config` secara programatik menggunakan `golang.org/x/oauth2/google`:

```go
cfg := &jwt.Config{
    Email:      config.GoogleClientEmail,
    PrivateKey: []byte(strings.ReplaceAll(config.GooglePrivateKey, `\n`, "\n")),
    Scopes:     []string{"https://www.googleapis.com/auth/spreadsheets"},
    TokenURL:   google.JWTTokenURL,
}
```

- Retry exponential backoff untuk HTTP 401, 429, 5xx — maksimal 3 kali.
- Akses sheet by name, bukan by index: gunakan spreadsheet metadata API untuk resolve nama → sheetId.

#### `sheet_service.go` — SheetService

```go
// SheetService membungkus GoogleClient dengan logika batch read/write level worksheet.
type SheetService interface {
    // ReadAllWorksheets membaca semua 8 worksheet sekaligus.
    // Worksheet yang gagal dibaca tidak menghentikan worksheet lainnya.
    ReadAllWorksheets(ctx context.Context) (map[string][][]string, map[string]error)

    // WriteWorksheet menghapus baris lama (mulai row 2) dan menulis data baru
    // menggunakan batchUpdate dalam satu round-trip per worksheet.
    WriteWorksheet(ctx context.Context, worksheet string, rows [][]interface{}) error

    // SyncRowToSheet menentukan apakah baris harus di-append, update, atau delete
    // berdasarkan operasi CRUD yang dilakukan, lalu memanggil GoogleClient.
    SyncRowToSheet(ctx context.Context, op CRUDOp, worksheet, keyCol, keyValue string, values []interface{}) error
}

// CRUDOp mewakili jenis operasi CRUD.
type CRUDOp string

const (
    OpCreate CRUDOp = "create"
    OpUpdate CRUDOp = "update"
    OpDelete CRUDOp = "delete"
)
```

#### `sheet_mapper.go` — SheetMapper

```go
// SheetMapper mengonversi baris spreadsheet ([]string) ke/dari struct model Go.
type SheetMapper interface {
    // RowsToInbounds mengonversi baris Inbound worksheet, skip row kosong/invalid.
    RowsToInbounds(rows [][]string) ([]models.Inbound, []SkippedRow)
    RowsToOutbounds(rows [][]string) ([]models.Outbound, []SkippedRow)
    RowsToReportDailyTransports(rows [][]string) ([]models.ReportDailyTransport, []SkippedRow)
    RowsToScanOutDCs(rows [][]string) ([]models.ScanOutDC, []SkippedRow)
    RowsToClaimVendors(rows [][]string) ([]models.ClaimVendor, []SkippedRow)
    RowsToGantunganFakturs(rows [][]string) ([]models.GantunganFaktur, []SkippedRow)
    RowsToSetorans(rows [][]string) ([]models.Setoran, []SkippedRow)
    RowsToWoWts(rows [][]string) ([]models.WoWt, []SkippedRow)

    // InboundToRow dan sejenisnya mengonversi struct ke []interface{} untuk ditulis ke sheet.
    InboundToRow(m *models.Inbound) []interface{}
    OutboundToRow(m *models.Outbound) []interface{}
    ReportDailyTransportToRow(m *models.ReportDailyTransport) []interface{}
    ScanOutDCToRow(m *models.ScanOutDC) []interface{}
    ClaimVendorToRow(m *models.ClaimVendor) []interface{}
    GantunganFakturToRow(m *models.GantunganFaktur) []interface{}
    SetoranToRow(m *models.Setoran) []interface{}
    WoWtToRow(m *models.WoWt) []interface{}
}

// SkippedRow mencatat baris yang dilewati saat parsing.
type SkippedRow struct {
    Worksheet string
    RowNumber int    // 1-based, termasuk header
    Reason    string
}
```

#### `sync_service.go` — SyncService (Orchestrator)

```go
// SyncService adalah orchestrator utama yang mengoordinasikan semua komponen syncsvc.
type SyncService interface {
    // ImportAll membaca semua 8 worksheet dan melakukan upsert ke MySQL.
    ImportAll(ctx context.Context) (*ImportResult, error)

    // ExportAll membaca semua 8 tabel MySQL dan menulis ke worksheet yang bersesuaian.
    ExportAll(ctx context.Context) (*ExportResult, error)

    // SyncAfterCRUD dipanggil sebagai goroutine async setelah operasi CRUD berhasil.
    // entity: nama tabel (mis. "inbounds"), op: create/update/delete, record: model struct
    SyncAfterCRUD(entity string, op CRUDOp, record interface{})

    // ProcessWebhook memvalidasi secret, membaca baris dari sheet, upsert ke MySQL,
    // dan menyiarkan event SSE.
    ProcessWebhook(ctx context.Context, payload WebhookPayload) error

    // IsConfigured mengembalikan true jika env vars Google tersedia (bukan Degraded Mode).
    IsConfigured() bool
}

// WebhookPayload adalah payload dari Apps Script.
type WebhookPayload struct {
    Worksheet string `json:"worksheet"`
    Row       int    `json:"row"`
    Timestamp string `json:"timestamp"`
    Secret    string `json:"secret"`
}

// ImportResult merangkum hasil operasi import.
type ImportResult struct {
    Results []WorksheetImportResult `json:"results"`
}

type WorksheetImportResult struct {
    Worksheet string `json:"worksheet"`
    Imported  int    `json:"imported"`
    Skipped   int    `json:"skipped"`
    Error     string `json:"error,omitempty"`
}

// ExportResult merangkum hasil operasi export.
type ExportResult struct {
    Results []WorksheetExportResult `json:"results"`
    Errors  []string                `json:"errors,omitempty"`
}

type WorksheetExportResult struct {
    Worksheet string `json:"worksheet"`
    Written   int    `json:"written"`
}
```

#### `conflict_resolver.go` — ConflictResolver

```go
// ConflictResolver menyelesaikan konflik data antara Google Sheets dan MySQL.
type ConflictResolver interface {
    // Resolve membandingkan updated_at dari kedua sumber dan menentukan tindakan.
    // Mengembalikan ConflictDecision dan melakukan write-back bila diperlukan.
    Resolve(ctx context.Context, table string, recordID uint,
        sheetsUpdatedAt, mysqlUpdatedAt time.Time,
        writeBackToMySQL func() error,
        writeBackToSheets func() error,
    ) (ConflictDecision, error)
}

// ConflictDecision adalah hasil keputusan resolusi konflik.
type ConflictDecision string

const (
    DecisionMySQLWins  ConflictDecision = "mysql_wins"
    DecisionSheetsWins ConflictDecision = "sheets_wins"
    DecisionNoConflict ConflictDecision = "no_conflict"
)
```

### SSE Hub Design

SSE Hub diimplementasikan sebagai struct yang berjalan di satu goroutine event-loop untuk menghindari race condition pada map clients.

```
┌─────────────────────────────────────────────────────────────┐
│                         SSE Hub                             │
│                                                             │
│   clients map[string]chan SSEEvent  ← protected by loop     │
│   register  chan clientReg                                   │
│   unregister chan string (clientID)                         │
│   broadcast  chan SSEEvent                                   │
│   keepalive  *time.Ticker (30s)                             │
│                                                             │
│   goroutine Run():                                          │
│     select {                                                │
│       case reg  := <-register    → clients[id] = ch        │
│       case id   := <-unregister  → delete(clients, id)     │
│       case evt  := <-broadcast   → for _, ch := range ...  │
│       case <-keepalive.C         → write ": keepalive\n\n" │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
```

```go
// SSEHub mengelola koneksi SSE dari klien Dashboard.
type SSEHub struct {
    clients    map[string]chan SSEEvent  // clientID → channel
    register   chan clientReg
    unregister chan string
    broadcast  chan SSEEvent
}

type SSEEvent struct {
    Event     string `json:"event"`
    Worksheet string `json:"worksheet,omitempty"`
    ID        uint   `json:"id,omitempty"`
    ClientID  string `json:"clientId,omitempty"`
}

type clientReg struct {
    id string
    ch chan SSEEvent
}

// NewSSEHub membuat Hub baru dan menjalankan goroutine event-loop.
func NewSSEHub() *SSEHub

// Register mendaftarkan klien baru dan mengembalikan channel untuk menerima event.
func (h *SSEHub) Register(clientID string) chan SSEEvent

// Unregister melepas registrasi klien dan menutup channelnya.
func (h *SSEHub) Unregister(clientID string)

// Broadcast menyiarkan event ke semua klien yang terdaftar.
func (h *SSEHub) Broadcast(evt SSEEvent)
```

**Endpoint `GET /api/sse` Handler:**
```go
func (ctrl *SyncController) SSEStream(c *gin.Context) {
    clientID := uuid.NewString()
    ch := ctrl.hub.Register(clientID)
    defer ctrl.hub.Unregister(clientID)

    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("X-Accel-Buffering", "no")

    // Kirim event "connected"
    c.SSEvent("message", SSEEvent{Event: "connected", ClientID: clientID})
    c.Writer.Flush()

    for {
        select {
        case <-c.Request.Context().Done():
            return
        case evt, ok := <-ch:
            if !ok {
                return
            }
            c.SSEvent("message", evt)
            c.Writer.Flush()
        }
    }
}
```

---

## Data Models

### Mapping Worksheet ↔ Tabel ↔ Upsert Key ↔ Kolom Sheet

| Worksheet | Tabel MySQL | Upsert Key | Kolom (kiri→kanan di sheet) |
|---|---|---|---|
| Inbound | `inbounds` | `nomor_fo` | tanggal, shifting, nomor_fo, nopol, plant_pabrik, jenis_bongkaran, total_box, nomor_gr, total_slipsheet |
| Outbound | `outbounds` | `freight_order` | tanggal, freight_order, mobil_muat, status_fo, assign_job, jam_terima, status, selesai_muat, hari, putaran, sth2, jam_running |
| Report Daily | `report_daily_transports` | `tanggal`+`division`+`report_type` | tanggal, division, report_type, qty |
| Scan Out DC | `scan_out_dcs` | `tanggal`+`nopol` | tanggal, vendor, nopol, driver, jam_scan, jam_keluar, status |
| Claim Vendor | `claim_vendors` | `nomor_claim` | tanggal, vendor, nomor_claim, payment, outstanding, value, status |
| Gantungan Faktur | `gantungan_fakturs` | `sd_document` | tanggal, pay_terms, customer, nama_toko, sd_document, sales_doc, net_value, keterangan_transport |
| Setoran | `setorans` | `tanggal`+`salesman` | tanggal, salesman, pulang_kunjungan, setoran_ke_kasir, durasi, bulan |
| WO-WT | `wo_wts` | `tanggal`+`plant` | tanggal, plant, zwp1, zwp2, zwp4, zwp5, global |

### Ekstensi `Config` Struct

File `Auth_Service/config/config.go` diperluas secara additive:

```go
type Config struct {
    // ... field yang sudah ada tidak berubah ...
    Port        string
    DBHost      string
    DBPort      string
    DBUser      string
    DBPass      string
    DBName      string
    JWTSecret   string
    JWTExpire   string
    CORSOrigins string

    // Field baru untuk Google Sheets Sync
    GoogleProjectID     string // GOOGLE_PROJECT_ID (opsional, warning saja)
    GoogleClientEmail   string // GOOGLE_CLIENT_EMAIL (wajib)
    GooglePrivateKey    string // GOOGLE_PRIVATE_KEY (wajib, \n di-replace ke newline)
    GoogleSpreadsheetID string // GOOGLE_SPREADSHEET_ID (wajib)
    GoogleWebhookSecret string // GOOGLE_WEBHOOK_SECRET (opsional, warning saja)
}
```

**Startup logic:**

```
if GoogleClientEmail == "" || GooglePrivateKey == "" || GoogleSpreadsheetID == "" {
    log.Fatal("fatal: missing env var GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY/GOOGLE_SPREADSHEET_ID")
    → Backend TIDAK start
}
Jika semua ada → Init Google Client
Jika Google API tidak reachable → log warning, masuk Degraded Mode
```

**GOOGLE_PRIVATE_KEY normalisasi:**
```go
key := strings.ReplaceAll(os.Getenv("GOOGLE_PRIVATE_KEY"), `\n`, "\n")
```

### Env Vars Baru (`.env.example`)

```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
GOOGLE_SPREADSHEET_ID=1jwYCwHn8VsPOwEPJ8J56UHnweOW1Sy-kQ859Dg0DVqk
GOOGLE_WEBHOOK_SECRET=your-random-secret-here
```

---

## Conflict Resolver Algorithm (Last Write Wins)

```
Resolve(sheetsUpdatedAt, mysqlUpdatedAt):
  ┌─────────────────────────────────────────────────────┐
  │ Jika salah satu null/unparseable:                   │
  │   sumber null = kalah                               │
  │   log warning                                       │
  │   lakukan write-back ke sumber yang kalah           │
  │   return decision                                   │
  │                                                     │
  │ diff = sheetsUpdatedAt - mysqlUpdatedAt             │
  │                                                     │
  │ diff > 0 (sheets lebih baru):                       │
  │   → UPDATE MySQL dengan data dari Sheets            │
  │   → decision = "sheets_wins"                        │
  │                                                     │
  │ diff < 0 (mysql lebih baru):                        │
  │   → UPDATE Sheets dengan data dari MySQL            │
  │   → decision = "mysql_wins"                         │
  │                                                     │
  │ diff == 0 (identik):                                │
  │   → tidak ada operasi tulis                         │
  │   → decision = "no_conflict"                        │
  │                                                     │
  │ Catat ke log: table, id, sheetsTs, mysqlTs, decision│
  └─────────────────────────────────────────────────────┘
```

**Log format:**
```
[conflict_resolver] table=inbounds id=42 sheets_updated_at=2024-01-15T10:30:00Z
  mysql_updated_at=2024-01-15T10:29:00Z decision=sheets_wins
```

---

## Apps Script (Google Apps Script)

Kode lengkap Apps Script yang dipasang di Spreadsheet dengan trigger `onEdit`:

```javascript
/**
 * Konfigurasi: Set WEBHOOK_SECRET di Apps Script Properties
 *   File > Project Properties > Script Properties
 *   Key: WEBHOOK_SECRET, Value: <nilai secret yang sama dengan GOOGLE_WEBHOOK_SECRET>
 *
 * Set juga BACKEND_URL:
 *   Key: BACKEND_URL, Value: https://your-backend.example.com
 */

/**
 * Trigger onEdit - dipanggil otomatis saat sel diedit.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function onEdit(e) {
  // Hanya proses jika nilai sel benar-benar berubah (bukan sekedar format)
  if (e.value === undefined || e.oldValue === undefined) {
    return;
  }

  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('WEBHOOK_SECRET');
  var backendUrl = props.getProperty('BACKEND_URL');

  if (!secret) {
    console.error('[onEdit] WEBHOOK_SECRET not configured in Script Properties');
    return;
  }

  if (!backendUrl) {
    console.error('[onEdit] BACKEND_URL not configured in Script Properties');
    return;
  }

  // Validasi HTTPS
  if (!backendUrl.startsWith('https://')) {
    console.error('[onEdit] BACKEND_URL must use HTTPS, got: ' + backendUrl);
    return;
  }

  var sheet = e.source.getActiveSheet();
  var worksheetName = sheet.getName();
  var rowNum = e.range.getRow();

  var payload = JSON.stringify({
    worksheet: worksheetName,
    row: rowNum,
    timestamp: new Date().toISOString(),
    secret: secret
  });

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(backendUrl + '/api/sync/google', options);
    var code = response.getResponseCode();
    if (code !== 200) {
      console.error(
        '[onEdit] Webhook failed: HTTP ' + code +
        ' | worksheet=' + worksheetName +
        ' | row=' + rowNum +
        ' | body=' + response.getContentText()
      );
    }
  } catch (err) {
    // Jangan lempar exception — catat saja ke log
    console.error('[onEdit] Network error calling webhook: ' + err.toString());
  }
}
```

---

## Frontend SSE Consumer (Next.js)

Hook `useSSESync` untuk Next.js 15 yang terhubung ke `GET /api/sse` dan memicu refresh data.

```typescript
// src/hooks/useSSESync.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface SSEEvent {
  event: 'connected' | 'sync';
  worksheet?: string;
  id?: number;
  clientId?: string;
}

type SyncHandler = (event: SSEEvent) => void;

/**
 * useSSESync — menghubungkan ke SSE endpoint dan memanggil onSync
 * setiap kali event "sync" diterima dari backend.
 *
 * @param onSync  - callback dipanggil dengan SSEEvent setiap ada update
 * @param enabled - set false untuk disable (mis. saat komponen tidak visible)
 */
export function useSSESync(onSync: SyncHandler, enabled = true): void {
  const esRef = useRef<EventSource | null>(null);
  const onSyncRef = useRef<SyncHandler>(onSync);

  // Selalu pakai versi terbaru callback tanpa re-subscribe
  useEffect(() => {
    onSyncRef.current = onSync;
  });

  const connect = useCallback(() => {
    // Ambil token dari session/cookie
    const token = typeof window !== 'undefined'
      ? document.cookie.match(/token=([^;]+)/)?.[1]
      : null;

    if (!token) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sse`;
    // EventSource tidak mendukung header Authorization — kirim token via query param
    const es = new EventSource(`${url}?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const parsed: SSEEvent = JSON.parse(e.data);
        onSyncRef.current(parsed);
      } catch {
        // Abaikan pesan yang tidak valid JSON (mis. keepalive comment)
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect setelah 5 detik
      setTimeout(() => {
        if (enabled) connect();
      }, 5000);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, connect]);
}
```

**Contoh penggunaan di komponen:**
```typescript
// Dalam komponen tabel Inbound
export function InboundTable() {
  const { data, refetch } = useInbounds();

  useSSESync((evt) => {
    if (evt.event === 'sync' && evt.worksheet === 'Inbound') {
      refetch(); // re-query dari backend
    }
  });

  return <table>...</table>;
}
```

**Catatan:** Karena `EventSource` browser tidak mendukung custom header, token JWT dikirim sebagai query parameter `?token=...`. Backend middleware perlu mendukung token dari query param untuk endpoint `/api/sse`.

---

## Error Handling Strategy

### Kategori Error

| Kategori | Sumber | Handling | Dampak ke Klien |
|---|---|---|---|
| Google API error (retryable: 401/429/5xx) | `GoogleClient` | Retry 3x exponential backoff | Tidak terlihat jika retry berhasil |
| Google API error (tidak retryable: 400, 403) | `GoogleClient` | Log + return error | 500 ke endpoint sync/import/export |
| Baris sheet tidak valid | `SheetMapper` | Log + skip baris | Tidak ada; dilaporkan di response `skipped` |
| Upsert MySQL gagal | `SyncService` | Log + lanjut ke worksheet lain | Tidak ada (async) atau 500 (webhook) |
| Webhook secret tidak cocok | `SyncController` | Return 401 langsung | 401 ke Apps Script |
| SSE write error (klien disconnect) | `SSEHub` | Unregister klien | Tidak ada |
| Degraded Mode | `SyncController` | Return 503 | 503 dengan pesan deskriptif |
| Write-back conflict gagal | `ConflictResolver` | Log error, tidak gagalkan operasi utama | Tidak ada |

### Degraded Mode

```go
// Di setiap endpoint sync handler:
if !syncSvc.IsConfigured() {
    c.JSON(503, gin.H{"error": "google sync not configured"})
    return
}
```

Kondisi masuk Degraded Mode:
1. `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, atau `GOOGLE_SPREADSHEET_ID` kosong.
2. Google Sheets API tidak dapat dijangkau saat startup (network error).

Dalam Degraded Mode, semua endpoint CRUD (`/api/inbounds/*`, dll.) tetap berfungsi normal.

### Log Format Standar

Semua log dari `syncsvc` menggunakan prefix `[syncsvc]`:
```
[syncsvc] SyncAfterCRUD error: table=inbounds id=5 op=update err=<pesan>
[syncsvc] import skipped: worksheet=Inbound row=7 reason=invalid date "bukan-tanggal"
[syncsvc] conflict resolved: table=claim_vendors id=12 sheets_ts=... mysql_ts=... decision=sheets_wins
[syncsvc] webhook rejected: secret mismatch (remote_ip=1.2.3.4)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection (Sebelum Finalisasi)

Setelah analisis prework, beberapa properti yang redundan dikonsolidasi:
- **Req 5.2 dan 5.3** digabung menjadi Property 5 (secret validation).
- **Req 6.1–6.4** digabung menjadi satu comprehensive property conflict resolution (Property 7).
- **Req 6.6 dan 6.7** digabung menjadi Property 8 (null/error handling di resolver).
- **Req 3.3 dan 3.4** digabung menjadi Property 4 (idempotency export + header preservation).
- **Req 4.4 dan 4.5** digabung menjadi Property 6 (async sync tidak mempengaruhi klien).

---

### Property 1: SheetMapper melewati baris header

*For any* worksheet data ([][]string) dengan baris pertama apapun sebagai header, hasil `RowsToXxx(rows)` tidak boleh mengandung data yang berasal dari baris ke-0 — konversi selalu dimulai dari elemen indeks ke-1.

**Validates: Requirements 2.2**

---

### Property 2: SheetMapper round-trip (RowToStruct → StructToRow → RowToStruct)

*For any* valid model struct (Inbound, Outbound, ReportDailyTransport, ScanOutDC, ClaimVendor, GantunganFaktur, Setoran, WoWt) dengan nilai field yang valid, mengkonversi struct ke row lalu balik ke struct harus menghasilkan struct yang semantically equal dengan input asli: `RowToStruct(StructToRow(m)) ≡ m`.

**Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10**

---

### Property 3: Baris tidak valid menghasilkan SkippedRow, bukan panic

*For any* baris worksheet yang mengandung data tidak valid di field manapun (tanggal tidak bisa diparsing, nilai enum tidak dikenal, string kosong di field wajib), `SheetMapper.RowsToXxx` harus mengembalikan entri `SkippedRow` untuk baris tersebut dan tidak pernah panic atau return error fatal — baris lainnya tetap diproses.

**Validates: Requirements 2.11**

---

### Property 4: Import idempotent (upsert tidak membuat duplikat)

*For any* set baris worksheet yang valid, memanggil `SyncService.ImportAll` dua kali berturut-turut dengan data yang sama harus menghasilkan jumlah rekord di MySQL yang identik setelah kedua pemanggilan — tidak ada rekord duplikat yang dibuat.

**Validates: Requirements 2.12**

---

### Property 5: Setiap rekord hasil import memiliki created_by = "google_import"

*For any* data worksheet yang di-import melalui `POST /api/import/google`, setiap rekord yang diinsert ke MySQL harus memiliki field `created_by` bernilai tepat `"google_import"`, terlepas dari konten data worksheet.

**Validates: Requirements 2.13**

---

### Property 6: Export idempotent dan mempertahankan header

*For any* set data MySQL, memanggil `SyncService.ExportAll` dua kali berturut-turut harus menghasilkan isi worksheet yang identik setelah kedua pemanggilan (tidak ada duplikat baris). Selain itu, baris ke-1 (header) dari setiap worksheet tidak boleh berubah setelah operasi export apapun.

**Validates: Requirements 3.3, 3.4**

---

### Property 7: Async sync tidak mempengaruhi latency endpoint CRUD

*For any* CRUD operation yang berhasil di MySQL, response time endpoint yang diukur dari sisi klien tidak boleh bertambah lebih dari 50ms dibandingkan waktu yang dibutuhkan oleh operasi MySQL murni, terlepas dari berapa lama operasi sync ke Google Sheets berlangsung (disimulasikan via mock delay).

**Validates: Requirements 4.4**

---

### Property 8: Kegagalan sync async tidak mengubah response klien CRUD

*For any* CRUD operation di mana operasi sync ke Google Sheets gagal (mock error), response HTTP ke klien Dashboard harus tetap 201 (Create) atau 200 (Update/Delete) — error sync tidak pernah di-propagate ke response klien.

**Validates: Requirements 4.5**

---

### Property 9: Validasi webhook secret selalu mengembalikan 401 jika tidak cocok

*For any* pasangan (secret dari payload, nilai GOOGLE_WEBHOOK_SECRET yang dikonfigurasi) di mana keduanya tidak identik byte-per-byte, endpoint `POST /api/sync/google` harus mengembalikan HTTP 401 — tidak ada operasi database yang terjadi. Jika keduanya identik, endpoint memproses request (200).

**Validates: Requirements 5.2, 5.3, 11.1**

---

### Property 10: SSE Hub broadcast event ke semua klien terdaftar

*For any* jumlah N klien yang terdaftar di SSE Hub (1 ≤ N ≤ 50) dan *for any* SSEEvent yang di-broadcast, semua N klien harus menerima event yang identik di channel mereka dalam waktu ≤ 500ms dari waktu Broadcast() dipanggil.

**Validates: Requirements 5.5, 7.3, 7.6**

---

### Property 11: SSE Hub membersihkan klien yang disconnect

*For any* klien yang terdaftar di SSE Hub kemudian context-nya di-cancel (disconnect), entry klien tersebut harus dihapus dari internal map dalam waktu ≤ 5 detik setelah pemutusan, sehingga Broadcast selanjutnya tidak mencoba menulis ke channel klien yang sudah ditutup.

**Validates: Requirements 7.4**

---

### Property 12: Apps Script tidak mengirim webhook jika e.value atau e.oldValue undefined

*For any* spreadsheet edit event di mana `e.value === undefined` ATAU `e.oldValue === undefined` (mis: pembukaan sheet, perubahan format, atau sel baru yang sebelumnya kosong tanpa nilai lama), fungsi `onEdit` tidak boleh memanggil `UrlFetchApp.fetch` — tidak ada HTTP request yang dikirim ke backend.

**Validates: Requirements 5.6**

---

### Property 13: ConflictResolver deterministik berdasarkan updated_at

*For any* pasangan (sheetsUpdatedAt time.Time, mysqlUpdatedAt time.Time) yang keduanya valid (non-zero), `ConflictResolver.Resolve` harus mengembalikan keputusan yang deterministik: `"sheets_wins"` jika sheetsUpdatedAt > mysqlUpdatedAt, `"mysql_wins"` jika mysqlUpdatedAt > sheetsUpdatedAt, `"no_conflict"` jika keduanya identik. Fungsi yang sama dipanggil dua kali dengan input yang sama harus selalu mengembalikan keputusan yang sama.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

---

### Property 14: ConflictResolver memperlakukan null/zero updated_at sebagai kalah

*For any* pemanggilan `ConflictResolver.Resolve` di mana salah satu dari sheetsUpdatedAt atau mysqlUpdatedAt adalah zero time (`time.Time{}`), sumber dengan zero time harus selalu menjadi pihak yang kalah — write-back dipanggil untuk sumber tersebut — dan operasi utama tidak gagal (tidak ada error yang dipropagasi).

**Validates: Requirements 6.6, 6.7**

---

### Property 15: Normalisasi GOOGLE_PRIVATE_KEY mengganti semua literal \\n

*For any* string yang mengandung satu atau lebih kemunculan literal backslash-n (`\n` — dua karakter), fungsi normalisasi private key harus menggantikan **semua** kemunculan tersebut dengan karakter newline aktual (byte `0x0A`), sehingga jumlah kemunculan `\n` literal dalam string hasil adalah 0.

**Validates: Requirements 8.4**

---

### Property 16: JWT auth pada /api/sse menolak semua request tanpa token valid

*For any* request ke `GET /api/sse` yang tidak menyertakan JWT token atau menyertakan JWT yang tidak valid (expired, signature salah, format salah), response harus selalu HTTP 401 — koneksi SSE tidak dibuka.

**Validates: Requirements 7.8**

---

## Testing Strategy

### Dual Testing Approach

Pengujian menggunakan dua lapisan yang saling melengkapi:

1. **Property-based tests** — verifikasi properti universal dengan banyak input yang di-generate
2. **Unit/example tests** — verifikasi skenario spesifik, edge case, dan integration point

### Library

- **Property-based testing (Go)**: [`pgregory.net/rapid`](https://pkg.go.dev/pgregory.net/rapid) — mature, tidak butuh konfigurasi external
- Setiap property test dikonfigurasi dengan minimum **100 iterasi** via `rapid.Check`
- **Unit/integration tests**: standard `testing` package + `github.com/stretchr/testify`

### Konfigurasi Tag Test

Setiap property test diberi komentar tag untuk traceability:

```go
// Feature: google-sheets-sync, Property 2: SheetMapper round-trip
func TestSheetMapperRoundTrip(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        // generate random Inbound struct...
    })
}
```

### Struktur Test Files

```
Auth_Service/internal/syncsvc/
  google_client_test.go       ← integration tests (mock HTTP)
  sheet_mapper_test.go        ← property tests (P1, P2, P3)
  sync_service_test.go        ← property tests (P4, P5, P6, P7, P8)
  conflict_resolver_test.go   ← property tests (P13, P14)
  sse_hub_test.go             ← property tests (P10, P11)
Auth_Service/controllers/
  sync_controller_test.go     ← property tests (P9, P16), example tests
Auth_Service/config/
  config_test.go              ← property test (P15)
```

### Property Tests

| Property | File | Test Function | Iterasi |
|---|---|---|---|
| P1: Header dilewati | `sheet_mapper_test.go` | `TestSheetMapperSkipsHeader` | 100 |
| P2: Round-trip mapping | `sheet_mapper_test.go` | `TestSheetMapperRoundTrip` | 200 |
| P3: Baris invalid → SkippedRow | `sheet_mapper_test.go` | `TestSheetMapperInvalidRow` | 150 |
| P4: Import idempotent | `sync_service_test.go` | `TestImportIdempotent` | 100 |
| P5: created_by = google_import | `sync_service_test.go` | `TestImportCreatedBy` | 100 |
| P6: Export idempotent + header | `sync_service_test.go` | `TestExportIdempotent` | 100 |
| P7: Async sync latency | `sync_service_test.go` | `TestSyncAfterCRUDLatency` | 100 |
| P8: Sync error tidak affect CRUD | `sync_service_test.go` | `TestSyncErrorDoesNotAffectCRUD` | 100 |
| P9: Secret validation | `sync_controller_test.go` | `TestWebhookSecretValidation` | 200 |
| P10: Broadcast ke semua klien | `sse_hub_test.go` | `TestSSEHubBroadcastAll` | 100 |
| P11: Cleanup klien disconnect | `sse_hub_test.go` | `TestSSEHubClientCleanup` | 100 |
| P12: Apps Script filter event | (JavaScript test — Jest) | `onEdit.test.js` | 100 |
| P13: Conflict resolver deterministik | `conflict_resolver_test.go` | `TestConflictResolverDeterministic` | 500 |
| P14: Null updated_at kalah | `conflict_resolver_test.go` | `TestConflictResolverNullTime` | 100 |
| P15: Private key normalisasi | `config_test.go` | `TestPrivateKeyNormalization` | 200 |
| P16: JWT auth SSE | `sync_controller_test.go` | `TestSSEAuthRequired` | 100 |

### Unit/Integration Tests

- **Smoke tests**: verifikasi konfigurasi startup (env vars loaded, Google Client init)
- **Integration tests**: mock Google Sheets API responses, verifikasi end-to-end webhook flow
- **Error condition tests**: Degraded Mode (503), worksheet tidak ditemukan (error message), API rate limit (retry behavior)
- **Apps Script tests** (Jest/GAS mock): `onEdit` filter logic, payload format, HTTPS check

### Testing di Degraded Mode

```go
// Semua endpoint sync harus return 503 jika !IsConfigured()
func TestDegradedMode(t *testing.T) {
    // Setup: SyncService dengan IsConfigured() = false
    // Test semua 4 endpoint sync → expect 503
}
```

---
