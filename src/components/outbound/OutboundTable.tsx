"use client";

/**
 * OutboundTable — Informasi Detail Log Aktivitas Outbound per FO
 *
 * Columns (exactly from original HTML dashboard):
 *   Tanggal | Freight Order | Mobil Muat | S-Type | Status | Jam Terima (Input FO) | Gate
 *
 * Features: sticky header, sortable, search, hover row, pagination, export, refresh.
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { OutboundRecord, OutboundSortState, OutboundSortKey } from "@/types/outbound";
import { fmtDateTime } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
    if (dir === "asc") return <ChevronUp size={12} className="text-[#DC2626]" />;
    if (dir === "desc") return <ChevronDown size={12} className="text-[#DC2626]" />;
    return <ChevronsUpDown size={12} className="text-[#D1D5DB]" />;
}

// ─── S-Type badge ─────────────────────────────────────────────────────────────

const STYPE_STYLES: Record<string, string> = {
    S1: "bg-red-50     text-red-700    border-red-200",
    S2: "bg-blue-50    text-blue-700   border-blue-200",
    S3: "bg-violet-50  text-violet-700 border-violet-200",
    S4: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function STypeBadge({ sType }: { sType: string }) {
    const cls = STYPE_STYLES[sType] ?? "bg-slate-50 text-slate-700 border-slate-200";
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wider ${cls}`}>
            {sType}
        </span>
    );
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
    key: string;
    label: string;
    sortKey?: OutboundSortKey;
}

const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal", sortKey: "tanggal" },
    { key: "freightOrder", label: "Freight Order", sortKey: "freightOrder" },
    { key: "mobilMuat", label: "Mobil Muat", sortKey: "mobilMuat" },
    { key: "sType", label: "S-Type", sortKey: "sType" },
    { key: "status", label: "Status", sortKey: "status" },
    { key: "jamTerima", label: "Jam Terima (Input FO)", sortKey: "jamTerima" },
    { key: "gate", label: "Gate", sortKey: "gate" },
];

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
    record: OutboundRecord;
    index: number;
}

const TableRow = memo(function TableRow({ record, index }: RowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, delay: index * 0.02 }}
            className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.tanggal}
            </td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] whitespace-nowrap">
                {record.freightOrder}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.mobilMuat}
            </td>
            <td className="px-4 py-3">
                <STypeBadge sType={record.sType} />
            </td>
            <td className="px-4 py-3">
                <StatusBadge status={record.status} />
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {fmtDateTime(record.jamTerima)}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.gate}
            </td>
        </motion.tr>
    );
});

// ─── Main Table ───────────────────────────────────────────────────────────────

interface OutboundTableProps {
    paginated: OutboundRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: OutboundSortState | null;
    search: string;
    onSort: (k: OutboundSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

export default function OutboundTable({
    paginated,
    totalRecords,
    page,
    pageSize,
    totalPages,
    sort,
    search,
    onSort,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onExport,
    onRefresh,
}: OutboundTableProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Toolbar */}
            <TableToolbar
                totalRecords={totalRecords}
                search={search}
                onSearchChange={onSearchChange}
                onExport={onExport}
                onRefresh={onRefresh}
            />

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                    {/* Sticky header */}
                    <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={col.sortKey ? () => onSort(col.sortKey!) : undefined}
                                    className={[
                                        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] select-none whitespace-nowrap",
                                        col.sortKey ? "cursor-pointer hover:text-[#111827] transition-colors" : "",
                                    ].join(" ")}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortKey && (
                                            <SortIcon
                                                dir={sort?.key === col.sortKey ? sort.direction : null}
                                            />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <AnimatePresence initial={false}>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={COLUMNS.length}
                                        className="py-16 text-center text-sm text-[#9CA3AF]"
                                    >
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r, i) => (
                                    <TableRow key={r.id} record={r} index={i} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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
}
