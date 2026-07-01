"use client";

/**
 * FilterBar — Filter controls for Inbound dashboard.
 *
 * Filters:
 *   - Date Range       (Tanggal)
 *   - Plant Pabrik     (multi-select, dynamic)
 *   - Shifting         (multi-select, fixed: Shift 1/2/3)
 *   - Jenis Bongkaran  (multi-select, dynamic)
 *   - Search           (Nomor FO | Nopol | Nomor GR) — debounced 300ms
 */

import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { Calendar, Filter, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { InboundFilters } from "./types";

// ─── Debounce ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [d, setD] = useState<T>(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

interface MultiSelectProps {
    placeholder: string;
    options: string[];
    selected: string[];
    onChange: (s: string[]) => void;
}
function MultiSelect({ placeholder, options, selected, onChange }: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onOut(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
        document.addEventListener("mousedown", onOut);
        return () => document.removeEventListener("mousedown", onOut);
    }, [open]);

    const toggle = useCallback((v: string) =>
        onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]),
        [selected, onChange]);

    const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} dipilih`;

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)}
                className="w-full h-9 px-3 rounded-xl border border-[#E5E7EB] text-xs text-left bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 flex items-center justify-between gap-2"
                aria-haspopup="listbox" aria-expanded={open}>
                <span className="truncate text-[#374151]">{label}</span>
                <ChevronDown className={`w-4 h-4 text-[#9CA3AF] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto" role="listbox" aria-multiselectable="true">
                            {options.length === 0
                                ? <p className="px-3 py-3 text-xs text-[#9CA3AF] text-center">Tidak ada opsi</p>
                                : options.map((opt) => {
                                    const checked = selected.includes(opt);
                                    return (
                                        <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] cursor-pointer" role="option" aria-selected={checked}>
                                            <input type="checkbox" checked={checked} onChange={() => toggle(opt)} className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#DC2626]" />
                                            <span className="text-xs text-[#374151] truncate">{opt}</span>
                                        </label>
                                    );
                                })}
                        </div>
                        {selected.length > 0 && (
                            <div className="px-3 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={() => onChange([])} className="text-xs text-[#DC2626] hover:text-red-700 font-medium">Hapus Semua</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIFTING_OPTIONS = ["Shift 1", "Shift 2", "Shift 3"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    filters: InboundFilters;
    availablePlants: string[];
    availableJenis: string[];
    onChange: (partial: Partial<InboundFilters>) => void;
    onReset: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function FilterBarInner({ filters, availablePlants, availableJenis, onChange, onReset }: FilterBarProps) {
    const [rawSearch, setRawSearch] = useState(filters.searchQuery);

    useEffect(() => { setRawSearch(filters.searchQuery); }, [filters.searchQuery]);

    const debSearch = useDebounce(rawSearch, 300);
    useEffect(() => {
        if (debSearch !== filters.searchQuery) onChange({ searchQuery: debSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debSearch]);

    const handleStartDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ dateRange: { startDate: e.target.value || null, endDate: filters.dateRange.endDate } }),
        [filters.dateRange.endDate, onChange]);

    const handleEndDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ dateRange: { startDate: filters.dateRange.startDate, endDate: e.target.value || null } }),
        [filters.dateRange.startDate, onChange]);

    const handleReset = useCallback(() => { setRawSearch(""); onReset(); }, [onReset]);

    const hasActive = useMemo(() => !!(
        filters.dateRange.startDate || filters.dateRange.endDate ||
        filters.selectedPlant.length || filters.selectedShifting.length ||
        filters.selectedJenis.length || filters.searchQuery
    ), [filters]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#111827]">Filter Dashboard</h3>
                    {hasActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-medium text-red-700">Aktif</span>
                    )}
                </div>
                {hasActive && (
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} type="button" onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#6B7280] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]">
                        <RotateCcw className="w-3 h-3" />Reset Filter
                    </motion.button>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Date Range */}
                <fieldset className="space-y-2">
                    <legend className="block text-xs font-medium text-[#64748B] mb-1">Rentang Tanggal</legend>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.startDate ?? ""} onChange={handleStartDate} aria-label="Tanggal mulai"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input type="date" value={filters.dateRange.endDate ?? ""} onChange={handleEndDate} min={filters.dateRange.startDate ?? undefined} aria-label="Tanggal akhir"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" />
                    </div>
                </fieldset>

                <div className="space-y-2">
                    <span className="block text-xs font-medium text-[#64748B]">Plant Pabrik</span>
                    <MultiSelect placeholder="Pilih Plant..." options={availablePlants} selected={filters.selectedPlant} onChange={(s) => onChange({ selectedPlant: s })} />
                </div>

                <div className="space-y-2">
                    <span className="block text-xs font-medium text-[#64748B]">Shifting</span>
                    <MultiSelect placeholder="Pilih Shift..." options={SHIFTING_OPTIONS} selected={filters.selectedShifting} onChange={(s) => onChange({ selectedShifting: s })} />
                </div>

                <div className="space-y-2">
                    <span className="block text-xs font-medium text-[#64748B]">Jenis Bongkaran</span>
                    <MultiSelect placeholder="Pilih Jenis..." options={availableJenis} selected={filters.selectedJenis} onChange={(s) => onChange({ selectedJenis: s })} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="ib-search" className="block text-xs font-medium text-[#64748B]">Pencarian</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                        <input id="ib-search" type="search" value={rawSearch} onChange={(e) => setRawSearch(e.target.value)}
                            placeholder="No FO, Nopol, No GR..."
                            className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF]" />
                        {rawSearch && (
                            <button type="button" onClick={() => { setRawSearch(""); onChange({ searchQuery: "" }); }} aria-label="Hapus pencarian"
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
                    <motion.div key="chips" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-[#E5E7EB] overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">Filter Aktif:</span>
                            {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                                <FilterChip label={`${filters.dateRange.startDate ?? "..."} → ${filters.dateRange.endDate ?? "..."}`}
                                    onRemove={() => onChange({ dateRange: { startDate: null, endDate: null } })} />
                            )}
                            {filters.selectedPlant.map((p) => (
                                <FilterChip key={p} label={`Plant: ${p}`} onRemove={() => onChange({ selectedPlant: filters.selectedPlant.filter((x) => x !== p) })} />
                            ))}
                            {filters.selectedShifting.map((s) => (
                                <FilterChip key={s} label={s} onRemove={() => onChange({ selectedShifting: filters.selectedShifting.filter((x) => x !== s) })} />
                            ))}
                            {filters.selectedJenis.map((j) => (
                                <FilterChip key={j} label={`Jenis: ${j}`} onRemove={() => onChange({ selectedJenis: filters.selectedJenis.filter((x) => x !== j) })} />
                            ))}
                            {filters.searchQuery && (
                                <FilterChip label={`"${filters.searchQuery}"`} onRemove={() => { setRawSearch(""); onChange({ searchQuery: "" }); }} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default memo(FilterBarInner);
