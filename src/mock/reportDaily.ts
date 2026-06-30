/**
 * Report Daily — Mock Data
 * Matches the three-tab structure from the original HTML dashboard.
 */

import type {
    DailyRecord,
    GantunganItem,
    JamPulangItem,
    JamPulangPickingItem,
    BadStockItem,
    StockOnHandItem,
} from "@/types/reportDaily";

// ─── Transport: Gantungan Volume vs Count Delivery ───────────────────────────

export const gantunganData: GantunganItem[] = [
    { tanggal: "20 Jun", volume: 420, countDO: 38 },
    { tanggal: "21 Jun", volume: 510, countDO: 47 },
    { tanggal: "22 Jun", volume: 380, countDO: 32 },
    { tanggal: "23 Jun", volume: 640, countDO: 55 },
    { tanggal: "24 Jun", volume: 590, countDO: 51 },
    { tanggal: "25 Jun", volume: 310, countDO: 28 },
    { tanggal: "26 Jun", volume: 480, countDO: 43 },
];

// ─── Warehouse FG: Jam Pulang vs Qty Picking ─────────────────────────────────

export const jamPulangData: JamPulangItem[] = [
    { tanggal: "20 Jun", jamPulang: 17.0, qtyPicking: 8200 },
    { tanggal: "21 Jun", jamPulang: 18.5, qtyPicking: 9800 },
    { tanggal: "22 Jun", jamPulang: 16.5, qtyPicking: 7600 },
    { tanggal: "23 Jun", jamPulang: 19.0, qtyPicking: 11200 },
    { tanggal: "24 Jun", jamPulang: 18.0, qtyPicking: 10400 },
    { tanggal: "25 Jun", jamPulang: 15.5, qtyPicking: 6800 },
    { tanggal: "26 Jun", jamPulang: 17.5, qtyPicking: 9300 },
];

// ─── Warehouse FG: Jam Pulang vs Qty Picking (stacked: box + pcs) ─────────────

export const jamPulangPickingData: JamPulangPickingItem[] = [
    { tanggal: "2026-05-19", qtyPickingBox: 26400, qtyPickingPcs: 3100, jamPulang: 16.0 },
    { tanggal: "2026-05-21", qtyPickingBox: 29000, qtyPickingPcs: 2500, jamPulang: 16.5 },
    { tanggal: "2026-05-22", qtyPickingBox: 31200, qtyPickingPcs: 3800, jamPulang: 17.25 },
    { tanggal: "2026-05-25", qtyPickingBox: 27800, qtyPickingPcs: 2900, jamPulang: 16.0 },
    { tanggal: "2026-05-26", qtyPickingBox: 33500, qtyPickingPcs: 4200, jamPulang: 17.5 },
    { tanggal: "2026-05-27", qtyPickingBox: 29593, qtyPickingPcs: 4180, jamPulang: 16.5 },
    { tanggal: "2026-05-28", qtyPickingBox: 35100, qtyPickingPcs: 4600, jamPulang: 18.0 },
    { tanggal: "2026-05-29", qtyPickingBox: 28700, qtyPickingPcs: 3300, jamPulang: 16.0 },
    { tanggal: "2026-06-01", qtyPickingBox: 30200, qtyPickingPcs: 3700, jamPulang: 16.75 },
    { tanggal: "2026-06-02", qtyPickingBox: 32800, qtyPickingPcs: 4000, jamPulang: 17.0 },
];

// ─── Warehouse BS: In dan Out Bad Stock ──────────────────────────────────────

export const badStockData: BadStockItem[] = [
    { tanggal: "20 Jun", masuk: 120, keluar: 85, repack: 42 },
    { tanggal: "21 Jun", masuk: 95, keluar: 110, repack: 30 },
    { tanggal: "22 Jun", masuk: 145, keluar: 92, repack: 55 },
    { tanggal: "23 Jun", masuk: 88, keluar: 130, repack: 28 },
    { tanggal: "24 Jun", masuk: 160, keluar: 105, repack: 62 },
    { tanggal: "25 Jun", masuk: 72, keluar: 68, repack: 21 },
    { tanggal: "26 Jun", masuk: 108, keluar: 95, repack: 38 },
];

// ─── Warehouse BS: Trend Stock On Hand ───────────────────────────────────────

export const stockOnHandData: StockOnHandItem[] = [
    { tanggal: "20 Jun", stockOnHand: 1840 },
    { tanggal: "21 Jun", stockOnHand: 1825 },
    { tanggal: "22 Jun", stockOnHand: 1878 },
    { tanggal: "23 Jun", stockOnHand: 1836 },
    { tanggal: "24 Jun", stockOnHand: 1891 },
    { tanggal: "25 Jun", stockOnHand: 1895 },
    { tanggal: "26 Jun", stockOnHand: 1908 },
];

// ─── Transport Records ────────────────────────────────────────────────────────

export const transportRecords: DailyRecord[] = [
    { id: "TR-001", tanggal: "2025-06-28", division: "Transport", jenisReport: "Gantungan DO", keterangan: "480 CBM", informasiTambahan: "43 DO aktif" },
    { id: "TR-002", tanggal: "2025-06-28", division: "Transport", jenisReport: "Keterlambatan", keterangan: "3 unit terlambat", informasiTambahan: "Rute Surabaya" },
    { id: "TR-003", tanggal: "2025-06-28", division: "Transport", jenisReport: "Claim", keterangan: "Rp 1.200.000", informasiTambahan: "Klaim kerusakan barang" },
    { id: "TR-004", tanggal: "2025-06-28", division: "Transport", jenisReport: "Keberangkatan", keterangan: "28 unit berangkat", informasiTambahan: "Tepat waktu 92%" },
    { id: "TR-005", tanggal: "2025-06-27", division: "Transport", jenisReport: "Gantungan DO", keterangan: "590 CBM", informasiTambahan: "51 DO aktif" },
    { id: "TR-006", tanggal: "2025-06-27", division: "Transport", jenisReport: "Keterlambatan", keterangan: "5 unit terlambat", informasiTambahan: "Rute Jakarta" },
    { id: "TR-007", tanggal: "2025-06-27", division: "Transport", jenisReport: "Bahan Bakar", keterangan: "2.450 liter", informasiTambahan: "Efisiensi 87%" },
    { id: "TR-008", tanggal: "2025-06-26", division: "Transport", jenisReport: "Gantungan DO", keterangan: "310 CBM", informasiTambahan: "28 DO aktif" },
    { id: "TR-009", tanggal: "2025-06-26", division: "Transport", jenisReport: "Keberangkatan", keterangan: "18 unit berangkat", informasiTambahan: "Tepat waktu 89%" },
    { id: "TR-010", tanggal: "2025-06-25", division: "Transport", jenisReport: "Gantungan DO", keterangan: "480 CBM", informasiTambahan: "43 DO aktif" },
];

// ─── Warehouse FG Records ─────────────────────────────────────────────────────

export const warehouseFGRecords: DailyRecord[] = [
    { id: "FG-001", tanggal: "2025-06-28", division: "WH FG", jenisReport: "Picking", keterangan: "9.300 karton", informasiTambahan: "Jam selesai 17:30" },
    { id: "FG-002", tanggal: "2025-06-28", division: "WH FG", jenisReport: "Receiving", keterangan: "4.200 karton", informasiTambahan: "6 supplier" },
    { id: "FG-003", tanggal: "2025-06-28", division: "WH FG", jenisReport: "Stock Opname", keterangan: "99.2% akurasi", informasiTambahan: "Zone A & B" },
    { id: "FG-004", tanggal: "2025-06-28", division: "WH FG", jenisReport: "Putaway", keterangan: "3.800 karton", informasiTambahan: "100% selesai" },
    { id: "FG-005", tanggal: "2025-06-27", division: "WH FG", jenisReport: "Picking", keterangan: "10.400 karton", informasiTambahan: "Jam selesai 18:00" },
    { id: "FG-006", tanggal: "2025-06-27", division: "WH FG", jenisReport: "Receiving", keterangan: "5.100 karton", informasiTambahan: "8 supplier" },
    { id: "FG-007", tanggal: "2025-06-27", division: "WH FG", jenisReport: "Overtime", keterangan: "12 karyawan", informasiTambahan: "2 jam lembur" },
    { id: "FG-008", tanggal: "2025-06-26", division: "WH FG", jenisReport: "Picking", keterangan: "6.800 karton", informasiTambahan: "Jam selesai 15:30" },
    { id: "FG-009", tanggal: "2025-06-26", division: "WH FG", jenisReport: "Putaway", keterangan: "2.900 karton", informasiTambahan: "98% selesai" },
    { id: "FG-010", tanggal: "2025-06-25", division: "WH FG", jenisReport: "Picking", keterangan: "11.200 karton", informasiTambahan: "Jam selesai 19:00" },
];

// ─── Warehouse BS Records ─────────────────────────────────────────────────────

export const warehouseBSRecords: DailyRecord[] = [
    { id: "BS-001", tanggal: "2025-06-28", division: "WH BS", jenisReport: "Stock Masuk", keterangan: "108 SKU", informasiTambahan: "Dari plant PASM" },
    { id: "BS-002", tanggal: "2025-06-28", division: "WH BS", jenisReport: "Stock Keluar", keterangan: "95 SKU", informasiTambahan: "Ke disposal" },
    { id: "BS-003", tanggal: "2025-06-28", division: "WH BS", jenisReport: "Stock On Hand", keterangan: "1.908 unit", informasiTambahan: "Naik 13 dari kemarin" },
    { id: "BS-004", tanggal: "2025-06-28", division: "WH BS", jenisReport: "Investigasi", keterangan: "7 SKU", informasiTambahan: "Expired < 30 hari" },
    { id: "BS-005", tanggal: "2025-06-27", division: "WH BS", jenisReport: "Stock Masuk", keterangan: "72 SKU", informasiTambahan: "Dari plant IMSM" },
    { id: "BS-006", tanggal: "2025-06-27", division: "WH BS", jenisReport: "Stock Keluar", keterangan: "68 SKU", informasiTambahan: "Ke disposal" },
    { id: "BS-007", tanggal: "2025-06-27", division: "WH BS", jenisReport: "Stock On Hand", keterangan: "1.895 unit", informasiTambahan: "Naik 4 dari kemarin" },
    { id: "BS-008", tanggal: "2025-06-26", division: "WH BS", jenisReport: "Stock Masuk", keterangan: "160 SKU", informasiTambahan: "Dari plant U2" },
    { id: "BS-009", tanggal: "2025-06-26", division: "WH BS", jenisReport: "Stock Keluar", keterangan: "105 SKU", informasiTambahan: "Ke disposal" },
    { id: "BS-010", tanggal: "2025-06-25", division: "WH BS", jenisReport: "Stock On Hand", keterangan: "1.891 unit", informasiTambahan: "Turun 45 dari kemarin" },
];
