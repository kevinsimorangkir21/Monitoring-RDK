/**
 * Report Daily Transport — TypeScript interfaces
 *
 * Refactored: 3 tab (Transport | Warehouse FG | Warehouse BS),
 * CRUD dengan field Division, Jenis Report, Keterangan, Informasi Tambahan.
 */

import type { ReportDailyTab } from "@/types/reportDaily";

// ─── Re-export shared tab type ────────────────────────────────────────────────

export type { ReportDailyTab };

// ─── Division union ───────────────────────────────────────────────────────────

export type DivisionType = "Transport" | "Warehouse FG" | "Warehouse BS";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface TransportRecord {
    id: string;
    tanggal: string;              // "YYYY-MM-DD"
    division: DivisionType;
    jenisReport: string;
    keterangan: string;           // Keterangan / Value
    informasiTambahan: string;
}

// ─── Form values (all strings — parsed on save) ───────────────────────────────

export interface TransportFormValues {
    tanggal: string;
    division: string;
    jenisReport: string;
    keterangan: string;
    informasiTambahan: string;
}

export type TransportFormErrors = Partial<Record<keyof TransportFormValues, string>>;

// ─── CRUD modal ───────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: TransportRecord;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
