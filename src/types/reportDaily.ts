/**
 * Report Daily — Shared Type Definitions
 * Three tabs: Transport | Warehouse FG | Warehouse BS
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

export type ReportDailyTab = "transport" | "warehouse-fg" | "warehouse-bs";

export interface DailyRecord {
    id: string;
    tanggal: string;          // "2025-06-28"
    division: string;
    jenisReport: string;
    keterangan: string;       // Keterangan / Value
    informasiTambahan: string;
}

// ─── Transport ────────────────────────────────────────────────────────────────

export interface GantunganItem {
    tanggal: string;
    volume: number;    // total volume (CBM / ton)
    countDO: number;   // count delivery orders
}

// ─── Warehouse FG ─────────────────────────────────────────────────────────────

export interface JamPulangItem {
    tanggal: string;
    jamPulang: number;   // hour, e.g. 17.5 = 17:30
    qtyPicking: number;  // cartons / units picked
}

export interface JamPulangPickingItem {
    tanggal: string;
    qtyPickingBox: number;
    qtyPickingPcs: number;
    jamPulang: number;   // fractional hour: 16.5 = 16:30
}

// ─── Warehouse BS ─────────────────────────────────────────────────────────────

export interface BadStockItem {
    tanggal: string;
    masuk: number;   // stock in
    keluar: number;  // stock out
}

export interface StockOnHandItem {
    tanggal: string;
    stockOnHand: number;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type DailyRecordSortKey = keyof Pick<
    DailyRecord,
    "tanggal" | "division" | "jenisReport" | "keterangan"
>;

export interface DailyRecordSort {
    key: DailyRecordSortKey;
    direction: "asc" | "desc";
}
