# Requirements Document

## Introduction

Fitur **Outbound Module Refactor + Manual CRUD** adalah refactor halaman `/admin/outbound`
di proyek Next.js 15 (Monitoring-RDK / Wings Group). Halaman lama direfactor menggunakan
struktur data Outbound Excel sebagai acuan tunggal — **tanpa mengubah routing, autentikasi,
layout dashboard, maupun design system Wings Group**.

Halaman baru menampilkan dashboard monitoring outbound dengan 4 KPI Card, 3 Chart
(Status FO, Persebaran S-Type, Grouping Time STW), tabel detail, dan kemampuan CRUD manual
(Tambah, Edit, Hapus). Semua komponen colocated di `src/app/admin/outbound/` mengikuti pola
yang sama dengan modul `gantungan-faktur` dan `inbound` yang telah ada.

---

## Glossary

- **Outbound_Page**: Halaman `/admin/outbound` yang memuat semua komponen dashboard outbound.
- **OutboundRecord**: Satu entitas data outbound dengan 13 field sesuai sheet Excel Outbound.
- **FREIGHT_ORDER**: Nomor freight order — unik per record, berfungsi sebagai identifier bisnis.
- **Mobil_Muat**: Nomor kendaraan yang digunakan untuk muat.
- **S_TYPE**: Tipe pengiriman (misal: Regular, Express, Cold, dsb.).
- **Assign_Job**: Flag atau nilai yang hanya dapat diisi setelah `Mobil_Muat` terisi.
- **JAM_TERIMA**: Waktu FO diterima (`"HH:MM"`), hanya dapat diisi setelah `FREIGHT_ORDER` terisi.
- **STATUS**: Status Freight Order. Nilai valid: `"Open"`, `"Close"`, `"Cancel"`, `"Partial"`.
- **Selesai_Muat**: Waktu selesai proses muat (`"HH:MM"`).
- **HARI**: Indikator hari pengiriman (label teks bebas, misal: "Senin", "1", dsb.).
- **PUTARAN**: Nomor putaran pengiriman dalam satu hari.
- **ST**: Nilai numerik ≥ 0 terkait standar waktu.
- **H2**: Nilai numerik ≥ 0 terkait H+2 delivery.
- **JAM_RUNNING**: Waktu running (`"HH:MM"`), hanya dapat diisi setelah `H2` terisi.
- **KPI_Cards**: Komponen 4 kartu ringkasan metrik di bagian atas halaman.
- **StatusFO_Chart**: Horizontal Bar Chart distribusi records per STATUS.
- **SType_Chart**: Donut Chart distribusi records per S-TYPE.
- **STW_Chart**: Bar Chart grouping waktu STW (selisih JAM TERIMA → Selesai Muat).
- **Outbound_Table**: Tabel detail dengan pagination dan aksi per baris.
- **Filter_Bar**: Filter terpadu (date range, STATUS, S-TYPE, free-text search).
- **Outbound_Modal**: Modal form untuk Create dan Edit OutboundRecord.
- **Delete_Dialog**: Dialog konfirmasi sebelum menghapus satu OutboundRecord.
- **Toast**: Notifikasi pop-up sementara setelah aksi CRUD.
- **Active_Filter_Chip**: Elemen visual yang merepresentasikan satu filter aktif.
- **Super_Admin**: Role pengguna yang memiliki hak penuh atas operasi CRUD.
- **STW_Duration**: Selisih menit antara JAM_TERIMA dan Selesai_Muat, digunakan untuk bucketing STW Chart.


---

## Requirements

### Requirement 1: Definisi Tipe Data (Type Definitions)

**User Story:** As a developer, I want strict TypeScript type definitions for all outbound data structures, so that the entire feature has end-to-end type safety without any `any` type.

#### Acceptance Criteria

1. THE `src/app/admin/outbound/types.ts` SHALL export interface `OutboundRecord` dengan field: `id` (string), `tanggal` (string `"YYYY-MM-DD"`), `freightOrder` (string), `mobilMuat` (string), `sType` (string), `assignJob` (string), `jamTerima` (string `"HH:MM"`), `status` (`STATUS` union type), `selesaiMuat` (string `"HH:MM"`), `hari` (string), `putaran` (string), `st` (number ≥ 0), `h2` (number ≥ 0), `jamRunning` (string `"HH:MM"`).
2. THE `types.ts` SHALL export type `STATUS` dengan nilai literal: `"Open"`, `"Close"`, `"Cancel"`, `"Partial"`.
3. THE `types.ts` SHALL export `OutboundFormValues` dengan semua field sebagai `string` (raw form input sebelum parsing).
4. THE `types.ts` SHALL export `OutboundFormErrors` sebagai `Partial<Record<keyof OutboundFormValues, string>>`.
5. THE `types.ts` SHALL export `CrudMode` sebagai `"create" | "edit"`.
6. THE `types.ts` SHALL export `ModalState` dengan field `open` (boolean), `mode` (CrudMode), `record` (OutboundRecord, opsional).
7. THE `types.ts` SHALL export `OutboundFilters` dengan field: `dateRange` (`{ startDate: string | null; endDate: string | null }`), `selectedStatus` (string[]), `selectedSType` (string[]), `searchQuery` (string).
8. THE `types.ts` SHALL export `ToastVariant` sebagai `"success" | "error"` dan `ToastMessage` dengan field `id` (string), `variant` (ToastVariant), `message` (string).
9. THE `types.ts` SHALL NOT menggunakan TypeScript `any` type di manapun.
10. THE `types.ts` SHALL menjadi single source of truth — tidak ada type definition duplikat di file lain dalam folder `src/app/admin/outbound/`.


---

### Requirement 2: Mock Data

**User Story:** As a developer, I want realistic and complete mock data for the outbound feature, so that the UI is immediately functional and visually representative during development without a backend.

#### Acceptance Criteria

1. THE `src/app/admin/outbound/mock.ts` SHALL export `initialOutboundData` sebagai array dari minimal 25 `OutboundRecord` dengan semua 13 field terisi.
2. THE `initialOutboundData` SHALL mengandung variasi nilai `STATUS`: `"Open"`, `"Close"`, `"Cancel"`, `"Partial"` — dengan distribusi realistik (mayoritas `"Close"`).
3. THE `initialOutboundData` SHALL mengandung minimal 3 nilai `sType` berbeda.
4. THE `initialOutboundData` SHALL memiliki field `tanggal` tersebar minimal dalam rentang 14 hari.
5. THE `initialOutboundData` SHALL memiliki field `freightOrder` yang unik untuk setiap record.
6. THE `initialOutboundData` SHALL memiliki field `jamTerima`, `selesaiMuat`, dan `jamRunning` dengan format `"HH:MM"` yang valid.
7. THE `initialOutboundData` SHALL memiliki field `st` dan `h2` dengan nilai bilangan bulat ≥ 0.
8. WHEN `initialOutboundData` diurutkan berdasarkan `tanggal`, THE distribusi tanggal SHALL tidak terkonsentrasi pada satu hari saja.


---

### Requirement 3: KPI Cards (OutboundCards.tsx)

**User Story:** As a warehouse manager, I want to see 4 KPI summary cards at the top of the outbound dashboard, so that I can quickly assess total activity, loading categories, and second-round deliveries at a glance.

#### Acceptance Criteria

1. THE KPI_Cards SHALL merender tepat 4 kartu dalam grid responsif: `lg:grid-cols-4`, `sm:grid-cols-2`, `grid-cols-1`.
2. THE KPI_Cards SHALL menampilkan kartu **"Total Mobil Muat"** dengan nilai = jumlah total records dari data yang difilter.
3. THE KPI_Cards SHALL menampilkan kartu **"Muat Inap"** dengan nilai = jumlah records yang dikategorikan Muat Inap, disertai persentase dari total.
4. THE KPI_Cards SHALL menampilkan kartu **"Muat Pagi"** dengan nilai = jumlah records yang dikategorikan Muat Pagi, disertai persentase dari total.
5. THE KPI_Cards SHALL menampilkan kartu **"Rit 2"** dengan nilai = jumlah records yang dikategorikan Rit 2, disertai persentase dari total.
6. IF data yang difilter kosong (0 records), THE KPI_Cards SHALL menampilkan `0` pada semua kartu numerik dan `0%` atau `—` pada persentase.
7. THE KPI_Cards SHALL menggunakan design system Wings Group: primary `#10B981` (emerald), card white `#FFFFFF`, border `#E5E7EB`, `rounded-[18px]`.
8. THE KPI_Cards SHALL di-wrap dengan React `memo` dan menerima prop `data: OutboundRecord[]`.
9. THE KPI_Cards SHALL menghitung semua nilai KPI menggunakan `useMemo` agar tidak re-kalkulasi tanpa perubahan data.

#### Correctness Properties

- **Property KPI Invariant**: UNTUK SEMUA subset `data` yang valid, `jumlahMuatInap + jumlahMuatPagi + jumlahRit2 ≤ totalMobilMuat` (sebuah record dapat masuk lebih dari satu kategori, atau tidak ada — tidak pernah melebihi total).
- **Property Persentase Konsisten**: UNTUK SEMUA `data` dengan `length > 0`, persentase Muat Inap = `(jumlahMuatInap / totalMobilMuat) * 100` dengan toleransi pembulatan ±0.5%.


---

### Requirement 4: Chart Status FO — Horizontal Bar Chart (StatusFOChart.tsx)

**User Story:** As a warehouse manager, I want to see a horizontal bar chart showing the distribution of records by STATUS field, so that I can understand the proportion of Open, Close, Cancel, and Partial freight orders.

#### Acceptance Criteria

1. THE StatusFO_Chart SHALL merender Recharts `BarChart` dengan `layout="vertical"` di dalam `ResponsiveContainer` lebar penuh.
2. THE StatusFO_Chart SHALL menghitung distribusi frekuensi per nilai `status` dari prop `data: OutboundRecord[]` menggunakan `useMemo`.
3. THE StatusFO_Chart SHALL mengurutkan bar dari jumlah records terbanyak ke terkecil (descending).
4. THE StatusFO_Chart SHALL memetakan Y-axis ke nama `status` dan X-axis ke jumlah records.
5. THE StatusFO_Chart SHALL menyertakan custom tooltip yang menampilkan nama status dan jumlah records.
6. THE StatusFO_Chart SHALL menggunakan warna berbeda per status: `"Open"` → emerald `#10B981`, `"Close"` → biru `#3B82F6`, `"Cancel"` → merah `#EF4444`, `"Partial"` → amber `#F59E0B`.
7. THE StatusFO_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, judul **"Status FO"**.
8. IF data kosong, THE StatusFO_Chart SHALL menampilkan empty state dengan pesan deskriptif.
9. THE StatusFO_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

#### Correctness Properties

- **Property Distribusi Lengkap**: UNTUK SEMUA `data` yang valid, SUM dari semua nilai frekuensi pada distribusi status = `data.length` (tidak ada record yang terlewat atau terhitung ganda).


---

### Requirement 5: Chart Persebaran S-Type — Donut Chart (STypeChart.tsx)

**User Story:** As a warehouse manager, I want to see a donut chart showing the distribution of records by S-TYPE field, so that I can quickly identify which delivery types dominate the outbound activity.

#### Acceptance Criteria

1. THE SType_Chart SHALL merender Recharts `PieChart` dengan `innerRadius` (donut shape) di dalam `ResponsiveContainer` lebar penuh.
2. THE SType_Chart SHALL menghitung distribusi frekuensi per nilai `sType` dari prop `data: OutboundRecord[]` menggunakan `useMemo`.
3. THE SType_Chart SHALL menyertakan custom tooltip yang menampilkan nama s-type, jumlah records, dan persentase dari total.
4. THE SType_Chart SHALL menggunakan palet warna yang berbeda untuk setiap s-type (minimal 5 warna berbeda dari design system).
5. THE SType_Chart SHALL menyertakan Legend yang menampilkan nama dan jumlah/persentase per s-type.
6. THE SType_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, judul **"Persebaran S-Type"**.
7. IF data kosong, THE SType_Chart SHALL menampilkan empty state dengan pesan deskriptif.
8. THE SType_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

#### Correctness Properties

- **Property Distribusi Penuh**: UNTUK SEMUA `data` yang valid dengan `length > 0`, SUM dari semua nilai `value` pada pie data = `data.length` (setiap record masuk tepat satu slice).


---

### Requirement 6: Chart Grouping Time STW — Bar Chart (STGroupingChart.tsx)

**User Story:** As a warehouse operations staff member, I want to see a bar chart grouping records by their STW duration (time from JAM TERIMA to Selesai Muat), so that I can identify loading time bottlenecks.

#### Acceptance Criteria

1. THE STW_Chart SHALL merender Recharts `BarChart` di dalam `ResponsiveContainer` lebar penuh.
2. THE STW_Chart SHALL menghitung `STW_Duration` untuk setiap record sebagai selisih menit antara `jamTerima` dan `selesaiMuat` menggunakan `useMemo`.
3. THE STW_Chart SHALL mengelompokkan records ke dalam 4 bucket: **"< 30 Menit"**, **"30–60 Menit"**, **"60–90 Menit"**, **"> 90 Menit"**.
4. WHEN `jamTerima` atau `selesaiMuat` kosong atau tidak valid, THE STW_Chart SHALL mengecualikan record tersebut dari kalkulasi (tidak masuk bucket manapun).
5. THE STW_Chart SHALL memetakan X-axis ke label bucket dan Y-axis ke jumlah records per bucket.
6. THE STW_Chart SHALL menyertakan custom tooltip yang menampilkan label bucket dan jumlah records.
7. THE STW_Chart SHALL menggunakan warna berbeda per bucket (misal: hijau, kuning, oranye, merah — mencerminkan urgensi waktu).
8. THE STW_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, judul **"Grouping Time STW"**.
9. IF tidak ada records dengan waktu valid, THE STW_Chart SHALL menampilkan empty state.
10. THE STW_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

#### Correctness Properties

- **Property Bucket Invariant**: UNTUK SEMUA `data` yang valid, SUM dari semua bucket = jumlah records yang memiliki `jamTerima` dan `selesaiMuat` valid (records yang dikecualikan tidak menambah/mengurangi total records valid).
- **Property Bucket Mutually Exclusive**: UNTUK SEMUA record dengan STW valid, record tersebut SHALL masuk tepat satu bucket (tidak ada overlap antar bucket).


---

### Requirement 7: Filter Bar (FilterBar.tsx)

**User Story:** As a warehouse operations staff member, I want a comprehensive filter bar above the dashboard, so that I can narrow down outbound records by date range, status, s-type, and free-text search — with all dashboard sections responding to the same filter.

#### Acceptance Criteria

1. THE Filter_Bar SHALL merender kontrol Date Range (dua input date: startDate dan endDate) untuk memfilter berdasarkan field `tanggal`.
2. THE Filter_Bar SHALL merender dropdown multi-select **"STATUS"** dengan opsi tetap: `"Open"`, `"Close"`, `"Cancel"`, `"Partial"`.
3. THE Filter_Bar SHALL merender dropdown multi-select **"S-TYPE"** dengan opsi dinamis yang diambil dari nilai unik `sType` dalam data aktual.
4. THE Filter_Bar SHALL merender input text **"Search"** dengan placeholder `"Cari FREIGHT ORDER atau Mobil Muat..."` yang mencari pada field `freightOrder` dan `mobilMuat` secara bersamaan (case-insensitive).
5. WHEN pengguna mengetik di input Search, THE Filter_Bar SHALL menerapkan debounce 300 milidetik sebelum memperbarui filter state.
6. WHEN satu atau lebih filter aktif, THE Filter_Bar SHALL merender Active_Filter_Chip untuk setiap filter aktif di bawah baris kontrol.
7. WHEN pengguna mengklik tombol "×" pada satu Active_Filter_Chip, THE Filter_Bar SHALL menghapus hanya filter yang bersangkutan tanpa mengganggu filter lainnya.
8. THE Filter_Bar SHALL merender tombol **"Reset All"** yang menghapus semua filter sekaligus; tombol ini hanya tampil ketika minimal satu filter aktif.
9. THE Filter_Bar SHALL memanggil callback `onChange` dengan partial `OutboundFilters` setiap kali salah satu filter berubah.
10. THE Filter_Bar SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

#### Correctness Properties

- **Property Filter Subset**: UNTUK SEMUA filter yang aktif, `filteredData.length ≤ originalData.length` (filter hanya bisa memperkecil atau mempertahankan jumlah data, tidak pernah menambah).
- **Property Reset Idempotent**: SETELAH `onReset` dipanggil, menerapkan filter yang telah di-reset ke data apapun SHALL menghasilkan dataset yang sama dengan data asli tanpa filter.


---

### Requirement 8: Detail Table (OutboundTable.tsx)

**User Story:** As a warehouse operations staff member, I want a paginated detail table showing all outbound records with all fields visible, so that I can review and manage delivery data efficiently.

#### Acceptance Criteria

1. THE Outbound_Table SHALL merender tabel dengan tepat 14 kolom: **Tanggal | FREIGHT ORDER | Mobil Muat | S-TYPE | Assign Job | JAM TERIMA | STATUS | Selesai Muat | HARI | PUTARAN | ST | H2 | JAM RUNNING | Action**.
2. THE Outbound_Table SHALL merender kolom **STATUS** dengan badge berwarna: `"Open"` → emerald, `"Close"` → biru, `"Cancel"` → merah, `"Partial"` → amber.
3. THE Outbound_Table SHALL merender tombol **Edit** (ikon Pencil) dan **Delete** (ikon Trash2) di kolom Action untuk setiap baris.
4. WHEN tombol Edit diklik, THE Outbound_Table SHALL memanggil callback `onEdit` dengan `OutboundRecord` yang bersangkutan.
5. WHEN tombol Delete diklik, THE Outbound_Table SHALL memanggil callback `onDelete` dengan `OutboundRecord` yang bersangkutan.
6. THE Outbound_Table SHALL menerapkan hover row effect pada setiap baris.
7. THE Outbound_Table SHALL merender kontrol pagination dengan opsi page size: 10, 25, 50.
8. THE Outbound_Table SHALL menampilkan label pagination dalam format `"{start}–{end} dari {total} data"`.
9. WHEN data kosong, THE Outbound_Table SHALL menampilkan empty state dengan ikon `Inbox` dan teks **"Tidak ada data outbound ditemukan"**.
10. THE Outbound_Table SHALL memiliki `min-width` pada inner table agar dapat di-scroll secara horizontal pada layar kecil.
11. THE Outbound_Table SHALL di-wrap dengan `memo`, menggunakan `useCallback` untuk event handlers, dan menggunakan `"use client"` directive.


---

### Requirement 9: Modal CRUD (OutboundModal.tsx)

**User Story:** As a Super Admin, I want a modal form to create and edit outbound records, so that I can add new delivery data or correct existing entries without leaving the dashboard.

#### Acceptance Criteria

1. THE Outbound_Modal SHALL merender form dengan tepat 13 field sesuai struktur `OutboundRecord`: Tanggal (date), FREIGHT ORDER (text), Mobil Muat (text), S-TYPE (text), Assign Job (text), JAM TERIMA (time), STATUS (select), Selesai Muat (time), HARI (text), PUTARAN (text), ST (number), H2 (number), JAM RUNNING (time).
2. THE Outbound_Modal SHALL menampilkan judul **"Tambah Outbound"** saat `mode === "create"` dan **"Edit Outbound"** saat `mode === "edit"`.
3. WHEN `mode === "edit"`, THE Outbound_Modal SHALL pre-populate semua field dengan nilai dari `record` yang diedit.
4. THE Outbound_Modal SHALL memvalidasi semua field sebagai wajib (tidak boleh kosong atau hanya whitespace).
5. THE Outbound_Modal SHALL memvalidasi bahwa `ST` ≥ 0; nilai negatif SHALL ditolak dengan pesan error.
6. THE Outbound_Modal SHALL memvalidasi bahwa `H2` ≥ 0; nilai negatif SHALL ditolak dengan pesan error.
7. THE Outbound_Modal SHALL memvalidasi field `STATUS` hanya menerima nilai dari dropdown (`"Open"`, `"Close"`, `"Cancel"`, `"Partial"`).
8. THE Outbound_Modal SHALL menampilkan error validasi inline di bawah setiap field yang tidak valid.
9. WHEN pengguna menekan tombol Save saat form valid, THE Outbound_Modal SHALL memanggil `onSave` dengan `OutboundFormValues` dan menampilkan state loading pada tombol Save.
10. WHEN `saving` prop bernilai `true`, THE Outbound_Modal SHALL menonaktifkan tombol Save dan tombol Close.
11. WHEN pengguna menekan tombol Escape atau backdrop, THE Outbound_Modal SHALL memanggil `onClose` (kecuali saat `saving === true`).
12. THE Outbound_Modal SHALL menerapkan focus trap agar navigasi Tab/Shift+Tab tidak keluar dari batas modal.
13. THE Outbound_Modal SHALL menggunakan Framer Motion `AnimatePresence` dengan animasi masuk/keluar (scale + opacity).
14. THE Outbound_Modal SHALL menggunakan `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
15. THE Outbound_Modal SHALL menggunakan `"use client"` directive.

#### Correctness Properties

- **Property Validasi Error Conditions**: UNTUK SEMUA input dengan satu atau lebih field kosong, `validate(input)` SHALL menghasilkan `OutboundFormErrors` yang mengandung entry untuk setiap field yang kosong (tidak ada field kosong yang lolos validasi).
- **Property ST/H2 Non-Negatif**: UNTUK SEMUA input dengan nilai `st < 0` atau `h2 < 0`, `validate(input)` SHALL menghasilkan error pada field yang bersangkutan.


---

### Requirement 10: FREIGHT ORDER Uniqueness Validation

**User Story:** As a Super Admin, I want the system to reject duplicate FREIGHT ORDER entries during Create, so that data integrity is maintained and each freight order appears only once in the dataset.

#### Acceptance Criteria

1. WHEN Super_Admin mencoba Create dengan nilai `freightOrder` yang sudah ada di data, THE Outbound_Modal SHALL menampilkan error inline pada field FREIGHT ORDER: **"FREIGHT ORDER sudah terdaftar."**
2. WHEN Super_Admin mencoba Edit dengan nilai `freightOrder` yang dimiliki record lain (bukan record yang sedang diedit), THE Outbound_Modal SHALL menampilkan error inline pada field FREIGHT ORDER.
3. WHEN Super_Admin Edit dan nilai `freightOrder` tidak berubah (sama dengan record yang diedit), THE Outbound_Modal SHALL mengizinkan save tanpa error duplikasi.
4. THE Outbound_Modal SHALL menerima prop `existingFreightOrders: string[]` dan `currentId?: string` untuk keperluan validasi duplikasi.

#### Correctness Properties

- **Property Uniqueness**: UNTUK SEMUA operasi Create dengan `freightOrder` yang sudah ada dalam `existingFreightOrders`, validasi SHALL selalu mengembalikan error (tidak ada false negative).


---

### Requirement 11: Delete Confirmation Dialog

**User Story:** As a Super Admin, I want a confirmation dialog before deleting an outbound record, so that I can prevent accidental data loss.

#### Acceptance Criteria

1. THE Delete_Dialog SHALL merender elemen dengan `role="alertdialog"` dan `aria-modal="true"`.
2. THE Delete_Dialog SHALL menampilkan nilai `freightOrder` dan `tanggal` dari record yang akan dihapus sebagai konteks konfirmasi.
3. THE Delete_Dialog SHALL merender tombol **"Hapus"** dan tombol **"Batal"**.
4. WHEN `deleting` prop bernilai `true`, THE Delete_Dialog SHALL menonaktifkan kedua tombol dan menampilkan **"Menghapus..."** pada tombol Hapus.
5. WHEN pengguna mengklik backdrop, THE Delete_Dialog SHALL memanggil `onClose` (kecuali saat `deleting === true`).
6. THE Delete_Dialog SHALL menggunakan Framer Motion `AnimatePresence` dengan animasi masuk/keluar.


---

### Requirement 12: Toast Notifications

**User Story:** As a Super Admin, I want auto-dismissing toast notifications after each CRUD action, so that I receive immediate visual feedback on whether my action succeeded or failed.

#### Acceptance Criteria

1. WHEN operasi Create berhasil, THE Outbound_Page SHALL menampilkan Toast `variant="success"` dengan pesan **"Data outbound berhasil ditambahkan."**
2. WHEN operasi Edit berhasil, THE Outbound_Page SHALL menampilkan Toast `variant="success"` dengan pesan **"Data outbound berhasil diperbarui."**
3. WHEN operasi Delete berhasil, THE Outbound_Page SHALL menampilkan Toast `variant="success"` dengan pesan **"Data outbound berhasil dihapus."**
4. THE Toast sukses SHALL menampilkan border kiri `#10B981` (emerald) dan ikon `CheckCircle2`.
5. THE Toast error SHALL menampilkan border kiri merah dan ikon `AlertCircle`.
6. WHEN Toast ditampilkan, THE Toast SHALL di-dismiss otomatis setelah tepat 4000 milidetik.
7. THE Outbound_Page SHALL mendukung beberapa Toast aktif secara bersamaan dalam stack.
8. WHEN pengguna mengklik tombol "×" pada Toast, THE Toast tersebut SHALL segera di-dismiss.
9. THE Toast stack SHALL dirender di posisi fixed `bottom-4 right-4` pada layar besar dan center-aligned pada mobile.
10. THE Toast SHALL menggunakan Framer Motion `AnimatePresence` untuk animasi masuk dan keluar.


---

### Requirement 13: Reaktivitas Dashboard (CRUD Synchronization)

**User Story:** As a Super Admin, I want all dashboard sections to update automatically after any CRUD action, so that I always see the latest data without a page refresh.

#### Acceptance Criteria

1. WHEN operasi Create berhasil, THE Outbound_Page SHALL menambahkan record baru ke state data utama sehingga KPI_Cards, StatusFO_Chart, SType_Chart, STW_Chart, dan Outbound_Table semua terupdate otomatis.
2. WHEN operasi Edit berhasil, THE Outbound_Page SHALL mengganti record lama dengan record yang diperbarui di state utama sehingga semua komponen terupdate.
3. WHEN operasi Delete berhasil, THE Outbound_Page SHALL menghapus record dari state utama sehingga semua komponen terupdate.
4. THE semua komponen (KPI_Cards, charts, tabel) SHALL menerima data dari single state source di Outbound_Page.
5. THE agregasi data untuk KPI, chart, dan tabel SHALL dihitung menggunakan `useMemo` berdasarkan state data dan filter aktif.
6. THE Outbound_Page SHALL TIDAK melakukan page refresh (full reload) setelah operasi CRUD manapun.

#### Correctness Properties

- **Property Create Invariant**: SETELAH Create berhasil dengan record valid baru, `data.length` SHALL bertambah tepat 1.
- **Property Edit Invariant**: SETELAH Edit berhasil, `data.length` SHALL tetap sama; record dengan `id` yang diedit SHALL memiliki nilai field yang diperbarui.
- **Property Delete Invariant**: SETELAH Delete berhasil, `data.length` SHALL berkurang tepat 1; record dengan `id` yang dihapus SHALL tidak ada dalam `data`.


---

### Requirement 14: Halaman Utama Dashboard (page.tsx)

**User Story:** As a warehouse manager, I want a complete outbound dashboard page at `/admin/outbound`, so that I have a single place to monitor all outbound metrics and manage data.

#### Acceptance Criteria

1. THE Outbound_Page SHALL berlokasi di `src/app/admin/outbound/page.tsx` dengan `"use client"` directive.
2. THE Outbound_Page SHALL merender page header berisi judul **"Outbound Monitoring"**, subtitle, badge `"{filtered} dari {total} record"`, dan tombol **"+ Tambah Outbound"** berwarna emerald.
3. THE Outbound_Page SHALL merender komponen dalam urutan: Filter_Bar → KPI_Cards → StatusFO_Chart + SType_Chart (side-by-side) → STW_Chart (full-width) → Outbound_Table (full-width).
4. THE Outbound_Page SHALL menganimasikan setiap section menggunakan `fadeUp` Framer Motion variants dengan staggered delay indexes 0 hingga 5.
5. THE Outbound_Page SHALL mengelola state data utama `data: OutboundRecord[]` diinisialisasi dari `initialOutboundData`.
6. THE Outbound_Page SHALL mengelola state `filters: OutboundFilters` dan menghasilkan `filteredData` via `useMemo`.
7. THE Outbound_Page SHALL menggunakan `useCallback` untuk semua event handler: `handleSave`, `handleEdit`, `handleDeleteClick`, `handleConfirmDelete`, `updateFilters`, `resetFilters`, `addToast`, `dismissToast`.
8. WHEN tombol **"+ Tambah Outbound"** diklik, THE Outbound_Page SHALL membuka Outbound_Modal dalam mode `"create"`.
9. THE Outbound_Page SHALL merender Outbound_Modal, Delete_Dialog, dan Toast stack di bagian akhir JSX.


---

### Requirement 15: Konsistensi Pola Kode (Code Quality)

**User Story:** As a developer maintaining this codebase, I want the outbound-refactor feature to follow all established conventions, so that the codebase remains uniform and `npm run build` completes without errors.

#### Acceptance Criteria

1. THE semua file komponen SHALL mengandung `"use client"` directive sebagai baris pertama.
2. THE semua komponen SHALL di-wrap dengan React `memo` untuk mencegah re-render yang tidak perlu.
3. THE semua kalkulasi agregasi data SHALL menggunakan `useMemo`.
4. THE semua event handler SHALL menggunakan `useCallback`.
5. THE semua chart SHALL menggunakan Recharts `ResponsiveContainer` sebagai wrapper terluar.
6. THE semua animasi entrance SHALL menggunakan `framer-motion` dengan pola `fadeUp` variant (`opacity: 0, y: 14` → `opacity: 1, y: 0`).
7. THE design system Wings Group SHALL diterapkan konsisten di semua komponen: primary `#10B981`, cards white `#FFFFFF`, border `#E5E7EB`, `rounded-[18px]`.
8. THE semua file dalam `src/app/admin/outbound/` SHALL TIDAK menggunakan TypeScript `any` type.
9. THE `npm run build` SHALL berhasil dengan exit code 0 tanpa TypeScript compilation error maupun ESLint error.
10. THE semua import yang tidak digunakan SHALL dihapus dari semua file komponen.


---

### Requirement 16: Struktur Komponen (Component Structure)

**User Story:** As a developer, I want a well-defined component structure for the outbound module, so that the codebase is easy to navigate and maintain.

#### Acceptance Criteria

1. THE fitur outbound-refactor SHALL colocated seluruh file di `src/app/admin/outbound/` dengan struktur:
   ```
   outbound/
   ├── page.tsx
   ├── OutboundCards.tsx
   ├── StatusFOChart.tsx
   ├── STypeChart.tsx
   ├── STGroupingChart.tsx
   ├── OutboundTable.tsx
   ├── OutboundModal.tsx
   ├── FilterBar.tsx
   ├── mock.ts
   └── types.ts
   ```
2. THE routing `/admin/outbound` SHALL TIDAK berubah — file `page.tsx` tetap di lokasi yang sama.
3. THE autentikasi dan layout dashboard (DashboardLayout) SHALL TIDAK dimodifikasi.
4. THE design system Wings Group (warna, spacing, radius) SHALL dipertahankan sepenuhnya.
5. THE file `page.tsx` lama SHALL diganti total dengan implementasi baru menggunakan struktur data yang diperbarui.

