"use client";

/**
 * ScanOutTable — Scan Out DC Detail enterprise data grid.
 *
 * Columns: Tanggal | Jam | Nomor FO | Nomor DO | No. Polisi |
 *          Distribution Center | Driver | Total Box | Scanner | Status | Action
 *
 * Features: sticky header, sortable, search, hover row, pagination,
 *           export, refresh, thin scrollbar, Action → opens DetailDrawer.
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { ScanOutRecord, ScanOutSort, ScanOutSortKey } from "@/types/scanOutDC";
import { fmtNumber } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
    if (dir === "asc") return <ChevronUp size={12} className="text-[#DC2626]" />;
    if (dir === "desc") return <ChevronDown size={12} className="text-[#DC2626]" />;
    return <ChevronsUpDown size={12} className="text-[#D1D5DB]" />;
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
    key: string;
    label: string;
    sortKey?: ScanOutSortKey;
    align?: "right" | "center";
}

const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal", sortKey: "tanggal" },
    { key: "jam", label: "Jam", sortKey: "jam" },
    { key: "nomorFO", label: "Nomor FO", sortKey: "nomorFO" },
    { key: "nomorDO", label: "Nomor DO", sortKey: "nomorDO" },
    { key: "nomorPolisi", label: "No. Polisi", sortKey: "nomorPolisi" },
    { key: "distributionCenter", label: "Distribution Center", sortKey: "distributionCenter" },
    { key: "driver", label: "Driver" },
    { key: "totalBox", label: "Total Box", sortKey: "totalBox", align: "right" },
    { key: "scanner", label: "Scanner" },
    { key: "status", label: "Status", sortKey: "status" },
    { key: "action", label: "Aksi", align: "center" },
];

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
    record: ScanOutRecord;
    index: number;
    onView: (r: ScanOutRecord) => void;
}

const TableRow = memo(function TableRow({ record, index, onView }: RowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.13, delay: index * 0.018 }}
            className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.tanggal}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.jam}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] whitespace-nowrap">{record.nomorFO}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.nomorDO}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.nomorPolisi}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.distributionCenter}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.driver}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] text-right tabular-nums whitespace-nowrap">
                {fmtNumber(record.totalBox)}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.scanner}</td>
            <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() => onView(record)}
                    title="Lihat Detail"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors mx-auto"
                >
                    <Eye size={13} />
                </button>
            </td>
        </motion.tr>
    );
});

// ─── Main Table ───────────────────────────────────────────────────────────────

interface ScanOutTableProps {
    paginated: ScanOutRecord[];
    totalRecords: number;
    page: number; pageSize: number; totalPages: number;
    sort: ScanOutSort | null;
    search: string;
    onSort: (k: ScanOutSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onRowView: (r: ScanOutRecord) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

export default function ScanOutTable({
    paginated, totalRecords, page, pageSize, totalPages,
    sort, search, onSort, onPageChange, onPageSizeChange,
    onSearchChange, onRowView, onExport, onRefresh,
}: ScanOutTableProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            <TableToolbar
                totalRecords={totalRecords} search={search}
                onSearchChange={onSearchChange} onExport={onExport} onRefresh={onRefresh}
            />

            {/* Thin scrollbar */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[1000px] text-sm">
                    <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th key={col.key}
                                    onClick={col.sortKey ? () => onSort(col.sortKey!) : undefined}
                                    className={[
                                        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] select-none whitespace-nowrap",
                                        col.sortKey ? "cursor-pointer hover:text-[#111827] transition-colors" : "",
                                        col.align === "right" ? "text-right" : "",
                                        col.align === "center" ? "text-center" : "",
                                    ].join(" ")}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortKey && <SortIcon dir={sort?.key === col.sortKey ? sort.direction : null} />}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence initial={false}>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-[#9CA3AF]">
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r, i) => (
                                    <TableRow key={r.id} record={r} index={i} onView={onRowView} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page} totalPages={totalPages} pageSize={pageSize}
                totalRecords={totalRecords} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
            />
        </div>
    );
}
