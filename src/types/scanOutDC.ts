/**
 * Scan Out DC — Shared Type Definitions
 */

// ─── Core types ───────────────────────────────────────────────────────────────

export type ScanStatus = "Completed" | "Pending" | "Failed" | "Processing";

export interface ScanOutRecord {
    id: string;
    tanggal: string;           // "2025-06-28"
    jam: string;               // "06:10"
    nomorFO: string;
    nomorDO: string;
    nomorPolisi: string;
    distributionCenter: string;
    driver: string;
    totalBox: number;
    scanner: string;           // device / operator device
    operator: string;
    status: ScanStatus;
    // Timeline ISO datetimes
    foCreated: string;
    loading: string;
    scanning: string;
    completed: string;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface KPISummary {
    totalScanOut: number;
    completedScan: number;
    pendingScan: number;
    failedScan: number;
    completedPct: number;
    pendingPct: number;
    failedPct: number;
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface HourlyScanItem {
    jam: string;       // "06:00"
    total: number;
}

export interface DCItem {
    dc: string;
    total: number;
}

export interface SuccessRateItem {
    name: string;
    value: number;
    color: string;
}

export interface DailyTrendItem {
    tanggal: string;
    avgJamScanOut: number; // decimal hours, e.g. 7.94 = 07:56
}

// ─── Activity timeline ────────────────────────────────────────────────────────

export interface ActivityItem {
    id: string;
    time: string;        // "06:15"
    nomorFO: string;
    dc: string;
    operator: string;
    status: ScanStatus;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type ScanOutSortKey = keyof Pick<
    ScanOutRecord,
    "tanggal" | "jam" | "nomorFO" | "nomorDO" | "nomorPolisi" | "distributionCenter" | "totalBox" | "status"
>;

export interface ScanOutSort {
    key: ScanOutSortKey;
    direction: "asc" | "desc";
}
