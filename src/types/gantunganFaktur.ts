/**
 * Gantungan Faktur — Shared Type Definitions
 */

// ─── Core status ──────────────────────────────────────────────────────────────

export type FakturStatus = "Outstanding" | "Pending" | "Completed";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface FakturRecord {
    id: string;
    tanggal: string;          // "2025-06-28"
    vendor: string;
    nomorInvoice: string;     // "INV-2025-0001"
    nomorFaktur: string;      // "FKT-2025-0001"
    nomorDO: string;          // "DO-2025-0001"
    nomorPolisi: string;      // "B 1234 XYZ"
    plant: string;            // "Plant A"
    nominalFaktur: number;    // IDR
    status: FakturStatus;
    keterangan: string;
    // Timeline ISO datetimes
    fakturDibuat: string;
    diajukan: string;
    diProses: string;
    selesai: string | null;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface FakturKPI {
    totalDokumen: number;
    totalNominal: number;
    rataRataNominal: number;
    outstanding: number;
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface NominalHarianItem {
    tanggal: string;
    nominal: number;
}

export interface DokumenHarianItem {
    tanggal: string;
    jumlah: number;
}

/** Combined chart data merging nominal + dokumen by tanggal */
export interface NominalDokumenItem {
    tanggal: string;
    nominal: number;
    jumlah: number;
}

export interface NominalPerVendorItem {
    vendor: string;
    nominal: number;
}

export interface DistribusiNominalItem {
    name: string;
    value: number;
    color: string;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type FakturSortKey = keyof Pick<
    FakturRecord,
    | "tanggal"
    | "vendor"
    | "nomorInvoice"
    | "nomorFaktur"
    | "nomorDO"
    | "nomorPolisi"
    | "plant"
    | "nominalFaktur"
    | "status"
>;

export interface FakturSort {
    key: FakturSortKey;
    direction: "asc" | "desc";
}
