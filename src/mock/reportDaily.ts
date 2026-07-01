/**
 * Report Daily — Mock Data
 * Matches the three-tab structure from the original HTML dashboard.
 * Data dikosongkan — diisi melalui CRUD.
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

export const gantunganData: GantunganItem[] = [];

// ─── Warehouse FG: Jam Pulang vs Qty Picking ─────────────────────────────────

export const jamPulangData: JamPulangItem[] = [];

// ─── Warehouse FG: Jam Pulang vs Qty Picking (stacked: box + pcs) ─────────────

export const jamPulangPickingData: JamPulangPickingItem[] = [];

// ─── Warehouse BS: In dan Out Bad Stock ──────────────────────────────────────

export const badStockData: BadStockItem[] = [];

// ─── Warehouse BS: Trend Stock On Hand ───────────────────────────────────────

export const stockOnHandData: StockOnHandItem[] = [];

// ─── Transport Records ────────────────────────────────────────────────────────

export const transportRecords: DailyRecord[] = [];

// ─── Warehouse FG Records ─────────────────────────────────────────────────────

export const warehouseFGRecords: DailyRecord[] = [];

// ─── Warehouse BS Records ─────────────────────────────────────────────────────

export const warehouseBSRecords: DailyRecord[] = [];
