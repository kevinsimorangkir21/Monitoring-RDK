# Implementation Plan: Outbound Module Refactor + Manual CRUD

## Overview

Full replacement of `/admin/outbound` — old field model (`plant`, `vendor`, `noPolisi`, `driver`, `statusFO`, `totalBox`, `totalQty`, `jamLoading`, `jamBerangkat`) is removed and replaced with the Excel-aligned 13-field `OutboundRecord`. All 10 files in `src/app/admin/outbound/` are rewritten; the two legacy-only charts (`DeliveryTrendChart.tsx`, `VendorPerformanceChart.tsx`) are deleted. The implementation is purely in-memory (no backend), colocated under `src/app/admin/outbound/`, and must pass `npm run build` with exit code 0.

---

## Tasks

- [x] 1. Replace type definitions and mock data
  - [x] 1.1 Rewrite `types.ts` — new domain model
    - Delete all existing type definitions and replace with the new model
    - Export `STATUS` union (`"Open" | "Close" | "Cancel" | "Partial"`), `OutboundRecord` (13 non-id fields + `id`), `OutboundFormValues` (all strings), `OutboundFormErrors`, `CrudMode`, `ModalState`, `OutboundFilters`, `ToastVariant`, `ToastMessage`
    - Zero `any` usage; this file is the single source of truth — no type duplicates elsewhere
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [x] 1.2 Rewrite `mock.ts` — 25+ realistic records
    - Replace old mock with `initialOutboundData: OutboundRecord[]` (≥ 25 records)
    - `status` majority `"Close"` (~60%), remainder spread across `"Open"`, `"Cancel"`, `"Partial"`
    - ≥ 3 distinct `sType` values; `tanggal` spans ≥ 14 days; all `freightOrder` values unique
    - `jamTerima`, `selesaiMuat`, `jamRunning` in valid `"HH:MM"` format; `st` and `h2` are non-negative integers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 2. Implement KPI Cards (`OutboundCards.tsx`)
  - [x] 2.1 Implement `OutboundCards` component with KPI logic
    - Export pure predicate functions `isMuatInap`, `isMuatPagi`, `isRit2` and `calculateKPIs` for testability
    - Render 4-card grid (`lg:grid-cols-4 sm:grid-cols-2 grid-cols-1`) with Total Mobil Muat, Muat Inap, Muat Pagi, Rit 2
    - Each card shows count and percentage of total; show `0` / `0%` when data is empty
    - Wrap with `React.memo`; compute all values with `useMemo`; use Wings Group design system (`#10B981`, `#FFFFFF`, `#E5E7EB`, `rounded-[18px]`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 2.2 Write property test for KPI Invariant (Property 1)
    - **Property 1: KPI Invariant** — for any `OutboundRecord[]` (including empty), `muatInap + muatPagi + rit2 ≤ total`; for `length > 0`, percentages equal `(count / total) * 100` within ±0.5%
    - File: `src/app/admin/outbound/__tests__/OutboundCards.pbt.test.ts`
    - Tag: `// Feature: outbound-refactor, Property 1: KPI Invariant`
    - Run ≥ 100 iterations with fast-check arbitrary `OutboundRecord[]`
    - **Validates: Requirements 3.1–3.6**

- [x] 3. Implement StatusFO Chart (`StatusFOChart.tsx`)
  - [x] 3.1 Implement `StatusFOChart` with Recharts horizontal bar chart
    - Export pure `buildStatusFOData(records): StatusFODataPoint[]` — returns distribution sorted descending by count
    - Recharts `BarChart layout="vertical"` inside `ResponsiveContainer`; color map: Open→`#10B981`, Close→`#3B82F6`, Cancel→`#EF4444`, Partial→`#F59E0B`
    - Custom tooltip; empty state `"Belum ada data outbound."`; wrap with `memo`; `"use client"` directive
    - Card: `border border-[#E5E7EB] rounded-[18px] shadow-sm`, title **"Status FO"**
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x] 3.2 Write property test for StatusFO Distribution Sum (Property 2)
    - **Property 2: StatusFO Distribution Sum** — for any `OutboundRecord[]`, sum of all `count` in `buildStatusFOData(data)` = `data.length`
    - File: `src/app/admin/outbound/__tests__/StatusFOChart.pbt.test.ts`
    - Tag: `// Feature: outbound-refactor, Property 2: StatusFO Distribution Sum`
    - Run ≥ 100 iterations; generate arbitrary records with random `status` from the 4-value enum
    - **Validates: Requirements 4.2, 4.3**

- [x] 4. Implement SType Chart (`STypeChart.tsx`)
  - [x] 4.1 Implement `STypeChart` with Recharts donut chart
    - Export pure `buildSTypeData(records): STypeDataPoint[]` — `{ name, value, color }`
    - Recharts `PieChart` with `innerRadius` (donut) inside `ResponsiveContainer`; ≥ 5 distinct palette colors
    - Custom tooltip (name, count, percentage); Legend with name + count/percentage
    - Empty state `"Belum ada data outbound."`; wrap with `memo`; `"use client"` directive
    - Card: `border border-[#E5E7EB] rounded-[18px] shadow-sm`, title **"Persebaran S-Type"**
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 4.2 Write property test for SType Distribution Sum (Property 3)
    - **Property 3: SType Distribution Sum** — for any `OutboundRecord[]` with `length > 0`, sum of all `value` in `buildSTypeData(data)` = `data.length`
    - File: `src/app/admin/outbound/__tests__/STypeChart.pbt.test.ts`
    - Tag: `// Feature: outbound-refactor, Property 3: SType Distribution Sum`
    - Run ≥ 100 iterations with arbitrary `sType` strings
    - **Validates: Requirements 5.2**

- [x] 5. Implement STW Grouping Chart (`STGroupingChart.tsx`)
  - [x] 5.1 Implement `STGroupingChart` with bucket logic and Recharts bar chart
    - Export pure functions: `parseTimeToMinutes(time): number | null`, `computeSTWMinutes(jamTerima, selesaiMuat): number | null`, `bucketSTW(minutes): STWBucket`, `buildSTWData(records): STWDataPoint[]`
    - Buckets: `"< 30 Menit"` (0–29), `"30–60 Menit"` (30–59), `"60–90 Menit"` (60–89), `"> 90 Menit"` (90+); records with invalid/empty times excluded
    - Recharts `BarChart` inside `ResponsiveContainer`; X-axis = bucket labels, Y-axis = count; differentiated bucket colors; custom tooltip
    - Empty state `"Belum ada data dengan waktu valid."`; wrap with `memo`; `"use client"` directive
    - Card: `border border-[#E5E7EB] rounded-[18px] shadow-sm`, title **"Grouping Time STW"**
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [x] 5.2 Write property tests for STW Bucket Invariant (Property 4)
    - **Property 4: STW Bucket Invariant** — sum of all bucket counts = count of records with non-null `computeSTWMinutes`; each valid record lands in exactly one bucket (mutual exclusion)
    - File: `src/app/admin/outbound/__tests__/STGroupingChart.pbt.test.ts`
    - Tag: `// Feature: outbound-refactor, Property 4: STW Bucket Invariant`
    - Run ≥ 100 iterations; include arbitrary `jamTerima`/`selesaiMuat` strings including invalid values
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 6. Checkpoint — Core data layer complete
  - Ensure `types.ts`, `mock.ts`, all four chart/KPI components compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Filter Bar (`FilterBar.tsx`)
  - [x] 7.1 Implement `FilterBar` component with all filter controls
    - Date range (startDate/endDate inputs filtering `tanggal`); STATUS multi-select (fixed 4 options); S-TYPE multi-select (dynamic from `availableSTypes` prop)
    - Search input with placeholder `"Cari FREIGHT ORDER atau Mobil Muat..."`, debounced 300ms, searching `freightOrder` and `mobilMuat` case-insensitively
    - Active filter chips below controls; individual chip `×` removes only that filter; **"Reset All"** button visible only when ≥ 1 filter active
    - Calls `onChange(partial)` on every filter change; calls `onReset()` from Reset All
    - Wrap with `memo`; `"use client"` directive
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [x] 7.2 Write property tests for Filter Subset and Reset Idempotent (Properties 5 & 6)
    - **Property 5: Filter Subset** — for any `OutboundRecord[]` and any `OutboundFilters`, `applyFilters(data, filters).length ≤ data.length`
    - **Property 6: Filter Reset Idempotent** — `applyFilters(data, DEFAULT_FILTERS)` returns same length and contents as `data`
    - File: `src/app/admin/outbound/__tests__/FilterBar.pbt.test.ts`
    - Tags: `// Feature: outbound-refactor, Property 5: Filter Subset` and `// Feature: outbound-refactor, Property 6: Filter Reset Idempotent`
    - Run ≥ 100 iterations each; generate arbitrary record arrays and filter combinations
    - **Validates: Requirements 7.1, 7.4, 7.5, 7.8, 7.9**

- [x] 8. Implement Outbound Table (`OutboundTable.tsx`)
  - [x] 8.1 Implement `OutboundTable` with pagination and action callbacks
    - Render 14 columns: Tanggal | FREIGHT ORDER | Mobil Muat | S-TYPE | Assign Job | JAM TERIMA | STATUS | Selesai Muat | HARI | PUTARAN | ST | H2 | JAM RUNNING | Action
    - STATUS badge colors: Open→emerald, Close→blue, Cancel→red, Partial→amber
    - Edit button (Pencil icon) calls `onEdit(record)`; Delete button (Trash2 icon) calls `onDelete(record)`
    - Hover row effect; pagination controls (page sizes 10, 25, 50); label `"{start}–{end} dari {total} data"`
    - Empty state: `Inbox` icon + `"Tidak ada data outbound ditemukan"`
    - `overflow-x-auto` wrapper; inner `<table>` with `min-w-[900px]`; wrap with `memo`; `useCallback` for handlers; `"use client"` directive
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11_

- [x] 9. Implement Outbound Modal (`OutboundModal.tsx`)
  - [x] 9.1 Implement `validateOutboundForm` pure validation function
    - Export `validateOutboundForm(values, existingFreightOrders, currentId?): OutboundFormErrors`
    - All 13 fields required (no empty/whitespace); `st` ≥ 0; `h2` ≥ 0; `status` from valid enum; `freightOrder` uniqueness (skip self-check when `currentId` matches)
    - Error messages: required → `"Field ini wajib diisi."`, negative st → `"ST harus bernilai 0 atau lebih."`, negative h2 → `"H2 harus bernilai 0 atau lebih."`, invalid status → `"Pilih status yang valid."`, duplicate FO → `"FREIGHT ORDER sudah terdaftar."`
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4_

  - [x] 9.2 Write property tests for Form Validation and FO Uniqueness (Properties 7 & 8)
    - **Property 7: Form Validation — Empty Fields and Non-Negative Numbers** — any input with ≥ 1 empty/whitespace field produces errors for all such fields; negative `st`/`h2` always produce errors
    - **Property 8: FREIGHT ORDER Uniqueness** — any `freightOrder` present in `existingFreightOrders` (with `currentId = undefined`) always returns a `freightOrder` error (no false negatives)
    - File: `src/app/admin/outbound/__tests__/OutboundModal.pbt.test.ts`
    - Tags: `// Feature: outbound-refactor, Property 7: Form Validation` and `// Feature: outbound-refactor, Property 8: FO Uniqueness`
    - Run ≥ 100 iterations each
    - **Validates: Requirements 9.4, 9.5, 9.6, 10.1, 10.2, 10.3**

  - [x] 9.3 Implement `OutboundModal` component UI
    - Accept props: `open`, `mode`, `record?`, `saving`, `existingFreightOrders`, `currentId?`, `onSave`, `onClose`
    - Title: **"Tambah Outbound"** (create) / **"Edit Outbound"** (edit); pre-populate all 13 fields on edit
    - 13-field form in 2-column grid (sm+); inline errors below each invalid field
    - Save button shows loading state when `saving`; both buttons disabled when `saving`; Escape / backdrop click calls `onClose` (only when not saving)
    - Focus trap (Tab/Shift+Tab stays inside modal); `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
    - Framer Motion `AnimatePresence` with scale + opacity animation; `"use client"` directive
    - _Requirements: 9.1, 9.2, 9.3, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14, 9.15_

- [x] 10. Implement main page (`page.tsx`) — full replacement
  - [x] 10.1 Rewrite `page.tsx` with new state model and all CRUD handlers
    - `"use client"` directive; state: `data: OutboundRecord[]` (init from `initialOutboundData`), `filters: OutboundFilters`, `modalState: ModalState`, `deleteTarget`, `deleting`, `saving`, `toasts`
    - `filteredData` via `useMemo(applyFilters(data, filters))`; `availableSTypes`, `existingFreightOrders` via `useMemo`
    - Export `applyFilters(data, filters): OutboundRecord[]` as pure function
    - `DEFAULT_FILTERS` constant with null dateRange, empty arrays, empty searchQuery
    - All handlers with `useCallback`: `handleSave`, `handleEdit`, `handleDeleteClick`, `handleConfirmDelete`, `updateFilters`, `resetFilters`, `addToast`, `dismissToast`, `handleOpenCreate`, `handleCloseModal`, `handleCloseDelete`
    - Toast auto-dismiss after 4000ms; body scroll lock when modal or dialog open
    - _Requirements: 14.1, 14.5, 14.6, 14.7, 12.6, 12.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 15.3, 15.4_

  - [x] 10.2 Wire page layout — render all sections in correct order
    - Page header: title **"Outbound Monitoring"**, subtitle, badge `"{filtered} dari {total} record"`, button **"+ Tambah Outbound"** (emerald)
    - Section order: FilterBar → OutboundCards → `grid lg:grid-cols-2` (StatusFOChart + STypeChart) → STGroupingChart (full-width) → OutboundTable (full-width)
    - `fadeUp` Framer Motion variants (`opacity: 0, y: 14` → `opacity: 1, y: 0`) with stagger delays (custom index 0–5)
    - Inline `DeleteDialog` and `ToastStack` components at bottom of file; `DeleteDialog` shows `freightOrder` + `tanggal`, `role="alertdialog"`, Framer Motion animation
    - `ToastStack` fixed `bottom-4 right-4` (desktop), center-aligned (mobile); `CheckCircle2` (success) / `AlertCircle` (error) icons; dismiss button `"×"`
    - Remove all imports of `VendorPerformanceChart` and `DeliveryTrendChart`
    - _Requirements: 14.2, 14.3, 14.4, 14.8, 14.9, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.8, 12.9, 12.10_

  - [x] 10.3 Write property tests for CRUD state invariants (Properties 9, 10, 11)
    - **Property 9: Create State Invariant** — after create with a new valid record, `data.length` increases by exactly 1 and new record is present
    - **Property 10: Edit State Invariant** — after edit, `data.length` is unchanged and record with matching `id` reflects updated fields
    - **Property 11: Delete State Invariant** — after delete, `data.length` decreases by exactly 1 and record with deleted `id` is absent
    - File: `src/app/admin/outbound/__tests__/page.pbt.test.ts`
    - Tags: `// Feature: outbound-refactor, Property 9: Create Invariant`, `// Feature: outbound-refactor, Property 10: Edit Invariant`, `// Feature: outbound-refactor, Property 11: Delete Invariant`
    - Run ≥ 100 iterations each; test the pure state-update logic extracted from `handleSave` / `handleConfirmDelete`
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [x] 11. Delete legacy files
  - Delete `src/app/admin/outbound/DeliveryTrendChart.tsx`
  - Delete `src/app/admin/outbound/VendorPerformanceChart.tsx`
  - Verify no remaining imports of these files anywhere in the codebase
  - _Requirements: 16.1, 15.9_

- [x] 12. Final checkpoint — build verification
  - Run `npm run build` and confirm exit code 0 (zero TypeScript errors, zero ESLint errors)
  - Run `npm run test` and confirm all property-based and unit tests pass
  - Remove any unused imports across all files in `src/app/admin/outbound/`
  - Verify no `any` types remain in the outbound module
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for an MVP build; all non-starred tasks must be completed for the feature to function
- Property tests use **fast-check** (≥ 100 iterations each); unit tests use **vitest** + **@testing-library/react** — both already installed
- Each property test file should go in `src/app/admin/outbound/__tests__/` (create the folder if it doesn't exist)
- `applyFilters` and all chart transform functions (`buildStatusFOData`, `buildSTypeData`, `buildSTWData`) must be exported as named pure functions for testability
- Task 11 (delete legacy files) should only run after `page.tsx` no longer imports the old chart components
- The `STypeChart` and `STGroupingChart` components don't exist yet in the repo — they are net-new files
- Design system constants: primary `#10B981`, card background `#FFFFFF`, border `#E5E7EB`, border radius `rounded-[18px]`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "4.1", "5.1", "7.1", "8.1", "9.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "4.2", "5.2", "7.2", "9.2"] },
    { "id": 4, "tasks": ["9.3"] },
    { "id": 5, "tasks": ["10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3"] }
  ]
}
```
