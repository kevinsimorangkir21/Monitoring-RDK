# Implementation Plan: Outbound Module — Full Refactor + Manual CRUD

## Overview

Full replacement of `/admin/outbound` dengan implementasi baru berbasis sheet Excel Outbound. Halaman lama (Freight Order, Mobil Muat, S-Type) diganti total. Semua file baru colocated di `src/app/admin/outbound/` mengikuti pola yang sama dengan `gantungan-faktur`.

Pekerjaan dibagi dalam 5 wave:
1. **Types, Mock & Cleanup** — definisi tipe, seed data, hapus file lama
2. **Core Components** — KPI Cards, FilterBar, Modal, StatusFO Chart
3. **Chart Components** — Delivery Trend, Vendor Performance
4. **Table + Page** — Outbound Table, halaman utama + CRUD wiring
5. **Build verification** — cleanup import, `npm run build` zero error

---

## Tasks

- [x] 1. Types, mock data, dan cleanup file lama
  - [x] 1.1 Create `src/app/admin/outbound/types.ts`
    - Ekspor `StatusFO` = `"OPEN" | "CLOSE" | "CANCEL" | "PARTIAL"`
    - Ekspor `OutboundRecord` dengan field: `id`, `tanggal` (`"YYYY-MM-DD"`), `plant`, `vendor`, `noPolisi`, `driver`, `statusFO` (StatusFO), `totalBox` (number ≥ 0), `totalQty` (number ≥ 0), `jamLoading` (`"HH:MM"`), `jamBerangkat` (`"HH:MM"`)
    - Ekspor `OutboundFormValues` — semua field sebagai `string` untuk raw form input
    - Ekspor `OutboundFormErrors` = `Partial<Record<keyof OutboundFormValues, string>>`
    - Ekspor `CrudMode` = `"create" | "edit"`
    - Ekspor `ModalState` = `{ open: boolean; mode: CrudMode; record?: OutboundRecord }`
    - Ekspor `OutboundFilters` = `{ dateRange: { startDate: string | null; endDate: string | null }; selectedPlant: string[]; selectedVendor: string[]; selectedStatusFO: string[]; searchQuery: string }`
    - Ekspor `ToastVariant` = `"success" | "error"` dan `ToastMessage` = `{ id: string; variant: ToastVariant; message: string }`
    - Tidak ada `any` type
    - _Requirements: 1.1–1.10_

  - [x] 1.2 Create `src/app/admin/outbound/mock.ts` with 25+ realistic records
    - Ekspor `initialOutboundData: OutboundRecord[]` dengan minimal 25 records
    - 5 vendor berbeda: `"PT Logistics Nusantara"`, `"CV Trans Mandiri"`, `"PT Cepat Jaya"`, `"UD Mitra Cargo"`, `"PT Armada Express"`
    - 5 plant berbeda: `"PASM"`, `"IMSM"`, `"U2"`, `"LION"`, `"TASE"`
    - Mix 4 statusFO: OPEN, CLOSE, CANCEL, PARTIAL (distribusi realistik, lebih banyak CLOSE)
    - Tanggal tersebar di Juni 2026 (2026-06-01 sampai 2026-06-30)
    - `noPolisi` format `"B 1234 XY"` (uppercase, spasi sebagai pemisah)
    - `jamLoading` dan `jamBerangkat` format `"HH:MM"` valid (jam berangkat selalu setelah jam loading)
    - `totalBox` range 50-500, `totalQty` range 100-2000
    - _Requirements: 2.1–2.9_

  - [x] 1.3 Clean up old outbound files
    - Ganti isi `src/types/outbound.ts` dengan re-export minimal (untuk backward compat) atau hapus konten lama dan ganti dengan tipe baru
    - Ganti isi `src/mock/outbound.ts` dengan data kosong atau re-export dari file baru (agar tidak ada import conflict)
    - Hapus isi `src/hooks/useOutboundData.ts` dan ganti dengan stub kosong yang aman, ATAU hapus file dan update import yang memakai hook ini
    - JANGAN hapus atau modifikasi `src/components/outbound/` — biarkan as-is
    - _Requirements: 14.1–14.5_

- [x] 2. Core components — KPI Cards, FilterBar, Modal
  - [x] 2.1 Create `src/app/admin/outbound/OutboundCards.tsx`
    - Import `OutboundRecord` dari `./types`
    - Hitung 4 KPI dengan `useMemo`:
      - **Total Delivery** = `data.length`
      - **Total Box** = `data.reduce((s, r) => s + r.totalBox, 0)`
      - **Total Qty** = `data.reduce((s, r) => s + r.totalQty, 0)`
      - **Status FO Dominan** = statusFO dengan count terbanyak (map frequency, ambil max); tampilkan nama + `(count)`
    - Grid responsif: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
    - Setiap card: `border-l-4`, icon (Truck/Package/Archive/Activity dari lucide-react), primary value, secondary
    - Empty state saat `data.length === 0`: tampilkan `—` pada Status FO Dominan
    - `memo` wrapper, `"use client"` directive
    - Design system: `bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm`
    - _Requirements: 3.1–3.9_

  - [x] 2.2 Create `src/app/admin/outbound/FilterBar.tsx`
    - Props: `filters: OutboundFilters`, `availablePlants: string[]`, `availableVendors: string[]`, `onChange: (partial: Partial<OutboundFilters>) => void`, `onReset: () => void`
    - **Date Range**: 2 input date (startDate, endDate) filter by `tanggal`
    - **Plant**: multi-select dropdown dengan `availablePlants` sebagai opsi
    - **Vendor**: multi-select dropdown dengan `availableVendors` sebagai opsi
    - **Status FO**: multi-select dropdown dengan opsi tetap `["OPEN","CLOSE","CANCEL","PARTIAL"]`
    - **Search**: input teks debounced 300ms, mencari di `vendor`, `noPolisi`, `driver`
    - Active filter chips dengan X button per chip (individually removable)
    - Reset All button (hanya tampil jika ada filter aktif)
    - `memo` wrapper, `"use client"` directive
    - Gunakan MultiSelect helper (dropdown dengan checkbox) sama persis dengan pola gantungan-faktur
    - _Requirements: 7.1–7.11_

  - [x] 2.3 Create `src/app/admin/outbound/OutboundModal.tsx`
    - Props: `open`, `mode: CrudMode`, `record?: OutboundRecord`, `saving: boolean`, `onSave: (values: OutboundFormValues) => Promise<void>`, `onClose: () => void`
    - 10 field form:
      - `tanggal`: `<input type="date">`
      - `plant`: `<select>` dengan opsi `["PASM","IMSM","U2","LION","TASE"]`
      - `vendor`: `<input type="text">`
      - `noPolisi`: `<input type="text">`
      - `driver`: `<input type="text">`
      - `statusFO`: `<select>` dengan opsi `["OPEN","CLOSE","CANCEL","PARTIAL"]`
      - `totalBox`: `<input type="number" min="0">`
      - `totalQty`: `<input type="number" min="0">`
      - `jamLoading`: `<input type="time">`
      - `jamBerangkat`: `<input type="time">`
    - Validasi semua field wajib; `totalBox` ≥ 0, `totalQty` ≥ 0
    - Error messages per field di bawah setiap input
    - Pre-populate dari `record` saat mode edit
    - Focus trap (Tab/Shift+Tab terkunci di dalam modal)
    - Escape key + backdrop click menutup modal (kecuali saat `saving`)
    - Framer Motion enter/exit animation (scale + opacity + y)
    - Judul: "Tambah Data Outbound" (create) / "Edit Data Outbound" (edit)
    - Submit button "Simpan"/"Perbarui" dengan spinner saat saving; disabled saat `saving`
    - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
    - `"use client"` directive
    - _Requirements: 9.1–9.16_

  - [x] 2.4 Create `src/app/admin/outbound/StatusFOChart.tsx`
    - Props: `data: OutboundRecord[]`
    - Hitung distribusi per statusFO dengan `useMemo`:
      - Buat frequency map `{ OPEN: n, CLOSE: n, CANCEL: n, PARTIAL: n }`
      - Sort descending by count
    - Gunakan Recharts `BarChart` dengan `layout="vertical"` (horizontal bar chart)
    - Y-axis (category): nama statusFO; X-axis (value): jumlah records
    - Warna per status: OPEN → `#10B981` (emerald), CLOSE → `#3B82F6` (blue), CANCEL → `#EF4444` (red), PARTIAL → `#F59E0B` (amber)
    - Custom tooltip: nama status + jumlah
    - `ResponsiveContainer` sebagai wrapper
    - White card wrapper: `border border-[#E5E7EB] rounded-[18px] shadow-sm p-5`
    - Judul "Distribusi Status FO"
    - Empty state saat data kosong
    - `memo` wrapper, `"use client"` directive
    - _Requirements: 4.1–4.8_

- [x] 3. Chart components — Delivery Trend, Vendor Performance
  - [x] 3.1 Create `src/app/admin/outbound/DeliveryTrendChart.tsx`
    - Props: `data: OutboundRecord[]`
    - Agregasi data harian dengan `useMemo`:
      - Group by `tanggal`, hitung `count` (jumlah records) dan `totalBox` (SUM)
      - Format label: "01 Jun", "02 Jun", dst.
      - Sort ascending by tanggal
    - Gunakan Recharts `ComposedChart`:
      - **Bar** (left Y-axis, `yAxisId="delivery"`): `count` — Total Delivery per hari
      - **Line** (right Y-axis, `yAxisId="box"`): `totalBox` — Total Box per hari
    - Dual Y-axis: kiri untuk count, kanan untuk totalBox
    - X-axis: label tanggal singkat
    - Custom tooltip mengikuti design system (white card, border, rounded-xl, shadow)
    - Legend: Bar = square icon, Line = line icon
    - `ResponsiveContainer` sebagai wrapper
    - White card wrapper dengan judul "Tren Pengiriman Harian"
    - Empty state saat data kosong
    - `memo` wrapper, `"use client"` directive
    - _Requirements: 5.1–5.9_

  - [x] 3.2 Create `src/app/admin/outbound/VendorPerformanceChart.tsx`
    - Props: `data: OutboundRecord[]`
    - Agregasi per vendor dengan `useMemo`:
      - Count records per vendor
      - Sort descending by count
    - Gunakan Recharts `BarChart` dengan `layout="vertical"` (horizontal bar chart)
    - Y-axis (category): nama vendor; X-axis (value): jumlah delivery
    - Warna bar: satu warna konsisten (misal `#3B82F6` blue atau `#10B981` emerald)
    - Custom tooltip: nama vendor + jumlah delivery
    - `ResponsiveContainer` sebagai wrapper
    - White card wrapper dengan judul "Performa Vendor"
    - Empty state saat data kosong
    - `memo` wrapper, `"use client"` directive
    - _Requirements: 6.1–6.7_

- [x] 4. Table + Page orchestration
  - [x] 4.1 Create `src/app/admin/outbound/OutboundTable.tsx`
    - Props: `data: OutboundRecord[]`, `onEdit: (record: OutboundRecord) => void`, `onDelete: (record: OutboundRecord) => void`, `loading?: boolean`
    - 11 kolom: Tanggal | Plant | Vendor | No Polisi | Driver | Status FO | Total Box | Total Qty | Jam Loading | Jam Berangkat | Aksi
    - Kolom Status FO: badge berwarna (OPEN → emerald, CLOSE → biru, CANCEL → merah, PARTIAL → amber)
    - Kolom Aksi: tombol Edit (Pencil icon, hover emerald) + Delete (Trash2 icon, hover red)
    - Row hover: `hover:bg-[#F9FAFB] transition-colors`
    - `min-w-[1100px]` pada tabel inner untuk horizontal scroll
    - Header: `bg-[#F9FAFB]`, uppercase, `text-xs font-semibold text-[#64748B]`
    - Pagination state internal: page, pageSize (opsi 10, 25, 50)
    - Reset ke page 1 saat `data` prop berubah (useEffect)
    - Pagination display: `"{start}–{end} dari {total} data"`
    - Empty state: `Inbox` icon + "Tidak ada data outbound ditemukan"
    - `memo` wrapper, `useCallback` untuk handlers, `"use client"` directive
    - _Requirements: 8.1–8.12_

  - [x] 4.2 Create `src/app/admin/outbound/page.tsx` — full page orchestration
    - `"use client"` directive
    - State: `data: OutboundRecord[]` (init dari `initialOutboundData`), `filters: OutboundFilters`, `modalState: ModalState`, `deleteTarget: OutboundRecord | null`, `deleting: boolean`, `saving: boolean`, `toasts: ToastMessage[]`
    - `filteredData` = `useMemo(() => applyFilters(data, filters), [data, filters])`
    - `applyFilters` function menerapkan: date range, plant list, vendor list, statusFO list, search query (vendor + noPolisi + driver)
    - `availablePlants` = `useMemo(() => [...new Set(data.map(r => r.plant))].sort(), [data])`
    - `availableVendors` = `useMemo(() => [...new Set(data.map(r => r.vendor))].sort(), [data])`
    - CRUD handlers (semua `useCallback`):
      - `handleSave`: create → `[newRecord, ...prev]`; edit → `prev.map(r => r.id === updated.id ? updated : r)`
      - `handleEdit`: set `modalState = { open: true, mode: "edit", record }`
      - `handleDeleteClick`: set `deleteTarget`
      - `handleConfirmDelete`: filter by id, toast sukses, clear deleteTarget
    - Toast: `addToast(variant, message)`, `dismissToast(id)`, auto-dismiss 4000ms
    - Page sections (dengan fadeUp animation, custom delay 0-5):
      1. Page header: title, subtitle, badge `"{filtered} dari {total} record"`, tombol "+ Tambah Data Outbound" (emerald)
      2. FilterBar
      3. OutboundCards (data = filteredData)
      4. Side-by-side: StatusFOChart (50%) + VendorPerformanceChart (50%)
      5. DeliveryTrendChart (full width)
      6. OutboundTable (full width)
    - Render di akhir JSX: OutboundModal, DeleteDialog, ToastStack
    - _Requirements: 12.1–12.6, 13.1–13.15_

  - [x] 4.3 Implement inline DeleteDialog and ToastStack in `page.tsx`
    - **DeleteDialog** (inline component dalam page.tsx):
      - Props: `open`, `record: OutboundRecord | null`, `deleting`, `onConfirm`, `onClose`
      - Tampilkan vendor dan tanggal dari record sebagai konteks
      - Backdrop click closes saat tidak `deleting`
      - Framer Motion AnimatePresence (scale + opacity)
      - `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`
      - Tombol Hapus disabled + "Menghapus..." saat `deleting`; Tombol Batal disabled saat `deleting`
    - **ToastStack** (inline component dalam page.tsx):
      - Fixed `bottom-4 right-4` (desktop), center pada mobile
      - AnimatePresence untuk animated enter/exit per toast
      - success: emerald border-l-4 + CheckCircle2 icon; error: red border-l-4 + AlertCircle icon
      - Dismiss button (X) per toast
    - _Requirements: 10.1–10.8, 11.1–11.10_

- [ ] 5. Build verification and cleanup
  - [ ] 5.1 Remove unused imports and fix TypeScript issues
    - Hapus semua import yang tidak digunakan di semua file `src/app/admin/outbound/`
    - Pastikan tidak ada tipe `any` di semua file baru
    - Pastikan tidak ada `@ts-ignore` atau `@ts-expect-error`
    - Semua props dan state memiliki tipe eksplisit
    - _Requirements: 15.1–15.10_

  - [ ] 5.2 Run `npm run build` and fix all errors
    - Jalankan `npm run build` dari root project
    - Perbaiki semua TypeScript compilation error
    - Perbaiki semua ESLint error (warnings boleh)
    - Build harus berhasil (exit code 0)
    - Pastikan tidak ada import yang masih merujuk ke file/hook lama yang sudah dihapus atau dikosongkan
    - _Requirements: 15.1–15.10_

---

## Notes

- **Colocated pattern**: semua file di `src/app/admin/outbound/` — tidak ada shared components di `src/components/outbound/` yang dipakai
- **Old components preserved**: `src/components/outbound/` dibiarkan apa adanya, tidak diimport dari page baru
- **Old types/mock**: `src/types/outbound.ts` dan `src/mock/outbound.ts` harus diperbarui agar tidak menyebabkan import conflict; `src/hooks/useOutboundData.ts` juga harus dibersihkan
- **Design system primary color**: gunakan `#10B981` (emerald) sebagai primary action color (bukan `#DC2626` red yang ada di old outbound)
- **StatusFO badge colors**: OPEN=emerald, CLOSE=blue, CANCEL=red, PARTIAL=amber
- **Jam Loading/Berangkat**: di mock dan form pakai format `"HH:MM"`, tampil as-is di tabel
- **Filter logic**: `applyFilters` mengecek semua filter secara berantai (AND logic); jika array filter kosong, tidak memfilter
- **availablePlants/Vendors**: dari raw `data` (bukan `filteredData`) agar opsi tidak berkurang saat filter aktif

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1", "5.2"] }
  ]
}
```
