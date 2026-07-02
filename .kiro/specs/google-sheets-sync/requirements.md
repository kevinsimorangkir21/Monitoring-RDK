# Requirements Document

## Introduction

Fitur **Google Sheets Sync** mengintegrasikan sistem Monitoring RDK secara langsung dengan Google Spreadsheet (ID: `1jwYCwHn8VsPOwEPJ8J56UHnweOW1Sy-kQ859Dg0DVqk`). Sistem tidak lagi menggunakan file Excel manual. Sinkronisasi bersifat dua arah: perubahan di Dashboard memperbarui MySQL lalu meneruskannya ke Google Sheets, dan perubahan di Google Sheets (via Apps Script trigger) memperbarui MySQL lalu menyiarkannya ke Dashboard melalui SSE.

Delapan worksheet dipetakan ke tabel MySQL yang sudah ada:

| Worksheet           | Tabel MySQL                    |
|---------------------|-------------------------------|
| Inbound             | `inbounds`                    |
| Outbound            | `outbounds`                   |
| Report Daily        | `report_daily_transports`     |
| Scan Out DC         | `scan_out_dcs`                |
| Claim Vendor        | `claim_vendors`               |
| Gantungan Faktur    | `gantungan_fakturs`           |
| Setoran             | `setorans`                    |
| WO-WT               | `wo_wts`                      |

Semua endpoint CRUD yang sudah ada tidak boleh berubah dan harus tetap kompatibel sepenuhnya.

---

## Glossary

- **Sync_Service**: Modul Go di `internal/syncsvc` yang mengelola seluruh logika sinkronisasi Google Sheets ↔ MySQL.
- **Google_Client**: Komponen di `internal/syncsvc/google_client.go` yang mengelola koneksi ke Google Sheets API menggunakan Service Account.
- **Sheet_Service**: Komponen di `internal/syncsvc/sheet_service.go` yang membaca dan menulis data ke Google Sheets menggunakan batch update.
- **Sheet_Mapper**: Komponen di `internal/syncsvc/sheet_mapper.go` yang mengonversi baris spreadsheet menjadi struct model Go dan sebaliknya.
- **Conflict_Resolver**: Komponen di `internal/syncsvc/conflict_resolver.go` yang menyelesaikan konflik data menggunakan strategi Last Write Wins berdasarkan `updated_at`.
- **Apps_Script**: Google Apps Script yang terpasang di Spreadsheet dengan trigger `onEdit(e)` untuk mendeteksi perubahan.
- **SSE_Hub**: Komponen di backend Go yang mengelola koneksi Server-Sent Events dan menyiarkan event ke semua klien Dashboard yang terhubung.
- **Webhook_Payload**: Payload JSON yang dikirim Apps Script ke endpoint `POST /api/sync/google` berisi field `worksheet`, `row`, `timestamp`, dan `secret`.
- **Service_Account**: Akun layanan Google Cloud yang digunakan backend untuk mengautentikasi ke Google Sheets API tanpa interaksi pengguna.
- **Spreadsheet**: Google Spreadsheet dengan ID `1jwYCwHn8VsPOwEPJ8J56UHnweOW1Sy-kQ859Dg0DVqk` yang menjadi sumber data utama.
- **Dashboard**: Antarmuka Next.js 15 yang menampilkan data dan menerima update real-time via SSE.
- **Last_Write_Wins**: Strategi resolusi konflik di mana rekord dengan `updated_at` terbaru dianggap sebagai versi yang benar.
- **Degraded_Mode**: Kondisi operasi backend ketika konfigurasi Google tidak tersedia — endpoint CRUD tetap berfungsi normal, endpoint sync mengembalikan HTTP 503.

---

## Requirements

### Requirement 1: Koneksi Google Sheets API via Service Account

**User Story:** Sebagai administrator sistem, saya ingin backend Go terhubung ke Google Sheets API menggunakan Service Account, sehingga sinkronisasi berjalan otomatis tanpa memerlukan autentikasi manual.

#### Acceptance Criteria

1. THE `Google_Client` SHALL mengautentikasi ke Google Sheets API menggunakan kredensial Service Account yang dibaca dari environment variable `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, dan `GOOGLE_PRIVATE_KEY`, dengan scope `https://www.googleapis.com/auth/spreadsheets`.
2. THE `Google_Client` SHALL membaca `GOOGLE_SPREADSHEET_ID` dari environment variable untuk mengidentifikasi Spreadsheet target; nilai ini SHALL divalidasi sebagai string non-kosong saat inisialisasi.
3. WHEN environment variable `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, atau `GOOGLE_SPREADSHEET_ID` tidak tersedia atau kosong saat startup, THEN THE `Sync_Service` SHALL menggagalkan inisialisasi dan mencatat pesan error ke log yang menyebutkan nama variabel yang hilang secara eksplisit (contoh: `"missing required env var: GOOGLE_PRIVATE_KEY"`).
4. THE `Google_Client` SHALL mengakses sheet berdasarkan nama worksheet (string), bukan berdasarkan indeks numerik; IF nama worksheet tidak ditemukan di Spreadsheet, THEN `Google_Client` SHALL mengembalikan error dengan pesan yang menyertakan nama worksheet yang diminta.
5. WHEN panggilan ke Google Sheets API gagal dengan error yang dapat di-retry (HTTP 401, 429, atau 5xx), THEN THE `Google_Client` SHALL melakukan retry dengan exponential backoff maksimal 3 kali; IF semua retry gagal, THEN `Google_Client` SHALL mengembalikan error yang menyertakan kode HTTP terakhir dan jumlah retry yang dilakukan.
6. THE `Google_Client` SHALL menggunakan paket `golang.org/x/oauth2/google` untuk parsing kredensial Service Account dari JSON yang dibangun secara programatik dari environment variables — tidak dari file JSON di disk.

---

### Requirement 2: Import Google Sheets ke MySQL

**User Story:** Sebagai operator, saya ingin mengimpor data dari Google Sheets ke MySQL, sehingga data yang dimasukkan langsung di Spreadsheet dapat tersimpan ke database.

#### Acceptance Criteria

1. WHEN endpoint `POST /api/import/google` dipanggil, THE `Sync_Service` SHALL membaca semua 8 worksheet dari Spreadsheet dan menyimpan datanya ke tabel MySQL yang bersesuaian; IF satu worksheet gagal diproses, THEN worksheet lainnya tetap diproses dan error worksheet yang gagal dicatat ke log serta disertakan dalam response.
2. THE `Sheet_Mapper` SHALL melewati baris pertama setiap worksheet (baris header) dan memulai konversi data dari baris ke-2.
3. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Inbound` ke struct `Inbound` dengan memetakan kolom ke field: `tanggal`, `shifting`, `nomor_fo`, `nopol`, `plant_pabrik`, `jenis_bongkaran`, `total_box`, `nomor_gr`, `total_slipsheet`.
4. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Outbound` ke struct `Outbound` dengan memetakan kolom ke field: `tanggal`, `freight_order`, `mobil_muat`, `status_fo`, `assign_job`, `jam_terima`, `status`, `selesai_muat`, `hari`, `putaran`, `sth2`, `jam_running`.
5. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Report Daily` ke struct `ReportDailyTransport` dengan memetakan kolom ke field: `tanggal`, `division`, `report_type`, `qty`.
6. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Scan Out DC` ke struct `ScanOutDC` dengan memetakan kolom ke field: `tanggal`, `vendor`, `nopol`, `driver`, `jam_scan`, `jam_keluar`, `status`.
7. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Claim Vendor` ke struct `ClaimVendor` dengan memetakan kolom ke field: `tanggal`, `vendor`, `nomor_claim`, `payment`, `outstanding`, `value`, `status`.
8. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Gantungan Faktur` ke struct `GantunganFaktur` dengan memetakan kolom ke field: `tanggal`, `pay_terms`, `customer`, `nama_toko`, `sd_document`, `sales_doc`, `net_value`, `keterangan_transport`.
9. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `Setoran` ke struct `Setoran` dengan memetakan kolom ke field: `tanggal`, `salesman`, `pulang_kunjungan`, `setoran_ke_kasir`, `durasi`, `bulan`.
10. THE `Sheet_Mapper` SHALL mengonversi setiap baris worksheet `WO-WT` ke struct `WoWt` dengan memetakan kolom ke field: `tanggal`, `plant`, `zwp1`, `zwp2`, `zwp4`, `zwp5`, `global`.
11. IF sebuah baris worksheet kosong (semua kolom kosong), atau memiliki format data yang tidak valid (tanggal tidak dapat diparsing, nilai enum tidak dikenal, tipe data tidak sesuai), THEN THE `Sheet_Mapper` SHALL melewati baris tersebut dan mencatat pesan error ke log yang menyertakan nama worksheet dan nomor baris.
12. THE `Sync_Service` SHALL menggunakan upsert dengan kunci unik berikut per tabel: `nomor_fo` untuk `inbounds`; `freight_order` untuk `outbounds`; kombinasi `tanggal`+`division`+`report_type` untuk `report_daily_transports`; kombinasi `tanggal`+`nopol` untuk `scan_out_dcs`; `nomor_claim` untuk `claim_vendors`; `sd_document` untuk `gantungan_fakturs`; kombinasi `tanggal`+`salesman` untuk `setorans`; kombinasi `tanggal`+`plant` untuk `wo_wts`.
13. THE `Sync_Service` SHALL menetapkan field `created_by` pada setiap rekord yang diinsert via import dengan nilai `"google_import"`.
14. WHEN endpoint `POST /api/import/google` selesai, THE backend SHALL mengembalikan response JSON dengan field `results` berisi array per worksheet yang memuat `worksheet` (nama), `imported` (jumlah baris berhasil), dan `skipped` (jumlah baris dilewati).

---

### Requirement 3: Export MySQL ke Google Sheets

**User Story:** Sebagai operator, saya ingin mengekspor data dari MySQL ke Google Sheets, sehingga Spreadsheet selalu mencerminkan data terkini dari database.

#### Acceptance Criteria

1. WHEN endpoint `POST /api/export/google` dipanggil, THE `Sync_Service` SHALL membaca semua rekord dari 8 tabel MySQL dan menuliskannya ke worksheet yang bersesuaian di Spreadsheet; WHEN export selesai, THE backend SHALL mengembalikan response JSON dengan field `results` berisi jumlah rekord per tabel yang ditulis.
2. THE `Sheet_Service` SHALL menggunakan Google Sheets API `values.batchUpdate` untuk menulis semua data dalam satu request per worksheet, bukan satu request per baris.
3. WHEN `POST /api/export/google` dipanggil, THE `Sheet_Service` SHALL terlebih dahulu menghapus konten worksheet mulai dari baris ke-2 (mempertahankan baris pertama sebagai header), kemudian menulis data baru dimulai dari baris ke-2.
4. THE `Sheet_Service` SHALL mempertahankan baris ke-1 (baris header) dari setiap worksheet dan tidak menimpanya saat melakukan export.
5. IF pembacaan data dari MySQL gagal untuk satu atau lebih tabel, THEN THE `Sheet_Service` SHALL menghentikan export untuk tabel tersebut, mencatat error ke log, dan melanjutkan export tabel lainnya; response SHALL menyertakan field `errors` dengan detail tabel yang gagal.
6. IF panggilan Google Sheets API gagal saat export (termasuk rate limit HTTP 429), THEN THE `Sheet_Service` SHALL mencatat error ke log dengan kode HTTP dan pesan error, dan mengembalikan HTTP 500 dengan pesan error deskriptif kepada pemanggil endpoint.

---

### Requirement 4: Sinkronisasi Dua Arah — Dashboard ke Google Sheets

**User Story:** Sebagai pengguna Dashboard, saya ingin setiap operasi CRUD yang saya lakukan di Dashboard juga diperbarui secara otomatis di Google Sheets, sehingga Spreadsheet selalu sinkron dengan database.

#### Acceptance Criteria

1. WHEN operasi Create pada salah satu dari 8 entitas berhasil di MySQL, THE `Sync_Service` SHALL menambahkan satu baris baru di akhir worksheet yang bersesuaian menggunakan kunci unik yang sama seperti didefinisikan di Requirement 2.12.
2. WHEN operasi Update pada salah satu dari 8 entitas berhasil di MySQL, THE `Sync_Service` SHALL menemukan baris yang bersesuaian di worksheet berdasarkan kunci unik (Requirement 2.12) dan menimpa nilainya; IF baris tidak ditemukan, THE `Sync_Service` SHALL menambahkan baris baru.
3. WHEN operasi Delete pada salah satu dari 8 entitas berhasil di MySQL, THE `Sync_Service` SHALL menghapus baris yang bersesuaian di worksheet berdasarkan kunci unik; perilaku dan response endpoint CRUD yang sudah ada tidak berubah.
4. WHEN operasi MySQL berhasil dan sinkronisasi ke Google Sheets akan dimulai, THE `Sync_Service` SHALL menjalankan sinkronisasi tersebut dalam goroutine terpisah sehingga waktu eksekusi goroutine tidak menambah latency endpoint CRUD yang diukur dari sisi klien.
5. WHEN operasi sinkronisasi asinkron ke Google Sheets gagal, THEN THE `Sync_Service` SHALL mencatat error ke log dengan menyertakan nama tabel, ID rekord, jenis operasi (create/update/delete), dan pesan error; error tidak dikembalikan ke klien Dashboard.
6. IF operasi sinkronisasi hanya melibatkan satu baris, THE `Sync_Service` SHALL menggunakan single-row update (bukan batch); IF operasi melibatkan lebih dari satu baris dalam satu panggilan, THE `Sync_Service` SHALL menggunakan `values.batchUpdate`.

---

### Requirement 5: Sinkronisasi Dua Arah — Google Sheets ke MySQL (via Apps Script Webhook)

**User Story:** Sebagai pengguna Spreadsheet, saya ingin perubahan yang saya buat langsung di Google Sheets diperbarui secara otomatis ke MySQL dan Dashboard, sehingga semua pengguna melihat data yang sama.

#### Acceptance Criteria

1. WHEN Apps Script mendeteksi perubahan nilai sel di Spreadsheet via trigger `onEdit(e)`, THE `Apps_Script` SHALL mengirim HTTP POST ke endpoint `POST /api/sync/google` dengan payload JSON: `{"worksheet":"<nama sheet>","row":<nomor baris integer>,"timestamp":"<ISO 8601>","secret":"<WEBHOOK_SECRET>"}`.
2. WHEN endpoint `POST /api/sync/google` menerima request, THE `Sync_Service` SHALL memvalidasi field `secret` dari payload dengan membandingkannya terhadap environment variable `GOOGLE_WEBHOOK_SECRET` menggunakan `subtle.ConstantTimeCompare`.
3. IF nilai `secret` tidak cocok dengan `GOOGLE_WEBHOOK_SECRET`, THEN THE `Sync_Service` SHALL mengembalikan HTTP 401 dengan body `{"error":"unauthorized"}` dan tidak melakukan operasi apapun pada database.
4. WHEN validasi secret berhasil, THE `Sync_Service` SHALL membaca baris yang disebutkan dalam payload dari worksheet yang bersangkutan, kemudian melakukan upsert rekord ke tabel MySQL yang bersesuaian menggunakan kunci unik dari Requirement 2.12.
5. WHEN upsert MySQL berhasil, THE `SSE_Hub` SHALL menyiarkan event ke semua klien Dashboard yang terhubung dalam format `data: {"event":"sync","worksheet":"<nama>","id":<id rekord>}\n\n`.
6. THE `Apps_Script` SHALL menggunakan fungsi `onEdit(e)` sebagai trigger dan hanya mengirim webhook ketika `e.value !== undefined && e.oldValue !== undefined` (nilai sel berubah), bukan saat sheet dibuka atau hanya diformat ulang.
7. IF endpoint `POST /api/sync/google` tidak dapat dijangkau (network error), THE `Apps_Script` SHALL mencatat error ke Apps Script execution log menggunakan `console.error()` dan tidak melempar exception yang menghentikan eksekusi selanjutnya.

---

### Requirement 6: Conflict Resolution — Last Write Wins

**User Story:** Sebagai sistem, saya ingin konflik data antara Google Sheets dan MySQL diselesaikan secara otomatis, sehingga data yang paling baru selalu menjadi versi yang berlaku.

#### Acceptance Criteria

1. WHEN terjadi konflik antara data di Google Sheets dan MySQL untuk rekord yang sama (rekord yang sama diidentifikasi oleh kunci unik dari Requirement 2.12), THE `Conflict_Resolver` SHALL membandingkan nilai `updated_at` (tipe `time.Time`) dari kedua sumber.
2. IF nilai `updated_at` dari Google Sheets lebih baru dari MySQL (selisih > 0 detik), THEN THE `Conflict_Resolver` SHALL memperbarui rekord di MySQL dengan data dari Google Sheets.
3. IF nilai `updated_at` dari MySQL lebih baru dari Google Sheets (selisih > 0 detik), THEN THE `Conflict_Resolver` SHALL memperbarui baris di Google Sheets dengan data dari MySQL.
4. IF nilai `updated_at` dari kedua sumber identik (selisih = 0 detik), THEN THE `Conflict_Resolver` SHALL mempertahankan versi MySQL sebagai sumber kebenaran dan tidak melakukan operasi tulis apapun.
5. THE `Conflict_Resolver` SHALL mencatat setiap resolusi konflik ke log dengan menyertakan: nama tabel, ID rekord, `updated_at` dari Google Sheets, `updated_at` dari MySQL, dan keputusan yang diambil (`"mysql_wins"`, `"sheets_wins"`, atau `"no_conflict"`).
6. IF salah satu sumber memiliki nilai `updated_at` yang null atau tidak dapat diparsing, THEN THE `Conflict_Resolver` SHALL memperlakukan sumber tersebut sebagai yang kalah dan mencatat warning ke log.
7. IF pembaruan write-back ke sumber yang kalah gagal, THEN THE `Conflict_Resolver` SHALL mencatat error ke log dengan menyertakan detail sumber, rekord, dan pesan error; error ini tidak menggagalkan operasi utama.

---

### Requirement 7: SSE — Real-time Update ke Dashboard

**User Story:** Sebagai pengguna Dashboard, saya ingin melihat data yang diperbarui secara real-time tanpa perlu me-reload browser, sehingga saya selalu melihat kondisi data terkini.

#### Acceptance Criteria

1. THE `SSE_Hub` SHALL menyediakan endpoint `GET /api/sse` yang menjaga koneksi HTTP tetap terbuka dengan header `Content-Type: text/event-stream`, `Cache-Control: no-cache`, dan `X-Accel-Buffering: no`.
2. WHEN klien Dashboard terhubung ke `GET /api/sse`, THE `SSE_Hub` SHALL mendaftarkan koneksi klien tersebut dan mengirim event konfirmasi dengan format `data: {"event":"connected","clientId":"<uuid>"}\n\n`.
3. WHEN `SSE_Hub` menerima notifikasi dari `Sync_Service` setelah sinkronisasi berhasil, THE `SSE_Hub` SHALL menyiarkan event SSE ke semua klien yang terdaftar dengan format `data: {"event":"sync","worksheet":"<nama>","id":<id>}\n\n`.
4. WHEN koneksi klien terputus (context `Done()` atau write error), THE `SSE_Hub` SHALL menghapus registrasi klien tersebut, menutup channel klien yang bersesuaian, dan membebaskan resource dalam waktu ≤ 5 detik setelah pemutusan terdeteksi.
5. WHILE tidak ada koneksi klien aktif, THE `SSE_Hub` SHALL tetap menerima koneksi baru tanpa error.
6. THE `SSE_Hub` SHALL mendukung minimal 50 koneksi klien simultan; WHEN jumlah koneksi mencapai 50, waktu broadcast ke semua klien SHALL ≤ 500ms yang diukur dari waktu notifikasi diterima hingga terakhir write ke client channel.
7. THE `SSE_Hub` SHALL mengirim keepalive comment (`": keepalive\n\n"`) ke semua koneksi aktif setiap 30 detik untuk mencegah timeout oleh proxy dan browser.
8. THE endpoint `GET /api/sse` SHALL memerlukan JWT token yang valid (melalui middleware autentikasi yang sudah ada); IF token tidak valid atau tidak ada, THEN backend SHALL mengembalikan HTTP 401 sebelum membuka koneksi SSE.

---

### Requirement 8: Konfigurasi Environment Variables

**User Story:** Sebagai administrator, saya ingin semua kredensial Google dikonfigurasi melalui environment variables, sehingga tidak ada secret yang tertanam di dalam kode sumber.

#### Acceptance Criteria

1. THE backend SHALL membaca konfigurasi Google dari environment variables berikut dan menyediakan nilainya melalui struct `Config`: `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID`, dan `GOOGLE_WEBHOOK_SECRET`.
2. THE struct `Config` yang ada di `Auth_Service/config/config.go` SHALL diperluas dengan 5 field baru (`GoogleProjectID`, `GoogleClientEmail`, `GooglePrivateKey`, `GoogleSpreadsheetID`, `GoogleWebhookSecret`) tanpa mengubah atau menghapus field yang sudah ada.
3. IF salah satu dari `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, atau `GOOGLE_SPREADSHEET_ID` kosong atau tidak tersedia saat startup, THEN THE backend SHALL menggagalkan startup dengan pesan error yang menyebutkan nama variabel yang hilang (contoh: `"fatal: missing env var GOOGLE_PRIVATE_KEY"`); `GOOGLE_PROJECT_ID` dan `GOOGLE_WEBHOOK_SECRET` yang kosong hanya menghasilkan warning, bukan fatal error.
4. WHEN THE backend membaca nilai `GOOGLE_PRIVATE_KEY` dari environment, THE backend SHALL menggantikan literal string `\n` (dua karakter backslash-n) dengan karakter newline aktual (`0x0A`) sebelum menggunakannya sebagai PEM key.

---

### Requirement 9: Struktur Modul Internal Sync

**User Story:** Sebagai developer, saya ingin logika sinkronisasi diorganisasi dalam modul terpisah, sehingga kode tidak bercampur dengan controller dan service yang sudah ada.

#### Acceptance Criteria

1. THE `Sync_Service` SHALL diimplementasikan dalam package bernama `syncsvc` di bawah path `internal/syncsvc` di direktori `Auth_Service`, terdiri dari file: `google_client.go`, `sheet_service.go`, `sheet_mapper.go`, `sync_service.go`, dan `conflict_resolver.go`.
2. THE package `syncsvc` SHALL tidak mengubah function signature, interface, atau struct yang diekspor dari package `controllers`, `services`, `repositories`, atau `models` yang sudah ada; perubahan hanya boleh berupa penambahan (additive).
3. WHEN `go build ./...` dijalankan dari direktori `Auth_Service` setelah penambahan package `syncsvc`, THE build SHALL selesai tanpa error atau warning kompilasi.
4. THE package `syncsvc` SHALL mendeklarasikan dependency pada `google.golang.org/api` versi `v0.160.0` atau lebih baru di `go.mod`; versi harus di-pin secara eksplisit, bukan menggunakan `latest`.

---

### Requirement 10: Backward Compatibility dan Keamanan Build

**User Story:** Sebagai developer, saya ingin penambahan fitur sinkronisasi tidak mempengaruhi fitur yang sudah ada, sehingga seluruh sistem tetap berfungsi tanpa regresi.

#### Acceptance Criteria

1. THE backend SHALL mengekspor semua route CRUD yang sudah ada (`/api/auth/*`, `/api/inbounds/*`, `/api/outbounds/*`, dan sejenisnya) tanpa perubahan path, HTTP method, request body format, atau response format.
2. WHEN `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, atau `GOOGLE_SPREADSHEET_ID` tidak dikonfigurasi, THE backend SHALL berjalan dalam `Degraded_Mode`; DALAM mode ini, endpoint `POST /api/sync/google`, `POST /api/import/google`, `POST /api/export/google`, dan `GET /api/sse` SHALL mengembalikan HTTP 503 dengan body `{"error":"google sync not configured"}`.
3. THE `Sync_Service` SHALL melakukan inisialisasi Google Client secara non-blocking; IF Google Sheets API tidak dapat dijangkau saat startup, THE backend SHALL mencatat warning ke log dan melanjutkan startup dalam `Degraded_Mode` tanpa menggagalkan proses.
4. WHEN `go build ./...` dijalankan dari direktori `Auth_Service` setelah seluruh implementasi `internal/syncsvc` selesai, THE build SHALL berhasil tanpa error.

---

### Requirement 11: Keamanan Webhook Apps Script

**User Story:** Sebagai administrator keamanan, saya ingin endpoint webhook terlindungi dari request tidak sah, sehingga database tidak dapat dimodifikasi oleh pihak yang tidak berwenang.

#### Acceptance Criteria

1. THE `Sync_Service` SHALL memvalidasi setiap request ke `POST /api/sync/google` dengan membandingkan `[]byte(payload.Secret)` terhadap `[]byte(config.GoogleWebhookSecret)` menggunakan `subtle.ConstantTimeCompare` dari paket `crypto/subtle`; perbandingan string biasa (==) tidak boleh digunakan.
2. IF `GOOGLE_WEBHOOK_SECRET` kosong atau tidak dikonfigurasi di environment, THEN THE backend SHALL menolak semua request ke `POST /api/sync/google` dengan HTTP 503 dan body `{"error":"webhook not configured"}`.
3. THE endpoint `POST /api/sync/google` SHALL tidak menerapkan middleware JWT authentication; validasi keamanannya dilakukan semata-mata melalui field `secret` di payload sebagaimana didefinisikan di Requirement 11.1.
4. THE `Apps_Script` SHALL membaca nilai webhook secret dari Apps Script Properties Service (`PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET")`) dan tidak menyematkan secret sebagai literal string dalam kode script.
5. THE `Apps_Script` SHALL menggunakan HTTPS (bukan HTTP) untuk semua panggilan ke endpoint backend; IF URL backend menggunakan HTTP, THE `Apps_Script` SHALL mencatat error dan tidak mengirim request.
