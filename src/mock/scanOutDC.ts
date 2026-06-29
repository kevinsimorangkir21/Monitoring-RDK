/**
 * Scan Out DC — Mock Data
 */

import type {
    ScanOutRecord, KPISummary,
    HourlyScanItem, DCItem,
    SuccessRateItem, DailyTrendItem, ActivityItem,
} from "@/types/scanOutDC";

// ─── KPI ─────────────────────────────────────────────────────────────────────

export const KPI: KPISummary = {
    totalScanOut: 847,
    completedScan: 712,
    pendingScan: 98,
    failedScan: 37,
    completedPct: 84.1,
    pendingPct: 11.6,
    failedPct: 4.3,
};

// ─── Chart: Scan Out per Hour ──────────────────────────────────────────────────

export const hourlyScanData: HourlyScanItem[] = [
    { jam: "05:00", total: 12 },
    { jam: "06:00", total: 48 },
    { jam: "07:00", total: 95 },
    { jam: "08:00", total: 128 },
    { jam: "09:00", total: 110 },
    { jam: "10:00", total: 87 },
    { jam: "11:00", total: 63 },
    { jam: "12:00", total: 42 },
    { jam: "13:00", total: 70 },
    { jam: "14:00", total: 98 },
    { jam: "15:00", total: 75 },
    { jam: "16:00", total: 29 },
];

// ─── Chart: Scan Out by DC ────────────────────────────────────────────────────

export const dcData: DCItem[] = [
    { dc: "DC Jakarta", total: 234 },
    { dc: "DC Surabaya", total: 187 },
    { dc: "DC Bandung", total: 156 },
    { dc: "DC Semarang", total: 142 },
    { dc: "DC Medan", total: 128 },
];

// ─── Chart: Success vs Failed ─────────────────────────────────────────────────

export const successRateData: SuccessRateItem[] = [
    { name: "Completed", value: 84, color: "#16A34A" },
    { name: "Pending", value: 12, color: "#F59E0B" },
    { name: "Failed", value: 4, color: "#DC2626" },
];

// ─── Chart: Daily Trend ───────────────────────────────────────────────────────

export const dailyTrendData: DailyTrendItem[] = [
    { tanggal: "20 Jun", total: 620 },
    { tanggal: "21 Jun", total: 780 },
    { tanggal: "22 Jun", total: 710 },
    { tanggal: "23 Jun", total: 850 },
    { tanggal: "24 Jun", total: 920 },
    { tanggal: "25 Jun", total: 680 },
    { tanggal: "26 Jun", total: 847 },
];

// ─── Activity Timeline ────────────────────────────────────────────────────────

export const activityData: ActivityItem[] = [
    { id: "ACT-001", time: "16:42", nomorFO: "FO-2025-0901", dc: "DC Jakarta", operator: "Budi R.", status: "Completed" },
    { id: "ACT-002", time: "16:38", nomorFO: "FO-2025-0900", dc: "DC Surabaya", operator: "Andi P.", status: "Processing" },
    { id: "ACT-003", time: "16:31", nomorFO: "FO-2025-0899", dc: "DC Bandung", operator: "Reni S.", status: "Failed" },
    { id: "ACT-004", time: "16:24", nomorFO: "FO-2025-0898", dc: "DC Jakarta", operator: "Dewa K.", status: "Completed" },
    { id: "ACT-005", time: "16:18", nomorFO: "FO-2025-0897", dc: "DC Semarang", operator: "Putri W.", status: "Pending" },
    { id: "ACT-006", time: "16:10", nomorFO: "FO-2025-0896", dc: "DC Medan", operator: "Hendra L.", status: "Completed" },
];

// ─── Scan Out Records ─────────────────────────────────────────────────────────

export const scanOutRecords: ScanOutRecord[] = [
    { id: "SC-001", tanggal: "2025-06-28", jam: "06:10", nomorFO: "FO-2025-0841", nomorDO: "DO-2025-1201", nomorPolisi: "B 2345 KAL", distributionCenter: "DC Jakarta", driver: "Andi Pratama", totalBox: 420, scanner: "SCAN-01", operator: "Budi R.", status: "Completed", foCreated: "2025-06-28T05:30:00", loading: "2025-06-28T05:50:00", scanning: "2025-06-28T06:05:00", completed: "2025-06-28T06:25:00" },
    { id: "SC-002", tanggal: "2025-06-28", jam: "06:35", nomorFO: "FO-2025-0842", nomorDO: "DO-2025-1202", nomorPolisi: "D 6789 MBR", distributionCenter: "DC Surabaya", driver: "Basuki Wibowo", totalBox: 380, scanner: "SCAN-02", operator: "Andi P.", status: "Completed", foCreated: "2025-06-28T05:45:00", loading: "2025-06-28T06:10:00", scanning: "2025-06-28T06:28:00", completed: "2025-06-28T06:45:00" },
    { id: "SC-003", tanggal: "2025-06-28", jam: "07:00", nomorFO: "FO-2025-0843", nomorDO: "DO-2025-1203", nomorPolisi: "F 1234 NCP", distributionCenter: "DC Bandung", driver: "Cahyo Santoso", totalBox: 510, scanner: "SCAN-01", operator: "Reni S.", status: "Processing", foCreated: "2025-06-28T06:00:00", loading: "2025-06-28T06:40:00", scanning: "2025-06-28T06:55:00", completed: "2025-06-28T07:20:00" },
    { id: "SC-004", tanggal: "2025-06-28", jam: "07:22", nomorFO: "FO-2025-0844", nomorDO: "DO-2025-1204", nomorPolisi: "H 4567 PDQ", distributionCenter: "DC Semarang", driver: "Dedi Gunawan", totalBox: 290, scanner: "SCAN-03", operator: "Dewa K.", status: "Pending", foCreated: "2025-06-28T06:15:00", loading: "2025-06-28T07:00:00", scanning: "2025-06-28T07:18:00", completed: "2025-06-28T07:40:00" },
    { id: "SC-005", tanggal: "2025-06-28", jam: "07:45", nomorFO: "FO-2025-0845", nomorDO: "DO-2025-1205", nomorPolisi: "B 8901 RST", distributionCenter: "DC Jakarta", driver: "Eko Hermawan", totalBox: 460, scanner: "SCAN-02", operator: "Putri W.", status: "Completed", foCreated: "2025-06-28T06:30:00", loading: "2025-06-28T07:20:00", scanning: "2025-06-28T07:38:00", completed: "2025-06-28T07:58:00" },
    { id: "SC-006", tanggal: "2025-06-28", jam: "08:10", nomorFO: "FO-2025-0846", nomorDO: "DO-2025-1206", nomorPolisi: "D 2345 UVW", distributionCenter: "DC Medan", driver: "Farid Rahmat", totalBox: 200, scanner: "SCAN-04", operator: "Hendra L.", status: "Failed", foCreated: "2025-06-28T07:00:00", loading: "2025-06-28T07:50:00", scanning: "2025-06-28T08:05:00", completed: "2025-06-28T08:25:00" },
    { id: "SC-007", tanggal: "2025-06-28", jam: "08:32", nomorFO: "FO-2025-0847", nomorDO: "DO-2025-1207", nomorPolisi: "F 6789 XYZ", distributionCenter: "DC Surabaya", driver: "Guntur P.", totalBox: 395, scanner: "SCAN-01", operator: "Budi R.", status: "Completed", foCreated: "2025-06-28T07:30:00", loading: "2025-06-28T08:10:00", scanning: "2025-06-28T08:25:00", completed: "2025-06-28T08:45:00" },
    { id: "SC-008", tanggal: "2025-06-28", jam: "08:55", nomorFO: "FO-2025-0848", nomorDO: "DO-2025-1208", nomorPolisi: "H 3456 ABD", distributionCenter: "DC Bandung", driver: "Hendra Kusuma", totalBox: 330, scanner: "SCAN-03", operator: "Andi P.", status: "Pending", foCreated: "2025-06-28T07:45:00", loading: "2025-06-28T08:30:00", scanning: "2025-06-28T08:48:00", completed: "2025-06-28T09:10:00" },
    { id: "SC-009", tanggal: "2025-06-28", jam: "09:15", nomorFO: "FO-2025-0849", nomorDO: "DO-2025-1209", nomorPolisi: "B 7890 CEF", distributionCenter: "DC Jakarta", driver: "Irfan Syah", totalBox: 470, scanner: "SCAN-02", operator: "Reni S.", status: "Completed", foCreated: "2025-06-28T08:00:00", loading: "2025-06-28T08:55:00", scanning: "2025-06-28T09:08:00", completed: "2025-06-28T09:28:00" },
    { id: "SC-010", tanggal: "2025-06-28", jam: "09:40", nomorFO: "FO-2025-0850", nomorDO: "DO-2025-1210", nomorPolisi: "D 1234 GHI", distributionCenter: "DC Semarang", driver: "Joko Mulyadi", totalBox: 415, scanner: "SCAN-04", operator: "Dewa K.", status: "Completed", foCreated: "2025-06-28T08:30:00", loading: "2025-06-28T09:20:00", scanning: "2025-06-28T09:33:00", completed: "2025-06-28T09:55:00" },
    { id: "SC-011", tanggal: "2025-06-28", jam: "10:05", nomorFO: "FO-2025-0851", nomorDO: "DO-2025-1211", nomorPolisi: "F 5678 JKL", distributionCenter: "DC Medan", driver: "Kurniawan A.", totalBox: 185, scanner: "SCAN-01", operator: "Putri W.", status: "Failed", foCreated: "2025-06-28T09:00:00", loading: "2025-06-28T09:45:00", scanning: "2025-06-28T10:00:00", completed: "2025-06-28T10:20:00" },
    { id: "SC-012", tanggal: "2025-06-28", jam: "10:28", nomorFO: "FO-2025-0852", nomorDO: "DO-2025-1212", nomorPolisi: "H 9012 MNO", distributionCenter: "DC Jakarta", driver: "Luthfi Anwar", totalBox: 360, scanner: "SCAN-02", operator: "Hendra L.", status: "Completed", foCreated: "2025-06-28T09:30:00", loading: "2025-06-28T10:05:00", scanning: "2025-06-28T10:20:00", completed: "2025-06-28T10:42:00" },
];

// ─── Filter option lists ──────────────────────────────────────────────────────

export const DC_OPTIONS = ["DC Jakarta", "DC Surabaya", "DC Bandung", "DC Semarang", "DC Medan"];
export const STATUS_OPTIONS = ["Completed", "Pending", "Failed", "Processing"] as const;
