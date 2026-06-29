"use client";

import { memo, useState, useCallback } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    totalRecords: number;
    search: string;
    onSearchChange: (q: string) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

const TableToolbar = memo(function TableToolbar({
    totalRecords, search, onSearchChange, onExport, onRefresh,
}: Props) {
    const [spinning, setSpinning] = useState(false);

    const handleRefresh = useCallback(async () => {
        if (spinning) return;
        setSpinning(true);
        try { await onRefresh?.(); } finally { setTimeout(() => setSpinning(false), 700); }
    }, [spinning, onRefresh]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3 min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">Wavepick Activity Log</p>
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[11px] font-semibold">
                    {totalRecords} Data
                </span>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari wavepick, operator..."
                        className="h-8 w-52 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#111827] pl-8 pr-3 outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all"
                    />
                </div>
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
    );
});

export default TableToolbar;
