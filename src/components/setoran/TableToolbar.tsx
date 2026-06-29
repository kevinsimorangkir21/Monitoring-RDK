"use client";

import { memo, useState, useCallback } from "react";
import { Search, Download, RefreshCw, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { BULAN_OPTIONS, TANGGAL_OPTIONS } from "@/mock/setoran";
import type { SetoranFilter } from "@/types/setoran";

interface Props {
    totalRecords: number;
    filter: SetoranFilter;
    onFilterChange: (patch: Partial<SetoranFilter>) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

const TableToolbar = memo(function TableToolbar({
    totalRecords, filter, onFilterChange, onExport, onRefresh,
}: Props) {
    const [spinning, setSpinning] = useState(false);

    const handleRefresh = useCallback(async () => {
        if (spinning) return;
        setSpinning(true);
        try { await onRefresh?.(); } finally { setTimeout(() => setSpinning(false), 700); }
    }, [spinning, onRefresh]);

    return (
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            {/* Row 1: title + actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate">Detail Setoran Salesman</p>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[11px] font-semibold">
                        {totalRecords} Data
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                    <button
                        type="button"
                        onClick={onExport}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                        <Download size={13} />Export
                    </button>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={spinning}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors hover:border-[#D1D5DB] disabled:opacity-50"
                    >
                        <motion.span
                            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                            transition={spinning ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}}
                            className="flex"
                        >
                            <RefreshCw size={13} />
                        </motion.span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Row 2: filters */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                        type="text"
                        value={filter.search}
                        onChange={(e) => onFilterChange({ search: e.target.value })}
                        placeholder="Cari nama salesman..."
                        className="h-8 w-48 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#111827] pl-8 pr-3 outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all"
                    />
                </div>

                {/* Filter Bulan */}
                <div className="relative flex items-center">
                    <Filter size={11} className="absolute left-2.5 text-[#9CA3AF]" />
                    <select
                        value={filter.bulan}
                        onChange={(e) => onFilterChange({ bulan: e.target.value })}
                        className="h-8 pl-7 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#374151] outline-none focus:border-[#DC2626] appearance-none cursor-pointer"
                    >
                        <option value="">Semua Bulan</option>
                        {BULAN_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                {/* Filter Tanggal */}
                <div className="relative flex items-center">
                    <Filter size={11} className="absolute left-2.5 text-[#9CA3AF]" />
                    <select
                        value={filter.tanggal}
                        onChange={(e) => onFilterChange({ tanggal: e.target.value })}
                        className="h-8 pl-7 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#374151] outline-none focus:border-[#DC2626] appearance-none cursor-pointer"
                    >
                        <option value="">Semua Tanggal</option>
                        {TANGGAL_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Clear */}
                {(filter.search || filter.bulan || filter.tanggal) && (
                    <button
                        onClick={() => onFilterChange({ search: "", bulan: "", tanggal: "" })}
                        className="h-8 px-3 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs text-[#6B7280] font-medium transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
});

export default TableToolbar;
