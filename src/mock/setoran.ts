/**
 * Setoran ke Kasir — Mock Data
 */

import type {
    SetoranRecord,
    SetoranKPI,
    DurasiChartItem,
} from "@/types/setoran";

// ─── Helper ────────────────────────────────────────────────────────────────────

function fmtDurasi(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function status(s: number): SetoranRecord["status"] {
    if (s <= 1800) return "Fast";
    if (s <= 3600) return "Normal";
    return "Slow";
}

// ─── Raw records ──────────────────────────────────────────────────────────────

const RAW: Omit<SetoranRecord, "durasi" | "status">[] = [
    { id: "S-001", tanggal: "2025-06-28", bulan: "Juni 2025", namaSalesman: "Andi Wijaya", pulangKunjungan: "16:15", setoranKasir: "16:42", durasiSeconds: 1620, waktuPulang: "2025-06-28T16:15:00", waktuSetoran: "2025-06-28T16:42:00" },
    { id: "S-002", tanggal: "2025-06-28", bulan: "Juni 2025", namaSalesman: "Budi Santoso", pulangKunjungan: "16:30", setoranKasir: "17:45", durasiSeconds: 4500, waktuPulang: "2025-06-28T16:30:00", waktuSetoran: "2025-06-28T17:45:00" },
    { id: "S-003", tanggal: "2025-06-28", bulan: "Juni 2025", namaSalesman: "Cahyo Pramono", pulangKunjungan: "15:50", setoranKasir: "16:25", durasiSeconds: 2100, waktuPulang: "2025-06-28T15:50:00", waktuSetoran: "2025-06-28T16:25:00" },
    { id: "S-004", tanggal: "2025-06-28", bulan: "Juni 2025", namaSalesman: "Deni Kurniawan", pulangKunjungan: "16:00", setoranKasir: "17:20", durasiSeconds: 4800, waktuPulang: "2025-06-28T16:00:00", waktuSetoran: "2025-06-28T17:20:00" },
    { id: "S-005", tanggal: "2025-06-28", bulan: "Juni 2025", namaSalesman: "Eka Fitriani", pulangKunjungan: "16:45", setoranKasir: "17:00", durasiSeconds: 900, waktuPulang: "2025-06-28T16:45:00", waktuSetoran: "2025-06-28T17:00:00" },
    { id: "S-006", tanggal: "2025-06-27", bulan: "Juni 2025", namaSalesman: "Andi Wijaya", pulangKunjungan: "16:20", setoranKasir: "16:55", durasiSeconds: 2100, waktuPulang: "2025-06-27T16:20:00", waktuSetoran: "2025-06-27T16:55:00" },
    { id: "S-007", tanggal: "2025-06-27", bulan: "Juni 2025", namaSalesman: "Fahri Ramadan", pulangKunjungan: "16:05", setoranKasir: "18:10", durasiSeconds: 7500, waktuPulang: "2025-06-27T16:05:00", waktuSetoran: "2025-06-27T18:10:00" },
    { id: "S-008", tanggal: "2025-06-27", bulan: "Juni 2025", namaSalesman: "Gita Permata", pulangKunjungan: "15:45", setoranKasir: "16:10", durasiSeconds: 1500, waktuPulang: "2025-06-27T15:45:00", waktuSetoran: "2025-06-27T16:10:00" },
    { id: "S-009", tanggal: "2025-06-27", bulan: "Juni 2025", namaSalesman: "Budi Santoso", pulangKunjungan: "16:30", setoranKasir: "17:50", durasiSeconds: 4800, waktuPulang: "2025-06-27T16:30:00", waktuSetoran: "2025-06-27T17:50:00" },
    { id: "S-010", tanggal: "2025-06-27", bulan: "Juni 2025", namaSalesman: "Hendra Gunawan", pulangKunjungan: "16:00", setoranKasir: "16:18", durasiSeconds: 1080, waktuPulang: "2025-06-27T16:00:00", waktuSetoran: "2025-06-27T16:18:00" },
    { id: "S-011", tanggal: "2025-06-26", bulan: "Juni 2025", namaSalesman: "Cahyo Pramono", pulangKunjungan: "15:55", setoranKasir: "16:40", durasiSeconds: 2700, waktuPulang: "2025-06-26T15:55:00", waktuSetoran: "2025-06-26T16:40:00" },
    { id: "S-012", tanggal: "2025-06-26", bulan: "Juni 2025", namaSalesman: "Indra Prasetya", pulangKunjungan: "16:10", setoranKasir: "18:30", durasiSeconds: 8400, waktuPulang: "2025-06-26T16:10:00", waktuSetoran: "2025-06-26T18:30:00" },
    { id: "S-013", tanggal: "2025-06-26", bulan: "Juni 2025", namaSalesman: "Eka Fitriani", pulangKunjungan: "16:50", setoranKasir: "17:05", durasiSeconds: 900, waktuPulang: "2025-06-26T16:50:00", waktuSetoran: "2025-06-26T17:05:00" },
    { id: "S-014", tanggal: "2025-06-26", bulan: "Juni 2025", namaSalesman: "Deni Kurniawan", pulangKunjungan: "16:15", setoranKasir: "17:35", durasiSeconds: 4800, waktuPulang: "2025-06-26T16:15:00", waktuSetoran: "2025-06-26T17:35:00" },
    { id: "S-015", tanggal: "2025-06-25", bulan: "Juni 2025", namaSalesman: "Andi Wijaya", pulangKunjungan: "16:00", setoranKasir: "16:22", durasiSeconds: 1320, waktuPulang: "2025-06-25T16:00:00", waktuSetoran: "2025-06-25T16:22:00" },
    { id: "S-016", tanggal: "2025-06-25", bulan: "Juni 2025", namaSalesman: "Fahri Ramadan", pulangKunjungan: "15:40", setoranKasir: "17:55", durasiSeconds: 8100, waktuPulang: "2025-06-25T15:40:00", waktuSetoran: "2025-06-25T17:55:00" },
    { id: "S-017", tanggal: "2025-06-25", bulan: "Juni 2025", namaSalesman: "Gita Permata", pulangKunjungan: "16:20", setoranKasir: "16:38", durasiSeconds: 1080, waktuPulang: "2025-06-25T16:20:00", waktuSetoran: "2025-06-25T16:38:00" },
    { id: "S-018", tanggal: "2025-06-24", bulan: "Juni 2025", namaSalesman: "Joko Susilo", pulangKunjungan: "16:05", setoranKasir: "17:10", durasiSeconds: 3900, waktuPulang: "2025-06-24T16:05:00", waktuSetoran: "2025-06-24T17:10:00" },
    { id: "S-019", tanggal: "2025-06-24", bulan: "Juni 2025", namaSalesman: "Kevin Andrean", pulangKunjungan: "16:30", setoranKasir: "16:48", durasiSeconds: 1080, waktuPulang: "2025-06-24T16:30:00", waktuSetoran: "2025-06-24T16:48:00" },
    { id: "S-020", tanggal: "2025-06-24", bulan: "Juni 2025", namaSalesman: "Budi Santoso", pulangKunjungan: "16:00", setoranKasir: "18:05", durasiSeconds: 7500, waktuPulang: "2025-06-24T16:00:00", waktuSetoran: "2025-06-24T18:05:00" },
    { id: "S-021", tanggal: "2025-06-23", bulan: "Juni 2025", namaSalesman: "Andi Wijaya", pulangKunjungan: "16:10", setoranKasir: "16:32", durasiSeconds: 1320, waktuPulang: "2025-06-23T16:10:00", waktuSetoran: "2025-06-23T16:32:00" },
    { id: "S-022", tanggal: "2025-06-23", bulan: "Juni 2025", namaSalesman: "Indra Prasetya", pulangKunjungan: "15:55", setoranKasir: "17:45", durasiSeconds: 6600, waktuPulang: "2025-06-23T15:55:00", waktuSetoran: "2025-06-23T17:45:00" },
    { id: "S-023", tanggal: "2025-06-22", bulan: "Juni 2025", namaSalesman: "Eka Fitriani", pulangKunjungan: "16:40", setoranKasir: "16:52", durasiSeconds: 720, waktuPulang: "2025-06-22T16:40:00", waktuSetoran: "2025-06-22T16:52:00" },
    { id: "S-024", tanggal: "2025-06-22", bulan: "Juni 2025", namaSalesman: "Cahyo Pramono", pulangKunjungan: "16:00", setoranKasir: "17:20", durasiSeconds: 4800, waktuPulang: "2025-06-22T16:00:00", waktuSetoran: "2025-06-22T17:20:00" },
];

export const setoranRecords: SetoranRecord[] = RAW.map((r) => ({
    ...r,
    durasi: fmtDurasi(r.durasiSeconds),
    status: status(r.durasiSeconds),
}));

// ─── KPI ─────────────────────────────────────────────────────────────────────

const totalSeconds = setoranRecords.reduce((s, r) => s + r.durasiSeconds, 0);
const avgSeconds = Math.round(totalSeconds / setoranRecords.length);

const sorted = [...setoranRecords].sort((a, b) => a.durasiSeconds - b.durasiSeconds);

export const KPI: SetoranKPI = {
    avgDurasiSeconds: avgSeconds,
    avgDurasi: fmtDurasi(avgSeconds),
    prevAvgDurasi: fmtDurasi(avgSeconds - 420),
    longestRecord: sorted[sorted.length - 1],
    fastestRecord: sorted[0],
};

// ─── Chart: Top 5 Terlama ─────────────────────────────────────────────────────

export const longestChartData: DurasiChartItem[] = [...setoranRecords]
    .sort((a, b) => b.durasiSeconds - a.durasiSeconds)
    .slice(0, 5)
    .map((r) => ({
        salesman: r.namaSalesman,
        durasiMinutes: +(r.durasiSeconds / 60).toFixed(1),
        durasi: r.durasi,
    }));

// ─── Chart: Top 5 Tercepat ────────────────────────────────────────────────────

export const fastestChartData: DurasiChartItem[] = [...setoranRecords]
    .sort((a, b) => a.durasiSeconds - b.durasiSeconds)
    .slice(0, 5)
    .map((r) => ({
        salesman: r.namaSalesman,
        durasiMinutes: +(r.durasiSeconds / 60).toFixed(1),
        durasi: r.durasi,
    }));

// ─── Filter options ───────────────────────────────────────────────────────────

export const BULAN_OPTIONS = ["Juni 2025", "Mei 2025", "April 2025"];

export const TANGGAL_OPTIONS = [
    ...new Set(setoranRecords.map((r) => r.tanggal)),
].sort((a, b) => b.localeCompare(a));
