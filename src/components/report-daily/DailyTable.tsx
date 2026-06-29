"use client";

/**
 * DailyTable — Report Daily enterprise data table.
 *
 * Columns (same across all three tabs, matching original HTML):
 *   Tanggal | Division | Jenis Report | Keterangan / Value | Informasi Tambahan
 *
 * Features: sticky header, sortable, search, hover row, pagination,
 *           export, refresh, per-tab title, status badge on Jenis Report.
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { DailyRecord, DailyRecordSort, DailyRecordSortKey } from "@/types/reportDaily";
import StatusBadge from "./StatusBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
    if (dir === "asc") return <ChevronUp size={12} className="text-[#DC2626]" />;
    if (dir === "desc") return <ChevronDown size={12} className="text-[#DC2626]" />;
    return <ChevronsUpDown size={12} className="text-[#D1D5DB]" />;
}

// ─── Division badge ───────────────────────────────────────────────────────────

const DIVISION_STYLES: Record<string, string> = {
    "Transport": "bg-red-50    text-red-700    border-red-200",
    "WH FG": "bg-blue-50   text-blue-700   border-blue-200",
    "WH BS": "bg-violet-50 text-violet-700 border-violet-200",
};

function DivisionBadge({ division }: { division: string }) {
    const cls = DIVISION_STYLES[division] ?? "bg-slate-50 text-slate-700 border-slate-200";
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wide ${cls}`}>
            {division}
        </span>
    );
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
    key: string;
    label: string;
    sortKey?: DailyRecordSortKey;
}

const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal", sortKey: "tanggal" },
    { key: "division", label: "Division", sortKey: "division" },
    { key: "jenisReport", label: "Jenis Report", sortKey: "jenisReport" },
    { key: "keterangan", label: "Keterangan / Value", sortKey: "keterangan" },
    { key: "informasiTambahan", label: "Informasi Tambahan" },
];

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
    record: DailyRecord;
    index: number;
}

const TableRow = memo(function TableRow({ record, index }: RowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.13, delay: index * 0.018 }}
            className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.tanggal}
            </td>
            <td className="px-4 py-3">
                <DivisionBadge division={record.division} />
            </td>
            <td className="px-4 py-3">
                <StatusBadge label={record.jenisReport} />
            </td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827]">
                {record.keterangan}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B]">
                {record.informasiTambahan}
            </td>
        </motion.tr>
    );
});

// ─── Main Table ───────────────────────────────────────────────────────────────

interface DailyTableProps {
    title: string;
    paginated: DailyRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: DailyRecordSort | null;
    search: string;
    onSort: (k: DailyRecordSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

export default function DailyTable({
    title,
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
}: DailyTableProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Toolbar */}
            <TableToolbar
                title={title}
                totalRecords={totalRecords}
                search={search}
                onSearchChange={onSearchChange}
                onExport={onExport}
                onRefresh={onRefresh}
            />

            {/* Scrollable table with thin custom scrollbar */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[720px] text-sm">
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
                                            <SortIcon dir={sort?.key === col.sortKey ? sort.direction : null} />
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
                                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-[#9CA3AF]">
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
