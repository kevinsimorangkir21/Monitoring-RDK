"use client";

/**
 * FilterBar — Claim Vendor
 * Filters: Rentang Tanggal | Vendor | Status | Search
 * Design sama seperti Outbound/Setoran (card putih, rounded-[18px]).
 */

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Calendar, Filter, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Debounce ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [d, setD] = useState<T>(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-[#7F1D1D] text-[11px] font-medium">
            {label}
            <button type="button" onClick={onRemove} aria-label={`Hapus filter ${label}`}
                className="w-3.5 h-3.5 rounded-full hover:bg-red-200 flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClaimFilters {
    dateRange: { startDate: string | null; endDate: string | null };
    vendor: string;
    status: string;     // "" | "Pending" | "Lunas"
    searchQuery: string;
}

export const INITIAL_CLAIM_FILTERS: ClaimFilters = {
    dateRange: { startDate: null, endDate: null },
    vendor: "",
    status: "",
    searchQuery: "",
};

const STATUS_OPTIONS = ["Pending", "Lunas"] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    filters: ClaimFilters;
    vendors: string[];
    onChange: (partial: Partial<ClaimFilters>) => void;
    onReset: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function FilterBarInner({ filters, vendors, onChange, onReset }: FilterBarProps) {
    const [rawSearch, setRawSearch] = useState(filters.searchQuery);

    useEffect(() => { setRawSearch(filters.searchQuery); }, [filters.searchQuery]);

    const debSearch = useDebounce(rawSearch, 300);
    useEffect(() => {
        if (debSearch !== filters.searchQuery) onChange({ searchQuery: debSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debSearch]);

    const handleStartDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ dateRange: { startDate: e.target.value || null, endDate: filters.dateRange.endDate } });
    }, [filters.dateRange.endDate, onChange]);

    const handleEndDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ dateRange: { startDate: filters.dateRange.startDate, endDate: e.target.value || null } });
    }, [filters.dateRange.startDate, onChange]);

    const handleReset = useCallback(() => { setRawSearch(""); onReset(); }, [onReset]);

    const hasActive = useMemo(() => !!(
        filters.dateRange.startDate || filters.dateRange.endDate ||
        filters.vendor || filters.status || filters.searchQuery
    ), [filters]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#111827]">Filter Dashboard</h3>
                    {hasActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-medium text-red-700">
                            Aktif
                        </span>
                    )}
                </div>
                {hasActive && (
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        type="button" onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#6B7280] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]">
                        <RotateCcw className="w-3 h-3" />Reset Filter
                    </motion.button>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Date Range */}
                <fieldset className="space-y-2">
                    <legend className="block text-xs font-medium text-[#64748B] mb-1">Rentang Tanggal</legend>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.startDate ?? ""} onChange={handleStartDate}
                            aria-label="Tanggal mulai"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.endDate ?? ""} onChange={handleEndDate}
                            min={filters.dateRange.startDate ?? undefined} aria-label="Tanggal akhir"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" />
                    </div>
                </fieldset>

                {/* Vendor */}
                <div className="space-y-2">
                    <label htmlFor="cv-vendor" className="block text-xs font-medium text-[#64748B]">Vendor</label>
                    <div className="relative">
                        <select id="cv-vendor" value={filters.vendor}
                            onChange={(e) => onChange({ vendor: e.target.value })}
                            className="w-full h-9 pl-3 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 appearance-none cursor-pointer">
                            <option value="">Semua Vendor</option>
                            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label htmlFor="cv-status" className="block text-xs font-medium text-[#64748B]">Status</label>
                    <div className="relative">
                        <select id="cv-status" value={filters.status}
                            onChange={(e) => onChange({ status: e.target.value })}
                            className="w-full h-9 pl-3 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 appearance-none cursor-pointer">
                            <option value="">Semua Status</option>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
                    </div>
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <label htmlFor="cv-search" className="block text-xs font-medium text-[#64748B]">Pencarian</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input id="cv-search" type="search" value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            placeholder="Cari Vendor / No Mobil..."
                            className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF]" />
                        {rawSearch && (
                            <button type="button" onClick={() => { setRawSearch(""); onChange({ searchQuery: "" }); }}
                                aria-label="Hapus pencarian"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active chips */}
            <AnimatePresence>
                {hasActive && (
                    <motion.div key="chips" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-[#E5E7EB] overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">Filter Aktif:</span>
                            {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                                <FilterChip label={`${filters.dateRange.startDate ?? "..."} → ${filters.dateRange.endDate ?? "..."}`}
                                    onRemove={() => onChange({ dateRange: { startDate: null, endDate: null } })} />
                            )}
                            {filters.vendor && (
                                <FilterChip label={`Vendor: ${filters.vendor}`} onRemove={() => onChange({ vendor: "" })} />
                            )}
                            {filters.status && (
                                <FilterChip label={`Status: ${filters.status}`} onRemove={() => onChange({ status: "" })} />
                            )}
                            {filters.searchQuery && (
                                <FilterChip label={`"${filters.searchQuery}"`}
                                    onRemove={() => { setRawSearch(""); onChange({ searchQuery: "" }); }} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default memo(FilterBarInner);
