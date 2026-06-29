"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { SetoranRecord, SetoranSort, SetoranSortKey, SetoranFilter } from "@/types/setoran";
import DurationBadge from "./DurationBadge";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

function SortIcon({ colKey, sort }: { colKey: SetoranSortKey; sort: SetoranSort | null }) {
    if (sort?.key !== colKey) return <ChevronsUpDown size={12} className="text-[#9CA3AF]" />;
    return sort.direction === "asc"
        ? <ChevronUp size={12} className="text-[#DC2626]" />
        : <ChevronDown size={12} className="text-[#DC2626]" />;
}

const COLUMNS: { key: SetoranSortKey; label: string; align?: string }[] = [
    { key: "tanggal", label: "Tanggal" },
    { key: "namaSalesman", label: "Nama Salesman" },
    { key: "pulangKunjungan", label: "Pulang Kunjungan" },
    { key: "setoranKasir", label: "Setoran ke Kasir" },
    { key: "durasiSeconds", label: "Durasi", align: "text-center" },
    { key: "bulan", label: "Bulan" },
];

interface Props {
    paginated: SetoranRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: SetoranSort | null;
    filter: SetoranFilter;
    onSort: (key: SetoranSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onFilterChange: (patch: Partial<SetoranFilter>) => void;
    onRowView: (record: SetoranRecord) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

const SetoranTable = memo(function SetoranTable({
    paginated, totalRecords, page, pageSize, totalPages,
    sort, filter,
    onSort, onPageChange, onPageSizeChange, onFilterChange,
    onRowView, onExport, onRefresh,
}: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden">
            <TableToolbar
                totalRecords={totalRecords}
                filter={filter}
                onFilterChange={onFilterChange}
                onExport={onExport}
                onRefresh={onRefresh}
            />
            <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#DC2626] text-white">
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => onSort(col.key)}
                                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-[#B91C1C] transition-colors ${col.align ?? "text-left"}`}
                                >
                                    <div className={`flex items-center gap-1 ${col.align === "text-center" ? "justify-center" : ""}`}>
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
                                    <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap">{record.tanggal}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-semibold text-[#111827] whitespace-nowrap">{record.namaSalesman}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs font-mono text-[#374151] whitespace-nowrap">{record.pulangKunjungan}</td>
                                    <td className="px-4 py-3.5 text-xs font-mono text-[#374151] whitespace-nowrap">{record.setoranKasir}</td>
                                    <td className="px-4 py-3.5 text-center">
                                        <DurationBadge durasi={record.durasi} status={record.status} />
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#6B7280] whitespace-nowrap">{record.bulan}</td>
                                    <td className="px-4 py-3.5">
                                        <button
                                            onClick={() => onRowView(record)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-[11px] font-semibold transition-colors"
                                            aria-label={`Detail ${record.namaSalesman}`}
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

export default SetoranTable;
