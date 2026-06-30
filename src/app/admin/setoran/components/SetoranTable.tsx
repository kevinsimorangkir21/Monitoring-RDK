"use client";

/**
 * SetoranTable — Paginated, responsive data table for setoran records.
 *
 * Columns: Tanggal, Nama Salesman, Pulang Kunjungan, Setoran ke Kasir, Durasi, [Aksi]
 *
 * Features:
 *  - Responsive horizontal scroll on small screens (overflow-x-auto)
 *  - Configurable page sizes: 10, 25, 50
 *  - Page range indicator: "1-10 dari 200"
 *  - DurasiStatus badge: Fast (green), Normal (blue), Slow (red)
 *  - Loading skeleton rows
 *  - Empty state when no records
 *  - Search result highlighting in Nama Salesman cells (Requirement 5.3)
 *  - Sortable columns for Tanggal and Durasi with direction indicators (Requirement 5.4)
 *  - Optional Action column with Edit/Delete buttons (Requirements 3.1, 4.1, 9.2, 13.2)
 *
 * Requirements: 3.1, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 8.3, 8.4, 8.5, 9.2, 13.2
 */

import React, { memo, useMemo, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import type { SetoranRecord, DurasiStatus } from "@/types/setoran";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Configurable page size options (Requirement 8.4) */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

// Sort direction type for column headers
export type SortDirection = "asc" | "desc" | null;

// Sortable column keys
export type SortableColumn = "tanggal" | "durasiSeconds";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SetoranTableProps {
    /** Filtered setoran records to display (Requirement 5.1) */
    data: SetoranRecord[];
    /** Shows skeleton rows while loading */
    loading?: boolean;
    /**
     * Search query for highlighting matching text in Nama Salesman cells.
     * When provided, matching substrings are highlighted with a yellow background.
     * Requirement 5.3
     */
    searchQuery?: string;
    /**
     * Called when the user clicks the edit (Pencil) action button for a record.
     * When provided together with or without onDelete, an "Aksi" column is rendered.
     * Requirements: 3.1, 9.2
     */
    onEdit?: (record: SetoranRecord) => void;
    /**
     * Called when the user clicks the delete (Trash2) action button for a record.
     * When provided together with or without onEdit, an "Aksi" column is rendered.
     * Requirements: 4.1, 13.2
     */
    onDelete?: (record: SetoranRecord) => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<DurasiStatus, { bg: string; text: string; label: string }> = {
    Fast: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "Fast",
    },
    Normal: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Normal",
    },
    Slow: {
        bg: "bg-red-50",
        text: "text-red-700",
        label: "Slow",
    },
};

function StatusBadge({ status }: { status: DurasiStatus }) {
    const style = STATUS_STYLES[status];
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
        >
            {style.label}
        </span>
    );
}

// ─── Date / Time Formatters ───────────────────────────────────────────────────

/**
 * Format an ISO date string (YYYY-MM-DD) to a localized display format.
 * e.g. "2025-06-28" → "28 Jun 2025"
 */
export function formatTanggal(tanggal: string): string {
    try {
        const date = new Date(`${tanggal}T00:00:00`);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return tanggal;
    }
}

// ─── Search Highlighting ──────────────────────────────────────────────────────

/**
 * Splits `text` by `query` (case-insensitive) and returns an array of React
 * nodes where matching substrings are wrapped in a highlighted <span>.
 *
 * When query is empty/blank, returns the original text as-is.
 *
 * Requirement 5.3
 */
export function highlightText(text: string, query: string): React.ReactNode {
    const trimmed = query.trim();
    if (!trimmed) return text;

    // Escape special regex characters so user input is treated as literal text
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    if (parts.length <= 1) return text;

    return (
        <>
            {parts.map((part, idx) =>
                regex.test(part) ? (
                    <span
                        key={idx}
                        className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5"
                        aria-label={`Cocok: ${part}`}
                    >
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
}

// ─── Sort Direction Icon ──────────────────────────────────────────────────────

/**
 * Renders an appropriate sort indicator icon for a column header.
 *
 * - No active sort: neutral double-chevron
 * - Active asc:  up chevron (emerald)
 * - Active desc: down chevron (emerald)
 *
 * Requirement 5.4
 */
function SortIcon({ direction }: { direction: SortDirection }) {
    if (direction === "asc") {
        return <ChevronUp size={14} className="text-emerald-600" aria-hidden="true" />;
    }
    if (direction === "desc") {
        return <ChevronDown size={14} className="text-emerald-600" aria-hidden="true" />;
    }
    return <ChevronsUpDown size={14} className="text-[#9CA3AF]" aria-hidden="true" />;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonRow({ hasActions }: { hasActions?: boolean }) {
    const colCount = hasActions ? 6 : 5;
    return (
        <tr className="animate-pulse" aria-hidden="true">
            {Array.from({ length: colCount }, (_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-[#F3F4F6] rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasActions }: { hasActions?: boolean }) {
    return (
        <tr>
            <td colSpan={hasActions ? 6 : 5} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[#9CA3AF]">
                    <Inbox size={40} strokeWidth={1.25} />
                    <p className="text-sm font-medium">Belum ada data.</p>
                    <p className="text-xs">Tambahkan data menggunakan tombol &quot;+ Tambah Setoran&quot;</p>
                </div>
            </td>
        </tr>
    );
}

// ─── Pagination Controls ──────────────────────────────────────────────────────

interface PaginationProps {
    page: number;
    totalPages: number;
    pageSize: PageSizeOption;
    totalRecords: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: PageSizeOption) => void;
}

const Pagination = memo(function Pagination({
    page,
    totalPages,
    pageSize,
    totalRecords,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const rangeStart = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalRecords);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E5E7EB]">
            {/* Page size selector + range indicator */}
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
                <span className="whitespace-nowrap">Tampilkan</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSizeOption)}
                    className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#10B981]"
                    aria-label="Baris per halaman"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
                <span className="whitespace-nowrap">
                    {rangeStart}–{rangeEnd} dari {totalRecords.toLocaleString("id-ID")}
                </span>
            </div>

            {/* Page navigation buttons */}
            <div className="flex items-center gap-1" role="navigation" aria-label="Navigasi halaman">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={page <= 1}
                    aria-label="Halaman pertama"
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Halaman sebelumnya"
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page number pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                        if (totalPages <= 5) return true;
                        if (p === 1 || p === totalPages) return true;
                        return Math.abs(p - page) <= 1;
                    })
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0) {
                            const prev = arr[idx - 1];
                            if (typeof prev === "number" && p - prev > 1) acc.push("…");
                        }
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((item, idx) =>
                        item === "…" ? (
                            <span key={`ellipsis-${idx}`} className="px-1 text-[#9CA3AF] text-sm">
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => onPageChange(item as number)}
                                aria-label={`Halaman ${item}`}
                                aria-current={page === item ? "page" : undefined}
                                className={`min-w-[32px] h-8 px-1 rounded-lg text-sm font-medium transition-colors ${page === item
                                    ? "bg-[#10B981] text-white"
                                    : "text-[#64748B] hover:bg-[#F3F4F6]"
                                    }`}
                            >
                                {item}
                            </button>
                        )
                    )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Halaman berikutnya"
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={page >= totalPages}
                    aria-label="Halaman terakhir"
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
});

// ─── Table Header ─────────────────────────────────────────────────────────────

const TABLE_COLUMNS: {
    key: string;
    label: string;
    className: string;
    sortKey?: SortableColumn;
}[] = [
        { key: "tanggal", label: "Tanggal", className: "min-w-[110px]", sortKey: "tanggal" },
        { key: "namaSalesman", label: "Nama Salesman", className: "min-w-[160px]" },
        { key: "pulangKunjungan", label: "Pulang Kunjungan", className: "min-w-[140px]" },
        { key: "setoranKasir", label: "Setoran ke Kasir", className: "min-w-[140px]" },
        { key: "durasi", label: "Durasi", className: "min-w-[120px]", sortKey: "durasiSeconds" },
    ];

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SetoranTable renders a paginated responsive table of setoran records.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.3, 8.4, 8.5
 */
export const SetoranTable = memo(function SetoranTable({
    data,
    loading = false,
    searchQuery = "",
    onEdit,
    onDelete,
}: SetoranTableProps) {
    /** Whether the "Aksi" action column should be shown */
    const hasActions = !!(onEdit || onDelete);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<PageSizeOption>(10);

    // ── Sort state (Requirement 5.4) ────────────────────────────────────────
    const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    /**
     * Toggle sort for a sortable column:
     *  - First click:  asc
     *  - Second click: desc
     *  - Third click:  clear (no sort)
     */
    const toggleSort = useCallback((colKey: SortableColumn) => {
        if (sortColumn !== colKey) {
            setSortColumn(colKey);
            setSortDirection("asc");
        } else if (sortDirection === "asc") {
            setSortDirection("desc");
        } else if (sortDirection === "desc") {
            setSortColumn(null);
            setSortDirection(null);
        } else {
            setSortColumn(colKey);
            setSortDirection("asc");
        }
        // Reset to page 1 on sort change
        setPage(1);
    }, [sortColumn, sortDirection]);

    // ── Reset to page 1 when data prop changes (filter applied) ───────────
    // Requirement 5.3, 5.4: table must update when filters change
    useEffect(() => {
        setPage(1);
    }, [data]);

    // ── Sort + paginate data ────────────────────────────────────────────────

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data;

        return [...data].sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            if (sortColumn === "tanggal") {
                aVal = a.tanggal; // ISO date string — lexicographic sort works correctly
                bVal = b.tanggal;
            } else {
                // durasiSeconds — numeric sort
                aVal = a.durasiSeconds;
                bVal = b.durasiSeconds;
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    const totalRecords = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

    // Clamp current page within valid range
    const safePage = Math.min(page, totalPages);

    /** Slice of records for the current page */
    const pageData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, safePage, pageSize]);

    const handlePageChange = useCallback(
        (newPage: number) => {
            const clamped = Math.max(1, Math.min(newPage, totalPages));
            setPage(clamped);
        },
        [totalPages]
    );

    const handlePageSizeChange = useCallback((newSize: PageSizeOption) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page when page size changes
    }, []);

    return (
        <section
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden"
            aria-label="Tabel setoran"
        >
            {/* Table header */}
            <div className="p-5 border-b border-[#E5E7EB]">
                <h2 className="text-sm font-bold text-[#111827]">Detail Setoran</h2>
                {!loading && (
                    <p className="text-xs text-[#64748B] mt-1">
                        {totalRecords.toLocaleString("id-ID")} total record
                    </p>
                )}
            </div>

            {/* Responsive table wrapper — horizontal scroll on small screens (Requirement 5.5, 8.3) */}
            <div className="overflow-x-auto" role="region" aria-label="Scroll tabel">
                <table className="w-full text-sm" aria-label="Data setoran">
                    <thead className="bg-[#F9FAFB]">
                        <tr>
                            {TABLE_COLUMNS.map((col) => {
                                const isActive = col.sortKey && sortColumn === col.sortKey;
                                const direction: SortDirection = isActive ? sortDirection : null;

                                return col.sortKey ? (
                                    // Sortable column header (Requirement 5.4)
                                    // aria-sort must be on the <th> element, not on the button inside it (ARIA spec)
                                    <th
                                        key={col.key}
                                        scope="col"
                                        aria-sort={
                                            isActive
                                                ? direction === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : "none"
                                        }
                                        className={`px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider ${col.className}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleSort(col.sortKey!)}
                                            className={`inline-flex items-center gap-1 group hover:text-[#111827] transition-colors ${isActive ? "text-emerald-700" : ""}`}
                                            aria-label={`Urutkan berdasarkan ${col.label}`}
                                        >
                                            {col.label}
                                            <SortIcon direction={direction} />
                                        </button>
                                    </th>
                                ) : (
                                    // Non-sortable column header
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider ${col.className}`}
                                    >
                                        {col.label}
                                    </th>
                                );
                            })}

                            {/* Action column header — only rendered when edit/delete callbacks are provided (Requirements 3.1, 4.1) */}
                            {hasActions && (
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider min-w-[80px]"
                                >
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F3F4F6]">
                        {loading ? (
                            // Loading state — 5 skeleton rows
                            Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} hasActions={hasActions} />)
                        ) : totalRecords === 0 ? (
                            // Empty state
                            <EmptyState hasActions={hasActions} />
                        ) : (
                            // Data rows (Requirement 5.2)
                            pageData.map((record) => (
                                <tr
                                    key={record.id}
                                    className="hover:bg-[#F9FAFB] transition-colors"
                                >
                                    {/* Tanggal */}
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">
                                        {formatTanggal(record.tanggal)}
                                    </td>

                                    {/* Nama Salesman — with search highlight (Requirement 5.3) */}
                                    <td className="px-4 py-3 font-medium text-[#111827] whitespace-nowrap text-xs">
                                        {highlightText(record.namaSalesman, searchQuery)}
                                    </td>

                                    {/* Pulang Kunjungan */}
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">
                                        {record.pulangKunjungan}
                                    </td>

                                    {/* Setoran ke Kasir */}
                                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">
                                        {record.setoranKasir}
                                    </td>

                                    {/* Durasi + status badge */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#111827] text-xs font-medium">{record.durasi}</span>
                                            <StatusBadge status={record.status} />
                                        </div>
                                    </td>

                                    {/* Action cell — only rendered when edit/delete callbacks are provided (Requirements 3.1, 4.1, 9.2, 13.2) */}
                                    {hasActions && (
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {onEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(record)}
                                                        aria-label={`Edit setoran ${record.namaSalesman}`}
                                                        className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] hover:text-emerald-600 transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(record)}
                                                        aria-label={`Hapus setoran ${record.namaSalesman}`}
                                                        className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F3F4F6] hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination — only show when there is data and not loading (Requirement 8.4, 8.5) */}
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

export default SetoranTable;
