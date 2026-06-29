/**
 * Claim Vendor — Shared Type Definitions
 */

// ─── Core status ──────────────────────────────────────────────────────────────

export type ClaimStatus = "Waiting Approval" | "Approved" | "Rejected";

// ─── Claim category ───────────────────────────────────────────────────────────

export type ClaimCategory =
    | "Pengiriman"
    | "Kerusakan Barang"
    | "Kelebihan Tagihan"
    | "Kesalahan Picking"
    | "Lainnya";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface ClaimRecord {
    id: string;
    tanggal: string;           // "2025-06-28"
    nomorClaim: string;        // "CLM-2025-0001"
    vendor: string;
    invoice: string;           // "INV-2025-0001"
    kategori: ClaimCategory;
    jumlahClaim: number;       // IDR
    pic: string;
    status: ClaimStatus;
    keterangan: string;
    // Timeline ISO datetimes
    claimDibuat: string;
    diajukan: string;
    diReview: string;
    selesai: string | null;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface ClaimKPI {
    totalClaim: number;
    waitingApproval: number;
    approved: number;
    rejected: number;
    totalNilai: number;
    approvedNilai: number;
    approvalRate: number;
    rejectionRate: number;
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface ClaimTrendItem {
    tanggal: string;
    total: number;
    approved: number;
    rejected: number;
}

export interface ClaimByVendorItem {
    vendor: string;
    total: number;
    nilai: number;
}

export interface ClaimByCategoryItem {
    kategori: string;
    total: number;
    color: string;
}

export interface ApprovalProgressItem {
    name: string;
    value: number;
    color: string;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type ClaimSortKey = keyof Pick<
    ClaimRecord,
    "tanggal" | "nomorClaim" | "vendor" | "invoice" | "kategori" | "jumlahClaim" | "pic" | "status"
>;

export interface ClaimSort {
    key: ClaimSortKey;
    direction: "asc" | "desc";
}
