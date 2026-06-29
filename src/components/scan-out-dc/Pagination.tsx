"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageRange(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
}

interface PaginationProps {
    page: number; totalPages: number; pageSize: number; totalRecords: number;
    onPageChange: (p: number) => void; onPageSizeChange: (s: number) => void;
}

const Pagination = memo(function Pagination({
    page, totalPages, pageSize, totalRecords, onPageChange, onPageSizeChange,
}: PaginationProps) {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalRecords);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
                <span>{start}–{end} dari {totalRecords} data</span>
                <div className="flex items-center gap-1.5">
                    <span>Tampilkan</span>
                    <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="h-7 rounded-lg bg-white border border-[#E5E7EB] text-[#374151] px-2 text-xs outline-none focus:border-[#DC2626]">
                        {[5, 10, 20, 50].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-[#E5E7EB] text-[#64748B] hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-30 transition-colors">
                    <ChevronLeft size={13} />
                </button>
                {pageRange(page, totalPages).map((p, i) =>
                    p === "…"
                        ? <span key={`e-${i}`} className="w-7 text-center text-xs text-[#64748B]">…</span>
                        : <button key={p} onClick={() => onPageChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${p === page ? "bg-[#DC2626] text-white shadow-sm" : "bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#DC2626] hover:text-[#DC2626]"}`}>
                            {p}
                        </button>
                )}
                <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-[#E5E7EB] text-[#64748B] hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-30 transition-colors">
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
});

export default Pagination;
