"use client";

import { memo, useState, useCallback } from "react";
import { Search, RefreshCw, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "@/mock/users";
import type { UserFilter } from "@/types/users";

interface Props {
    totalRecords: number;
    filter: UserFilter;
    onFilterChange: (patch: Partial<UserFilter>) => void;
    onRefresh?: () => void | Promise<void>;
}

const UserToolbar = memo(function UserToolbar({ totalRecords, filter, onFilterChange, onRefresh }: Props) {
    const [spinning, setSpinning] = useState(false);
    const handleRefresh = useCallback(async () => {
        if (spinning) return;
        setSpinning(true);
        try { await onRefresh?.(); } finally { setTimeout(() => setSpinning(false), 700); }
    }, [spinning, onRefresh]);

    return (
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <p className="text-sm font-semibold text-[#111827]">User List</p>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[11px] font-semibold">{totalRecords} Users</span>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                    <button type="button" onClick={handleRefresh} disabled={spinning} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors hover:border-[#D1D5DB] disabled:opacity-50">
                        <motion.span animate={spinning ? { rotate: 360 } : { rotate: 0 }} transition={spinning ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}} className="flex"><RefreshCw size={13} /></motion.span>Refresh
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input type="text" value={filter.search} onChange={(e) => onFilterChange({ search: e.target.value })} placeholder="Search name, username, email..." className="h-8 w-56 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#111827] pl-8 pr-3 outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all" />
                </div>
                <div className="relative flex items-center">
                    <Filter size={11} className="absolute left-2.5 text-[#9CA3AF]" />
                    <select value={filter.role} onChange={(e) => onFilterChange({ role: e.target.value })} className="h-8 pl-7 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#374151] outline-none focus:border-[#DC2626] appearance-none cursor-pointer">
                        <option value="">All Roles</option>
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="relative flex items-center">
                    <Filter size={11} className="absolute left-2.5 text-[#9CA3AF]" />
                    <select value={filter.status} onChange={(e) => onFilterChange({ status: e.target.value })} className="h-8 pl-7 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#374151] outline-none focus:border-[#DC2626] appearance-none cursor-pointer">
                        <option value="">All Status</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {(filter.search || filter.role || filter.status) && (
                    <button onClick={() => onFilterChange({ search: "", role: "", status: "" })} className="h-8 px-3 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs text-[#6B7280] font-medium transition-colors">Reset</button>
                )}
            </div>
        </div>
    );
});

export default UserToolbar;
