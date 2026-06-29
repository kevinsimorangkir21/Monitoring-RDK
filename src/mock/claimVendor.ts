/**
 * Claim Vendor — Mock Data
 */

import type {
    ClaimRecord, ClaimKPI,
    ClaimTrendItem, ClaimByVendorItem,
    ClaimByCategoryItem, ApprovalProgressItem,
} from "@/types/claimVendor";

// ─── KPI ─────────────────────────────────────────────────────────────────────

export const KPI: ClaimKPI = {
    totalClaim: 128,
    waitingApproval: 34,
    approved: 79,
    rejected: 15,
    totalNilai: 4_872_500_000,
    approvedNilai: 3_128_750_000,
    approvalRate: 61.7,
    rejectionRate: 11.7,
};

// ─── Chart: Claim Trend ───────────────────────────────────────────────────────

export const claimTrendData: ClaimTrendItem[] = [
    { tanggal: "22 Jun", total: 14, approved: 8, rejected: 2 },
    { tanggal: "23 Jun", total: 18, approved: 11, rejected: 3 },
    { tanggal: "24 Jun", total: 12, approved: 7, rejected: 1 },
    { tanggal: "25 Jun", total: 22, approved: 14, rejected: 4 },
    { tanggal: "26 Jun", total: 16, approved: 10, rejected: 2 },
    { tanggal: "27 Jun", total: 24, approved: 15, rejected: 3 },
    { tanggal: "28 Jun", total: 22, approved: 14, rejected: 0 },
];

// ─── Chart: Claim by Vendor ───────────────────────────────────────────────────

export const claimByVendorData: ClaimByVendorItem[] = [
    { vendor: "PT Maju Bersama", total: 28, nilai: 1_240_000_000 },
    { vendor: "CV Sinar Jaya", total: 22, nilai: 980_500_000 },
    { vendor: "PT Logistik Prima", total: 19, nilai: 874_000_000 },
    { vendor: "UD Karya Agung", total: 16, nilai: 720_000_000 },
    { vendor: "PT Trans Nusantara", total: 14, nilai: 612_500_000 },
    { vendor: "CV Delta Cargo", total: 11, nilai: 445_000_000 },
];

// ─── Chart: Claim by Category ─────────────────────────────────────────────────

export const claimByCategoryData: ClaimByCategoryItem[] = [
    { kategori: "Pengiriman", total: 42, color: "#DC2626" },
    { kategori: "Kerusakan Barang", total: 31, color: "#F59E0B" },
    { kategori: "Kelebihan Tagihan", total: 24, color: "#3B82F6" },
    { kategori: "Kesalahan Picking", total: 19, color: "#8B5CF6" },
    { kategori: "Lainnya", total: 12, color: "#10B981" },
];

// ─── Chart: Approval Progress ─────────────────────────────────────────────────

export const approvalProgressData: ApprovalProgressItem[] = [
    { name: "Approved", value: 62, color: "#16A34A" },
    { name: "Waiting", value: 27, color: "#F59E0B" },
    { name: "Rejected", value: 11, color: "#DC2626" },
];

// ─── Claim Records ────────────────────────────────────────────────────────────

export const claimRecords: ClaimRecord[] = [
    {
        id: "CLM-001",
        tanggal: "2025-06-28",
        nomorClaim: "CLM-2025-0128",
        vendor: "PT Maju Bersama",
        invoice: "INV-2025-0841",
        kategori: "Pengiriman",
        jumlahClaim: 125_000_000,
        pic: "Kevin A.",
        status: "Waiting Approval",
        keterangan: "Keterlambatan pengiriman melebihi SLA 48 jam, kerugian operasional.",
        claimDibuat: "2025-06-28T07:00:00",
        diajukan: "2025-06-28T08:30:00",
        diReview: "2025-06-28T10:00:00",
        selesai: null,
    },
    {
        id: "CLM-002",
        tanggal: "2025-06-27",
        nomorClaim: "CLM-2025-0127",
        vendor: "CV Sinar Jaya",
        invoice: "INV-2025-0835",
        kategori: "Kerusakan Barang",
        jumlahClaim: 87_500_000,
        pic: "Anin P.",
        status: "Approved",
        keterangan: "Barang rusak saat transit, foto dokumentasi terlampir.",
        claimDibuat: "2025-06-27T09:00:00",
        diajukan: "2025-06-27T10:15:00",
        diReview: "2025-06-27T13:00:00",
        selesai: "2025-06-27T15:30:00",
    },
    {
        id: "CLM-003",
        tanggal: "2025-06-27",
        nomorClaim: "CLM-2025-0126",
        vendor: "PT Logistik Prima",
        invoice: "INV-2025-0828",
        kategori: "Kelebihan Tagihan",
        jumlahClaim: 43_250_000,
        pic: "Rizky D.",
        status: "Approved",
        keterangan: "Tagihan ganda untuk rute yang sama, selisih teridentifikasi.",
        claimDibuat: "2025-06-27T08:00:00",
        diajukan: "2025-06-27T09:00:00",
        diReview: "2025-06-27T11:00:00",
        selesai: "2025-06-27T14:00:00",
    },
    {
        id: "CLM-004",
        tanggal: "2025-06-26",
        nomorClaim: "CLM-2025-0125",
        vendor: "UD Karya Agung",
        invoice: "INV-2025-0820",
        kategori: "Kesalahan Picking",
        jumlahClaim: 56_000_000,
        pic: "Dimas F.",
        status: "Rejected",
        keterangan: "Klaim ditolak karena tidak disertai bukti pendukung yang memadai.",
        claimDibuat: "2025-06-26T10:00:00",
        diajukan: "2025-06-26T11:30:00",
        diReview: "2025-06-26T14:00:00",
        selesai: "2025-06-26T16:00:00",
    },
    {
        id: "CLM-005",
        tanggal: "2025-06-26",
        nomorClaim: "CLM-2025-0124",
        vendor: "PT Trans Nusantara",
        invoice: "INV-2025-0815",
        kategori: "Pengiriman",
        jumlahClaim: 98_750_000,
        pic: "Budi S.",
        status: "Waiting Approval",
        keterangan: "Pengiriman ke lokasi salah, membutuhkan re-deliver.",
        claimDibuat: "2025-06-26T07:30:00",
        diajukan: "2025-06-26T09:00:00",
        diReview: "2025-06-26T11:30:00",
        selesai: null,
    },
    {
        id: "CLM-006",
        tanggal: "2025-06-25",
        nomorClaim: "CLM-2025-0123",
        vendor: "CV Delta Cargo",
        invoice: "INV-2025-0807",
        kategori: "Lainnya",
        jumlahClaim: 32_000_000,
        pic: "Kevin A.",
        status: "Approved",
        keterangan: "Klaim kompensasi akibat force majeure, disepakati bersama.",
        claimDibuat: "2025-06-25T08:00:00",
        diajukan: "2025-06-25T09:30:00",
        diReview: "2025-06-25T12:00:00",
        selesai: "2025-06-25T14:30:00",
    },
    {
        id: "CLM-007",
        tanggal: "2025-06-25",
        nomorClaim: "CLM-2025-0122",
        vendor: "PT Maju Bersama",
        invoice: "INV-2025-0800",
        kategori: "Kerusakan Barang",
        jumlahClaim: 210_000_000,
        pic: "Anin P.",
        status: "Rejected",
        keterangan: "Kerusakan tidak tercakup dalam klausul asuransi vendor.",
        claimDibuat: "2025-06-25T09:00:00",
        diajukan: "2025-06-25T10:30:00",
        diReview: "2025-06-25T13:30:00",
        selesai: "2025-06-25T16:00:00",
    },
    {
        id: "CLM-008",
        tanggal: "2025-06-24",
        nomorClaim: "CLM-2025-0121",
        vendor: "CV Sinar Jaya",
        invoice: "INV-2025-0793",
        kategori: "Kelebihan Tagihan",
        jumlahClaim: 67_500_000,
        pic: "Rizky D.",
        status: "Approved",
        keterangan: "Selisih tarif akibat perubahan zona pengiriman, disetujui pengembalian.",
        claimDibuat: "2025-06-24T08:30:00",
        diajukan: "2025-06-24T10:00:00",
        diReview: "2025-06-24T12:30:00",
        selesai: "2025-06-24T15:00:00",
    },
    {
        id: "CLM-009",
        tanggal: "2025-06-24",
        nomorClaim: "CLM-2025-0120",
        vendor: "PT Logistik Prima",
        invoice: "INV-2025-0786",
        kategori: "Pengiriman",
        jumlahClaim: 145_000_000,
        pic: "Dimas F.",
        status: "Waiting Approval",
        keterangan: "Paket hilang dalam proses transit, sedang dalam investigasi.",
        claimDibuat: "2025-06-24T07:00:00",
        diajukan: "2025-06-24T09:00:00",
        diReview: "2025-06-24T11:00:00",
        selesai: null,
    },
    {
        id: "CLM-010",
        tanggal: "2025-06-23",
        nomorClaim: "CLM-2025-0119",
        vendor: "UD Karya Agung",
        invoice: "INV-2025-0779",
        kategori: "Kesalahan Picking",
        jumlahClaim: 78_250_000,
        pic: "Budi S.",
        status: "Approved",
        keterangan: "SKU tertukar saat packing, vendor bertanggung jawab atas selisih.",
        claimDibuat: "2025-06-23T08:00:00",
        diajukan: "2025-06-23T09:30:00",
        diReview: "2025-06-23T12:00:00",
        selesai: "2025-06-23T15:00:00",
    },
    {
        id: "CLM-011",
        tanggal: "2025-06-23",
        nomorClaim: "CLM-2025-0118",
        vendor: "PT Trans Nusantara",
        invoice: "INV-2025-0772",
        kategori: "Lainnya",
        jumlahClaim: 19_500_000,
        pic: "Kevin A.",
        status: "Waiting Approval",
        keterangan: "Perbedaan berat kiriman vs tagihan, menunggu konfirmasi timbangan.",
        claimDibuat: "2025-06-23T09:30:00",
        diajukan: "2025-06-23T11:00:00",
        diReview: "2025-06-23T13:30:00",
        selesai: null,
    },
    {
        id: "CLM-012",
        tanggal: "2025-06-22",
        nomorClaim: "CLM-2025-0117",
        vendor: "CV Delta Cargo",
        invoice: "INV-2025-0765",
        kategori: "Pengiriman",
        jumlahClaim: 54_000_000,
        pic: "Anin P.",
        status: "Rejected",
        keterangan: "Klaim melewati batas waktu pengajuan yang telah disepakati.",
        claimDibuat: "2025-06-22T10:00:00",
        diajukan: "2025-06-22T14:00:00",
        diReview: "2025-06-22T16:00:00",
        selesai: "2025-06-22T17:00:00",
    },
];

// ─── Filter option lists ──────────────────────────────────────────────────────

export const VENDOR_OPTIONS = [
    "PT Maju Bersama",
    "CV Sinar Jaya",
    "PT Logistik Prima",
    "UD Karya Agung",
    "PT Trans Nusantara",
    "CV Delta Cargo",
];

export const STATUS_OPTIONS: ClaimRecord["status"][] = [
    "Waiting Approval",
    "Approved",
    "Rejected",
];

export const CATEGORY_OPTIONS: ClaimRecord["kategori"][] = [
    "Pengiriman",
    "Kerusakan Barang",
    "Kelebihan Tagihan",
    "Kesalahan Picking",
    "Lainnya",
];
