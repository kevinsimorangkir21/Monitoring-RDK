"use client";

/**
 * OutboundTable — Paginated detail table for Outbound records.
 *
 * 14 columns:
 *   Tanggal | FREIGHT ORDER | Mobil Muat | S-TYPE | Assign Job | JAM TERIMA |
 *   STATUS | Selesai Muat | HARI | PUTARAN | ST | H2 | JAM RUNNING | Action
 *
 * S-TYPE column is kept for table display (matches Excel data structure),
 * but is no longer used in visualizations/charts.
 *
 * STATUS values: "Muat Pagi" | "Muat Inap"
 */

import React, { memo, useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import type { OutboundRecord } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutboundTableProps {
    data: OutboundRecord[];
    onEdit: (record: OutboundRecord) => void;
    onDelete: (record: OutboundRecord) => void;
    loading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

// ─── STATUS badge colors — Muat Pagi | Muat Inap ─────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    "Muat Pagi": "bg-amber-100 text-amber-700 border border-amber-200",
    "Muat Inap": "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border border-gray-200";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
            {status}
        </span>
    );
}

// ─── Column headers ───────────────────────────────────────────────────────────

const COLUMNS = [
    "Tanggal",
    "FREIGHT ORDER",
    "Mobil Muat",
    "S-TYPE",
    "Assign Job",
    "JAM TERIMA",
    "STATUS",
    "Selesai Muat",
    "HARI",
    "PUTARAN",
    "ST",
    "H2",
    "JAM RUNNING",
    "Action",
] as const;

// ─── OutboundTable Component ──────────────────────────────────────────────────

const OutboundTable = memo(function OutboundTable({
    data,
    onEdit,
    onDelete,
    loading = false,
}: OutboundTableProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => { setPage(1); }, [data]);

    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const pageData = data.slice(startIndex, endIndex);

    const handleEdit = useCallback((record: OutboundRecord) => { onEdit(record); }, [onEdit]);
    const handleDelete = useCallback((record: OutboundRecord) => { onDelete(record); }, [onDelete]);
    const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    }, []);
    const handlePrevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
    const handleNextPage = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            {COLUMNS.map((col) => (
                                <th
                                    key={col}
                                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <tr key={i} className="border-b border-[#E5E7EB]">
                                    {COLUMNS.map((col) => (
                                        <td key={col} className="px-4 py-3">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : total === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
                                        <Inbox size={40} strokeWidth={1.5} aria-hidden="true" />
                                        <span className="text-sm font-medium">Belum ada data.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pageData.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.tanggal}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-[#111827] whitespace-nowrap">{record.freightOrder}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.mobilMuat}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.sType}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.assignJob}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.jamTerima}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.selesaiMuat}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.hari}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.putaran}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] text-right whitespace-nowrap">{record.st}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] text-right whitespace-nowrap">{record.h2}</td>
                                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">{record.jamRunning}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(record)}
                                                title="Edit"
                                                aria-label={`Edit ${record.freightOrder}`}
                                                className="p-1.5 rounded-lg text-[#64748B] hover:text-emerald-600 hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                            >
                                                <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(record)}
                                                title="Hapus"
                                                aria-label={`Hapus ${record.freightOrder}`}
                                                className="p-1.5 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                                            >
                                                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {!loading && total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                    <div className="flex items-center gap-3 text-sm text-[#64748B]">
                        <span>Tampilkan</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
                            aria-label="Ukuran halaman"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span>{startIndex + 1}–{endIndex} dari {total} data</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            aria-label="Halaman sebelumnya"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#374151] hover:bg-white border border-transparent hover:border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                        </button>
                        <span className="px-3 py-1 text-sm text-[#374151] font-medium">
                            {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                            aria-label="Halaman berikutnya"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#374151] hover:bg-white border border-transparent hover:border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default OutboundTable;
