/**
 * Claim Vendor — TypeScript interfaces (new CRUD-based module)
 */

// ─── Status ───────────────────────────────────────────────────────────────────

export type ClaimStatus = "Pending" | "Lunas";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface ClaimEntry {
    id: string;
    tanggal: string;        // "YYYY-MM-DD"
    vendor: string;
    noMobil: string;        // "B 9011 UXG"
    totalClaim: number;     // >= 0
    sudahDibayar: number;   // >= 0
    belumDibayar: number;   // computed: totalClaim - sudahDibayar
    status: ClaimStatus;    // "Lunas" jika belumDibayar === 0
    keterangan: string;     // optional
}

// ─── Form values (all strings — parsed on save) ───────────────────────────────

export interface ClaimFormValues {
    tanggal: string;
    vendor: string;
    noMobil: string;
    totalClaim: string;
    sudahDibayar: string;
    status: string;
    keterangan: string;
}

export type ClaimFormErrors = Partial<Record<keyof ClaimFormValues, string>>;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: ClaimEntry;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}

// ─── Aggregated types ─────────────────────────────────────────────────────────

export interface ClaimKPIs {
    totalDokumen: number;
    totalNominal: number;
    belumDibayarNominal: number;
    belumDibayarDokumen: number;
    sudahLunasNominal: number;
    sudahLunasDokumen: number;
}

/** Trend per tanggal untuk chart Pendingan Tagihan */
export interface TrendPoint {
    tanggal: string;
    belumDibayar: number;
    sudahDibayar: number;
}

/** Rekap per vendor */
export interface VendorRecapRow {
    vendor: string;
    totalClaiman: number;
    lunas: number;
    belumBayar: number;
    jumlahDokumen: number;
}
