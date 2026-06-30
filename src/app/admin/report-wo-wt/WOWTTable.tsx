"use client";

/**
 * WOWTTable — Paginated detail table for WO-WT records.
 *
 * Columns: Tanggal | Wavepick | ZWP1 | ZWP2 | ZWP4 | ZWP5 | WO-WT Global | Aksi
 */

import { memo, useMemo, useState, useCallback, useEffect } from "react";
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Inbox, Pencil, Trash2,
} from "lucide-react";
import type { WoWtRecord } from "./types";

// ─── Page size ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatTanggal(iso: string): string {
    try {
        return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
        });
    } catch {
        return iso;
    }
}

function fmt(n: number): string {
    return n.toFixed(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="animate-pulse" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-[#F3F4F6] rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[#9CA3AF]">
                    <Inbox size={40} strokeWidth={1.25} />
                    <p className="text-sm font-medium">Belum ada data.</p>
                    <p className="text-xs">Tambahkan data menggunakan tombol &quot;+ Tambah WO-WT&quot;</p>
                </div>
            </td>
        </tr>
    );
}

interface PaginationProps {
    page: number; totalPages: number; pageSize: PageSizeOption; totalRecords: number;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: PageSizeOption) => void;
}

const Pagination = memo(function Pagination({
    page, totalPages, pageSize, totalRecords, onPageChange, onPageSizeChange,
}: PaginationProps) {
    const start = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalRecords);
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
                <span className="whitespace-nowrap">Tampilkan</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSizeOption)}
                    className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    aria-label="Baris per halaman"
                >
                    {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="whitespace-nowrap">{start}–{end} dari {totalRecords.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center gap-1" role="navigation" aria-label="Navigasi halaman">
                <button onClick={() => onPageChange(1)} disabled={page <= 1}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronsLeft size={16} />
                </button>
                <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                        if (i > 0) { const prev = arr[i - 1]; if (typeof prev === "number" && p - prev > 1) acc.push("…"); }
                        acc.push(p); return acc;
                    }, [])
                    .map((item, idx) =>
                        item === "…" ? (
                            <span key={`e-${idx}`} className="px-1 text-[#9CA3AF] text-sm">…</span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => onPageChange(item as number)}
                                aria-current={page === item ? "page" : undefined}
                                className={`min-w-[32px] h-8 px-1 rounded-lg text-sm font-medium ${page === item ? "bg-[#10B981] text-white" : "text-[#64748B] hover:bg-[#F3F4F6]"}`}
                            >{item}</button>
                        )
                    )}
                <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight size={16} />
                </button>
                <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface WOWTTableProps {
    data: WoWtRecord[];
    loading?: boolean;
    onEdit: (record: WoWtRecord) => void;
    onDelete: (record: WoWtRecord) => void;
}

export const WOWTTable = memo(function WOWTTable({ data, loading = false, onEdit, onDelete }: WOWTTableProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<PageSizeOption>(10);

    useEffect(() => { setPage(1); }, [data]);

    const totalRecords = data.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const safePage = Math.min(page, totalPages);

    const pageData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, safePage, pageSize]);

    const handlePageChange = useCallback((p: number) => {
        setPage(Math.max(1, Math.min(p, totalPages)));
    }, [totalPages]);

    const handlePageSizeChange = useCallback((s: PageSizeOption) => {
        setPageSize(s);
        setPage(1);
    }, []);

    const COLS = ["Tanggal", "Wavepick", "ZWP1", "ZWP2", "ZWP4", "ZWP5", "WO-WT Global", "Aksi"];

    return (
        <section className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden" aria-label="Tabel WO-WT">
            <div className="p-5 border-b border-[#E5E7EB]">
                <h2 className="text-sm font-bold text-[#111827]">Detail WO-WT</h2>
                {!loading && (
                    <p className="text-xs text-[#64748B] mt-1">{totalRecords.toLocaleString("id-ID")} total record</p>
                )}
            </div>

            <div className="overflow-x-auto" role="region" aria-label="Scroll tabel">
                <table className="w-full text-sm" aria-label="Data WO-WT">
                    <thead className="bg-[#F9FAFB]">
                        <tr>
                            {COLS.map((col) => (
                                <th key={col} scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                        {loading ? (
                            Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
                        ) : totalRecords === 0 ? (
                            <EmptyState />
                        ) : (
                            pageData.map((record) => (
                                <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{formatTanggal(record.tanggal)}</td>
                                    <td className="px-4 py-3 font-medium text-[#111827] whitespace-nowrap text-xs">{record.wavepick}</td>
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{fmt(record.zwp1)}%</td>
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{fmt(record.zwp2)}%</td>
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{fmt(record.zwp4)}%</td>
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{fmt(record.zwp5)}%</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${record.woWtGlobal >= 90
                                                ? "bg-emerald-50 text-emerald-700"
                                                : record.woWtGlobal >= 80
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}>
                                            {fmt(record.woWtGlobal)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => onEdit(record)}
                                                aria-label={`Edit ${record.wavepick}`}
                                                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] hover:text-emerald-600 transition-colors">
                                                <Pencil size={14} />
                                            </button>
                                            <button type="button" onClick={() => onDelete(record)}
                                                aria-label={`Hapus ${record.wavepick}`}
                                                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] hover:text-red-600 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && totalRecords > 0 && (
                <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </section>
    );
});

export default WOWTTable;
