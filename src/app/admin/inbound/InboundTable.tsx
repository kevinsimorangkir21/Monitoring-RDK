"use client";

/**
 * InboundTable — Detail table.
 *
 * Columns: Tanggal | Shifting | Nomor_FO | Nopol | Plant Pabrik |
 *          Jenis_Bongkaran | Total Box | Nomor GR | Total Slipsheet | Action
 */

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, Search, X } from "lucide-react";
import type { InboundRecord } from "./types";

// ─── Status / badge helpers ───────────────────────────────────────────────────

const JENIS_STYLE: Record<string, string> = {
    SLIPSHEET: "bg-violet-50 text-violet-700 border-violet-200",
    CURAH: "bg-red-50 text-red-700 border-red-200",
};
function JenisBadge({ jenis }: { jenis: string }) {
    const cls = JENIS_STYLE[jenis] ?? "bg-gray-50 text-gray-700 border-gray-200";
    return <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>{jenis}</span>;
}

const SHIFT_STYLE: Record<string, string> = {
    "Shift 1": "bg-blue-50 text-blue-700 border-blue-200",
    "Shift 2": "bg-red-50 text-red-700 border-red-200",
    "Shift 3": "bg-green-50 text-green-700 border-green-200",
};
function ShiftBadge({ shift }: { shift: string }) {
    const cls = SHIFT_STYLE[shift] ?? "bg-gray-50 text-gray-700 border-gray-200";
    return <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>{shift}</span>;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<InboundRecord, "tanggal" | "shifting" | "nomorFO" | "nopol" | "plantPabrik" | "jenisBongkaran" | "totalBox" | "totalSlipsheet">;
interface SortState { key: SortKey; dir: "asc" | "desc" }

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
    if (!active) return <ChevronsUpDown size={12} className="text-[#D1D5DB]" />;
    return dir === "asc" ? <ChevronUp size={12} className="text-[#DC2626]" /> : <ChevronDown size={12} className="text-[#DC2626]" />;
}

// ─── Columns ─────────────────────────────────────────────────────────────────

interface ColDef { key: string; label: string; sortKey?: SortKey; align?: "right" }

const COLUMNS: ColDef[] = [
    { key: "tanggal", label: "Tanggal", sortKey: "tanggal" },
    { key: "shifting", label: "Shifting", sortKey: "shifting" },
    { key: "nomorFO", label: "Nomor FO", sortKey: "nomorFO" },
    { key: "nopol", label: "Nopol", sortKey: "nopol" },
    { key: "plantPabrik", label: "Plant Pabrik", sortKey: "plantPabrik" },
    { key: "jenisBongkaran", label: "Jenis Bongkaran", sortKey: "jenisBongkaran" },
    { key: "totalBox", label: "Total Box", sortKey: "totalBox", align: "right" },
    { key: "nomorGR", label: "Nomor GR" },
    { key: "totalSlipsheet", label: "Total Slipsheet", sortKey: "totalSlipsheet", align: "right" },
    { key: "action", label: "Aksi" },
];

const PAGE_SIZES = [10, 25, 50] as const;

// ─── Row ─────────────────────────────────────────────────────────────────────

const TableRow = memo(function TableRow({
    record, index, onEdit, onDelete,
}: { record: InboundRecord; index: number; onEdit: (r: InboundRecord) => void; onDelete: (r: InboundRecord) => void }) {
    return (
        <motion.tr initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.13, delay: index * 0.018 }}
            className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150">
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.tanggal}</td>
            <td className="px-4 py-3"><ShiftBadge shift={record.shifting} /></td>
            <td className="px-4 py-3 text-xs font-mono font-medium text-[#111827] whitespace-nowrap">{record.nomorFO}</td>
            <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">{record.nopol}</td>
            <td className="px-4 py-3">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5F7FB] text-[#374151] border border-[#E5E7EB]">{record.plantPabrik}</span>
            </td>
            <td className="px-4 py-3"><JenisBadge jenis={record.jenisBongkaran} /></td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] text-right tabular-nums whitespace-nowrap">{record.totalBox.toLocaleString("id-ID")}</td>
            <td className="px-4 py-3 text-xs font-mono text-[#64748B] whitespace-nowrap">{record.nomorGR}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#111827] text-right tabular-nums whitespace-nowrap">{record.totalSlipsheet.toLocaleString("id-ID")}</td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onEdit(record)} aria-label={`Edit ${record.nomorFO}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(record)} aria-label={`Hapus ${record.nomorFO}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200">
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InboundTable({
    data, onEdit, onDelete,
}: { data: InboundRecord[]; onEdit: (r: InboundRecord) => void; onDelete: (r: InboundRecord) => void }) {
    const [sort, setSort] = useState<SortState>({ key: "tanggal", dir: "desc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [search, setSearch] = useState("");

    const searched = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data;
        return data.filter((r) =>
            r.nomorFO.toLowerCase().includes(q) ||
            r.nopol.toLowerCase().includes(q) ||
            r.nomorGR.toLowerCase().includes(q)
        );
    }, [data, search]);

    const sorted = useMemo(() => [...searched].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
    }), [searched, sort]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = useMemo(() => sorted.slice((safePage - 1) * pageSize, safePage * pageSize), [sorted, safePage, pageSize]);

    const handleSort = useCallback((key: SortKey) => {
        setSort((prev) => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
        setPage(1);
    }, []);
    const handlePageSize = useCallback((n: number) => { setPageSize(n); setPage(1); }, []);
    const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, sorted.length);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[#E5E7EB]">
                <div>
                    <p className="text-sm font-bold text-[#111827]">Detail Inbound</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{sorted.length.toLocaleString("id-ID")} data ditemukan</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                    <input type="search" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Nomor FO, Nopol, Nomor GR..."
                        className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF]" />
                    {search && (
                        <button type="button" onClick={() => handleSearch("")} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                    <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th key={col.key}
                                    onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                                    className={["px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] select-none whitespace-nowrap",
                                        col.sortKey ? "cursor-pointer hover:text-[#111827] transition-colors" : "",
                                        col.align === "right" ? "text-right" : ""].join(" ")}>
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
                            {paginated.length === 0
                                ? <tr><td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-[#9CA3AF]">Tidak ada data ditemukan.</td></tr>
                                : paginated.map((r, i) => <TableRow key={r.id} record={r} index={i} onEdit={onEdit} onDelete={onDelete} />)}
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
                        { label: "«", action: () => setPage(1), disabled: safePage === 1, aria: "Halaman pertama" },
                        { label: "‹", action: () => setPage((p) => Math.max(1, p - 1)), disabled: safePage === 1, aria: "Sebelumnya" },
                    ].map((btn) => (
                        <button key={btn.label} type="button" onClick={btn.action} disabled={btn.disabled} aria-label={btn.aria}
                            className="w-7 h-7 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
                            {btn.label}
                        </button>
                    ))}
                    <span className="px-3 h-7 flex items-center text-xs text-[#374151] font-medium">{safePage} / {totalPages}</span>
                    {[
                        { label: "›", action: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: safePage === totalPages, aria: "Berikutnya" },
                        { label: "»", action: () => setPage(totalPages), disabled: safePage === totalPages, aria: "Halaman terakhir" },
                    ].map((btn) => (
                        <button key={btn.label} type="button" onClick={btn.action} disabled={btn.disabled} aria-label={btn.aria}
                            className="w-7 h-7 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
