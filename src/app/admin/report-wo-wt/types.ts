/**
 * Report WO-WT — TypeScript interfaces (self-contained module)
 *
 * Data structure mirrors the WO-WT Excel sheet:
 *   Tanggal | Wavepick | ZWP1 | ZWP2 | ZWP4 | ZWP5 | WO-WT Global (auto)
 */

// ─── Core record ──────────────────────────────────────────────────────────────

/** One row of WO-WT data as entered / stored */
export interface WoWtRecord {
    id: string;
    tanggal: string;   // "YYYY-MM-DD"
    wavepick: string;  // e.g. "WP-001"
    zwp1: number;
    zwp2: number;
    zwp4: number;
    zwp5: number;
    /** Auto-calculated: (zwp1 + zwp2 + zwp4 + zwp5) / 4 */
    woWtGlobal: number;
}

// ─── Form values ──────────────────────────────────────────────────────────────

/** Raw string values coming from the form inputs */
export interface WoWtFormValues {
    tanggal: string;
    wavepick: string;
    zwp1: string;
    zwp2: string;
    zwp4: string;
    zwp5: string;
}

/** Field-level validation errors keyed by WoWtFormValues key */
export type WoWtFormErrors = Partial<Record<keyof WoWtFormValues, string>>;

// ─── Modal state ──────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: WoWtRecord;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface WoWtFilters {
    dateRange: { startDate: string | null; endDate: string | null };
    selectedWavepick: string[];
    searchQuery: string;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface WoWtKPIs {
    averageGlobal: number;
    bestWavepick: { name: string; value: number } | null;
    worstWavepick: { name: string; value: number } | null;
    totalRecords: number;
}

// ─── Chart ───────────────────────────────────────────────────────────────────

export interface TrendDataPoint {
    tanggal: string;      // "YYYY-MM-DD"
    tanggalLabel: string; // "28 Jun"
    ZWP1: number;
    ZWP2: number;
    ZWP4: number;
    ZWP5: number;
    woWtGlobal: number;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
