# Requirements Document

## Introduction

Fitur **Nominal Gantungan Faktur** adalah halaman dashboard monitoring di `/admin/gantungan-faktur` untuk memantau invoice vendor yang masih berstatus "gantungan" (belum diselesaikan) dalam operasional logistik/warehouse. Dashboard ini menampilkan KPI ringkasan, grafik tren harian, analisis per vendor, distribusi status, dan tabel detail rekap faktur beserta drawer detail interaktif.

Fitur ini dibangun di atas Next.js 15 App Router dengan pola yang sepenuhnya mengikuti fitur `claim-vendor` yang sudah ada di codebase: struktur folder, konvensi TypeScript, animasi Framer Motion, grafik Recharts, dan tema visual yang sama.

---

## Glossary

- **Dashboard**: Halaman web interaktif yang menampilkan ringkasan data monitoring secara visual.
- **Faktur**: Dokumen invoice dari vendor/pemasok logistik.
- **Gantungan_Faktur**: Invoice vendor yang masih berstatus outstanding atau belum diselesaikan.
- **Vendor**: Perusahaan pemasok atau mitra logistik yang menerbitkan faktur.
- **Nomer_DO**: Nomor Delivery Order — dokumen yang menyertai pengiriman barang.
- **Nomer_Polisi**: Nomor plat kendaraan/truk yang mengangkut barang.
- **Plant**: Lokasi gudang atau pusat distribusi tempat faktur diproses.
- **Nominal**: Nilai moneter dalam rupiah (IDR) dari sebuah faktur.
- **KPI**: Key Performance Indicator — metrik ringkasan bisnis.
- **FakturStatus**: Salah satu dari tiga nilai: `"Outstanding"`, `"Pending"`, atau `"Completed"`.
- **FakturRecord**: Satu entitas data faktur yang lengkap dengan semua atributnya.
- **FakturKPI**: Struktur data agregat yang merangkum total dokumen, nominal, rata-rata, dan jumlah outstanding.
- **Dashboard_Page**: Halaman `/admin/gantungan-faktur` yang memuat semua komponen.
- **Summary_Cards**: Komponen yang menampilkan 4 kartu KPI di bagian atas halaman.
- **Nominal_Chart**: Komponen grafik batang yang menampilkan nominal faktur harian.
- **Document_Chart**: Komponen grafik garis yang menampilkan jumlah dokumen harian.
- **Vendor_Chart**: Komponen grafik batang horizontal yang menampilkan nominal per vendor.
- **Distribution_Chart**: Komponen grafik donut yang menampilkan distribusi nominal berdasarkan status.
- **Faktur_Table**: Komponen tabel data grid enterprise untuk daftar rekap faktur.
- **Detail_Drawer**: Panel slide-in dari kanan yang menampilkan detail lengkap satu faktur.
- **Status_Badge**: Komponen visual kecil yang merepresentasikan FakturStatus dengan warna.
- **Table_Toolbar**: Komponen toolbar di atas tabel yang berisi pencarian, export, dan refresh.
- **Pagination**: Komponen navigasi halaman data di bawah tabel.
- **Export_Button**: Tombol untuk mengekspor data ke Excel.
- **Refresh_Button**: Tombol untuk memperbarui tampilan data.
- **Hook**: Custom React hook yang mengelola state dan logika data.
- **useGantunganFaktur**: Custom hook untuk fitur gantungan-faktur.
- **fmtNumber**: Fungsi utilitas untuk memformat angka dengan locale Indonesia (titik sebagai pemisah ribuan).
- **fadeUp**: Varian animasi Framer Motion — elemen muncul dari bawah ke atas dengan fade-in.
- **ChartSkeleton**: Placeholder loading animasi untuk grafik yang di-lazy-load.
- **ResponsiveContainer**: Komponen Recharts pembungkus grafik agar responsif terhadap ukuran kontainer.

---

## Requirements

### Requirement 1: Definisi Tipe Data (Type Definitions)

**User Story:** As a developer, I want strict TypeScript type definitions for all gantungan-faktur data structures, so that the entire feature has end-to-end type safety.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL use type definitions from `src/types/gantunganFaktur.ts` as the single source of truth for all data shapes.
2. THE `src/types/gantunganFaktur.ts` SHALL export the type `FakturStatus` with exactly three string literal values: `"Outstanding"`, `"Pending"`, and `"Completed"`.
3. THE `src/types/gantunganFaktur.ts` SHALL export the interface `FakturRecord` with all required fields: `id`, `tanggal`, `vendor`, `nomorInvoice`, `nomorFaktur`, `nomorDO`, `nomorPolisi`, `plant`, `nominalFaktur`, `status`, `tanggalMasuk`, `tanggalProses`, dan `tanggalSelesai`.
4. THE `src/types/gantunganFaktur.ts` SHALL type `tanggalProses` dan `tanggalSelesai` as `string | null` to represent optional timeline completion.
5. THE `src/types/gantunganFaktur.ts` SHALL export `FakturKPI`, `NominalHarianItem`, `DokumenHarianItem`, `NominalVendorItem`, `DistribusiNominalItem`, `FakturSortKey`, dan `FakturSort` without using the `any` type anywhere.

---

### Requirement 2: Mock Data

**User Story:** As a developer, I want realistic and complete mock data for the gantungan-faktur feature, so that the UI is immediately functional and visually representative during development.

#### Acceptance Criteria

1. THE `src/mock/gantunganFaktur.ts` SHALL export a `KPI` object of type `FakturKPI` with `totalDokumen` = 156, `totalNominalFaktur` = 8_742_500_000, `rataRataNominal` = 56_041_667, dan `outstandingFaktur` = 48.
2. THE `src/mock/gantunganFaktur.ts` SHALL export `nominalHarianData` containing exactly 7 entries of type `NominalHarianItem`, each with a `tanggal` string and a `nominal` value greater than zero.
3. THE `src/mock/gantunganFaktur.ts` SHALL export `dokumenHarianData` containing exactly 7 entries of type `DokumenHarianItem`, each with a `jumlah` value between 15 and 30 inclusive.
4. THE `src/mock/gantunganFaktur.ts` SHALL export `nominalVendorData` containing exactly 6 entries of type `NominalVendorItem`, each with a distinct `vendor` name and a positive `nominal` value.
5. THE `src/mock/gantunganFaktur.ts` SHALL export `distribusiNominalData` containing exactly 3 entries of type `DistribusiNominalItem` with names `"Outstanding"`, `"Pending"`, dan `"Completed"`, and colors `#DC2626`, `#F59E0B`, dan `#16A34A` respectively.
6. THE `src/mock/gantunganFaktur.ts` SHALL export `fakturRecords` as an array of at least 12 `FakturRecord` entries with all required fields populated, containing a realistic mix of all three `FakturStatus` values.
7. THE `src/mock/gantunganFaktur.ts` SHALL export `VENDOR_OPTIONS`, `STATUS_OPTIONS`, dan `PLANT_OPTIONS` as string arrays for use as filter dropdown options.

---

### Requirement 3: Hook useGantunganFaktur

**User Story:** As a developer, I want a custom React hook that manages all data state for the gantungan-faktur table, so that the page component stays declarative and the data logic is testable in isolation.

#### Acceptance Criteria

1. THE `src/hooks/useGantunganFaktur.ts` SHALL follow the exact same pattern as `useClaimVendor.ts`, including separate `applySort` and `applySearch` pure functions.
2. THE useGantunganFaktur SHALL manage state for `sort` (type `FakturSort | null`), `search` (string), `page` (number), dan `pageSize` (number).
3. WHEN a search query is applied, THE useGantunganFaktur SHALL return a `processed` array where the length is less than or equal to the total number of records in `fakturRecords`.
4. WHEN the search query is empty, THE useGantunganFaktur SHALL return all records from `fakturRecords` in the processed array.
5. WHEN `handleSort` is called with the same key twice, THE useGantunganFaktur SHALL toggle the sort direction from `"asc"` to `"desc"`.
6. THE useGantunganFaktur SHALL return `paginated` as a slice of `processed` where `paginated.length` is less than or equal to `pageSize`.
7. THE useGantunganFaktur SHALL reset `page` to 1 whenever `handleSort` or `handleSearchChange` is called.
8. THE useGantunganFaktur SHALL return `totalPages` as the mathematical ceiling of `processed.length / pageSize`, with a minimum value of 1.

---

### Requirement 4: Komponen SummaryCards

**User Story:** As a logistics manager, I want to see 4 KPI summary cards at the top of the dashboard, so that I can quickly assess the overall status of outstanding invoices at a glance.

#### Acceptance Criteria

1. THE Summary_Cards SHALL render exactly 4 cards in a 4-column grid on large screens and a 2-column grid on small screens.
2. THE Summary_Cards SHALL display "Total Dokumen" with a FileText icon, blue color accent, and the `totalDokumen` value from `KPI`.
3. THE Summary_Cards SHALL display "Total Nominal Faktur" with a Wallet icon, green color accent, and the `totalNominalFaktur` value formatted as `"Rp {fmtNumber(value)}"`.
4. THE Summary_Cards SHALL display "Rata-rata Nominal per Dokumen" with a Calculator icon, orange color accent, and the `rataRataNominal` value formatted as `"Rp {fmtNumber(value)}"`.
5. THE Summary_Cards SHALL display "Outstanding Faktur" with a Clock icon, red color accent (`#DC2626`), and the `outstandingFaktur` value.
6. WHEN the page loads, THE Summary_Cards SHALL animate each card's numeric value from 0 to its target value using a count-up animation with cubic-ease-out easing over 1000 milliseconds.
7. WHEN a user hovers over a card, THE Summary_Cards SHALL lift the card by 2 pixels (translateY: -2px) with an increased box shadow.
8. THE Summary_Cards SHALL apply a left-side colored border accent (`border-l-4`) matching the card's color theme.
9. THE Summary_Cards SHALL use `"use client"` directive and `memo` wrapper on all card components.

---

### Requirement 5: Komponen NominalChart

**User Story:** As a logistics manager, I want to see a daily bar chart of invoice nominal values for the past 7 days, so that I can identify trends in outstanding invoice amounts.

#### Acceptance Criteria

1. THE Nominal_Chart SHALL render a Recharts `BarChart` wrapped in a `ResponsiveContainer` with full width.
2. THE Nominal_Chart SHALL use `nominalHarianData` as its data source with the X-axis mapped to `tanggal` and the Y-axis mapped to `nominal`.
3. THE Nominal_Chart SHALL format Y-axis tick labels in billions notation (e.g., "Rp 1.2M" for 1.2 billion IDR).
4. THE Nominal_Chart SHALL include a custom tooltip that displays the `tanggal` and the `nominal` value formatted as `"Rp {fmtNumber(value)}"`.
5. THE Nominal_Chart SHALL render inside a white card with `border`, `rounded-[18px]`, `shadow-sm`, and a title "Nominal Faktur Harian" with a subtitle.
6. THE Nominal_Chart SHALL use `isAnimationActive` on the Bar component to enable Recharts built-in animation on mount.
7. THE Nominal_Chart SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 6: Komponen DocumentChart

**User Story:** As a logistics manager, I want to see a daily line chart of invoice document counts for the past 7 days, so that I can track document volume trends.

#### Acceptance Criteria

1. THE Document_Chart SHALL render a Recharts `LineChart` wrapped in a `ResponsiveContainer` with full width.
2. THE Document_Chart SHALL use `dokumenHarianData` as its data source with X-axis mapped to `tanggal` and Y-axis mapped to `jumlah`.
3. THE Document_Chart SHALL render the line with dot markers visible on each data point.
4. THE Document_Chart SHALL include a tooltip displaying `tanggal` and `jumlah` with the label "Dokumen".
5. THE Document_Chart SHALL render inside the same white card wrapper pattern as Nominal_Chart, with the title "Jumlah Dokumen Harian".
6. THE Document_Chart SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 7: Komponen VendorChart

**User Story:** As a logistics manager, I want to see a horizontal bar chart comparing invoice nominal values across vendors, so that I can identify which vendors have the highest outstanding amounts.

#### Acceptance Criteria

1. THE Vendor_Chart SHALL render a Recharts `BarChart` with `layout="vertical"` wrapped in a `ResponsiveContainer` with full width.
2. THE Vendor_Chart SHALL use `nominalVendorData` as its data source with Y-axis (category axis) mapped to `vendor` names and X-axis (value axis) mapped to `nominal` values.
3. THE Vendor_Chart SHALL include a tooltip that formats the `nominal` value as `"Rp {fmtNumber(value)}"`.
4. THE Vendor_Chart SHALL render inside a white card wrapper with the title "Nominal per Vendor".
5. THE Vendor_Chart SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 8: Komponen DistributionChart

**User Story:** As a logistics manager, I want to see a donut chart showing the nominal distribution by invoice status, so that I can quickly see the proportion of outstanding, pending, and completed invoices.

#### Acceptance Criteria

1. THE Distribution_Chart SHALL render a Recharts `PieChart` configured as a donut (with `innerRadius` and `outerRadius` set) wrapped in a `ResponsiveContainer`.
2. THE Distribution_Chart SHALL use `distribusiNominalData` as its data source and apply each entry's `color` field as the fill color of the corresponding pie slice.
3. THE Distribution_Chart SHALL include a legend below the chart showing each status name and its percentage of the total.
4. THE Distribution_Chart SHALL render inside a white card wrapper with the title "Distribusi Nominal Faktur".
5. THE Distribution_Chart SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 9: Komponen FakturTable

**User Story:** As a logistics operations staff member, I want an enterprise-grade data table for all faktur records with sorting, searching, and pagination, so that I can efficiently find and review specific invoices.

#### Acceptance Criteria

1. THE Faktur_Table SHALL render a table with exactly 10 columns: Tanggal, Vendor, Nomor Invoice, Nomor Faktur, Nomor DO, Nomor Polisi, Plant, Nominal Faktur, Status, dan Aksi.
2. THE Faktur_Table SHALL render a sticky table header with background color `#DC2626` and white text.
3. THE Faktur_Table SHALL render each column header as a clickable sort trigger that calls `onSort` with the corresponding `FakturSortKey`.
4. THE Faktur_Table SHALL display sort direction icons (ChevronUp/ChevronDown/ChevronsUpDown from lucide-react) in each sortable column header.
5. THE Faktur_Table SHALL format the "Nominal Faktur" column values as `"Rp {fmtNumber(nominalFaktur)}"` and right-align the column.
6. THE Faktur_Table SHALL render a `Status_Badge` component in the "Status" column for each record.
7. WHEN a row's "Detail" action button is clicked, THE Faktur_Table SHALL call `onRowView` with the corresponding `FakturRecord`.
8. THE Faktur_Table SHALL apply `hover:bg-red-50/50` transition on each table row.
9. THE Faktur_Table SHALL set `min-width: 1100px` on the inner table element to enable horizontal scrolling on small screens.
10. WHEN the filtered result set is empty, THE Faktur_Table SHALL display the message "Tidak ada data ditemukan" spanning all columns.
11. THE Faktur_Table SHALL render the `Table_Toolbar` component above the table and the `Pagination` component below the table.
12. THE Faktur_Table SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 10: Komponen TableToolbar (Gantungan Faktur)

**User Story:** As a logistics operations staff member, I want a toolbar above the table with search, export, and refresh controls, so that I can filter the data and interact with the table efficiently.

#### Acceptance Criteria

1. THE Table_Toolbar SHALL display the title "Detail Nominal Gantungan Faktur" and a badge showing the total record count.
2. THE Table_Toolbar SHALL render a text input with the placeholder "Cari vendor, invoice, faktur..." that calls `onSearchChange` on every keystroke.
3. THE Table_Toolbar SHALL render an Export button (green, with Download icon) that calls `onExport` when clicked.
4. THE Table_Toolbar SHALL render a Refresh button with a rotating RefreshCw icon animation from Framer Motion while the refresh is in progress.
5. WHEN the refresh is in progress, THE Table_Toolbar SHALL disable the Refresh button until the operation completes.
6. THE Table_Toolbar SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 11: Komponen Pagination (Gantungan Faktur)

**User Story:** As a logistics operations staff member, I want pagination controls below the table, so that I can navigate between pages of invoice data and control how many records are shown per page.

#### Acceptance Criteria

1. THE Pagination SHALL display the range label in the format "{start}–{end} dari {totalRecords} data".
2. THE Pagination SHALL render a page-size selector dropdown with options 5, 10, 20, dan 50, that calls `onPageSizeChange` when changed.
3. THE Pagination SHALL render Previous and Next buttons (ChevronLeft/ChevronRight icons) that are disabled when the user is on the first or last page respectively.
4. THE Pagination SHALL render page number buttons using an ellipsis (`…`) for pages that are out of the visible window, following the same `pageRange` logic as the claim-vendor Pagination component.
5. THE Pagination SHALL highlight the current page button with background color `#DC2626` and white text.
6. THE Pagination SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 12: Komponen StatusBadge (Gantungan Faktur)

**User Story:** As a user, I want a visually distinct status badge for each invoice status, so that I can instantly identify whether an invoice is Outstanding, Pending, or Completed.

#### Acceptance Criteria

1. THE Status_Badge SHALL render with `bg-red-50 text-red-700 border-red-200` styles when the status is `"Outstanding"`.
2. THE Status_Badge SHALL render with `bg-amber-50 text-amber-700 border-amber-200` styles when the status is `"Pending"`.
3. THE Status_Badge SHALL render with `bg-emerald-50 text-emerald-700 border-emerald-200` styles when the status is `"Completed"`.
4. THE Status_Badge SHALL render a colored dot indicator matching the status color as the first child element when `dot` prop is `true` (default).
5. THE Status_Badge SHALL use `"use client"` directive and `memo` wrapper.

---

### Requirement 13: Komponen DetailDrawer

**User Story:** As a logistics operations staff member, I want to open a slide-in detail panel for any invoice record, so that I can review the complete invoice information and processing timeline without leaving the dashboard.

#### Acceptance Criteria

1. WHEN `record` prop is non-null, THE Detail_Drawer SHALL animate in from the right side of the screen using Framer Motion with `x: 440 → 0` transition.
2. WHEN `record` prop becomes null, THE Detail_Drawer SHALL animate out to the right (`x: 0 → 440`) and be removed from the DOM via `AnimatePresence`.
3. THE Detail_Drawer SHALL render a semi-transparent backdrop overlay behind the panel that calls `onClose` when clicked.
4. WHEN the user presses the Escape key, THE Detail_Drawer SHALL call `onClose` to dismiss the panel.
5. THE Detail_Drawer SHALL render a header section containing the title "Detail Gantungan Faktur", the record's `id`, a `Status_Badge`, and a close button.
6. THE Detail_Drawer SHALL render a color-coded status banner in the body: red for `"Outstanding"`, amber for `"Pending"`, and green for `"Completed"`.
7. THE Detail_Drawer SHALL render an "Informasi Faktur" section displaying: Vendor, Nomor Invoice, Nomor Faktur, Nomor DO, Nomor Polisi, Plant, Nominal Faktur (formatted as `"Rp {fmtNumber(nominalFaktur)}"`), dan Tanggal.
8. THE Detail_Drawer SHALL render a "Timeline" section with three steps: "Tanggal Masuk" (from `tanggalMasuk`), "Diproses" (from `tanggalProses`), dan "Selesai" (from `tanggalSelesai`).
9. WHEN a timeline step's timestamp is null, THE Detail_Drawer SHALL display `"—"` for that step's time and render the step as incomplete (unfilled circle, gray connector).
10. THE Detail_Drawer SHALL render a footer with a "Download PDF" button, a "Print" button, dan a "Tutup" button that calls `onClose`.
11. THE Detail_Drawer SHALL be 440 pixels wide and occupy the full screen height with an internal scrollable body section.
12. THE Detail_Drawer SHALL use `"use client"` directive.

---

### Requirement 14: Komponen ExportButton dan RefreshButton

**User Story:** As a logistics operations staff member, I want dedicated Export and Refresh buttons in the page header area, so that I can export data to Excel or refresh the dashboard data from any section of the page.

#### Acceptance Criteria

1. THE Export_Button SHALL render as a green button (`bg-emerald-600`) with a Download icon and an `onClick` prop handler.
2. THE Export_Button SHALL accept an optional `label` prop defaulting to `"Export Excel"`.
3. THE Refresh_Button SHALL render with a Framer Motion rotating animation on the RefreshCw icon while the refresh operation is in progress.
4. WHEN the refresh is in progress, THE Refresh_Button SHALL be disabled to prevent duplicate requests.
5. THE Export_Button and THE Refresh_Button SHALL each use `"use client"` directive and `memo` wrapper.

---

### Requirement 15: Halaman Dashboard /admin/gantungan-faktur

**User Story:** As a logistics manager, I want a complete, well-structured dashboard page at `/admin/gantungan-faktur`, so that I have a single place to monitor all outstanding vendor invoice metrics.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL be located at `src/app/admin/gantungan-faktur/page.tsx` and use the `"use client"` directive.
2. THE Dashboard_Page SHALL render a page header containing the title "Nominal Gantungan Faktur", subtitle "Monitoring Nominal Gantungan Faktur Vendor", a last-update timestamp label, a `Refresh_Button`, dan an `Export_Button` aligned to the right.
3. THE Dashboard_Page SHALL render `Summary_Cards` in a full-width row as the first content section.
4. THE Dashboard_Page SHALL render `Nominal_Chart` (spanning 2/3 width) and `Document_Chart` (spanning 1/3 width) in a side-by-side row as the second content section.
5. THE Dashboard_Page SHALL render `Vendor_Chart` (spanning 1/2 width) and `Distribution_Chart` (spanning 1/2 width) in a side-by-side row as the third content section.
6. THE Dashboard_Page SHALL render `Faktur_Table` as a full-width row as the fourth content section.
7. THE Dashboard_Page SHALL render the `Detail_Drawer` overlay controlled by a `selectedRecord` state variable of type `FakturRecord | null`.
8. THE Dashboard_Page SHALL lazy-load all chart components (`Nominal_Chart`, `Document_Chart`, `Vendor_Chart`, `Distribution_Chart`) using Next.js `dynamic` import with `ssr: false` and a `ChartSkeleton` fallback.
9. THE Dashboard_Page SHALL lazy-load `Detail_Drawer` using Next.js `dynamic` import with `ssr: false`.
10. THE Dashboard_Page SHALL animate each layout section sequentially using `fadeUp` Framer Motion variants with staggered `custom` delay indexes (0 through 5).
11. WHEN the Export button is clicked, THE Dashboard_Page SHALL log the total record count to the browser console.
12. WHEN the Refresh button is clicked, THE Dashboard_Page SHALL simulate a 700-millisecond async delay before resolving.
13. THE Dashboard_Page SHALL use the `useGantunganFaktur` hook to provide all table state and handlers to the `Faktur_Table` component.

---

### Requirement 16: Konsistensi Pola Kode (Code Pattern Compliance)

**User Story:** As a developer maintaining this codebase, I want the gantungan-faktur feature to follow all established conventions exactly, so that the codebase remains uniform and easy to maintain.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL place all TypeScript types in `src/types/gantunganFaktur.ts`, mock data in `src/mock/gantunganFaktur.ts`, hooks in `src/hooks/useGantunganFaktur.ts`, and components in `src/components/gantungan-faktur/`.
2. THE Dashboard_Page SHALL have every component file include the `"use client"` directive as its first line.
3. THE Dashboard_Page SHALL wrap every component in React's `memo` to prevent unnecessary re-renders.
4. WHEN displaying any IDR monetary value, THE Dashboard_Page SHALL format it using `fmtNumber` from `@/utils/formatNumber` in the pattern `"Rp {fmtNumber(value)}"`.
5. THE Dashboard_Page SHALL use `framer-motion` for all section entrance animations using the `fadeUp` variant pattern (`opacity: 0, y: 14` → `opacity: 1, y: 0`).
6. THE Dashboard_Page SHALL use Recharts `ResponsiveContainer` as the outermost wrapper for every chart component.
7. THE Dashboard_Page SHALL not use the TypeScript `any` type anywhere in the feature's source files.
8. THE Dashboard_Page SHALL apply the theme colors: primary `#DC2626`, background `#F5F7FB`, cards white (`#FFFFFF`), and card `border-radius` `18px` (`rounded-[18px]`) consistently across all components.
