# Implementation Plan: Google Sheets Sync

## Overview

Implementasi sinkronisasi dua arah antara MySQL dan Google Spreadsheet menggunakan package baru `internal/syncsvc` dalam Go. Backend berjalan dalam Degraded Mode jika env vars Google tidak dikonfigurasi — semua endpoint CRUD yang ada tidak berubah behavior maupun response.

## Tasks

- [x] 1. Konfigurasi dependencies dan environment variables
  - [x] 1.1 Tambahkan dependencies Google ke `go.mod` dan update `go.sum`
    - Tambahkan `google.golang.org/api v0.160.0` (pin eksplisit)
    - Tambahkan `golang.org/x/oauth2 v0.17.0` (pin eksplisit)
    - Tambahkan `pgregory.net/rapid v1.1.0` untuk property-based testing
    - Jalankan `go mod tidy` untuk resolve indirect dependencies
    - _Requirements: 9.4_

  - [x] 1.2 Perluas struct `Config` di `Auth_Service/config/config.go`
    - Tambahkan 5 field baru: `GoogleProjectID`, `GoogleClientEmail`, `GooglePrivateKey`, `GoogleSpreadsheetID`, `GoogleWebhookSecret`
    - Update fungsi `Load()`: wajibkan `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID` (fatal jika kosong), log warning untuk `GOOGLE_PROJECT_ID` dan `GOOGLE_WEBHOOK_SECRET`
    - Normalisasi `GOOGLE_PRIVATE_KEY`: ganti literal `\n` (dua karakter) dengan newline aktual `0x0A`
    - Field lama tidak berubah
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.3 Tulis property test untuk normalisasi private key (`config_test.go`)
    - **Property 15: Normalisasi GOOGLE_PRIVATE_KEY mengganti semua literal \\n**
    - **Validates: Requirements 8.4**
    - Gunakan `rapid.Check` dengan 200 iterasi, generate string dengan berbagai kemunculan `\n` literal

  - [x] 1.4 Update `.env.example` di `Auth_Service/` dengan 5 env var baru
    - Tambahkan `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID`, `GOOGLE_WEBHOOK_SECRET`
    - _Requirements: 8.1_


- [x] 2. Buat package `internal/syncsvc` dan `google_client.go`
  - [x] 2.1 Buat direktori `Auth_Service/internal/syncsvc/` dan file `google_client.go`
    - Deklarasikan `package syncsvc`
    - Definisikan interface `GoogleClient` dengan semua 8 method: `GetSheetValues`, `GetRow`, `AppendRow`, `UpdateRow`, `DeleteRow`, `BatchUpdateRows`, `ClearSheet`, `FindRowByKey`
    - Implementasikan struct `googleClientImpl` yang memenuhi interface
    - Bangun kredensial Service Account dari `config.Config` secara programatik menggunakan `golang.org/x/oauth2/google` dan `jwt.Config` — tidak dari file JSON
    - Implementasikan `NewGoogleClient(cfg *config.Config) (GoogleClient, error)` yang membaca env vars dan mengembalikan error dengan nama var yang hilang
    - Implementasikan retry exponential backoff (max 3x) untuk HTTP 401, 429, 5xx
    - Akses sheet by name (bukan index): resolve nama → sheetId via spreadsheet metadata API
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.2 Definisikan tipe `CRUDOp`, `WebhookPayload`, `ImportResult`, `ExportResult`, `SSEEvent`, `SkippedRow` di file `types.go` dalam package `syncsvc`
    - Pastikan semua type yang dibutuhkan tersedia sebelum file lain di-compile
    - _Requirements: 9.1_


- [x] 3. Implementasikan `sheet_mapper.go`
  - [x] 3.1 Buat file `Auth_Service/internal/syncsvc/sheet_mapper.go`
    - Definisikan interface `SheetMapper` dengan 16 method (8 `RowsToXxx` + 8 `XxxToRow`)
    - Implementasikan struct `sheetMapperImpl` dan `NewSheetMapper() SheetMapper`
    - Implementasikan `RowsToInbounds`: skip baris ke-0 (header), map kolom ke field `tanggal`, `shifting`, `nomor_fo`, `nopol`, `plant_pabrik`, `jenis_bongkaran`, `total_box`, `nomor_gr`, `total_slipsheet`
    - Implementasikan `RowsToOutbounds`: skip header, map 12 kolom sesuai design
    - Implementasikan `RowsToReportDailyTransports`, `RowsToScanOutDCs`, `RowsToClaimVendors`, `RowsToGantunganFakturs`, `RowsToSetorans`, `RowsToWoWts`: skip header, map sesuai tabel di design
    - Untuk baris kosong atau data invalid: skip dan catat `SkippedRow{Worksheet, RowNumber, Reason}` — tidak pernah panic
    - Implementasikan 8 method `XxxToRow`: konversi struct → `[]interface{}`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

  - [x] 3.2 Tulis property tests untuk `SheetMapper` di `sheet_mapper_test.go`
    - **Property 1: SheetMapper melewati baris header** — Validates: Requirements 2.2
      - 100 iterasi, generate `[][]string` dengan baris header acak, verifikasi hasil tidak mengandung data dari indeks 0
    - **Property 2: SheetMapper round-trip (RowToStruct → StructToRow → RowToStruct)** — Validates: Requirements 2.3–2.10
      - 200 iterasi, generate struct valid acak untuk semua 8 model, verifikasi `RowToStruct(StructToRow(m)) ≡ m`
    - **Property 3: Baris tidak valid menghasilkan SkippedRow, bukan panic** — Validates: Requirements 2.11
      - 150 iterasi, generate baris dengan field tidak valid di posisi acak, verifikasi tidak panic dan `SkippedRow` terbentuk


- [x] 4. Implementasikan `sheet_service.go`
  - [x] 4.1 Buat file `Auth_Service/internal/syncsvc/sheet_service.go`
    - Definisikan interface `SheetService` dengan method: `ReadAllWorksheets`, `WriteWorksheet`, `SyncRowToSheet`
    - Implementasikan `sheetServiceImpl` yang menerima `GoogleClient` sebagai dependency
    - `ReadAllWorksheets`: baca semua 8 worksheet; worksheet yang gagal tidak menghentikan yang lain — return `map[string]error` untuk yang gagal
    - `WriteWorksheet`: hapus konten mulai baris ke-2 via `ClearSheet`, lalu tulis data baru dari baris ke-2 menggunakan `BatchUpdateRows` (satu round-trip per worksheet via `values.batchUpdate`)
    - `SyncRowToSheet`: tentukan append/update/delete berdasarkan `CRUDOp`; untuk single-row gunakan `AppendRow`/`UpdateRow`/`DeleteRow`; untuk multi-row gunakan `BatchUpdateRows`
    - Jika `ClearSheet`/API call gagal: log error dengan kode HTTP, return error ke pemanggil
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.6_


- [x] 5. Implementasikan `conflict_resolver.go`
  - [x] 5.1 Buat file `Auth_Service/internal/syncsvc/conflict_resolver.go`
    - Definisikan interface `ConflictResolver` dengan method `Resolve(ctx, table, recordID, sheetsUpdatedAt, mysqlUpdatedAt time.Time, writeBackToMySQL, writeBackToSheets func() error) (ConflictDecision, error)`
    - Definisikan tipe `ConflictDecision` dengan konstanta `DecisionMySQLWins`, `DecisionSheetsWins`, `DecisionNoConflict`
    - Implementasikan algoritma Last Write Wins: `diff > 0` → `sheets_wins` (update MySQL), `diff < 0` → `mysql_wins` (update Sheets), `diff == 0` → `no_conflict` (tidak ada write)
    - Jika salah satu timestamp zero/null: sumber tersebut kalah, log warning, panggil write-back, tidak gagalkan operasi utama
    - Jika write-back gagal: log error detail (sumber, rekord, pesan), tidak propagate error ke operasi utama
    - Log setiap resolusi dengan format `[conflict_resolver] table=X id=Y sheets_ts=Z mysql_ts=W decision=D`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.2 Tulis property tests untuk `ConflictResolver` di `conflict_resolver_test.go`
    - **Property 13: ConflictResolver deterministik berdasarkan updated_at** — Validates: Requirements 6.1, 6.2, 6.3, 6.4
      - 500 iterasi, generate pasangan `(sheetsTs, mysqlTs time.Time)` non-zero, verifikasi keputusan deterministik dan konsisten
    - **Property 14: Null/zero updated_at kalah** — Validates: Requirements 6.6, 6.7
      - 100 iterasi, generate kasus dengan salah satu timestamp zero, verifikasi sumber zero selalu kalah dan tidak ada error propagasi


- [x] 6. Implementasikan `sync_service.go` (orchestrator)
  - [x] 6.1 Buat file `Auth_Service/internal/syncsvc/sync_service.go`
    - Definisikan interface `SyncService` dengan method: `ImportAll`, `ExportAll`, `SyncAfterCRUD`, `ProcessWebhook`, `IsConfigured`
    - Implementasikan `syncServiceImpl` yang menerima `GoogleClient`, `SheetService`, `SheetMapper`, `ConflictResolver`, dan `*gorm.DB` sebagai dependency
    - `ImportAll`: baca semua 8 worksheet via `SheetService.ReadAllWorksheets`, konversi via `SheetMapper`, upsert ke MySQL dengan `ON DUPLICATE KEY UPDATE` per upsert key dari Req 2.12, set `created_by = "google_import"` pada record baru
    - `ExportAll`: baca semua 8 tabel MySQL, konversi via `SheetMapper`, tulis ke worksheet via `SheetService.WriteWorksheet`; error satu tabel tidak menghentikan tabel lain
    - `SyncAfterCRUD`: jalankan dalam goroutine terpisah (tidak block caller); tentukan worksheet dan key dari `entity`; panggil `SheetService.SyncRowToSheet`; log error jika gagal tanpa propagate ke klien
    - `ProcessWebhook`: validasi secret dengan `subtle.ConstantTimeCompare`, baca baris dari sheet, upsert ke MySQL, notify `SSEHub`
    - `IsConfigured()`: return true jika semua 3 env var wajib non-kosong dan Google Client berhasil diinit
    - _Requirements: 2.1, 2.12, 2.13, 2.14, 3.1, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.2, 5.3, 5.4, 10.2, 10.3_

  - [x] 6.2 Tulis property tests untuk `SyncService` di `sync_service_test.go`
    - **Property 4: Import idempotent (upsert tidak membuat duplikat)** — Validates: Requirements 2.12
      - 100 iterasi, panggil `ImportAll` dua kali dengan data sama, verifikasi jumlah rekord MySQL identik
    - **Property 5: Setiap rekord hasil import memiliki created_by = "google_import"** — Validates: Requirements 2.13
      - 100 iterasi, generate data worksheet acak, verifikasi semua rekord yang diinsert punya `created_by = "google_import"`
    - **Property 6: Export idempotent dan mempertahankan header** — Validates: Requirements 3.3, 3.4
      - 100 iterasi, panggil `ExportAll` dua kali, verifikasi isi worksheet identik dan baris ke-1 tidak berubah
    - **Property 7: Async sync tidak mempengaruhi latency endpoint CRUD** — Validates: Requirements 4.4
      - 100 iterasi, simulasikan mock delay di sync, verifikasi response time tidak bertambah >50ms
    - **Property 8: Kegagalan sync async tidak mengubah response klien CRUD** — Validates: Requirements 4.5
      - 100 iterasi, inject mock error di sync, verifikasi response HTTP tetap 201/200


- [x] 7. Implementasikan SSE Hub (`sse_hub.go`)
  - [x] 7.1 Buat file `Auth_Service/internal/syncsvc/sse_hub.go`
    - Definisikan struct `SSEHub` dengan field: `clients map[string]chan SSEEvent`, `register chan clientReg`, `unregister chan string`, `broadcast chan SSEEvent`, keepalive `*time.Ticker`
    - Definisikan struct `SSEEvent` dan `clientReg`
    - Implementasikan `NewSSEHub() *SSEHub` yang membuat hub dan menjalankan goroutine `Run()`
    - `Run()`: event-loop dengan `select` — handle register, unregister, broadcast, keepalive (30s) untuk mencegah proxy timeout
    - `Register(clientID string) chan SSEEvent`: daftarkan klien, return channel
    - `Unregister(clientID string)`: lepas registrasi dan tutup channel dalam ≤5 detik
    - `Broadcast(evt SSEEvent)`: kirim ke semua klien terdaftar; broadcast ke ≤50 klien dalam ≤500ms
    - Kirim keepalive comment `": keepalive\n\n"` ke semua koneksi aktif setiap 30 detik
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 7.2 Tulis property tests untuk `SSEHub` di `sse_hub_test.go`
    - **Property 10: Broadcast event ke semua klien terdaftar** — Validates: Requirements 5.5, 7.3, 7.6
      - 100 iterasi, generate N klien (1–50), verify semua menerima event identik dalam ≤500ms
    - **Property 11: SSE Hub membersihkan klien yang disconnect** — Validates: Requirements 7.4
      - 100 iterasi, register klien lalu cancel context, verifikasi entry dihapus dalam ≤5 detik

- [x] 8. Checkpoint — Verifikasi build dan unit test package syncsvc
  - Jalankan `go build ./...` dari direktori `Auth_Service`, pastikan tidak ada error kompilasi
  - Jalankan `go test ./internal/syncsvc/...` untuk verifikasi semua unit test dan property test lulus
  - Pastikan package `syncsvc` tidak mengubah signature apapun dari package `controllers`, `services`, `repositories`, atau `models`
  - Tanyakan kepada user jika ada pertanyaan sebelum lanjut


- [x] 9. Implementasikan `controllers/sync_controller.go`
  - [x] 9.1 Buat file `Auth_Service/controllers/sync_controller.go`
    - Definisikan struct `SyncController` dengan field `svc syncsvc.SyncService` dan `hub *syncsvc.SSEHub`
    - Implementasikan `NewSyncController(svc syncsvc.SyncService, hub *syncsvc.SSEHub) *SyncController`
    - Handler `WebhookSync` (`POST /api/sync/google`): tidak menggunakan JWT middleware; validasi secret via `subtle.ConstantTimeCompare`; return 401 jika tidak cocok; return 503 jika `!IsConfigured()`; return 503 dengan `{"error":"webhook not configured"}` jika `GOOGLE_WEBHOOK_SECRET` kosong; panggil `svc.ProcessWebhook`
    - Handler `ImportGoogle` (`POST /api/import/google`): JWT protected; return 503 jika `!IsConfigured()`; panggil `svc.ImportAll`; return response JSON `{"results":[...]}`
    - Handler `ExportGoogle` (`POST /api/export/google`): JWT protected; return 503 jika `!IsConfigured()`; panggil `svc.ExportAll`; return response JSON `{"results":[...]}`
    - Handler `SSEStream` (`GET /api/sse`): JWT protected (token via query param `?token=`); set header `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`; register client dengan UUID; kirim `{"event":"connected","clientId":"<uuid>"}`; stream events dari channel; unregister saat context Done
    - _Requirements: 2.1, 2.14, 3.1, 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.8, 10.2, 11.1, 11.2, 11.3_

  - [x] 9.2 Tulis property tests dan example tests di `controllers/sync_controller_test.go`
    - **Property 9: Validasi webhook secret selalu mengembalikan 401 jika tidak cocok** — Validates: Requirements 5.2, 5.3, 11.1
      - 200 iterasi, generate pasangan (payload_secret, env_secret) tidak identik, verifikasi selalu 401 dan tidak ada DB operation
    - **Property 16: JWT auth pada /api/sse menolak request tanpa token valid** — Validates: Requirements 7.8
      - 100 iterasi, generate token invalid/expired/malformed, verifikasi selalu HTTP 401 dan koneksi SSE tidak dibuka
    - Example test: Degraded Mode → semua 4 endpoint sync return 503


- [x] 10. Wire routes dan main.go
  - [x] 10.1 Update `Auth_Service/routes/routes.go`
    - Tambahkan field `SyncCtrl *controllers.SyncController` ke struct `Deps` (additive — field lama tidak berubah)
    - Daftarkan route baru di fungsi `Register`:
      - `POST /api/sync/google` → `d.SyncCtrl.WebhookSync` (tanpa JWT middleware)
      - `POST /api/import/google` → protected group → `d.SyncCtrl.ImportGoogle`
      - `POST /api/export/google` → protected group → `d.SyncCtrl.ExportGoogle`
      - `GET /api/sse` → protected group (token via query param) → `d.SyncCtrl.SSEStream`
    - Update JWT middleware (`middleware/auth_middleware.go`) untuk mendukung token dari query param `?token=` selain header `Authorization: Bearer` — hanya untuk endpoint `/api/sse`
    - Semua route CRUD yang ada tidak berubah path, method, atau middleware
    - _Requirements: 7.1, 7.8, 10.1_

  - [x] 10.2 Update `Auth_Service/cmd/main.go`
    - Inisialisasi `syncsvc.NewGoogleClient(config.AppConfig)` — jika gagal (env missing) → jalankan dalam Degraded Mode (log warning, lanjut)
    - Inisialisasi `syncsvc.NewSSEHub()` dan jalankan goroutine-nya
    - Inisialisasi `syncsvc.NewSheetMapper()`, `syncsvc.NewSheetService(googleClient)`, `syncsvc.NewConflictResolver()`
    - Inisialisasi `syncsvc.NewSyncService(googleClient, sheetSvc, mapper, resolver, db)`
    - Wire `controllers.NewSyncController(syncSvc, hub)` ke `deps.SyncCtrl`
    - Semua wiring CRUD yang sudah ada tidak berubah
    - _Requirements: 9.1, 10.2, 10.3_


- [x] 11. Update existing CRUD controllers untuk trigger async sync
  - [x] 11.1 Update `controllers/inbound_controller.go`
    - Tambahkan field `syncSvc syncsvc.SyncService` ke struct `InboundController`
    - Update `NewInboundController` untuk menerima `syncSvc` sebagai parameter opsional (nil-safe)
    - Di `Create`: setelah `ctrl.svc.Create` berhasil, jalankan `go ctrl.syncSvc.SyncAfterCRUD("inbounds", syncsvc.OpCreate, m)` — hanya jika `syncSvc != nil && syncSvc.IsConfigured()`
    - Di `Update`: setelah `ctrl.svc.Update` berhasil, jalankan goroutine sync dengan `OpUpdate`
    - Di `Delete`: setelah `ctrl.svc.Delete` berhasil, jalankan goroutine sync dengan `OpDelete`
    - Response HTTP tidak berubah — 201 untuk Create, 200 untuk Update/Delete
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1_

  - [x] 11.2 Update 7 controller CRUD lainnya dengan pola yang sama
    - `outbound_controller.go`, `report_daily_transport_controller.go`, `scan_out_dc_controller.go`, `claim_vendor_controller.go`, `gantungan_faktur_controller.go`, `setoran_controller.go`, `wo_wt_controller.go`
    - Pola identik dengan 11.1: inject `syncSvc`, trigger goroutine sync setelah CRUD sukses
    - Response HTTP tidak berubah untuk semua controller
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1_

- [x] 12. Checkpoint — Verifikasi backward compatibility dan build penuh
  - Jalankan `go build ./...` dari direktori `Auth_Service`, pastikan berhasil tanpa error
  - Pastikan semua route CRUD lama masih terdaftar dengan method, path, dan format response yang sama
  - Pastikan Degraded Mode berfungsi: jika env vars Google tidak ada, endpoint CRUD tetap 200/201, endpoint sync return 503
  - Tanyakan kepada user jika ada pertanyaan sebelum lanjut


- [x] 13. Buat frontend SSE consumer hook (`useSSESync`)
  - [x] 13.1 Buat file `src/hooks/useSSESync.ts`
    - Deklarasikan interface `SSEEvent` dengan field `event`, `worksheet?`, `id?`, `clientId?`
    - Implementasikan `useSSESync(onSync: SyncHandler, enabled = true): void`
    - Baca JWT token dari cookie (`document.cookie.match(/token=([^;]+)/)?.[1]`)
    - Buat `EventSource` dengan URL `${NEXT_PUBLIC_API_URL}/api/sse?token=<token>` (query param karena EventSource tidak support custom header)
    - Handle `onmessage`: parse JSON, panggil `onSync` via ref untuk menghindari stale closure
    - Handle `onerror`: tutup, reconnect setelah 5 detik jika `enabled`
    - Cleanup: tutup `EventSource` saat komponen unmount
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 14. Buat Apps Script (`apps-script/onEdit.gs`)
  - [x] 14.1 Buat file `apps-script/onEdit.gs` di root workspace (file terpisah, bukan di Auth_Service)
    - Implementasikan fungsi `onEdit(e)` sesuai design
    - Baca `WEBHOOK_SECRET` dan `BACKEND_URL` dari `PropertiesService.getScriptProperties()`
    - Guard: return jika `e.value === undefined || e.oldValue === undefined`
    - Validasi HTTPS: log error dan return jika `backendUrl` tidak dimulai dengan `https://`
    - Build payload: `{worksheet, row, timestamp: new Date().toISOString(), secret}`
    - Kirim `UrlFetchApp.fetch` dengan `muteHttpExceptions: true`
    - Tangkap network error dengan try-catch → `console.error(...)` tanpa throw
    - _Requirements: 5.1, 5.6, 5.7, 11.4, 11.5_

- [x] 15. Final checkpoint — Build verification dan test suite
  - Jalankan `go build ./...` dari direktori `Auth_Service`, verifikasi success
  - Jalankan `go test ./...` dari direktori `Auth_Service`, verifikasi semua test lulus
  - Verifikasi semua 16 property tests terdaftar dan berjalan
  - Tanyakan kepada user jika ada pertanyaan


## Notes

- Tasks bertanda `*` bersifat opsional dan dapat diskip untuk MVP lebih cepat; namun semua 16 property di design harus tercakup untuk produksi
- Package `syncsvc` **tidak boleh** mengubah signature fungsi, interface, atau struct yang sudah ada — hanya penambahan (additive)
- `go build ./...` dari `Auth_Service/` harus lulus di setiap checkpoint sebelum melanjutkan ke task berikutnya
- CRUD controllers diupdate dengan pola nil-safe (`syncSvc != nil && syncSvc.IsConfigured()`) sehingga backward compatible
- Async goroutine di `SyncAfterCRUD` adalah fire-and-forget — error hanya di-log, tidak pernah di-propagate ke response klien
- Degraded Mode aktif jika salah satu dari `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, atau `GOOGLE_SPREADSHEET_ID` kosong — endpoint CRUD tetap berfungsi normal
- Property tests menggunakan `pgregory.net/rapid` dengan minimum iterasi sesuai tabel di design (100–500)
- Apps Script disimpan sebagai file terpisah (`apps-script/onEdit.gs`) — di-deploy manual ke Google Spreadsheet
- JWT untuk `GET /api/sse` dikirim via query param `?token=` karena browser `EventSource` tidak support custom header

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1", "5.1", "7.1"] },
    { "id": 3, "tasks": ["3.2", "5.2", "7.2"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1", "10.2"] },
    { "id": 8, "tasks": ["11.1", "11.2"] },
    { "id": 9, "tasks": ["13.1", "14.1"] }
  ]
}
```
