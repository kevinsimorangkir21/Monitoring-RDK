# Implementation Plan: Gantungan Faktur — Refactor + Manual CRUD

## Overview

Refactor modul `/admin/gantungan-faktur` agar sepenuhnya selaras dengan struktur sheet **Gantungan Faktur** pada file Excel. Implementasi yang sudah ada di `src/app/admin/gantungan-faktur/` dipertahankan dan disempurnakan — tidak ada perubahan routing, autentikasi, layout dashboard, maupun design system Wings Group.

Pekerjaan dibagi dalam 5 lapisan:
1. **Types & Mock** — pastikan tipe data dan mock sesuai spec Excel
2. **KPI Cards** — FakturCards dengan 4 metrik yang benar
3. **Chart** — DailyFakturChart ComposedChart (Bar + Line, dual Y-axis)
4. **Table + FilterBar** — semua kolom Excel + CRUD actions
5. **CRUD Modal + Delete Dialog** — validasi lengkap, sync dashboard
6. **Build verification** — `npm run build` zero error

---

## Tasks

- [x] 1. Audit & fix `types.ts` and `mock.ts`
  - [x] 1.1 Verify `types.ts` exports all required interfaces matching Excel structure
    - Pastikan `FakturRecord` memiliki persis 9 field: `id`, `tanggal`, `date`, `payTerms`, `customer`, `namaToko`, `sdDocument`, `salesDoc`, `netValue`, `keteranganTransport`
    - Pastikan `FakturFormValues` memiliki field yang sama (semua `string`, `netValue` sebagai raw string currency)
    - Pastikan `FakturFormErrors` adalah `Partial<Record<keyof FakturFormValues, string>>`
    - Pastikan `CrudMode`, `ModalState`, `FakturFilters`, `FakturKPIs`, `DailyTrendPoint`, `ToastVariant`, `ToastMessage` semua sudah terekspor
    - Tidak ada penggunaan tipe `any`
    - _Acceptance: data mengikuti struktur sheet Gantungan Faktur_

  - [x] 1.2 Populate `mock.ts` with realistic seed data
    - Ekspor `initialFakturData` sebagai array minimal **12** `FakturRecord` yang realistik
    - Data mencakup setidaknya 3 customer berbeda, 2 pay terms berbeda, rentang tanggal dalam 30 hari terakhir
    - `salesDoc` setiap record unik
    - `netValue` positif, bervariasi (contoh: 1.500.000 – 25.000.000)
    - Data yang cukup agar semua KPI dan chart langsung terlihat saat halaman dibuka pertama kali
    - _Acceptance: dashboard langsung menampilkan data pada first load_

- [x] 2. Refactor `FakturCards.tsx` — KPI accuracy
  - [x] 2.1 Ensure KPI calculations are correct and render properly
    - `Total Nominal Faktur` = `SUM(netValue)` dari semua record dalam `filteredData`, format `Rp xxx.xxx.xxx`
    - `Total Dokumen` = `filteredData.length` (jumlah SALES DOC setelah filter)
    - `Average Nominal Faktur` = `totalNetValue / totalDokumen`, format `Rp xxx.xxx.xxx`
    - `Customer Terbanyak` = customer dengan jumlah dokumen paling banyak; tampilkan nama + jumlah dokumen
    - Gunakan `useMemo` untuk semua kalkulasi agregasi
    - Empty state (data kosong) menampilkan `—` dengan pesan "Belum ada data"
    - _Acceptance: Total Nominal Faktur = SUM NET VALUE; Total Dokumen = jumlah SALES DOC; Average benar; Customer Terbanyak benar_

  - [x] 2.2 Ensure KPI cards follow design system
    - 4-column grid (lg), 2-column grid (sm), responsif
    - Setiap card: `border-l-4`, icon, primary value, secondary value
    - `memo` wrapper pada semua card component
    - Hover lift effect (`whileHover: { y: -2 }`)
    - _Acceptance: Responsive; design system Wings Group_

- [x] 3. Refactor `DailyFakturChart.tsx` — ComposedChart dual Y-axis
  - [x] 3.1 Implement ComposedChart with Bar + Line and dual Y-axis
    - Gunakan Recharts `ComposedChart` (bukan BarChart biasa)
    - **Bar** (left Y-axis): `jumlah` — Jumlah Dokumen per hari
    - **Line** (right Y-axis): `netValue` — Total NET VALUE per hari (SUM)
    - X-axis: `tanggalLabel` (formatted tanggal, contoh: "28 Jun")
    - Dual Y-axis: `yAxisId="docs"` (kiri) dan `yAxisId="net"` (kanan, formatted Rp)
    - Tooltip mengikuti design system Wings Group (white card, border, rounded-xl, shadow)
    - Legend custom (Bar = square icon, Line = line icon)
    - `ResponsiveContainer` sebagai wrapper
    - _Acceptance: Daily Faktur Trend menggunakan ComposedChart (Bar + Line); Dual Y Axis_

  - [x] 3.2 Ensure data aggregation and empty state
    - `buildDailyTrend(records)` mengagregasi by `tanggal`: hitung `jumlah` (count) dan `netValue` (SUM)
    - Sort ascending by tanggal
    - Empty state: card dengan pesan "Belum ada data faktur."
    - `useMemo` untuk transformasi data
    - `memo` wrapper
    - _Acceptance: Chart sync dengan filter_

- [x] 4. Refactor `FakturTable.tsx` — all Excel columns + actions
  - [x] 4.1 Ensure all 9 Excel columns + Action column are present
    - Kolom persis (urutan sama dengan Excel): `Tanggal` | `Date` | `PAY TERMS` | `CUSTOMER` | `NAMA TOKO` | `SD DOCUMENT` | `SALES DOC` | `NET VALUE` | `KETERANGAN DARI TRANSPORT` | `Aksi`
    - `NET VALUE` diformat `Rp xxx.xxx.xxx` dan right-align
    - `KETERANGAN DARI TRANSPORT` truncate dengan `title` tooltip
    - Header row: `bg-[#F9FAFB]`, text uppercase `text-xs font-semibold text-[#64748B]`
    - Row hover: `hover:bg-[#F9FAFB] transition-colors`
    - Action cell: tombol Edit (Pencil icon, hover emerald) + Delete (Trash2 icon, hover red)
    - `min-width` pada tabel agar horizontal scroll di layar kecil
    - _Acceptance: Detail Table menampilkan seluruh field Excel; tombol Edit/Delete tersedia_

  - [x] 4.2 Ensure pagination and empty state
    - Empty state: icon `Inbox`, pesan "Belum ada data." + sub-text untuk mendorong tambah data
    - Pagination: page size options (10, 25, 50), range label, prev/next/first/last buttons
    - Reset ke page 1 saat `data` prop berubah
    - `memo` wrapper, `useCallback` untuk handlers
    - _Acceptance: Responsive; Total Dokumen = jumlah data setelah filter_

- [x] 5. Refactor `FilterBar.tsx` — complete filter coverage
  - [x] 5.1 Ensure all required filters are implemented
    - **Date Range**: filter by `tanggal` field (startDate ≤ tanggal ≤ endDate)
    - **Customer**: multi-select dropdown, options dari data yang ada
    - **Pay Terms**: multi-select dropdown, options dari data yang ada
    - **Search**: teks bebas mencari di `customer`, `namaToko`, `salesDoc` (debounced 300ms)
    - Active filter chips: tampilkan chips untuk setiap filter aktif, masing-masing bisa di-remove
    - Reset All: tombol reset menghapus semua filter sekaligus
    - _Acceptance: Seluruh dashboard mengikuti filter_

  - [x] 5.2 Ensure filter logic in page.tsx is correct
    - Fungsi `applyFilters(data, filters)` menerapkan semua filter secara berantai
    - `filteredData` di-compute dengan `useMemo([data, filters])`
    - `availableCustomers` dan `availablePayTerms` di-compute dengan `useMemo([data])` dari raw `data` (bukan `filteredData`) agar options tidak berkurang saat filter aktif
    - _Acceptance: Semua komponen (KPI, Chart, Table) berubah saat filter diubah_

- [x] 6. Refactor `FakturModal.tsx` — complete validation
  - [x] 6.1 Ensure all fields and validation rules are correct
    - Semua 9 field wajib diisi (wajib termasuk `tanggal` dan `date`)
    - `NET VALUE`: harus angka, tidak boleh negatif, parsed dengan `parseCurrency`
    - `SALES DOC`: tidak boleh duplikat — cek terhadap `existingSalesDocs` prop; pada mode edit, abaikan salesDoc record yang sedang diedit
    - Field-level error messages ditampilkan di bawah masing-masing input
    - Format NET VALUE input: auto-format ribuan saat user mengetik (gunakan `formatCurrencyInput`)
    - _Acceptance: Semua field wajib; NET VALUE angka tidak negatif; SALES DOC tidak duplikat_

  - [x] 6.2 Ensure modal UX and accessibility
    - Judul modal: "Tambah Data Faktur" (create) / "Edit Data Faktur" (edit)
    - Pre-populate fields dari `record` saat mode edit
    - Focus trap: Tab/Shift+Tab terkunci di dalam modal
    - Escape key menutup modal
    - Backdrop click menutup modal (kecuali saat `saving`)
    - Submit button: "Simpan" (create) / "Perbarui" (edit); spinner saat `saving`
    - Tombol Batal selalu tersedia
    - `aria-modal`, `role="dialog"`, `aria-labelledby` terpasang
    - _Acceptance: Super Admin dapat Create dan Edit; Responsive_

- [x] 7. Ensure CRUD wiring and dashboard synchronization in `page.tsx`
  - [x] 7.1 Verify Create, Edit, Delete handlers are fully implemented
    - `handleSave(values)`: pada create — buat `FakturRecord` baru dengan `crypto.randomUUID()`, prepend ke `data`; pada edit — update record di `data` by `id`
    - `handleEdit(record)`: buka modal mode edit dengan record terpilih
    - `handleDeleteClick(record)`: set `deleteTarget` untuk membuka confirm dialog
    - `handleConfirmDelete()`: hapus record dari `data` by `id`, tutup dialog, tampilkan toast sukses
    - Semua handler pakai `useCallback`
    - _Acceptance: Super Admin dapat Create, Edit, Delete_

  - [x] 7.2 Verify dashboard synchronization after CRUD
    - Setelah Create/Edit/Delete, `data` state berubah → `filteredData` di-recompute otomatis → KPI Cards, Chart, Table semua terupdate **tanpa refresh halaman**
    - Toast notifications: sukses (emerald border) dan error (red border), auto-dismiss 4 detik
    - Delete confirmation dialog: modal konfirmasi sebelum hapus, tombol disabled saat `deleting === true`
    - `+ Tambah Faktur` button di page header, visible dan accessible
    - _Acceptance: Dashboard otomatis memperbarui KPI, Chart, Table setelah CRUD; Tanpa refresh halaman_

- [x] 8. Build verification and cleanup
  - [x] 8.1 Remove unused imports and fix TypeScript issues
    - Hapus semua import yang tidak digunakan di seluruh file dalam `src/app/admin/gantungan-faktur/`
    - Tidak ada penggunaan tipe `any`
    - Tidak ada `@ts-ignore` atau `@ts-expect-error` yang tidak perlu
    - Semua props dan state memiliki tipe eksplisit
    - _Acceptance: npm run build tanpa TypeScript error_

  - [x] 8.2 Run `npm run build` and fix all errors
    - Jalankan `npm run build` dari root project
    - Perbaiki semua TypeScript compilation error
    - Perbaiki semua ESLint error (warnings boleh)
    - Build harus berhasil (exit code 0)
    - _Acceptance: npm run build berhasil tanpa error TypeScript maupun ESLint_

---

## Notes

- **Jangan ubah**: routing (`/admin/gantungan-faktur`), layout (`src/app/admin/layout.jsx`), autentikasi, design system Wings Group (warna, border-radius, tipografi)
- **Colocation**: semua file tetap di `src/app/admin/gantungan-faktur/` — tidak perlu memindahkan ke `src/components/`
- **Mock data**: `initialFakturData` di `mock.ts` adalah satu-satunya source of truth untuk seed data; tidak ada backend
- **Design system colors**: primary `#10B981` (emerald) untuk aksi utama, `#DC2626` (red) hanya bila sudah ada di layout, cards `#FFFFFF`, bg `#F9FAFB`, border `#E5E7EB`, rounded-`[18px]`
- **parseCurrency**: fungsi helper di `FakturModal.tsx` — diimpor di `page.tsx`; tidak perlu duplikat
- **existingSalesDocs**: di `page.tsx`, di-compute dengan `useMemo` dari `data.map(r => r.salesDoc)`; pada mode edit, salesDoc record aktif tetap masuk list tapi validasi mengecualikannya

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2", "6.1", "6.2"] },
    { "id": 2, "tasks": ["4.1", "4.2", "5.1", "5.2", "7.1", "7.2"] },
    { "id": 3, "tasks": ["8.1", "8.2"] }
  ]
}
```
