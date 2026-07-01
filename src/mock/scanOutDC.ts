/**
 * Scan Out DC — Mock Data (dikosongkan)
 * Modul baru menggunakan local CRUD state di /admin/scan-out-dc/
 * File ini dipertahankan untuk kompatibilitas dengan komponen lama yang masih dipakai.
 */

import type {
    ScanOutRecord, KPISummary,
    HourlyScanItem, DCItem,
    SuccessRateItem, DailyTrendItem, ActivityItem,
} from "@/types/scanOutDC";

// ─── KPI ─────────────────────────────────────────────────────────────────────

export const KPI: KPISummary = {
    totalScanOut: 0,
    completedScan: 0,
    pendingScan: 0,
    failedScan: 0,
    completedPct: 0,
    pendingPct: 0,
    failedPct: 0,
};

// ─── Charts (kosong) ──────────────────────────────────────────────────────────

export const hourlyScanData: HourlyScanItem[] = [];
export const dcData: DCItem[] = [];
export const successRateData: SuccessRateItem[] = [];
export const dailyTrendData: DailyTrendItem[] = [];
export const activityData: ActivityItem[] = [];
export const scanOutRecords: ScanOutRecord[] = [];

// ─── Filter options ───────────────────────────────────────────────────────────

export const DC_OPTIONS: string[] = [];
export const STATUS_OPTIONS = ["Completed", "Pending", "Failed", "Processing"] as const;
