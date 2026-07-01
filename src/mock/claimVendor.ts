/**
 * Claim Vendor — Mock Data (dikosongkan)
 * Modul baru menggunakan local CRUD state di /admin/claim-vendor/
 * File ini dipertahankan untuk kompatibilitas dengan komponen lama.
 */

import type {
    ClaimRecord, ClaimKPI,
    ClaimTrendItem, ClaimByVendorItem,
    ClaimByCategoryItem, ApprovalProgressItem,
} from "@/types/claimVendor";

// ─── KPI (kosong) ─────────────────────────────────────────────────────────────

export const KPI: ClaimKPI = {
    totalClaim: 0,
    waitingApproval: 0,
    approved: 0,
    rejected: 0,
    totalNilai: 0,
    approvedNilai: 0,
    approvalRate: 0,
    rejectionRate: 0,
};

// ─── Charts (kosong) ──────────────────────────────────────────────────────────

export const claimTrendData: ClaimTrendItem[] = [];
export const claimByVendorData: ClaimByVendorItem[] = [];
export const claimByCategoryData: ClaimByCategoryItem[] = [];
export const approvalProgressData: ApprovalProgressItem[] = [];
export const claimRecords: ClaimRecord[] = [];

// ─── Filter options ───────────────────────────────────────────────────────────

export const VENDOR_OPTIONS: string[] = [];
export const STATUS_OPTIONS: ClaimRecord["status"][] = ["Waiting Approval", "Approved", "Rejected"];
export const CATEGORY_OPTIONS: ClaimRecord["kategori"][] = [
    "Pengiriman", "Kerusakan Barang", "Kelebihan Tagihan", "Kesalahan Picking", "Lainnya",
];
