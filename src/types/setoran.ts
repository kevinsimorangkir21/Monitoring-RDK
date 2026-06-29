/**
 * Setoran ke Kasir — Shared Type Definitions
 */

// ─── Duration status ──────────────────────────────────────────────────────────

export type DurasiStatus = "Fast" | "Normal" | "Slow";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface SetoranRecord {
    id: string;
    tanggal: string;           // "2025-06-28"
    bulan: string;             // "Juni 2025"
    namaSalesman: string;
    pulangKunjungan: string;   // "HH:mm" e.g. "16:30"
    setoranKasir: string;      // "HH:mm" e.g. "17:05"
    durasiSeconds: number;     // total seconds
    durasi: string;            // "HH:mm:ss" formatted
    status: DurasiStatus;
    // Timeline ISO
    waktuPulang: string;       // ISO datetime
    waktuSetoran: string;      // ISO datetime
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface SetoranKPI {
    avgDurasiSeconds: number;
    avgDurasi: string;         // "HH:mm:ss"
    prevAvgDurasi: string;
    longestRecord: SetoranRecord;
    fastestRecord: SetoranRecord;
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface DurasiChartItem {
    salesman: string;
    durasiMinutes: number;
    durasi: string;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type SetoranSortKey = keyof Pick<
    SetoranRecord,
    "tanggal" | "namaSalesman" | "pulangKunjungan" | "setoranKasir" | "durasiSeconds" | "bulan"
>;

export interface SetoranSort {
    key: SetoranSortKey;
    direction: "asc" | "desc";
}

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface SetoranFilter {
    search: string;
    bulan: string;
    tanggal: string;
}
