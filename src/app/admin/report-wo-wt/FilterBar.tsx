"use client";

/**
 * FilterBar — Filter controls for the WO-WT dashboard.
 *
 * Filters: Date Range | Wavepick (multi-select) | Search Wavepick
 */

import {
    useState, useEffect, useMemo, useCallback, useRef,
} from "react";
import {
    Calendar, Filter, Search, X, ChevronDown, RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { WoWtFilters } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ─── WavepickMultiSelect ──────────────────────────────────────────────────────

interface WavepickMultiSelectProps {
    available: string[];
    selected: string[];
    onChange: (s: string[]) => void;
}

function WavepickMultiSelect({ available, selected, onChange }: WavepickMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [rawSearch, setRawSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const debSearch = useDebounce(rawSearch, 200);

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, [open]);

    const filtered = useMemo(() => {
        const q = debSearch.toLowerCase().trim();
        if (!q) return available;
        return available.filter((s) => s.toLowerCase().includes(q));
    }, [available, debSearch]);

    const toggle = useCallback((name: string) => {
        onChange(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);
    }, [selected, onChange]);

    const label = selected.length === 0 ? "Pilih Wavepick..."
        : selected.length === 1 ? selected[0]
            : `${selected.length} wavepick dipilih`;

    return (
        <div ref={containerRef} className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)}
                className="w-full h-9 px-3 rounded-xl border border-[#E5E7EB] text-xs text-left bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 transition-all flex items-center justify-between gap-2"
                aria-haspopup="listbox" aria-expanded={open}
            >
                <span className="truncate text-[#374151]">{label}</span>
                <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                        <div className="p-2 border-b border-[#E5E7EB]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9CA3AF]" />
                                <input type="text" value={rawSearch} onChange={(e) => setRawSearch(e.target.value)}
                                    placeholder="Cari wavepick..."
                                    className="w-full h-7 pl-7 pr-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981]" />
                            </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto" role="listbox" aria-multiselectable="true">
                            {filtered.length > 0 ? filtered.map((wp) => {
                                const checked = selected.includes(wp);
                                return (
                                    <label key={wp} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] cursor-pointer"
                                        role="option" aria-selected={checked}>
                                        <input type="checkbox" checked={checked} onChange={() => toggle(wp)}
                                            className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#10B981]" />
                                        <span className="text-xs text-[#374151] truncate">{wp}</span>
                                    </label>
                                );
                            }) : (
                                <p className="px-3 py-3 text-xs text-[#9CA3AF] text-center">Tidak ditemukan</p>
                            )}
                        </div>
                        {selected.length > 0 && (
                            <div className="px-3 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={() => onChange([])}
                                    className="text-xs text-[#10B981] hover:text-emerald-700 font-medium">
                                    Hapus Semua Pilihan
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#065F46] text-[11px] font-medium">
            {label}
            <button type="button" onClick={onRemove} aria-label={`Hapus filter ${label}`}
                className="w-3.5 h-3.5 rounded-full hover:bg-emerald-200 flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    filters: WoWtFilters;
    availableWavepick: string[];
    onChange: (partial: Partial<WoWtFilters>) => void;
    onReset: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FilterBar({ filters, availableWavepick, onChange, onReset }: FilterBarProps) {
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

    const hasActive = !!(
        filters.dateRange.startDate || filters.dateRange.endDate ||
        filters.selectedWavepick.length > 0 || filters.searchQuery
    );

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#111827]">Filter Dashboard</h3>
                    {hasActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-700">Aktif</span>
                    )}
                </div>
                {hasActive && (
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        type="button" onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#6B7280]">
                        <RotateCcw className="w-3 h-3" />Reset Filter
                    </motion.button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Range */}
                <fieldset className="space-y-2">
                    <legend className="block text-xs font-medium text-[#64748B] mb-1">Rentang Tanggal</legend>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.startDate ?? ""} onChange={handleStartDate}
                            aria-label="Tanggal mulai"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.endDate ?? ""} onChange={handleEndDate}
                            min={filters.dateRange.startDate ?? undefined} aria-label="Tanggal akhir"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100" />
                    </div>
                </fieldset>

                {/* Wavepick multi-select */}
                <div className="space-y-2">
                    <span className="block text-xs font-medium text-[#64748B]">Wavepick</span>
                    <WavepickMultiSelect
                        available={availableWavepick}
                        selected={filters.selectedWavepick}
                        onChange={(s) => onChange({ selectedWavepick: s })}
                    />
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <label htmlFor="wowt-search" className="block text-xs font-medium text-[#64748B]">Pencarian</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input id="wowt-search" type="search" value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            placeholder="Cari wavepick..."
                            className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 placeholder:text-[#9CA3AF]" />
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
                    <motion.div
                        key="chips"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-[#E5E7EB] overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">Filter Aktif:</span>
                            {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                                <FilterChip
                                    label={`${filters.dateRange.startDate ?? "..."} → ${filters.dateRange.endDate ?? "..."}`}
                                    onRemove={() => onChange({ dateRange: { startDate: null, endDate: null } })}
                                />
                            )}
                            {filters.selectedWavepick.map((wp) => (
                                <FilterChip key={wp} label={wp}
                                    onRemove={() => onChange({ selectedWavepick: filters.selectedWavepick.filter((x) => x !== wp) })} />
                            ))}
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
