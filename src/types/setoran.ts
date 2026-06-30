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
    dateFrom: string;   // "YYYY-MM-DD" or ""
    dateTo: string;     // "YYYY-MM-DD" or ""
}

// ─── Chart types — derived from filtered records ──────────────────────────────

export interface DailyAverageItem {
    tanggal: string;        // "YYYY-MM-DD"
    tanggalLabel: string;   // "28 Jun"
    avgMinutes: number;     // average duration in minutes (rounded to 1 dp)
}

export interface SalesmanAvgItem {
    salesman: string;
    avgMinutes: number;
    durasiFormatted: string;  // "mm:ss" or "H:mm:ss"
}

export interface DistribusiItem {
    label: string;
    value: number;
    color: string;
    pct: number;
}
