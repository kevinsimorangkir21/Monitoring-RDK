/**
 * Inbound Monitoring — Mock Data
 * Replace with real API calls when backend is ready.
 */

import type {
    InboundRecord,
    ReportHarianItem,
    BongkaranItem,
    JumlahBongkaranHarianItem,
    SupplierContribution,
    KontribusiSupplyItem,
    ProduktivitasItem,
    ProduktivitasBongkarItem,
} from "@/types/inbound";

// ─── Summary KPIs ─────────────────────────────────────────────────────────────

export const SUMMARY = {
    totalMobil: 204,
    totalBox: 647863,
    slipSheet: { percent: 80.9, count: 165 },
    curah: { percent: 19.1, count: 39 },
} as const;

// ─── Filter option lists ──────────────────────────────────────────────────────

export const PLANT_OPTIONS = ["PASM", "IMSM", "U2", "LION", "TASE"];
export const SUPPLIER_OPTIONS = [
    "PT Maju Jaya",
    "CV Sumber Mas",
    "PT Nusantara",
    "CV Berkah Abadi",
    "PT Sentosa",
    "CV Mandiri",
];
export const JENIS_OPTIONS = ["SlipSheet", "Curah"] as const;
export const STATUS_OPTIONS = ["Completed", "Progress", "Pending", "Delay"] as const;

// ─── Chart data ───────────────────────────────────────────────────────────────

export const reportHarianData: ReportHarianItem[] = [
    { tanggal: "6/4/2026", slipsheet: 9, curah: 2, totalFO: 9 },
    { tanggal: "6/6/2026", slipsheet: 12, curah: 3, totalFO: 12 },
    { tanggal: "6/8/2026", slipsheet: 7, curah: 1, totalFO: 7 },
    { tanggal: "6/10/2026", slipsheet: 15, curah: 4, totalFO: 15 },
    { tanggal: "6/12/2026", slipsheet: 11, curah: 2, totalFO: 11 },
    { tanggal: "6/14/2026", slipsheet: 8, curah: 3, totalFO: 8 },
    { tanggal: "6/16/2026", slipsheet: 14, curah: 5, totalFO: 14 },
    { tanggal: "6/18/2026", slipsheet: 10, curah: 2, totalFO: 10 },
    { tanggal: "6/20/2026", slipsheet: 13, curah: 3, totalFO: 13 },
    { tanggal: "6/22/2026", slipsheet: 6, curah: 1, totalFO: 6 },
];

export const bongkaranData: BongkaranItem[] = [
    { plant: "PASM", slipSheet: 38, curah: 10 },
    { plant: "IMSM", slipSheet: 45, curah: 8 },
    { plant: "U2", slipSheet: 29, curah: 12 },
    { plant: "LION", slipSheet: 53, curah: 9 },
    { plant: "TASE", slipSheet: 31, curah: 7 },
];

export const jumlahBongkaranData: JumlahBongkaranHarianItem[] = [
    { tanggal: "6/4/2026", totalBox: 82500 },
    { tanggal: "6/6/2026", totalBox: 96000 },
    { tanggal: "6/8/2026", totalBox: 79200 },
    { tanggal: "6/10/2026", totalBox: 105000 },
    { tanggal: "6/12/2026", totalBox: 90300 },
    { tanggal: "6/14/2026", totalBox: 64800 },
    { tanggal: "6/16/2026", totalBox: 110000 },
    { tanggal: "6/18/2026", totalBox: 88000 },
    { tanggal: "6/20/2026", totalBox: 97500 },
    { tanggal: "6/22/2026", totalBox: 58200 },
];

export const supplierContributionData: SupplierContribution[] = [
    { supplier: "PT Maju Jaya", totalBox: 185000 },
    { supplier: "CV Sumber Mas", totalBox: 142000 },
    { supplier: "PT Nusantara", totalBox: 126500 },
    { supplier: "CV Berkah Abadi", totalBox: 98300 },
    { supplier: "PT Sentosa", totalBox: 76200 },
    { supplier: "CV Mandiri", totalBox: 54800 },
];

export const bongkaranByPlantData: KontribusiSupplyItem[] = [
    { plant: "PAS", totalMobil: 38 },
    { plant: "MIM", totalMobil: 19 },
    { plant: "SMU2", totalMobil: 15 },
    { plant: "LION", totalMobil: 86 },
    { plant: "TAS", totalMobil: 22 },
    { plant: "AMG", totalMobil: 11 },
    { plant: "KAS", totalMobil: 8 },
    { plant: "BAS", totalMobil: 6 },
    { plant: "CALBEE", totalMobil: 3 },
    { plant: "DAM", totalMobil: 2 },
    { plant: "UNKNOWN", totalMobil: 1 },
    { plant: "HAS", totalMobil: 1 },
];

/** @deprecated Use bongkaranByPlantData */
export const kontribusiSupplyData = bongkaranByPlantData;

export const produktivitasData: ProduktivitasItem[] = [
    { name: "Tepat Waktu", value: 62, color: "#10B981" },
    { name: "Terlambat", value: 22, color: "#EF4444" },
    { name: "Proses", value: 16, color: "#3B82F6" },
];

export const produktivitasBongkarData: ProduktivitasBongkarItem[] = [
    { interval: "00:00-04:00", jumlahMobil: 30 },
    { interval: "04:00-08:00", jumlahMobil: 55 },
    { interval: "08:00-12:00", jumlahMobil: 63 },
    { interval: "12:00-16:00", jumlahMobil: 41 },
    { interval: "16:00-20:00", jumlahMobil: 18 },
    { interval: "20:00-00:00", jumlahMobil: 4 },
];

// ─── Inbound Records ──────────────────────────────────────────────────────────

export const inboundRecords: InboundRecord[] = [
    { id: "IB-001", tanggal: "2025-06-28T06:10:00", nomorFO: "FO-2025-0841", noPolisi: "B 1234 TKA", plant: "PASM", supplier: "PT Maju Jaya", jenisBongkaran: "SlipSheet", totalBox: 3200, nomorGR: "GR-2025-0420", status: "Completed", driver: "Ahmad Sutrisno", mobilMasuk: "2025-06-28T06:10:00", bongkarDimulai: "2025-06-28T06:25:00", bongkarSelesai: "2025-06-28T08:45:00", grDibuat: "2025-06-28T09:00:00" },
    { id: "IB-002", tanggal: "2025-06-28T07:00:00", nomorFO: "FO-2025-0842", noPolisi: "D 5678 ABP", plant: "IMSM", supplier: "CV Sumber Mas", jenisBongkaran: "Curah", totalBox: 1850, nomorGR: "GR-2025-0421", status: "Progress", driver: "Budi Santoso", mobilMasuk: "2025-06-28T07:00:00", bongkarDimulai: "2025-06-28T07:20:00", bongkarSelesai: "2025-06-28T09:10:00", grDibuat: "2025-06-28T09:30:00" },
    { id: "IB-003", tanggal: "2025-06-28T07:30:00", nomorFO: "FO-2025-0843", noPolisi: "F 9012 CDE", plant: "U2", supplier: "PT Nusantara", jenisBongkaran: "SlipSheet", totalBox: 2700, nomorGR: "GR-2025-0422", status: "Pending", driver: "Cahyo Wibowo", mobilMasuk: "2025-06-28T07:30:00", bongkarDimulai: "2025-06-28T07:50:00", bongkarSelesai: "2025-06-28T10:00:00", grDibuat: "2025-06-28T10:20:00" },
    { id: "IB-004", tanggal: "2025-06-28T08:00:00", nomorFO: "FO-2025-0844", noPolisi: "H 3456 EFG", plant: "LION", supplier: "CV Berkah Abadi", jenisBongkaran: "Curah", totalBox: 2100, nomorGR: "GR-2025-0423", status: "Delay", driver: "Deni Rahmadan", mobilMasuk: "2025-06-28T08:00:00", bongkarDimulai: "2025-06-28T08:45:00", bongkarSelesai: "2025-06-28T11:30:00", grDibuat: "2025-06-28T12:00:00" },
    { id: "IB-005", tanggal: "2025-06-28T08:15:00", nomorFO: "FO-2025-0845", noPolisi: "B 7890 GHI", plant: "PASM", supplier: "PT Sentosa", jenisBongkaran: "SlipSheet", totalBox: 4100, nomorGR: "GR-2025-0424", status: "Completed", driver: "Eko Prasetyo", mobilMasuk: "2025-06-28T08:15:00", bongkarDimulai: "2025-06-28T08:30:00", bongkarSelesai: "2025-06-28T10:45:00", grDibuat: "2025-06-28T11:00:00" },
    { id: "IB-006", tanggal: "2025-06-28T09:00:00", nomorFO: "FO-2025-0846", noPolisi: "D 2345 JKL", plant: "IMSM", supplier: "CV Mandiri", jenisBongkaran: "SlipSheet", totalBox: 1960, nomorGR: "GR-2025-0425", status: "Progress", driver: "Fajar Nugroho", mobilMasuk: "2025-06-28T09:00:00", bongkarDimulai: "2025-06-28T09:15:00", bongkarSelesai: "2025-06-28T11:00:00", grDibuat: "2025-06-28T11:20:00" },
    { id: "IB-007", tanggal: "2025-06-28T09:30:00", nomorFO: "FO-2025-0847", noPolisi: "F 6789 MNO", plant: "U2", supplier: "PT Maju Jaya", jenisBongkaran: "Curah", totalBox: 3350, nomorGR: "GR-2025-0426", status: "Completed", driver: "Gunawan Putra", mobilMasuk: "2025-06-28T09:30:00", bongkarDimulai: "2025-06-28T09:50:00", bongkarSelesai: "2025-06-28T12:10:00", grDibuat: "2025-06-28T12:30:00" },
    { id: "IB-008", tanggal: "2025-06-28T10:00:00", nomorFO: "FO-2025-0848", noPolisi: "H 1234 PQR", plant: "TASE", supplier: "CV Sumber Mas", jenisBongkaran: "SlipSheet", totalBox: 2450, nomorGR: "GR-2025-0427", status: "Delay", driver: "Hendra Wijaya", mobilMasuk: "2025-06-28T10:00:00", bongkarDimulai: "2025-06-28T10:40:00", bongkarSelesai: "2025-06-28T13:00:00", grDibuat: "2025-06-28T13:20:00" },
    { id: "IB-009", tanggal: "2025-06-28T10:30:00", nomorFO: "FO-2025-0849", noPolisi: "B 5678 STU", plant: "PASM", supplier: "PT Nusantara", jenisBongkaran: "SlipSheet", totalBox: 2800, nomorGR: "GR-2025-0428", status: "Pending", driver: "Irwan Setiawan", mobilMasuk: "2025-06-28T10:30:00", bongkarDimulai: "2025-06-28T10:45:00", bongkarSelesai: "2025-06-28T13:15:00", grDibuat: "2025-06-28T13:30:00" },
    { id: "IB-010", tanggal: "2025-06-28T11:00:00", nomorFO: "FO-2025-0850", noPolisi: "D 9012 VWX", plant: "IMSM", supplier: "CV Berkah Abadi", jenisBongkaran: "Curah", totalBox: 1720, nomorGR: "GR-2025-0429", status: "Completed", driver: "Joko Susilo", mobilMasuk: "2025-06-28T11:00:00", bongkarDimulai: "2025-06-28T11:15:00", bongkarSelesai: "2025-06-28T13:30:00", grDibuat: "2025-06-28T13:45:00" },
    { id: "IB-011", tanggal: "2025-06-28T11:30:00", nomorFO: "FO-2025-0851", noPolisi: "F 3456 YZA", plant: "LION", supplier: "PT Maju Jaya", jenisBongkaran: "SlipSheet", totalBox: 3600, nomorGR: "GR-2025-0430", status: "Completed", driver: "Kurnia Adi", mobilMasuk: "2025-06-28T11:30:00", bongkarDimulai: "2025-06-28T11:45:00", bongkarSelesai: "2025-06-28T14:00:00", grDibuat: "2025-06-28T14:15:00" },
    { id: "IB-012", tanggal: "2025-06-28T12:00:00", nomorFO: "FO-2025-0852", noPolisi: "H 7890 BCD", plant: "TASE", supplier: "PT Sentosa", jenisBongkaran: "Curah", totalBox: 2250, nomorGR: "GR-2025-0431", status: "Progress", driver: "Lukman Hakim", mobilMasuk: "2025-06-28T12:00:00", bongkarDimulai: "2025-06-28T12:20:00", bongkarSelesai: "2025-06-28T14:30:00", grDibuat: "2025-06-28T14:45:00" },
];
