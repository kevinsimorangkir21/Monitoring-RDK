/**
 * Inbound Monitoring — Mock Data
 * All types and mock data are co-located here for easy replacement
 * when a real API is available.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type InboundStatus = "Completed" | "Progress" | "Pending" | "Delay";

export type JenisBongkaran = "SlipSheet" | "Curah";

export interface InboundRecord {
    id: string;
    tanggal: string;        // ISO datetime string
    nomorFO: string;
    noPolisi: string;
    plant: string;
    supplier: string;
    jenisBongkaran: JenisBongkaran;
    totalBox: number;
    nomorGR: string;
    status: InboundStatus;
    driver: string;
    // Timeline (ISO datetime)
    mobilMasuk: string;
    bongkarDimulai: string;
    bongkarSelesai: string;
    grDibuat: string;
}

export interface ReportHarianItem {
    tanggal: string;
    totalMobil: number;
    totalBox: number;
    selesai: number;
}

export interface BongkaranItem {
    plant: string;
    slipSheet: number;
    curah: number;
}

export interface SupplierContribution {
    supplier: string;
    totalBox: number;
}

export interface ProduktivitasItem {
    name: string;
    value: number;
    color: string;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export const SUMMARY_DATA = {
    totalMobil: 204,
    totalBox: 647863,
    slipSheet: { percent: 80.9, count: 165 },
    curah: { percent: 19.1, count: 39 },
} as const;

// ─── Report Harian (Composed Chart) ──────────────────────────────────────────

export const reportHarianData: ReportHarianItem[] = [
    { tanggal: "20 Jun", totalMobil: 28, totalBox: 82500, selesai: 24 },
    { tanggal: "21 Jun", totalMobil: 32, totalBox: 96000, selesai: 30 },
    { tanggal: "22 Jun", totalMobil: 27, totalBox: 79200, selesai: 25 },
    { tanggal: "23 Jun", totalMobil: 35, totalBox: 105000, selesai: 32 },
    { tanggal: "24 Jun", totalMobil: 30, totalBox: 90300, selesai: 27 },
    { tanggal: "25 Jun", totalMobil: 22, totalBox: 64800, selesai: 20 },
    { tanggal: "26 Jun", totalMobil: 30, totalBox: 89963, selesai: 28 },
];

// ─── Jumlah Bongkaran (Bar Chart) ─────────────────────────────────────────────

export const bongkaranData: BongkaranItem[] = [
    { plant: "Plant A", slipSheet: 38, curah: 10 },
    { plant: "Plant B", slipSheet: 45, curah: 8 },
    { plant: "Plant C", slipSheet: 29, curah: 12 },
    { plant: "Plant D", slipSheet: 53, curah: 9 },
];

// ─── Kontribusi Supply (Horizontal Bar) ───────────────────────────────────────

export const supplierContributionData: SupplierContribution[] = [
    { supplier: "PT Maju Jaya", totalBox: 185000 },
    { supplier: "CV Sumber Mas", totalBox: 142000 },
    { supplier: "PT Nusantara", totalBox: 126500 },
    { supplier: "CV Berkah Abadi", totalBox: 98300 },
    { supplier: "PT Sentosa", totalBox: 76200 },
    { supplier: "CV Mandiri", totalBox: 54800 },
];

// ─── Produktivitas Bongkar (Donut Chart) ─────────────────────────────────────

export const produktivitasData: ProduktivitasItem[] = [
    { name: "Selesai Tepat Waktu", value: 62, color: "#16a34a" },
    { name: "Terlambat", value: 22, color: "#dc2626" },
    { name: "Dalam Proses", value: 16, color: "#2563eb" },
];

// ─── Inbound Records ──────────────────────────────────────────────────────────

export const inboundRecords: InboundRecord[] = [
    {
        id: "IB-001",
        tanggal: "2025-06-28T06:10:00",
        nomorFO: "FO-2025-0841",
        noPolisi: "B 1234 TKA",
        plant: "Plant A",
        supplier: "PT Maju Jaya",
        jenisBongkaran: "SlipSheet",
        totalBox: 3200,
        nomorGR: "GR-2025-0420",
        status: "Completed",
        driver: "Ahmad Sutrisno",
        mobilMasuk: "2025-06-28T06:10:00",
        bongkarDimulai: "2025-06-28T06:25:00",
        bongkarSelesai: "2025-06-28T08:45:00",
        grDibuat: "2025-06-28T09:00:00",
    },
    {
        id: "IB-002",
        tanggal: "2025-06-28T07:00:00",
        nomorFO: "FO-2025-0842",
        noPolisi: "D 5678 ABP",
        plant: "Plant B",
        supplier: "CV Sumber Mas",
        jenisBongkaran: "Curah",
        totalBox: 1850,
        nomorGR: "GR-2025-0421",
        status: "Progress",
        driver: "Budi Santoso",
        mobilMasuk: "2025-06-28T07:00:00",
        bongkarDimulai: "2025-06-28T07:20:00",
        bongkarSelesai: "2025-06-28T09:10:00",
        grDibuat: "2025-06-28T09:30:00",
    },
    {
        id: "IB-003",
        tanggal: "2025-06-28T07:30:00",
        nomorFO: "FO-2025-0843",
        noPolisi: "F 9012 CDE",
        plant: "Plant C",
        supplier: "PT Nusantara",
        jenisBongkaran: "SlipSheet",
        totalBox: 2700,
        nomorGR: "GR-2025-0422",
        status: "Pending",
        driver: "Cahyo Wibowo",
        mobilMasuk: "2025-06-28T07:30:00",
        bongkarDimulai: "2025-06-28T07:50:00",
        bongkarSelesai: "2025-06-28T10:00:00",
        grDibuat: "2025-06-28T10:20:00",
    },
    {
        id: "IB-004",
        tanggal: "2025-06-28T08:00:00",
        nomorFO: "FO-2025-0844",
        noPolisi: "H 3456 EFG",
        plant: "Plant D",
        supplier: "CV Berkah Abadi",
        jenisBongkaran: "Curah",
        totalBox: 2100,
        nomorGR: "GR-2025-0423",
        status: "Delay",
        driver: "Deni Rahmadan",
        mobilMasuk: "2025-06-28T08:00:00",
        bongkarDimulai: "2025-06-28T08:45:00",
        bongkarSelesai: "2025-06-28T11:30:00",
        grDibuat: "2025-06-28T12:00:00",
    },
    {
        id: "IB-005",
        tanggal: "2025-06-28T08:15:00",
        nomorFO: "FO-2025-0845",
        noPolisi: "B 7890 GHI",
        plant: "Plant A",
        supplier: "PT Sentosa",
        jenisBongkaran: "SlipSheet",
        totalBox: 4100,
        nomorGR: "GR-2025-0424",
        status: "Completed",
        driver: "Eko Prasetyo",
        mobilMasuk: "2025-06-28T08:15:00",
        bongkarDimulai: "2025-06-28T08:30:00",
        bongkarSelesai: "2025-06-28T10:45:00",
        grDibuat: "2025-06-28T11:00:00",
    },
    {
        id: "IB-006",
        tanggal: "2025-06-28T09:00:00",
        nomorFO: "FO-2025-0846",
        noPolisi: "D 2345 JKL",
        plant: "Plant B",
        supplier: "CV Mandiri",
        jenisBongkaran: "SlipSheet",
        totalBox: 1960,
        nomorGR: "GR-2025-0425",
        status: "Progress",
        driver: "Fajar Nugroho",
        mobilMasuk: "2025-06-28T09:00:00",
        bongkarDimulai: "2025-06-28T09:15:00",
        bongkarSelesai: "2025-06-28T11:00:00",
        grDibuat: "2025-06-28T11:20:00",
    },
    {
        id: "IB-007",
        tanggal: "2025-06-28T09:30:00",
        nomorFO: "FO-2025-0847",
        noPolisi: "F 6789 MNO",
        plant: "Plant C",
        supplier: "PT Maju Jaya",
        jenisBongkaran: "Curah",
        totalBox: 3350,
        nomorGR: "GR-2025-0426",
        status: "Completed",
        driver: "Gunawan Putra",
        mobilMasuk: "2025-06-28T09:30:00",
        bongkarDimulai: "2025-06-28T09:50:00",
        bongkarSelesai: "2025-06-28T12:10:00",
        grDibuat: "2025-06-28T12:30:00",
    },
    {
        id: "IB-008",
        tanggal: "2025-06-28T10:00:00",
        nomorFO: "FO-2025-0848",
        noPolisi: "H 1234 PQR",
        plant: "Plant D",
        supplier: "CV Sumber Mas",
        jenisBongkaran: "SlipSheet",
        totalBox: 2450,
        nomorGR: "GR-2025-0427",
        status: "Delay",
        driver: "Hendra Wijaya",
        mobilMasuk: "2025-06-28T10:00:00",
        bongkarDimulai: "2025-06-28T10:40:00",
        bongkarSelesai: "2025-06-28T13:00:00",
        grDibuat: "2025-06-28T13:20:00",
    },
    {
        id: "IB-009",
        tanggal: "2025-06-28T10:30:00",
        nomorFO: "FO-2025-0849",
        noPolisi: "B 5678 STU",
        plant: "Plant A",
        supplier: "PT Nusantara",
        jenisBongkaran: "SlipSheet",
        totalBox: 2800,
        nomorGR: "GR-2025-0428",
        status: "Pending",
        driver: "Irwan Setiawan",
        mobilMasuk: "2025-06-28T10:30:00",
        bongkarDimulai: "2025-06-28T10:45:00",
        bongkarSelesai: "2025-06-28T13:15:00",
        grDibuat: "2025-06-28T13:30:00",
    },
    {
        id: "IB-010",
        tanggal: "2025-06-28T11:00:00",
        nomorFO: "FO-2025-0850",
        noPolisi: "D 9012 VWX",
        plant: "Plant B",
        supplier: "CV Berkah Abadi",
        jenisBongkaran: "Curah",
        totalBox: 1720,
        nomorGR: "GR-2025-0429",
        status: "Completed",
        driver: "Joko Susilo",
        mobilMasuk: "2025-06-28T11:00:00",
        bongkarDimulai: "2025-06-28T11:15:00",
        bongkarSelesai: "2025-06-28T13:30:00",
        grDibuat: "2025-06-28T13:45:00",
    },
];

// ─── Filter Options ────────────────────────────────────────────────────────────

export const PLANT_OPTIONS = ["Plant A", "Plant B", "Plant C", "Plant D"];

export const SUPPLIER_OPTIONS = [
    "PT Maju Jaya",
    "CV Sumber Mas",
    "PT Nusantara",
    "CV Berkah Abadi",
    "PT Sentosa",
    "CV Mandiri",
];

export const JENIS_BONGKARAN_OPTIONS: JenisBongkaran[] = ["SlipSheet", "Curah"];

export const STATUS_OPTIONS: InboundStatus[] = [
    "Completed",
    "Progress",
    "Pending",
    "Delay",
];
