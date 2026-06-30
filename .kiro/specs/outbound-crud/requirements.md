# Requirements Document

## Introduction

Fitur **Outbound Module Refactor + Manual CRUD** adalah full refactor halaman `/admin/outbound` di proyek Next.js 15. Halaman lama (berbasis Freight Order, Mobil Muat, S-Type) diganti sepenuhnya dengan implementasi baru berbasis sheet Outbound Excel. Halaman baru menampilkan dashboard monitoring pengiriman outbound dengan KPI cards, chart distribusi Status FO, chart tren pengiriman harian, chart performa vendor, tabel detail dengan pagination, dan kemampuan CRUD manual (tambah, edit, hapus data). Semua komponen colocated di `src/app/admin/outbound/` mengikuti pola yang sama dengan fitur `gantungan-faktur`.

---

## Glossary

- **Outbound_Page**: Halaman `/admin/outbound` yang memuat semua komponen dashboard outbound.
- **OutboundRecord**: Satu entitas data pengiriman outbound dengan semua atributnya.
- **Plant**: Lokasi gudang atau pusat distribusi asal pengiriman. Nilai valid: `"PASM"`, `"IMSM"`, `"U2"`, `"LION"`, `"TASE"`.
- **Vendor**: Perusahaan transportasi/ekspedisi yang menjalankan pengiriman.
- **NoPolisi**: Nomor plat kendaraan yang digunakan untuk pengiriman, format `"B 1234 XY"`.
- **Driver**: Nama pengemudi kendaraan pengiriman.
- **StatusFO**: Status Freight Order. Nilai valid: `"OPEN"`, `"CLOSE"`, `"CANCEL"`, `"PARTIAL"`.
- **TotalBox**: Jumlah kardus/kotak yang dikirim dalam satu transaksi pengiriman (bilangan bulat ≥ 0).
- **TotalQty**: Jumlah item/satuan yang dikirim dalam satu transaksi pengiriman (bilangan bulat ≥ 0).
- **JamLoading**: Waktu mulai proses loading kendaraan, format `"HH:MM"`.
- **JamBerangkat**: Waktu kendaraan berangkat dari gudang, format `"HH:MM"`.
- **KPI_Cards**: Komponen yang menampilkan 4 kartu ringkasan metrik di bagian atas halaman.
- **StatusFO_Chart**: Komponen grafik batang horizontal yang menampilkan distribusi records per StatusFO.
- **Delivery_Trend_Chart**: Komponen ComposedChart yang menampilkan tren pengiriman harian (bar count + line totalBox).
- **Vendor_Chart**: Komponen grafik batang horizontal yang menampilkan jumlah pengiriman per vendor.
- **Outbound_Table**: Komponen tabel detail dengan pagination, sort, edit, dan delete per baris.
- **Filter_Bar**: Komponen filter terpadu (date range, plant, vendor, statusFO, free-text search).
- **Outbound_Modal**: Komponen modal form untuk Create dan Edit data OutboundRecord.
- **Delete_Dialog**: Komponen dialog konfirmasi sebelum menghapus satu OutboundRecord.
- **Toast**: Notifikasi pop-up sementara yang muncul setelah aksi CRUD berhasil atau gagal.
- **Active_Filter_Chip**: Elemen visual kecil di bawah filter controls yang merepresentasikan satu filter aktif dan dapat dihapus.
- **ResponsiveContainer**: Komponen Recharts pembungkus grafik agar responsif terhadap ukuran kontainer.
- **fadeUp**: Varian animasi Framer Motion — elemen muncul dari bawah ke atas dengan fade-in (`opacity: 0, y: 14` → `opacity: 1, y: 0`).

---

## Requirements

### Requirement 1: Definisi Tipe Data (Type Definitions)

**User Story:** As a developer, I want strict TypeScript type definitions for all outbound data structures, so that the entire feature has end-to-end type safety without any `any` type.

#### Acceptance Criteria

1. THE Outbound_Page SHALL use type definitions from `src/app/admin/outbound/types.ts` as the single source of truth for all data shapes.
2. THE `types.ts` SHALL export the interface `OutboundRecord` with fields: `id` (string), `tanggal` (string `"YYYY-MM-DD"`), `plant` (string), `vendor` (string), `noPolisi` (string), `driver` (string), `statusFO` (string), `totalBox` (number), `totalQty` (number), `jamLoading` (string `"HH:MM"`), `jamBerangkat` (string `"HH:MM"`).
3. THE `types.ts` SHALL export the type `StatusFO` with exactly four string literal values: `"OPEN"`, `"CLOSE"`, `"CANCEL"`, dan `"PARTIAL"`.
4. THE `types.ts` SHALL export `OutboundFormValues` dengan semua field sebagai `string` (untuk raw form input sebelum parsing).
5. THE `types.ts` SHALL export `OutboundFormErrors` sebagai `Partial<Record<keyof OutboundFormValues, string>>`.
6. THE `types.ts` SHALL export `CrudMode` sebagai union type `"create" | "edit"`.
7. THE `types.ts` SHALL export `ModalState` dengan field `open` (boolean), `mode` (CrudMode), dan `record` (OutboundRecord, opsional).
8. THE `types.ts` SHALL export `OutboundFilters` dengan field: `dateRange` ({ startDate: string | null; endDate: string | null }), `selectedPlant` (string[]), `selectedVendor` (string[]), `selectedStatusFO` (string[]), `searchQuery` (string).
9. THE `types.ts` SHALL export `ToastVariant` sebagai union `"success" | "error"` dan `ToastMessage` dengan field `id` (string), `variant` (ToastVariant), `message` (string).
10. THE `types.ts` SHALL NOT use the TypeScript `any` type anywhere.

---

### Requirement 2: Mock Data

**User Story:** As a developer, I want realistic and complete mock data for the outbound feature, so that the UI is immediately functional and visually representative during development.

#### Acceptance Criteria

1. THE `src/app/admin/outbound/mock.ts` SHALL export `initialOutboundData` sebagai array dari minimal 25 `OutboundRecord` dengan semua field terisi.
2. THE `initialOutboundData` SHALL mengandung tepat 5 vendor berbeda: `"PT Logistics Nusantara"`, `"CV Trans Mandiri"`, `"PT Cepat Jaya"`, `"UD Mitra Cargo"`, dan `"PT Armada Express"`.
3. THE `initialOutboundData` SHALL mengandung tepat 5 plant berbeda: `"PASM"`, `"IMSM"`, `"U2"`, `"LION"`, dan `"TASE"`.
4. THE `initialOutboundData` SHALL mengandung mix realistik semua 4 nilai StatusFO: `"OPEN"`, `"CLOSE"`, `"CANCEL"`, dan `"PARTIAL"`.
5. THE `initialOutboundData` SHALL memiliki field `tanggal` yang tersebar dalam rentang 30 hari terakhir (Juni 2026).
6. THE `initialOutboundData` SHALL memiliki field `noPolisi` dengan format `"B 1234 XY"` (huruf kapital, spasi sebagai pemisah).
7. THE `initialOutboundData` SHALL memiliki semua field `totalBox` dan `totalQty` dengan nilai bilangan bulat ≥ 0.
8. THE `initialOutboundData` SHALL memiliki semua field `jamLoading` dan `jamBerangkat` dengan format `"HH:MM"` yang valid.
9. WHEN `initialOutboundData` diurutkan berdasarkan `tanggal`, THE distribusi tanggal SHALL tidak terkonsentrasi pada satu hari saja (spread merata).

---

### Requirement 3: Komponen KPI Cards (OutboundCards.tsx)

**User Story:** As a warehouse manager, I want to see 4 KPI summary cards at the top of the outbound dashboard, so that I can quickly assess the overall delivery metrics at a glance.

#### Acceptance Criteria

1. THE KPI_Cards SHALL render tepat 4 kartu dalam grid responsif: 4 kolom pada layar besar (≥ lg), 2 kolom pada layar sedang, 1 kolom pada layar kecil.
2. THE KPI_Cards SHALL menampilkan kartu "Total Delivery" dengan nilai = jumlah records (count) dari data yang difilter.
3. THE KPI_Cards SHALL menampilkan kartu "Total Box" dengan nilai = SUM dari field `totalBox` seluruh records yang difilter.
4. THE KPI_Cards SHALL menampilkan kartu "Total Qty" dengan nilai = SUM dari field `totalQty` seluruh records yang difilter.
5. THE KPI_Cards SHALL menampilkan kartu "Status FO Dominan" dengan nilai = nama StatusFO dengan jumlah records terbanyak dari data yang difilter, diikuti dengan angka jumlah dalam tanda kurung.
6. IF dua atau lebih StatusFO memiliki jumlah records yang sama, THE KPI_Cards SHALL menampilkan salah satu StatusFO tersebut secara konsisten (tidak acak).
7. IF data yang difilter kosong (0 records), THE KPI_Cards SHALL menampilkan "–" pada kartu "Status FO Dominan".
8. THE KPI_Cards SHALL menggunakan design system Wings Group: primary `#10B981` (emerald) untuk aksen warna, cards white `#FFFFFF`, border `#E5E7EB`, `rounded-[18px]`.
9. THE KPI_Cards SHALL di-wrap dengan `memo` dan menerima prop `data: OutboundRecord[]`.

---

### Requirement 4: Komponen Status FO Chart (StatusFOChart.tsx)

**User Story:** As a warehouse manager, I want to see a horizontal bar chart showing the distribution of records by Status FO, so that I can understand the proportion of open, closed, cancelled, and partial deliveries.

#### Acceptance Criteria

1. THE StatusFO_Chart SHALL merender Recharts `BarChart` dengan `layout="vertical"` di dalam `ResponsiveContainer` lebar penuh.
2. THE StatusFO_Chart SHALL menggunakan data agregat distribusi per `statusFO` dari prop `data: OutboundRecord[]` sebagai sumber data, dihitung menggunakan `useMemo`.
3. THE StatusFO_Chart SHALL mengurutkan bar dari jumlah records terbanyak ke terkecil (descending).
4. THE StatusFO_Chart SHALL memetakan Y-axis (category axis) ke nama `statusFO` dan X-axis (value axis) ke jumlah records.
5. THE StatusFO_Chart SHALL menyertakan custom tooltip yang menampilkan nama `statusFO` dan jumlah records.
6. THE StatusFO_Chart SHALL menggunakan warna berbeda untuk setiap StatusFO: `"OPEN"` → emerald/hijau, `"CLOSE"` → biru, `"CANCEL"` → merah, `"PARTIAL"` → amber/kuning.
7. THE StatusFO_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, dan judul "Distribusi Status FO".
8. THE StatusFO_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

---

### Requirement 5: Komponen Delivery Trend Chart (DeliveryTrendChart.tsx)

**User Story:** As a warehouse manager, I want to see a daily delivery trend chart combining bar and line series, so that I can correlate delivery count with total box volume over time.

#### Acceptance Criteria

1. THE Delivery_Trend_Chart SHALL merender Recharts `ComposedChart` di dalam `ResponsiveContainer` lebar penuh.
2. THE Delivery_Trend_Chart SHALL menggunakan data agregat harian dari prop `data: OutboundRecord[]` yang dikelompokkan berdasarkan `tanggal`, dihitung menggunakan `useMemo`.
3. THE Delivery_Trend_Chart SHALL menampilkan Bar series untuk "Total Delivery" (count records per hari) menggunakan Y-axis kiri.
4. THE Delivery_Trend_Chart SHALL menampilkan Line series untuk "Total Box" (SUM `totalBox` per hari) menggunakan Y-axis kanan (secondary Y-axis).
5. THE Delivery_Trend_Chart SHALL memetakan X-axis ke label tanggal singkat (contoh: "01 Jun", "02 Jun").
6. THE Delivery_Trend_Chart SHALL menyertakan custom tooltip yang menampilkan tanggal, jumlah delivery, dan total box.
7. THE Delivery_Trend_Chart SHALL menyertakan Legend yang mengidentifikasi Bar series dan Line series.
8. THE Delivery_Trend_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, dan judul "Tren Pengiriman Harian".
9. THE Delivery_Trend_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

---

### Requirement 6: Komponen Vendor Performance Chart (VendorPerformanceChart.tsx)

**User Story:** As a warehouse manager, I want to see a horizontal bar chart comparing delivery counts per vendor, so that I can identify which vendors handle the most shipments.

#### Acceptance Criteria

1. THE Vendor_Chart SHALL merender Recharts `BarChart` dengan `layout="vertical"` di dalam `ResponsiveContainer` lebar penuh.
2. THE Vendor_Chart SHALL menggunakan data agregat per vendor dari prop `data: OutboundRecord[]` (count records per vendor) yang dihitung menggunakan `useMemo`.
3. THE Vendor_Chart SHALL mengurutkan vendor dari jumlah delivery terbanyak ke terkecil (descending).
4. THE Vendor_Chart SHALL memetakan Y-axis (category axis) ke nama `vendor` dan X-axis (value axis) ke jumlah records.
5. THE Vendor_Chart SHALL menyertakan custom tooltip yang menampilkan nama vendor dan jumlah delivery.
6. THE Vendor_Chart SHALL dirender di dalam white card dengan `border border-[#E5E7EB]`, `rounded-[18px]`, `shadow-sm`, dan judul "Performa Vendor".
7. THE Vendor_Chart SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

---

### Requirement 7: Komponen Filter Bar (FilterBar.tsx)

**User Story:** As a warehouse operations staff member, I want a comprehensive filter bar above the dashboard, so that I can narrow down outbound records by date, plant, vendor, status FO, and free-text search.

#### Acceptance Criteria

1. THE Filter_Bar SHALL merender kontrol Date Range (dua input date: startDate dan endDate) untuk memfilter berdasarkan field `tanggal`.
2. THE Filter_Bar SHALL merender dropdown multi-select "Plant" dengan opsi dinamis yang diambil dari data aktual (distinct values dari field `plant`).
3. THE Filter_Bar SHALL merender dropdown multi-select "Vendor" dengan opsi dinamis yang diambil dari data aktual (distinct values dari field `vendor`).
4. THE Filter_Bar SHALL merender dropdown multi-select "Status FO" dengan opsi tetap: `"OPEN"`, `"CLOSE"`, `"CANCEL"`, `"PARTIAL"`.
5. THE Filter_Bar SHALL merender input text "Search" dengan placeholder `"Cari vendor, no. polisi, driver..."` yang mencari pada field `vendor`, `noPolisi`, dan `driver` secara bersamaan.
6. WHEN pengguna mengetik di input Search, THE Filter_Bar SHALL menerapkan debounce 300 milidetik sebelum memperbarui filter state.
7. WHEN satu atau lebih filter aktif, THE Filter_Bar SHALL merender Active_Filter_Chip untuk setiap filter yang aktif di bawah baris kontrol filter.
8. WHEN pengguna mengklik tombol "×" pada satu Active_Filter_Chip, THE Filter_Bar SHALL menghapus hanya filter yang bersangkutan dan mempertahankan filter lainnya.
9. THE Filter_Bar SHALL merender tombol "Reset All" yang menghapus semua filter sekaligus dan hanya tampil ketika minimal satu filter aktif.
10. THE Filter_Bar SHALL memanggil callback `onChange` dengan partial `OutboundFilters` setiap kali salah satu filter berubah.
11. THE Filter_Bar SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.

---

### Requirement 8: Komponen Detail Table (OutboundTable.tsx)

**User Story:** As a warehouse operations staff member, I want a paginated detail table for all outbound records with edit and delete actions per row, so that I can manage delivery data efficiently.

#### Acceptance Criteria

1. THE Outbound_Table SHALL merender tabel dengan tepat 11 kolom: Tanggal | Plant | Vendor | No Polisi | Driver | Status FO | Total Box | Total Qty | Jam Loading | Jam Berangkat | Aksi.
2. THE Outbound_Table SHALL merender kolom "Status FO" dengan badge berwarna sesuai status: `"OPEN"` → emerald, `"CLOSE"` → biru, `"CANCEL"` → merah, `"PARTIAL"` → amber.
3. THE Outbound_Table SHALL merender tombol aksi Edit (ikon Pencil) dan Delete (ikon Trash2) di kolom "Aksi" untuk setiap baris.
4. WHEN tombol Edit diklik, THE Outbound_Table SHALL memanggil callback `onEdit` dengan `OutboundRecord` yang bersangkutan.
5. WHEN tombol Delete diklik, THE Outbound_Table SHALL memanggil callback `onDelete` dengan `OutboundRecord` yang bersangkutan.
6. THE Outbound_Table SHALL menerapkan hover row effect (`hover:bg-gray-50` atau setara) pada setiap baris tabel.
7. THE Outbound_Table SHALL merender kontrol pagination di bawah tabel dengan opsi page size: 10, 25, 50.
8. THE Outbound_Table SHALL menampilkan label range pada pagination dalam format `"{start}–{end} dari {total} data"`.
9. WHEN data yang difilter kosong (0 records), THE Outbound_Table SHALL menampilkan empty state dengan ikon `Inbox` dari lucide-react dan teks "Tidak ada data outbound ditemukan".
10. THE Outbound_Table SHALL memiliki `min-width` pada elemen tabel inner agar tabel dapat di-scroll secara horizontal pada layar kecil.
11. THE Outbound_Table SHALL di-wrap dengan `memo` dan menggunakan `"use client"` directive.
12. THE Outbound_Table SHALL menerima props: `data: OutboundRecord[]`, `onEdit: (record: OutboundRecord) => void`, `onDelete: (record: OutboundRecord) => void`.

---

### Requirement 9: Komponen Modal CRUD (OutboundModal.tsx)

**User Story:** As a warehouse operations staff member, I want a modal form to create and edit outbound records, so that I can add new delivery data or correct existing entries without leaving the dashboard.

#### Acceptance Criteria

1. THE Outbound_Modal SHALL merender form dengan tepat 10 field: Tanggal (date picker), Plant (select), Vendor (text input), No Polisi (text input), Driver (text input), Status FO (select), Total Box (number input), Total Qty (number input), Jam Loading (time input), Jam Berangkat (time input).
2. THE Outbound_Modal SHALL menampilkan judul "Tambah Data Outbound" saat `mode === "create"` dan judul "Edit Data Outbound" saat `mode === "edit"`.
3. WHEN `mode === "edit"`, THE Outbound_Modal SHALL pre-populate semua field dengan nilai dari `record` yang diedit.
4. THE Outbound_Modal SHALL menampilkan error validasi inline di bawah setiap field yang tidak valid.
5. THE Outbound_Modal SHALL memvalidasi semua field sebagai wajib (tidak boleh kosong atau hanya whitespace).
6. THE Outbound_Modal SHALL memvalidasi `totalBox` ≥ 0 dan `totalQty` ≥ 0; nilai negatif SHALL ditolak.
7. THE Outbound_Modal SHALL memvalidasi field `Plant` hanya menerima salah satu dari: `"PASM"`, `"IMSM"`, `"U2"`, `"LION"`, `"TASE"`.
8. THE Outbound_Modal SHALL memvalidasi field `StatusFO` hanya menerima salah satu dari: `"OPEN"`, `"CLOSE"`, `"CANCEL"`, `"PARTIAL"`.
9. WHEN pengguna menekan tombol Save saat form valid, THE Outbound_Modal SHALL memanggil `onSave` dengan `OutboundFormValues` dan menampilkan state loading pada tombol Save.
10. WHEN `saving` prop bernilai `true`, THE Outbound_Modal SHALL menonaktifkan (disable) tombol Save dan tombol Close untuk mencegah aksi ganda.
11. WHEN pengguna menekan tombol Close atau tombol Batal, THE Outbound_Modal SHALL memanggil `onClose` (kecuali saat `saving === true`).
12. WHEN pengguna menekan tombol Escape, THE Outbound_Modal SHALL memanggil `onClose` (kecuali saat `saving === true`).
13. WHEN pengguna mengklik backdrop (area di luar modal), THE Outbound_Modal SHALL memanggil `onClose` (kecuali saat `saving === true`).
14. THE Outbound_Modal SHALL menerapkan focus trap sehingga navigasi Tab/Shift+Tab tidak keluar dari batas elemen modal.
15. THE Outbound_Modal SHALL menggunakan Framer Motion `AnimatePresence` dengan animasi masuk/keluar (scale + opacity).
16. THE Outbound_Modal SHALL menggunakan `"use client"` directive.

---

### Requirement 10: Delete Confirmation Dialog

**User Story:** As a warehouse operations staff member, I want a confirmation dialog before deleting an outbound record, so that I can prevent accidental data deletion.

#### Acceptance Criteria

1. THE Delete_Dialog SHALL merender elemen dengan `role="alertdialog"` dan `aria-modal="true"`.
2. THE Delete_Dialog SHALL menampilkan nama vendor dan tanggal dari record yang akan dihapus sebagai konteks konfirmasi.
3. THE Delete_Dialog SHALL merender tombol "Hapus" dan tombol "Batal".
4. WHEN `deleting` prop bernilai `true`, THE Delete_Dialog SHALL menonaktifkan (disable) tombol "Hapus" dan mengubah teksnya menjadi "Menghapus...".
5. WHEN `deleting` prop bernilai `true`, THE Delete_Dialog SHALL menonaktifkan (disable) tombol "Batal".
6. WHEN pengguna mengklik backdrop (area di luar dialog), THE Delete_Dialog SHALL memanggil `onClose` (kecuali saat `deleting === true`).
7. THE Delete_Dialog SHALL menggunakan Framer Motion `AnimatePresence` dengan animasi masuk/keluar (scale + opacity).
8. THE Delete_Dialog SHALL menggunakan `"use client"` directive.

---

### Requirement 11: Toast Notifications

**User Story:** As a warehouse operations staff member, I want auto-dismissing toast notifications after each CRUD action, so that I receive clear feedback on whether my action succeeded or failed.

#### Acceptance Criteria

1. WHEN operasi Create berhasil, THE Outbound_Page SHALL menampilkan Toast dengan `variant="success"` dan pesan "Data outbound berhasil ditambahkan."
2. WHEN operasi Edit berhasil, THE Outbound_Page SHALL menampilkan Toast dengan `variant="success"` dan pesan "Data outbound berhasil diperbarui."
3. WHEN operasi Delete berhasil, THE Outbound_Page SHALL menampilkan Toast dengan `variant="success"` dan pesan "Data outbound berhasil dihapus."
4. THE Toast sukses SHALL menampilkan border kiri berwarna emerald (`#10B981`) dan ikon `CheckCircle2`.
5. THE Toast error SHALL menampilkan border kiri berwarna merah dan ikon `AlertCircle`.
6. WHEN Toast ditampilkan, THE Toast SHALL di-dismiss otomatis setelah tepat 4000 milidetik.
7. THE Outbound_Page SHALL mendukung beberapa Toast aktif secara bersamaan yang ditampilkan dalam stack.
8. WHEN pengguna mengklik tombol "×" pada satu Toast, THE Toast tersebut SHALL segera di-dismiss tanpa menunggu auto-dismiss.
9. THE Toast stack SHALL dirender di posisi fixed `bottom-4 right-4` pada layar besar, dan center-aligned pada layar kecil.
10. THE Toast SHALL menggunakan Framer Motion `AnimatePresence` untuk animasi masuk dan keluar.

---

### Requirement 12: Dashboard Synchronization (Reaktivitas CRUD)

**User Story:** As a warehouse operations staff member, I want all dashboard sections to update automatically after any CRUD action, so that I always see the latest data without needing a page refresh.

#### Acceptance Criteria

1. WHEN operasi Create berhasil, THE Outbound_Page SHALL menambahkan record baru ke state data utama sehingga seluruh komponen (KPI_Cards, StatusFO_Chart, Delivery_Trend_Chart, Vendor_Chart, Outbound_Table) terupdate secara otomatis.
2. WHEN operasi Edit berhasil, THE Outbound_Page SHALL mengganti record lama dengan record yang sudah diperbarui di state data utama sehingga seluruh komponen terupdate.
3. WHEN operasi Delete berhasil, THE Outbound_Page SHALL menghapus record dari state data utama sehingga seluruh komponen terupdate.
4. THE KPI_Cards, StatusFO_Chart, Delivery_Trend_Chart, Vendor_Chart, dan Outbound_Table SHALL semua menerima data yang sama dari single state source di Outbound_Page.
5. THE agregasi data untuk KPI, chart, dan tabel SHALL dihitung menggunakan `useMemo` berdasarkan state data dan filter yang aktif, sehingga perubahan state otomatis memicu re-kalkulasi.
6. THE Outbound_Page SHALL TIDAK melakukan page refresh (full reload) setelah operasi CRUD manapun.

---

### Requirement 13: Halaman Utama Dashboard (/admin/outbound/page.tsx)

**User Story:** As a warehouse manager, I want a complete, well-structured outbound dashboard page at `/admin/outbound`, so that I have a single place to monitor all outbound delivery metrics and manage data.

#### Acceptance Criteria

1. THE Outbound_Page SHALL berlokasi di `src/app/admin/outbound/page.tsx` dan menggunakan `"use client"` directive.
2. THE Outbound_Page SHALL merender page header yang berisi judul "Outbound Monitoring", subtitle, badge jumlah records (`{filtered} dari {total} record`), dan tombol "Tambah Data Outbound" dengan ikon `Plus` berwarna emerald.
3. THE Outbound_Page SHALL merender `Filter_Bar` sebagai section pertama di bawah header.
4. THE Outbound_Page SHALL merender `KPI_Cards` sebagai section kedua (full-width row).
5. THE Outbound_Page SHALL merender `StatusFO_Chart` dan `Vendor_Chart` berdampingan (side-by-side, masing-masing 1/2 width) sebagai section ketiga.
6. THE Outbound_Page SHALL merender `Delivery_Trend_Chart` sebagai section keempat (full-width row).
7. THE Outbound_Page SHALL merender `Outbound_Table` sebagai section kelima (full-width row).
8. THE Outbound_Page SHALL menganimasikan setiap section secara berurutan menggunakan `fadeUp` Framer Motion variants dengan staggered `custom` delay indexes (0 hingga 5).
9. THE Outbound_Page SHALL mengelola state data utama (`data: OutboundRecord[]`) yang diinisialisasi dari `initialOutboundData` di `mock.ts`.
10. THE Outbound_Page SHALL mengelola state filter (`filters: OutboundFilters`) dan menggunakannya untuk menghasilkan `filteredData` via `useMemo`.
11. THE Outbound_Page SHALL mengelola state modal (`modalState: ModalState`) untuk mengontrol visibilitas dan mode `Outbound_Modal`.
12. THE Outbound_Page SHALL mengelola state delete target (`deleteTarget: OutboundRecord | null`) untuk mengontrol visibilitas `Delete_Dialog`.
13. THE Outbound_Page SHALL menggunakan `useCallback` untuk semua event handler: `handleSave`, `handleEdit`, `handleDeleteClick`, `handleConfirmDelete`, `updateFilters`, `resetFilters`, `addToast`, `dismissToast`.
14. WHEN tombol "Tambah Data Outbound" diklik, THE Outbound_Page SHALL membuka `Outbound_Modal` dalam mode `"create"`.
15. THE Outbound_Page SHALL merender `Outbound_Modal`, `Delete_Dialog`, dan `Toast` stack di bagian akhir JSX.

---

### Requirement 14: Refactoring File Lama

**User Story:** As a developer, I want the old outbound files to be replaced or removed cleanly, so that there are no orphaned types, hooks, or mock data that could cause confusion or import conflicts.

#### Acceptance Criteria

1. THE file `src/types/outbound.ts` SHALL diganti total dengan tipe-tipe baru sesuai `OutboundRecord` yang didefinisikan di `src/app/admin/outbound/types.ts` (file lama dapat dihapus atau diubah isinya sepenuhnya).
2. THE file `src/mock/outbound.ts` SHALL diganti total dengan data baru sesuai `initialOutboundData` yang didefinisikan di `src/app/admin/outbound/mock.ts` (file lama dapat dihapus atau diubah isinya sepenuhnya).
3. THE file `src/hooks/useOutboundData.ts` SHALL dihapus karena tidak digunakan oleh implementasi baru.
4. THE komponen di `src/components/outbound/` SHALL dibiarkan apa adanya (tidak dihapus dan tidak dimodifikasi), tetapi tidak diimport oleh `src/app/admin/outbound/page.tsx` yang baru.
5. THE `src/app/admin/outbound/page.tsx` SHALL diganti total dengan implementasi baru; tidak ada referensi ke komponen lama dari `src/components/outbound/`.

---

### Requirement 15: Konsistensi Pola Kode (Code Pattern Compliance)

**User Story:** As a developer maintaining this codebase, I want the outbound-crud feature to follow all established conventions exactly, so that the codebase remains uniform and easy to maintain.

#### Acceptance Criteria

1. THE Outbound_Page SHALL menempatkan semua file fitur secara colocated di `src/app/admin/outbound/` (types, mock, page, dan semua komponen dalam satu folder).
2. THE Outbound_Page SHALL memastikan setiap file komponen mengandung `"use client"` directive sebagai baris pertama.
3. THE Outbound_Page SHALL membungkus setiap komponen dengan React `memo` untuk mencegah re-render yang tidak perlu.
4. THE Outbound_Page SHALL menggunakan `useMemo` untuk semua kalkulasi agregasi data (KPI, chart data, filtered data).
5. THE Outbound_Page SHALL menggunakan `useCallback` untuk semua event handler functions.
6. THE Outbound_Page SHALL menggunakan Recharts `ResponsiveContainer` sebagai wrapper terluar setiap komponen chart.
7. THE Outbound_Page SHALL menggunakan `framer-motion` untuk semua animasi entrance section menggunakan pola `fadeUp` variant (`opacity: 0, y: 14` → `opacity: 1, y: 0`).
8. THE Outbound_Page SHALL menggunakan design system Wings Group secara konsisten di semua komponen: primary `#10B981` (emerald) untuk aksi utama, cards white `#FFFFFF`, border `#E5E7EB`, `rounded-[18px]`.
9. THE Outbound_Page SHALL TIDAK menggunakan TypeScript `any` type di manapun dalam file-file fitur.
10. THE Outbound_Page SHALL menggunakan TypeScript strict mode; semua props dan state harus memiliki tipe eksplisit.
