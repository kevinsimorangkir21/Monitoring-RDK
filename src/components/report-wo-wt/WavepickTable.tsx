"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { WavepickRecord, WavepickSort, WavepickSortKey } from "@/types/reportWoWt";
import StatusBadge from "./StatusBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

function SortIcon({ colKey, sort }: { colKey: WavepickSortKey; sort: WavepickSort | null }) {
    if (sort?.key !== colKey) return <ChevronsUpDown size={12} className="text-[#9CA3AF]" />;
    return sort.direction === "asc"
        ? <ChevronUp size={12} className="text-[#DC2626]" />
        : <ChevronDown size={12} className="text-[#DC2626]" />;
}

function pct(v: number) {
    return (
        <span className={`font-semibold ${v >= 90 ? "text-emerald-600" : v >= 85 ? "text-amber-600" : "text-red-600"}`}>
            {v.toFixed(1)}%
        </span>
    );
}

const COLUMNS: { key: WavepickSortKey; label: string; align?: string }[] = [
    { key: "date", label: "Date" },
    { key: "wavepick", label: "Wavepick" },
    { key: "zwp1", label: "ZWP1", align: "text-right" },
    { key: "zwp2", label: "ZWP2", align: "text-right" },
    { key: "zwp4", label: "ZWP4", align: "text-right" },
    { key: "zwp5", label: "ZWP5", align: "text-right" },
    { key: "average", label: "Average", align: "text-right" },
    { key: "status", label: "Status" },
];

interface Props {
    paginated: WavepickRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: WavepickSort | null;
    search: string;
    onSort: (key: WavepickSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onSearchChange: (q: string) => void;
    onRowView: (record: WavepickRecord) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

const WavepickTable = memo(function WavepickTable({
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
            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
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
                                    <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap">{record.date}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-semibold text-[#DC2626] whitespace-nowrap">{record.wavepick}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-right whitespace-nowrap">{pct(record.zwp1)}</td>
                                    <td className="px-4 py-3.5 text-xs text-right whitespace-nowrap">{pct(record.zwp2)}</td>
                                    <td className="px-4 py-3.5 text-xs text-right whitespace-nowrap">{pct(record.zwp4)}</td>
                                    <td className="px-4 py-3.5 text-xs text-right whitespace-nowrap">{pct(record.zwp5)}</td>
                                    <td className="px-4 py-3.5 text-xs font-bold text-right whitespace-nowrap text-[#111827]">
                                        {record.average.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <button
                                            onClick={() => onRowView(record)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-[11px] font-semibold transition-colors"
                                            aria-label={`Detail ${record.wavepick}`}
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

export default WavepickTable;
