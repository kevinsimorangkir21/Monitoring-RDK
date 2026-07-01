/**
 * Inbound Monitoring — TypeScript interfaces
 *
 * Source of truth: Excel sheet "Inbound"
 *   Tanggal | Tanggal (DateTime) | Shifting | Nomor_FO | Nopol |
 *   Plant Pabrik | Jenis_Bongkaran | Total Box | Nomor GR | Total Slipsheet
 */

// ─── Jenis Bongkaran union — only two valid values ───────────────────────────

export type JenisBongkaran = "SLIPSHEET" | "CURAH";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface InboundRecord {
    id: string;
    tanggal: string;          // "YYYY-MM-DD"
    tanggalDatetime: string;  // "YYYY-MM-DD HH:mm:ss"
    shifting: string;         // "Shift 1" | "Shift 2" | "Shift 3"
    nomorFO: string;          // unique per record
    nopol: string;
    plantPabrik: string;
    jenisBongkaran: JenisBongkaran;  // SLIPSHEET | CURAH only
    totalBox: number;         // integer ≥ 0
    nomorGR: string;
    totalSlipsheet: number;   // integer ≥ 0
}

// ─── Form values (all strings — parsed on save) ───────────────────────────────

export interface InboundFormValues {
    tanggal: string;
    tanggalDatetime: string;
    shifting: string;
    nomorFO: string;
    nopol: string;
    plantPabrik: string;
    jenisBongkaran: string;
    totalBox: string;
    nomorGR: string;
    totalSlipsheet: string;
}

export type InboundFormErrors = Partial<Record<keyof InboundFormValues, string>>;

// ─── CRUD modal ───────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: InboundRecord;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface InboundFilters {
    dateRange: { startDate: string | null; endDate: string | null };
    selectedPlant: string[];
    selectedShifting: string[];
    selectedJenis: string[];
    searchQuery: string; // searches: nomorFO | nopol | nomorGR
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface InboundKPIs {
    totalMobil: number;
    totalBox: number;
    slipsheet: { count: number; pct: number };
    curah: { count: number; pct: number };
}

// ─── Chart aggregations ───────────────────────────────────────────────────────

export interface BongkaranByPlantPoint {
    plant: string;
    jumlah: number;
}

/** Report Harian: Bar slipsheet + curah, Line totalFO */
export interface ReportHarianPoint {
    tanggal: string;
    tanggalLabel: string;
    slipsheet: number;
    curah: number;
    totalFO: number;
}

/** Jumlah Bongkaran harian */
export interface JumlahBongkaranPoint {
    tanggal: string;
    tanggalLabel: string;
    jumlah: number;
}

/** Produktivitas (donut) */
export interface ProduktivitasItem {
    name: string;
    value: number;
    color: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
