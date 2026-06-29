"use client";

/**
 * ClaimTable — Enterprise data grid for Claim Vendor records.
 * Features: sticky header, sorting, search, pagination, row action.
 */

import { memo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { ClaimRecord, ClaimSort, ClaimSortKey } from "@/types/claimVendor";
import { fmtNumber } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ colKey, sort }: { colKey: ClaimSortKey; sort: ClaimSort | null }) {
    if (sort?.key !== colKey) return <ChevronsUpDown size={12} className="text-[#9CA3AF]" />;
    return sort.direction === "asc"
        ? <ChevronUp size={12} className="text-[#DC2626]" />
        : <ChevronDown size={12} className="text-[#DC2626]" />;
}

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS: { key: ClaimSortKey; label: string; align?: string }[] = [
    { key: "tanggal", label: "Tanggal" },
    { key: "nomorClaim", label: "No. Claim" },
    { key: "vendor", label: "Vendor" },
    { key: "invoice", label: "Invoice" },
    { key: "kategori", label: "Kategori" },
    { key: "jumlahClaim", label: "Jumlah Claim", align: "text-right" },
    { key: "pic", label: "PIC" },
    { key: "status", label: "Status" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    paginated: ClaimRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: ClaimSort | null;
    search: string;
    onSort: (key: ClaimSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onRowView: (record: ClaimRecord) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

// ─── Table ────────────────────────────────────────────────────────────────────

const ClaimTable = memo(function ClaimTable({
    paginated, totalRecords, page, pageSize, totalPages,
    sort, search,
    onSort, onPageChange, onPageSizeChange, onSearchChange,
    onRowView, onExport, onRefresh,
}: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden">
            <TableToolbar
                totalRecords={totalRecords}
                search={search}
                onSearchChange={onSearchChange}
                onExport={onExport}
                onRefresh={onRefresh}
            />

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#DC2626] text-white">
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => onSort(col.key)}
                                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-[#B91C1C] transition-colors ${col.align ?? "text-left"}`}
                                >
                                    <div className={`flex items-center gap-1 ${col.align === "text-right" ? "justify-end" : ""}`}>
                                        {col.label}
                                        <SortIcon colKey={col.key} sort={sort} />
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length + 2} className="text-center py-14 text-sm text-[#9CA3AF]">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        ) : (
                            paginated.map((record, idx) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-[#F3F4F6] hover:bg-red-50/50 transition-colors"
                                >
                                    <td className="px-4 py-3.5 text-xs text-[#9CA3AF] font-medium">
                                        {(page - 1) * pageSize + idx + 1}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap">
                                        {record.tanggal}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-semibold text-[#DC2626] whitespace-nowrap">
                                            {record.nomorClaim}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#374151] whitespace-nowrap max-w-[140px] truncate">
                                        {record.vendor}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap">
                                        {record.invoice}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-[11px] font-medium whitespace-nowrap">
                                            {record.kategori}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs font-semibold text-[#111827] text-right whitespace-nowrap">
                                        Rp {fmtNumber(record.jumlahClaim)}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#374151] whitespace-nowrap">
                                        {record.pic}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <button
                                            onClick={() => onRowView(record)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-[11px] font-semibold transition-colors"
                                            aria-label={`Detail ${record.nomorClaim}`}
                                        >
                                            <Eye size={12} />Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        </div>
    );
});

export default ClaimTable;
