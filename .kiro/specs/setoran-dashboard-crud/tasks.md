# Implementation Plan: Setoran Dashboard CRUD Enhancement

## Overview

Transform the read-only Setoran Dashboard into a fully interactive data management interface. The implementation proceeds in layers: pure calculation utilities and the server-side store first, then API routes, then new UI components, and finally wiring everything together in the existing page and table. Optimistic updates keep all KPI cards, charts, and the table in sync immediately after every write.

## Tasks

- [x] 1. Create calculation utilities and TypeScript interfaces
  - [x] 1.1 Create `src/lib/setoranCalculations.ts` with all pure calculation functions
    - Implement `timeToMinutes(hhmm: string): number`
    - Implement `secondsToHHmmss(seconds: number): string`
    - Implement `secondsToHHmm(seconds: number): string`
    - Implement `computeStatus(durasiSeconds: number): DurasiStatus` with thresholds ≤1800 → Fast, 1801–3600 → Normal, >3600 → Slow
    - Implement `computeBulan(tanggal: string): string` returning Indonesian month + year
    - Implement `computeDerivedFields(tanggal, pulangKunjungan, setoranKasir): DerivedSetoranFields | null` — returns null when setoranKasir ≤ pulangKunjungan
    - Export `DerivedSetoranFields` interface
    - _Requirements: 2.2, 10.1, 10.2, 10.3, 10.5_

  - [x] 1.2 Write property test — Property 1: Durasi always positive for valid inputs
    - **Property 1: Durasi is always positive for any accepted record**
    - File: `src/lib/setoranCalculations.test.ts`
    - Use fast-check to assert `computeDerivedFields` returns `null` for all inputs where `setoranKasir ≤ pulangKunjungan`, and `durasiSeconds > 0` for all valid inputs
    - **Validates: Requirements 2.2, 10.1, 10.3**

  - [x] 1.3 Write property test — Property 2: Derived fields are internally consistent
    - **Property 2: Derived fields are internally consistent**
    - File: `src/lib/setoranCalculations.test.ts`
    - Use fast-check to assert `durasiSeconds === (setoranMinutes - pulangMinutes) * 60`, `durasi === secondsToHHmmss(durasiSeconds)`, `bulan === computeBulan(tanggal)`, `status === computeStatus(durasiSeconds)` for all valid random inputs
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.5**

  - [x] 1.4 Write property test — Property 3: Status thresholds are exhaustive and non-overlapping
    - **Property 3: Status thresholds are exhaustive and non-overlapping**
    - File: `src/lib/setoranCalculations.test.ts`
    - Use fast-check with `fc.integer({ min: 0, max: 100000 })` to verify `computeStatus` returns exactly one of Fast | Normal | Slow and boundary values (1800, 1801, 3600, 3601) map to the correct categories
    - **Validates: Requirements 10.1, 12.2**

  - [x] 1.5 Create `src/app/admin/setoran/types/crud.ts` with all CRUD-specific TypeScript interfaces
    - Export `SetoranFormValues`, `SetoranFormErrors`, `CrudModalMode`, `CrudModalState`
    - Export `SetoranWritePayload`, `SetoranDataResponse`, `SetoranSuccessResponse`, `SetoranErrorResponse`, `SetoranApiResponse`
    - Export `ToastVariant`, `ToastMessage`
    - Export `UseCrudOperationsReturn`
    - _Requirements: 12.2, 12.3_

- [x] 2. Implement server-side in-memory store
  - [x] 2.1 Create `src/lib/setoranStore.ts` with lazy-initialized module-level Map
    - Use a `_store: Map<string, SetoranRecord> | null` module variable
    - Implement `getStore()` that seeds from `setoranDataGenerator.generateSetoranData(300, 3)` on first call
    - Implement `setoranStore.getAll()`, `getById(id)`, `create(record)`, `update(id, record)`, `delete(id)` methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 2.2 Write property test — Property 6: Store operations are isolated
    - **Property 6: Store operations are isolated**
    - File: `src/lib/setoranStore.test.ts`
    - Use fast-check to assert that `delete(id)` and `update(id, payload)` do not mutate any record with a different id — check `getAll()` before and after for unchanged non-targeted records
    - **Validates: Requirements 7.3, 7.4, 14.2, 14.5**

  - [x] 2.3 Write unit tests for store CRUD operations
    - File: `src/lib/setoranStore.test.ts`
    - Test `getAll` returns seeded records array
    - Test `create` increases `getAll().length` by 1 and `getById` returns the new record
    - Test `update` replaces the targeted field and `getById` reflects the change
    - Test `delete` removes the record and `getById` returns undefined
    - Test `delete` returns false for unknown id
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Implement API route handlers
  - [x] 3.1 Create `src/app/api/setoran/route.ts` with GET and POST handlers
    - `GET /api/setoran`: call `setoranStore.getAll()`, sort by `tanggal` descending, return `{ data: SetoranRecord[] }` with `Cache-Control: no-store`
    - `POST /api/setoran`: parse body as `SetoranWritePayload`, validate all four fields (regex for date/time, non-empty namaSalesman), call `computeDerivedFields`, assign `crypto.randomUUID()` as id, call `setoranStore.create()`, return 201 `{ data: SetoranRecord }`
    - Return 400 `{ error, field? }` for validation failures
    - _Requirements: 7.1, 7.2, 7.5, 2.2, 10.5_

  - [x] 3.2 Create `src/app/api/setoran/[id]/route.ts` with PUT and DELETE handlers
    - `PUT /api/setoran/[id]`: validate payload same as POST, call `computeDerivedFields`, call `setoranStore.update()`, return 200 `{ data: SetoranRecord }` or 404 `{ error: "Record tidak ditemukan" }`
    - `DELETE /api/setoran/[id]`: call `setoranStore.delete(id)`, return 200 `{ success: true }` or 404 `{ error: "Record tidak ditemukan" }`
    - Set `Cache-Control: no-store` on all responses
    - _Requirements: 7.3, 7.4, 7.5, 14.2_

  - [x] 3.3 Write integration tests for GET and POST route handlers
    - File: `src/app/api/setoran/route.test.ts`
    - Test GET returns 200 with data array
    - Test POST with valid payload returns 201 and SetoranRecord with all derived fields
    - Test POST with `setoranKasir ≤ pulangKunjungan` returns 400 with `error` containing "lebih besar"
    - Test POST with missing fields returns 400
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 3.4 Write integration tests for PUT and DELETE route handlers
    - File: `src/app/api/setoran/[id]/route.test.ts`
    - Test PUT with valid id and payload returns 200 with updated SetoranRecord
    - Test PUT with unknown id returns 404
    - Test DELETE with valid id returns 200 `{ success: true }`
    - Test DELETE with unknown id returns 404
    - _Requirements: 7.3, 7.4, 7.5_

- [x] 4. Checkpoint — Ensure all calculation and API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build CRUD UI components
  - [x] 5.1 Create `src/app/admin/setoran/components/SetoranFormModal.tsx`
    - Accept props: `open`, `mode: CrudModalMode`, `record?: SetoranRecord`, `availableSalesman: string[]`, `saving: boolean`, `onSave(values: SetoranFormValues): Promise<void>`, `onClose(): void`
    - Manage local `values: SetoranFormValues`, `errors: SetoranFormErrors`, `derived: DerivedSetoranFields | null`, `submitting: boolean` state
    - Render fields: `<input type="date">` for Tanggal, `<input type="text" list="salesman-list">` + `<datalist>` for Nama Salesman, `<input type="time">` for Pulang Kunjungan and Setoran ke Kasir, read-only Durasi preview showing `derived.durasiDisplay` or "—"
    - `useEffect` watching `tanggal`, `pulangKunjungan`, `setoranKasir` to call `computeDerivedFields` and update `derived`
    - Validate on submit: all fields non-empty, `setoranKasir > pulangKunjungan`; show field-level errors
    - Disable Save button when `submitting || Object.keys(errors).length > 0 || !derived`
    - Pre-populate fields from `record` when `mode === "edit"`
    - Trap focus, close on Escape key and backdrop click, use framer-motion for enter/exit animation
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 10.2, 10.4, 11.1, 11.2, 11.3, 13.1_

  - [x] 5.2 Write component tests for SetoranFormModal
    - File: `src/app/admin/setoran/components/SetoranFormModal.test.tsx`
    - Test renders in create mode with empty fields
    - Test renders in edit mode with pre-populated values
    - Test Save button is disabled when fields are empty
    - Test Save button is disabled and error message shown when `setoranKasir ≤ pulangKunjungan`
    - Test Save button enables with valid inputs; Durasi preview updates
    - Test `onSave` called with correct `SetoranFormValues` on valid submit
    - Test `onClose` called on Escape key press
    - Test datalist contains expected salesman options
    - _Requirements: 1.3, 2.1, 2.4, 2.5, 10.4, 11.1_

  - [x] 5.3 Create `src/app/admin/setoran/components/DeleteConfirmDialog.tsx`
    - Accept props: `open`, `record: SetoranRecord | null`, `deleting: boolean`, `onConfirm(): Promise<void>`, `onClose(): void`
    - Display salesman name and formatted date from `record` (using `formatTanggal` from SetoranTable)
    - "Hapus" button disabled while `deleting === true`; "Batal" button calls `onClose`
    - Use framer-motion for enter/exit animation; close on Escape and backdrop click
    - _Requirements: 4.2, 4.3, 8.1, 9.4, 13.4_

  - [x] 5.4 Write component tests for DeleteConfirmDialog
    - File: `src/app/admin/setoran/components/DeleteConfirmDialog.test.tsx`
    - Test renders salesman name and formatted date from record
    - Test confirm button calls `onConfirm`
    - Test cancel button calls `onClose`
    - Test confirm button is disabled when `deleting === true`
    - _Requirements: 4.2, 4.3, 8.1_

  - [x] 5.5 Create `src/app/admin/setoran/components/ToastContainer.tsx`
    - Accept props: `toasts: ToastMessage[]`, `onDismiss(id: string): void`
    - Render toasts fixed at bottom-right (desktop) / bottom-center (mobile) using `position: fixed`
    - Use framer-motion `AnimatePresence` for animated enter/exit per toast
    - Auto-dismiss after 4000 ms using `useEffect` + `setTimeout` per toast; call `onDismiss`
    - Success variant: emerald-500 left border; Error variant: red-500 left border
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 9.3, 13.3_

- [x] 6. Implement useCrudOperations hook
  - [x] 6.1 Create `src/app/admin/setoran/hooks/useCrudOperations.ts`
    - Export `useCrudOperations(options: { onOptimisticUpdate, onRollback, onToast }): UseCrudOperationsReturn`
    - Maintain `creating`, `updating`, `deleting` boolean state flags
    - `createRecord(values)`: build optimistic `SetoranRecord` using `computeDerivedFields` + `crypto.randomUUID()`; call `onOptimisticUpdate`; `fetch POST /api/setoran`; on 201 replace optimistic record with server record; on error call `onRollback` and `onToast` with error message; return server record or null
    - `updateRecord(id, values)`: build optimistic record; call `onOptimisticUpdate`; `fetch PUT /api/setoran/${id}`; on 200 reconcile; on error rollback and toast; return updated record or null
    - `deleteRecord(id)`: call `onOptimisticUpdate` to remove record; `fetch DELETE /api/setoran/${id}`; on error rollback; dispatch appropriate toast on success and failure; return boolean
    - _Requirements: 5.1, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 14.1, 15.1_

  - [x] 6.2 Write property test — Property 4: Optimistic update followed by rollback is identity
    - **Property 4: Optimistic update followed by rollback is identity**
    - File: `src/app/admin/setoran/hooks/useCrudOperations.test.ts`
    - Use fast-check to assert that `length(rawData after create+rollback) === length(rawData before create)` for arbitrary initial dataset lengths and random new record payloads
    - **Validates: Requirements 5.1, 5.3, 14.1, 15.1**

  - [x] 6.3 Write unit tests for useCrudOperations hook
    - File: `src/app/admin/setoran/hooks/useCrudOperations.test.ts`
    - Test `createRecord` calls POST with correct payload body
    - Test `creating` flag is true during in-flight request, false after resolution
    - Test `deleteRecord` calls DELETE with correct id path
    - Test `createRecord` returns null and calls `onRollback` when API returns 400
    - Test `updateRecord` returns null and calls `onRollback` when API returns 404
    - _Requirements: 7.2, 7.4, 8.1, 14.1_

- [x] 7. Checkpoint — Ensure all component and hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Wire CRUD into SetoranTable and SetoranPage
  - [x] 8.1 Modify `src/app/admin/setoran/components/SetoranTable.tsx` to add Action Column
    - Add optional `onEdit?: (record: SetoranRecord) => void` and `onDelete?: (record: SetoranRecord) => void` props to `SetoranTableProps`
    - Append "Aksi" column to `TABLE_COLUMNS` array — only render when `onEdit || onDelete` are provided
    - In each data row, render an Action cell with `Pencil` icon button (`onClick={() => onEdit?.(record)}`) and `Trash2` icon button (`onClick={() => onDelete?.(record)`) from lucide-react
    - Update `colSpan` in `SkeletonRow` and `EmptyState` from 5 to 6 when action callbacks are present
    - Action buttons follow Wings Group icon button styling: `p-1.5 rounded-lg hover:bg-[#F3F4F6]` with emerald hover for edit and red hover for delete
    - _Requirements: 3.1, 4.1, 9.2, 13.2_

  - [x] 8.2 Modify `src/app/admin/setoran/page.tsx` to integrate all CRUD state and components
    - Add `modalState: CrudModalState`, `deleteTarget: SetoranRecord | null`, `toasts: ToastMessage[]` state
    - Wire `useCrudOperations` with `onOptimisticUpdate` and `onRollback` callbacks that update `rawData` via `setRawData`
    - Add `addToast` helper that appends to `toasts` array with `crypto.randomUUID()` id
    - Add "+ Tambah Setoran" `<button>` in the header actions area (right of "Refresh Data") with `Plus` icon from lucide-react; opens `SetoranFormModal` in create mode
    - Implement `handleEdit(record)` → opens modal in edit mode; `handleDelete(record)` → sets deleteTarget
    - Implement `handleSave(values)` → calls `createRecord` or `updateRecord` based on `modalState.mode`, shows success/error toast, closes modal on success
    - Implement `handleConfirmDelete()` → calls `deleteRecord(deleteTarget.id)`, shows toast, clears deleteTarget
    - Pass `onEdit={handleEdit}` and `onDelete={handleDelete}` to `SetoranTable`
    - Render `<SetoranFormModal>`, `<DeleteConfirmDialog>`, `<ToastContainer>` at the bottom of the JSX tree
    - _Requirements: 1.1, 1.2, 3.2, 3.4, 3.5, 4.4, 4.5, 5.1, 5.2, 5.3, 6.4, 8.2, 8.3, 8.4, 15.2_

  - [x] 8.3 Write property test — Property 5: Total Setoran KPI equals filteredData.length
    - **Property 5: Total Setoran KPI equals filteredData.length**
    - File: `src/lib/setoranCalculations.test.ts` (or a dedicated KPI test file)
    - Use fast-check with arbitrary arrays of SetoranRecord to assert `calculateKPIs(filteredData).totalRecords === filteredData.length`
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 9. Final checkpoint — Full integration and build verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` and confirm zero TypeScript compilation errors
  - Verify ESLint passes with no warnings on new CRUD-related files
  - _Requirements: 12.1, 12.4, 12.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Properties 1–6 in the design document drive all PBT sub-tasks; each PBT task explicitly cites its property number
- The `setoranStore` uses lazy initialization — `_store` is reset between test runs by mocking the module or calling a reset helper exposed for tests
- The Action Column in `SetoranTable` is backward-compatible: if `onEdit` and `onDelete` are both undefined, the column is hidden and `colSpan` stays at 5
- All four API route handlers use `Cache-Control: no-store` because the in-memory store is mutable
- `computeDerivedFields` is the single source of truth for derived field calculation shared between client (live Durasi preview) and server (API route handlers), satisfying Requirement 10.5
- Toast auto-dismiss fires after 4000 ms; error toasts require manual dismiss to ensure the user sees the message

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.5"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.1", "5.3", "5.5", "6.1"] },
    { "id": 4, "tasks": ["5.2", "5.4", "6.2", "6.3"] },
    { "id": 5, "tasks": ["8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3"] }
  ]
}
```
