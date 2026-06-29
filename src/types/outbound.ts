/**
 * Outbound Monitoring — Shared Type Definitions
 * Mirrors the business logic from the original HTML dashboard.
 */

// ─── Core domain types ────────────────────────────────────────────────────────

export type OutboundStatus =
    | "Siap Muat"
    | "Muat Proses"
    | "Muat Selesai"
    | "Berangkat"
    | "Inap";

export type SType = "S1" | "S2" | "S3" | "S4";

export interface OutboundRecord {
    id: string;
    tanggal: string;           // ISO date string
    freightOrder: string;      // FO number
    mobilMuat: string;         // Vehicle / truck plate
    sType: SType;
    status: OutboundStatus;
    jamTerima: string;         // ISO datetime — "Jam Terima (Input FO)"
    gate: string;              // Gate code e.g. "Gate 1"
    plant: string;
    driver: string;
    totalKoli: number;
    totalBerat: number;        // kg
}

// ─── Chart / summary types ────────────────────────────────────────────────────

export interface StatusFOItem {
    status: string;
    jumlah: number;
}

export interface KlasifikasiStatusFOItem {
    tanggal: string;
    draft: number;
    released: number;
    loading: number;
    completed: number;
    cancelled: number;
    totalFO: number;
}

export interface TypeFOItem {
    type: string;
    jumlah: number;
}

export interface GroupingTimeItem {
    label: string;
    value: number;
    color: string;
}

export interface GroupingTimeSTWItem {
    interval: string;
    jumlahFO: number;
}

// ─── Sort state ───────────────────────────────────────────────────────────────

export type OutboundSortKey = keyof Pick<
    OutboundRecord,
    "tanggal" | "freightOrder" | "mobilMuat" | "sType" | "status" | "jamTerima" | "gate"
>;

export interface OutboundSortState {
    key: OutboundSortKey;
    direction: "asc" | "desc";
}
