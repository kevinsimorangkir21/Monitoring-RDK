/**
 * Scan Out DC — TypeScript interfaces (new CRUD-based module)
 */

// ─── Core record ──────────────────────────────────────────────────────────────

export interface ScanOutEntry {
    id: string;
    tanggal: string;     // "YYYY-MM-DD"
    nopol: string;       // "B 9077 UXX"
    vendor: string;      // "Balrich" | "Majur" | "GTU" | ...
    jamScanOut: string;  // "HH:mm"
    jamScanIn: string;   // "HH:mm"
    leadTime: string;    // "HH:mm" — dihitung otomatis
}

// ─── Form values ──────────────────────────────────────────────────────────────

export interface ScanOutFormValues {
    tanggal: string;
    nopol: string;
    vendor: string;
    jamScanOut: string;
    jamScanIn: string;
}

export type ScanOutFormErrors = Partial<Record<keyof ScanOutFormValues, string>>;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: ScanOutEntry;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}

// ─── Chart aggregates ─────────────────────────────────────────────────────────

export interface TrendPoint {
    tanggal: string;
    avgScanOut: number;  // decimal hours
    avgScanIn: number;   // decimal hours
}

export interface VendorAvgPoint {
    vendor: string;
    avgScanOut: number;  // decimal hours
}

export interface ArmadaPoint {
    nopol: string;
    avgScanOut: number;  // decimal hours
}
