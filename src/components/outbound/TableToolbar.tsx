"use client";

/**
 * TableToolbar (Outbound)
 * Left  — "Informasi Detail Log Aktivitas Outbound per FO" + record count badge
 * Right — Search | Export | Refresh
 */

import { memo } from "react";
import { Search } from "lucide-react";
import ExportButton from "./ExportButton";
import RefreshButton from "./RefreshButton";

interface TableToolbarProps {
    totalRecords: number;
    search: string;
    onSearchChange: (q: string) => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

const TableToolbar = memo(function TableToolbar({
    totalRecords,
    search,
    onSearchChange,
    onExport,
    onRefresh,
}: TableToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            {/* Title + count */}
            <div className="flex items-center gap-3 min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">
                    Informasi Detail Log Aktivitas Outbound per FO
                </p>
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[11px] font-semibold">
                    {totalRecords} Data
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                {/* Search */}
                <div className="relative">
                    <Search
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari FO, nopol, status..."
                        className="h-8 w-52 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#111827] pl-8 pr-3 outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all"
                    />
                </div>
                <ExportButton onClick={onExport} label="Export" />
                <RefreshButton onRefresh={onRefresh} />
            </div>
        </div>
    );
});

export default TableToolbar;
