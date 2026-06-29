"use client";

/**
 * InboundTable — Informasi Detail Per Nomor FO (Inbound)
 *
 * Columns (exactly as original HTML dashboard):
 *   Tanggal & Jam | Nomor FO | Nopol | Plant | Jenis Bongkaran | Total Box | Nomor GR
 *
 * Features: sticky header, sortable columns, search, hover row,
 *           pagination, export, refresh. Light enterprise theme.
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { InboundRecord, SortState } from "@/types/inbound";
import { fmtDateTime, fmtNumber } from "@/utils/formatNumber";
import PlantBadge from "./PlantBadge";
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

type SortKey = SortState["key"];

interface ColDef {
    key: string;
    label: string;
    sortKey?: SortKey;
    align?: "left" | "right" | "center";
}

/** Only the 7 columns from the original HTML — no extras */
const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal & Jam", sortKey: "tanggal" },
    { key: "nomorFO", label: "Nomor FO", sortKey: "nomorFO" },
    { key: "noPolisi", label: "Nopol", sortKey: "noPolisi" },
    { key: "plant", label: "Plant", sortKey: "plant" },
    { key: "jenisBongkaran", label: "Jenis Bongkaran", sortKey: "jenisBongkaran" },
    { key: "totalBox", label: "Total Box", sortKey: "totalBox", align: "right" },
    { key: "nomorGR", label: "Nomor GR" },
];

// ─── Jenis Bongkaran badge ────────────────────────────────────────────────────

function JenisBadge({ jenis }: { jenis: string }) {
    const cls =
        jenis === "SlipSheet"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : "bg-red-50 text-red-700 border-red-200";
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>
            {jenis}
        </span>
    );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

interface RowProps {
    record: InboundRecord;
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
                {fmtDateTime(record.tanggal)}
            </td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] whitespace-nowrap">
                {record.nomorFO}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.noPolisi}
            </td>
            <td className="px-4 py-3">
                <PlantBadge plant={record.plant} />
            </td>
            <td className="px-4 py-3">
                <JenisBadge jenis={record.jenisBongkaran} />
            </td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] text-right tabular-nums whitespace-nowrap">
                {fmtNumber(record.totalBox)}
            </td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                {record.nomorGR}
            </td>
        </motion.tr>
    );
});

// ─── Main Table ───────────────────────────────────────────────────────────────

interface InboundTableProps {
    paginated: InboundRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: SortState | null;
    search: string;
    onSort: (k: SortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

export default function InboundTable({
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
}: InboundTableProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Toolbar: title, record count, search, export, refresh */}
            <TableToolbar
                totalRecords={totalRecords}
                search={search}
                onSearchChange={onSearchChange}
                onExport={onExport}
                onRefresh={onRefresh}
            />

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                    {/* Sticky header */}
                    <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={col.sortKey ? () => onSort(col.sortKey!) : undefined}
                                    className={[
                                        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] select-none whitespace-nowrap",
                                        col.sortKey
                                            ? "cursor-pointer hover:text-[#111827] transition-colors"
                                            : "",
                                        col.align === "right" ? "text-right" : "",
                                    ].join(" ")}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortKey && (
                                            <SortIcon
                                                dir={
                                                    sort?.key === col.sortKey ? sort.direction : null
                                                }
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
