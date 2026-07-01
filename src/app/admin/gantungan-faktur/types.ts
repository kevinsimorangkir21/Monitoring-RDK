/**
 * Gantungan Faktur — TypeScript interfaces
 *
 * Field structure mirrors the Gantungan Faktur Excel sheet exactly:
 *   Tanggal | Date | PAY TERMS | CUSTOMER | NAMA TOKO | SD DOCUMENT
 *   SALES DOC | NET VALUE | KETERANGAN DARI TRANSPORT
 */

// ─── Core record ──────────────────────────────────────────────────────────────

export interface FakturRecord {
    id: string;
    tanggal: string;                  // "YYYY-MM-DD"  ← Tanggal column
    date: string;                     // "YYYY-MM-DD"  ← Date column
    payTerms: string;                 // PAY TERMS
    customer: string;                 // CUSTOMER
    namaToko: string;                 // NAMA TOKO
    sdDocument: string;               // SD DOCUMENT
    salesDoc: string;                 // SALES DOC — must be unique
    netValue: number;                 // NET VALUE  (numeric, ≥ 0)
    keteranganTransport: string;      // KETERANGAN DARI TRANSPORT
}

// ─── Form values (all strings — parsed on save) ───────────────────────────────

export interface FakturFormValues {
    tanggal: string;
    date: string;
    payTerms: string;
    customer: string;
    namaToko: string;
    sdDocument: string;
    salesDoc: string;
    netValue: string;                 // raw currency string, e.g. "1.500.000"
    keteranganTransport: string;
}

export type FakturFormErrors = Partial<Record<keyof FakturFormValues, string>>;

// ─── Modal state ──────────────────────────────────────────────────────────────

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: FakturRecord;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface FakturFilters {
    dateRange: { startDate: string | null; endDate: string | null };
    selectedCustomer: string[];
    selectedPayTerms: string[];
    searchQuery: string;              // searches: CUSTOMER, NAMA TOKO, SALES DOC
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface FakturKPIs {
    totalNetValue: number;            // SUM of all NET VALUE (0 when empty)
    totalDokumen: number;             // count of records (0 when empty)
    averageNetValue: number;          // mean NET VALUE (0 when empty)
    customerTerbanyak: { name: string; count: number } | null;
}

// ─── Chart ───────────────────────────────────────────────────────────────────

export interface DailyTrendPoint {
    tanggal: string;       // "YYYY-MM-DD"  (grouped by Tanggal field)
    tanggalLabel: string;  // "28 Jun"
    jumlah: number;        // count of SALES DOC per day  — Bar (left Y)
    netValue: number;      // SUM NET VALUE per day        — Line (right Y)
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
