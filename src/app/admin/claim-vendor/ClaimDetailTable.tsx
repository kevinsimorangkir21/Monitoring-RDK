"use client";

/**
 * ClaimDetailTable — Detail Claim Vendor dengan kolom Action.
 * Kolom: No Mobil | Total Claiman | Lunas | Belum Bayar | Status | Aksi
 * Dropdown vendor filter tersedia.
 * Empty state: "Belum ada data."
 */

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp, ChevronDown, ChevronsUpDown,
    Pencil, Trash2, Search, X, ChevronDown as ChevronDownIcon,
} from "lucide-react";
import type { ClaimEntry } from "./types";
import { fmtRp } from "./claimVendorStore";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cls = status === "Lunas"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
            {status}
        </span>
    );
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<ClaimEntry, "tanggal" | "vendor" | "noMobil" | "totalClaim" | "belumDibayar">;
interface SortState { key: SortKey; dir: "asc" | "desc" }

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
    if (!active) return <ChevronsUpDown size={12} className="text-[#D1D5DB]" />;
    return dir === "asc"
        ? <ChevronUp size={12} className="text-[#DC2626]" />
        : <ChevronDown size={12} className="text-[#DC2626]" />;
}

// ─── Columns ──────────────────────────────────────────────────────────────────

interface ColDef { key: string; label: string; sortKey?: SortKey }

const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal", sortKey: "tanggal" },
    { key: "vendor", label: "Vendor", sortKey: "vendor" },
    { key: "noMobil", label: "No Mobil", sortKey: "noMobil" },
    { key: "totalClaim", label: "Total Claiman", sortKey: "totalClaim" },
    { key: "sudahDibayar", label: "Lunas" },
    { key: "belumDibayar", label: "Belum Bayar", sortKey: "belumDibayar" },
    { key: "status", label: "Status" },
    { key: "action", label: "Aksi" },
];

const PAGE_SIZES = [10, 25, 50] as const;

// ─── Row ──────────────────────────────────────────────────────────────────────

const TableRow = memo(function TableRow({
    record, index, onEdit, onDelete,
}: {
    record: ClaimEntry; index: number;
    onEdit: (r: ClaimEntry) => void;
    onDelete: (r: ClaimEntry) => void;
}) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.13, delay: index * 0.018 }}
            className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.tanggal}</td>
            <td className="px-4 py-3 text-xs font-medium text-[#374151] whitespace-nowrap">{record.vendor}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] whitespace-nowrap">{record.noMobil}</td>
            <td className="px-4 py-3 text-xs font-bold text-[#111827] whitespace-nowrap tabular-nums">{fmtRp(record.totalClaim)}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#16A34A] whitespace-nowrap tabular-nums">{fmtRp(record.sudahDibayar)}</td>
            <td className="px-4 py-3 text-xs font-semibold text-amber-600 whitespace-nowrap tabular-nums">{fmtRp(record.belumDibayar)}</td>
            <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onEdit(record)} aria-label={`Edit ${record.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(record)} aria-label={`Hapus ${record.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200">
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
});

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ClaimDetailTableProps {
    data: ClaimEntry[];
    vendors: string[];
    onEdit: (r: ClaimEntry) => void;
    onDelete: (r: ClaimEntry) => void;
}

export default function ClaimDetailTable({ data, vendors, onEdit, onDelete }: ClaimDetailTableProps) {
    const [sort, setSort] = useState<SortState>({ key: "tanggal", dir: "desc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [search, setSearch] = useState("");
    const [vendorFilter, setVendorFilter] = useState("");

    const filtered = useMemo(() => {
        let r = data;
        if (vendorFilter) r = r.filter((d) => d.vendor === vendorFilter);
        const q = search.trim().toLowerCase();
        if (q) r = r.filter((d) =>
            d.vendor.toLowerCase().includes(q) ||
            d.noMobil.toLowerCase().includes(q) ||
            d.tanggal.includes(q) ||
            d.status.toLowerCase().includes(q)
        );
        return r;
    }, [data, vendorFilter, search]);

    const sorted = useMemo(
        () => [...filtered].sort((a, b) => {
            const av = a[sort.key]; const bv = b[sort.key];
            const cmp = typeof av === "number" && typeof bv === "number"
                ? av - bv : String(av).localeCompare(String(bv));
            return sort.dir === "asc" ? cmp : -cmp;
        }),
        [filtered, sort]
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = useMemo(
        () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
        [sorted, safePage, pageSize]
    );

    const handleSort = useCallback((key: SortKey) => {
        setSort((prev) => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
        setPage(1);
    }, []);

    const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);
    const handlePageSize = useCallback((n: number) => { setPageSize(n); setPage(1); }, []);
    const handleVendor = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setVendorFilter(e.target.value); setPage(1);
    }, []);

    const start = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, sorted.length);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[#E5E7EB]">
                <div>
                    <p className="text-sm font-bold text-[#111827]">Detail Claim Vendor</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{sorted.length.toLocaleString("id-ID")} data</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Vendor dropdown */}
                    <div className="relative">
                        <select value={vendorFilter} onChange={handleVendor}
                            className="h-9 pl-3 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#374151] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 appearance-none">
                            <option value="">Semua Vendor</option>
                            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <ChevronDownIcon size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                        <input type="search" value={search} onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Cari vendor, nopol..."
                            className="h-9 w-48 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF]" />
                        {search && (
                            <button type="button" onClick={() => handleSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[800px] text-sm">
                    <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th key={col.key}
                                    onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                                    className={[
                                        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] select-none whitespace-nowrap",
                                        col.sortKey ? "cursor-pointer hover:text-[#111827] transition-colors" : "",
                                    ].join(" ")}>
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortKey && <SortIcon active={sort.key === col.sortKey} dir={sort.dir} />}
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
                                        Belum ada data.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r, i) => (
                                    <TableRow key={r.id} record={r} index={i} onEdit={onEdit} onDelete={onDelete} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <span>Tampilkan</span>
                    <select value={pageSize} onChange={(e) => handlePageSize(Number(e.target.value))}
                        className="h-7 px-2 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] bg-white outline-none focus:border-[#DC2626]">
                        {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span>{sorted.length > 0 ? `${start}–${end} dari ${sorted.length.toLocaleString("id-ID")}` : "0 data"}</span>
                </div>
                <div className="flex items-center gap-1">
                    {[
                        { label: "«", action: () => setPage(1), disabled: safePage === 1 },
                        { label: "‹", action: () => setPage((p) => Math.max(1, p - 1)), disabled: safePage === 1 },
                    ].map((btn) => (
                        <button key={btn.label} type="button" onClick={btn.action} disabled={btn.disabled}
                            className="w-7 h-7 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
                            {btn.label}
                        </button>
                    ))}
                    <span className="px-3 h-7 flex items-center text-xs text-[#374151] font-medium">{safePage} / {totalPages}</span>
                    {[
                        { label: "›", action: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: safePage === totalPages },
                        { label: "»", action: () => setPage(totalPages), disabled: safePage === totalPages },
                    ].map((btn) => (
                        <button key={btn.label} type="button" onClick={btn.action} disabled={btn.disabled}
                            className="w-7 h-7 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
