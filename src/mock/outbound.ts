/**
 * Outbound Monitoring — Mock Data
 * Replace with real API calls when backend is ready.
 * Reflects business terminology from original HTML dashboard.
 */

import type {
    OutboundRecord,
    StatusFOItem,
    KlasifikasiStatusFOItem,
    TypeFOItem,
    GroupingTimeItem,
    GroupingTimeSTWItem,
} from "@/types/outbound";

// ─── Summary KPIs ─────────────────────────────────────────────────────────────

export const OUTBOUND_SUMMARY = {
    totalMobilMuat: 312,
    muatInap: { percent: 18.3, count: 57 },
    muatPagi: { percent: 47.4, count: 148 },
    rit2: { percent: 34.3, count: 107 },
} as const;

// ─── Chart 1 — Klasifikasi Status FO (full-width bar) ────────────────────────

export const statusFOData: StatusFOItem[] = [
    { status: "Siap Muat", jumlah: 54 },
    { status: "Muat Proses", jumlah: 87 },
    { status: "Muat Selesai", jumlah: 103 },
    { status: "Berangkat", jumlah: 46 },
    { status: "Inap", jumlah: 22 },
];

// ─── Chart 1b — Klasifikasi Status FO per hari (ComposedChart) ───────────────

export const klasifikasiStatusFOData: KlasifikasiStatusFOItem[] = [
    { tanggal: "18 Jun", draft: 4, released: 14, loading: 6, completed: 12, cancelled: 1, totalFO: 37 },
    { tanggal: "19 Jun", draft: 3, released: 16, loading: 5, completed: 13, cancelled: 0, totalFO: 37 },
    { tanggal: "20 Jun", draft: 5, released: 18, loading: 7, completed: 15, cancelled: 1, totalFO: 46 },
    { tanggal: "21 Jun", draft: 2, released: 12, loading: 4, completed: 10, cancelled: 2, totalFO: 30 },
    { tanggal: "22 Jun", draft: 4, released: 15, loading: 5, completed: 11, cancelled: 1, totalFO: 36 },
    { tanggal: "23 Jun", draft: 3, released: 17, loading: 6, completed: 14, cancelled: 0, totalFO: 40 },
    { tanggal: "24 Jun", draft: 3, released: 18, loading: 5, completed: 14, cancelled: 1, totalFO: 41 },
    { tanggal: "25 Jun", draft: 5, released: 20, loading: 8, completed: 16, cancelled: 2, totalFO: 51 },
    { tanggal: "26 Jun", draft: 2, released: 13, loading: 4, completed: 11, cancelled: 0, totalFO: 30 },
    { tanggal: "27 Jun", draft: 4, released: 19, loading: 7, completed: 15, cancelled: 1, totalFO: 46 },
];

// ─── Chart 2 — Persebaran Type FO (bar chart) ─────────────────────────────────

export const typeFOData: TypeFOItem[] = [
    { type: "S1", jumlah: 92 },
    { type: "S2", jumlah: 138 },
    { type: "S3", jumlah: 57 },
    { type: "S4", jumlah: 25 },
];

// ─── Chart 3 — Grouping Time STW (donut chart) ────────────────────────────────

export const groupingTimeData: GroupingTimeItem[] = [
    { label: "< 1 Jam", value: 38, color: "#16A34A" },
    { label: "1–2 Jam", value: 29, color: "#2563EB" },
    { label: "2–4 Jam", value: 21, color: "#F59E0B" },
    { label: "> 4 Jam", value: 12, color: "#DC2626" },
];

// ─── Chart 3b — Grouping Time STW per interval (BarChart) ────────────────────

export const groupingTimeSTWData: GroupingTimeSTWItem[] = [
    { interval: "00:00 - 05:59", jumlahFO: 14 },
    { interval: "06:00 - 10:59", jumlahFO: 72 },
    { interval: "11:00 - 15:59", jumlahFO: 160 },
    { interval: "16:00 - 20:59", jumlahFO: 388 },
    { interval: "21:00 - 23:59", jumlahFO: 236 },
];

// ─── Filter option lists ──────────────────────────────────────────────────────

export const GATE_OPTIONS = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];
export const STYPE_OPTIONS = ["S1", "S2", "S3", "S4"] as const;
export const STATUS_OPTIONS = [
    "Siap Muat",
    "Muat Proses",
    "Muat Selesai",
    "Berangkat",
    "Inap",
] as const;

// ─── Outbound Records ─────────────────────────────────────────────────────────

export const outboundRecords: OutboundRecord[] = [
    { id: "OB-001", tanggal: "2025-06-28", freightOrder: "FO-OUT-3401", mobilMuat: "B 2345 KAL", sType: "S2", status: "Muat Selesai", jamTerima: "2025-06-28T05:30:00", gate: "Gate 1", plant: "PASM", driver: "Andi Pratama", totalKoli: 420, totalBerat: 8400 },
    { id: "OB-002", tanggal: "2025-06-28", freightOrder: "FO-OUT-3402", mobilMuat: "D 6789 MBR", sType: "S1", status: "Berangkat", jamTerima: "2025-06-28T05:45:00", gate: "Gate 2", plant: "IMSM", driver: "Basuki Wibowo", totalKoli: 380, totalBerat: 7600 },
    { id: "OB-003", tanggal: "2025-06-28", freightOrder: "FO-OUT-3403", mobilMuat: "F 1234 NCP", sType: "S2", status: "Muat Proses", jamTerima: "2025-06-28T06:00:00", gate: "Gate 1", plant: "U2", driver: "Cahyo Santoso", totalKoli: 510, totalBerat: 10200 },
    { id: "OB-004", tanggal: "2025-06-28", freightOrder: "FO-OUT-3404", mobilMuat: "H 4567 PDQ", sType: "S3", status: "Siap Muat", jamTerima: "2025-06-28T06:15:00", gate: "Gate 3", plant: "LION", driver: "Dedi Gunawan", totalKoli: 290, totalBerat: 5800 },
    { id: "OB-005", tanggal: "2025-06-28", freightOrder: "FO-OUT-3405", mobilMuat: "B 8901 RST", sType: "S1", status: "Muat Selesai", jamTerima: "2025-06-28T06:30:00", gate: "Gate 2", plant: "PASM", driver: "Eko Hermawan", totalKoli: 460, totalBerat: 9200 },
    { id: "OB-006", tanggal: "2025-06-28", freightOrder: "FO-OUT-3406", mobilMuat: "D 2345 UVW", sType: "S4", status: "Inap", jamTerima: "2025-06-27T22:10:00", gate: "Gate 4", plant: "TASE", driver: "Farid Rahmat", totalKoli: 200, totalBerat: 4000 },
    { id: "OB-007", tanggal: "2025-06-28", freightOrder: "FO-OUT-3407", mobilMuat: "F 6789 XYZ", sType: "S2", status: "Berangkat", jamTerima: "2025-06-28T07:00:00", gate: "Gate 1", plant: "IMSM", driver: "Guntur Prayoga", totalKoli: 395, totalBerat: 7900 },
    { id: "OB-008", tanggal: "2025-06-28", freightOrder: "FO-OUT-3408", mobilMuat: "H 3456 ABD", sType: "S3", status: "Muat Proses", jamTerima: "2025-06-28T07:15:00", gate: "Gate 3", plant: "U2", driver: "Hendra Kusuma", totalKoli: 330, totalBerat: 6600 },
    { id: "OB-009", tanggal: "2025-06-28", freightOrder: "FO-OUT-3409", mobilMuat: "B 7890 CEF", sType: "S1", status: "Siap Muat", jamTerima: "2025-06-28T07:30:00", gate: "Gate 2", plant: "PASM", driver: "Irfan Syah", totalKoli: 470, totalBerat: 9400 },
    { id: "OB-010", tanggal: "2025-06-28", freightOrder: "FO-OUT-3410", mobilMuat: "D 1234 GHI", sType: "S2", status: "Muat Selesai", jamTerima: "2025-06-28T07:45:00", gate: "Gate 1", plant: "LION", driver: "Joko Mulyadi", totalKoli: 415, totalBerat: 8300 },
    { id: "OB-011", tanggal: "2025-06-28", freightOrder: "FO-OUT-3411", mobilMuat: "F 5678 JKL", sType: "S4", status: "Inap", jamTerima: "2025-06-27T23:00:00", gate: "Gate 4", plant: "TASE", driver: "Kurniawan Agus", totalKoli: 185, totalBerat: 3700 },
    { id: "OB-012", tanggal: "2025-06-28", freightOrder: "FO-OUT-3412", mobilMuat: "H 9012 MNO", sType: "S2", status: "Berangkat", jamTerima: "2025-06-28T08:00:00", gate: "Gate 2", plant: "IMSM", driver: "Luthfi Anwar", totalKoli: 360, totalBerat: 7200 },
    { id: "OB-013", tanggal: "2025-06-28", freightOrder: "FO-OUT-3413", mobilMuat: "B 3456 PQR", sType: "S1", status: "Muat Proses", jamTerima: "2025-06-28T08:15:00", gate: "Gate 1", plant: "U2", driver: "Muhamad Reza", totalKoli: 500, totalBerat: 10000 },
    { id: "OB-014", tanggal: "2025-06-28", freightOrder: "FO-OUT-3414", mobilMuat: "D 7890 STU", sType: "S3", status: "Siap Muat", jamTerima: "2025-06-28T08:30:00", gate: "Gate 3", plant: "PASM", driver: "Nanang Hidayat", totalKoli: 275, totalBerat: 5500 },
    { id: "OB-015", tanggal: "2025-06-28", freightOrder: "FO-OUT-3415", mobilMuat: "F 2345 VWX", sType: "S2", status: "Muat Selesai", jamTerima: "2025-06-28T08:45:00", gate: "Gate 2", plant: "LION", driver: "Oki Setiawan", totalKoli: 430, totalBerat: 8600 },
];
