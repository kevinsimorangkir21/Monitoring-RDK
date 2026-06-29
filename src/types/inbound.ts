/**
 * Inbound Monitoring — Shared Type Definitions
 */

// ─── Core domain types ───────────────────────────────────────────────────────

export type InboundStatus = "Completed" | "Progress" | "Pending" | "Delay";
export type JenisBongkaran = "SlipSheet" | "Curah";

export interface InboundRecord {
    id: string;
    tanggal: string;          // ISO datetime
    nomorFO: string;
    noPolisi: string;
    plant: string;
    supplier: string;
    jenisBongkaran: JenisBongkaran;
    totalBox: number;
    nomorGR: string;
    status: InboundStatus;
    driver: string;
    mobilMasuk: string;
    bongkarDimulai: string;
    bongkarSelesai: string;
    grDibuat: string;
}

// ─── Chart data types ────────────────────────────────────────────────────────

export interface ReportHarianItem {
    tanggal: string;
    slipsheet: number;
    curah: number;
    totalFO: number;
}

export interface BongkaranItem {
    plant: string;
    slipSheet: number;
    curah: number;
}

export interface JumlahBongkaranHarianItem {
    tanggal: string;
    totalBox: number;
}

export interface SupplierContribution {
    supplier: string;
    totalBox: number;
}

export interface KontribusiSupplyItem {
    plant: string;
    totalMobil: number;
}

export interface ProduktivitasItem {
    name: string;
    value: number;
    color: string;
}

export interface ProduktivitasBongkarItem {
    interval: string;
    jumlahMobil: number;
}

// ─── Filter state ────────────────────────────────────────────────────────────

export interface FilterState {
    dateFrom: string;
    dateTo: string;
    plant: string;
    supplier: string;
    jenisBongkaran: string;
    nomorFO: string;
    noPolisi: string;
    status: string;
}

export const EMPTY_FILTER: FilterState = {
    dateFrom: "",
    dateTo: "",
    plant: "",
    supplier: "",
    jenisBongkaran: "",
    nomorFO: "",
    noPolisi: "",
    status: "",
};

// ─── Sort state ──────────────────────────────────────────────────────────────

export type SortKey = keyof Pick<
    InboundRecord,
    "tanggal" | "nomorFO" | "noPolisi" | "plant" | "jenisBongkaran" | "totalBox" | "status"
>;

export interface SortState {
    key: SortKey;
    direction: "asc" | "desc";
}
