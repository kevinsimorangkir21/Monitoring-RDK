"use client";

/**
 * FilterBar — Dashboard filter controls for Setoran Dashboard
 *
 * Requirements: 6.1 (date range picker), 6.2 (month dropdown),
 *               6.3 (salesman multi-select), 6.4 (text search with debounce)
 *
 * Uses the SetoranFilters interface from the spec design document.
 * Falls back to locally-defined types if src/app/admin/setoran/types/setoran.ts
 * has not been created yet.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar, CalendarDays, Filter, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Mirror of SetoranFilters from design.md / types/setoran.ts */
export interface SetoranFilters {
    dateRange: {
        startDate: string | null; // "YYYY-MM-DD" or null
        endDate: string | null;   // "YYYY-MM-DD" or null
    };
    selectedMonth: string | null;      // "YYYY-MM" format
    selectedSalesman: string[];        // Array of salesman names
    searchQuery: string;               // Text search term
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    /** Current active filters */
    filters: SetoranFilters;
    /** Available month options in YYYY-MM format (e.g. "2025-06") */
    availableMonths: string[];
    /** All salesman names available for selection */
    availableSalesman: string[];
    /** Called whenever any filter changes */
    onChange: (filters: Partial<SetoranFilters>) => void;
    /** Called when the reset button is clicked */
    onReset: () => void;
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generic debounce hook */
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

/**
 * Format a YYYY-MM string into a human-readable month label.
 * e.g. "2025-06" → "Juni 2025"
 */
function formatMonthLabel(yyyyMm: string): string {
    try {
        const [year, month] = yyyyMm.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    } catch {
        return yyyyMm;
    }
}

// ─── Sub-component: SalesmanMultiSelect ───────────────────────────────────────

interface SalesmanMultiSelectProps {
    available: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

function SalesmanMultiSelect({ available, selected, onChange }: SalesmanMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [rawSearch, setRawSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce the salesman search input
    const debouncedSearch = useDebounce(rawSearch, 300);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const filtered = useMemo(() => {
        const q = debouncedSearch.toLowerCase().trim();
        if (!q) return available;
        return available.filter((s) => s.toLowerCase().includes(q));
    }, [available, debouncedSearch]);

    const handleToggle = useCallback(
        (name: string) => {
            const next = selected.includes(name)
                ? selected.filter((s) => s !== name)
                : [...selected, name];
            onChange(next);
        },
        [selected, onChange]
    );

    const handleClearAll = useCallback(() => {
        onChange([]);
    }, [onChange]);

    const triggerLabel =
        selected.length === 0
            ? "Pilih Salesman..."
            : selected.length === 1
                ? selected[0]
                : `${selected.length} salesman dipilih`;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full h-9 px-3 rounded-xl border border-[#E5E7EB] text-xs text-left bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 transition-all flex items-center justify-between gap-2"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="truncate text-[#374151]">{triggerLabel}</span>
                <ChevronDown
                    className={`w-4 h-4 text-[#9CA3AF] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                        {/* Search inside dropdown */}
                        <div className="p-2 border-b border-[#E5E7EB]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9CA3AF]" />
                                <input
                                    type="text"
                                    value={rawSearch}
                                    onChange={(e) => setRawSearch(e.target.value)}
                                    placeholder="Cari salesman..."
                                    className="w-full h-7 pl-7 pr-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] transition-all"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="max-h-44 overflow-y-auto" role="listbox" aria-multiselectable="true">
                            {filtered.length > 0 ? (
                                filtered.map((salesman) => {
                                    const checked = selected.includes(salesman);
                                    return (
                                        <label
                                            key={salesman}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                                            role="option"
                                            aria-selected={checked}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleToggle(salesman)}
                                                className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#10B981]"
                                            />
                                            <span className="text-xs text-[#374151] truncate">{salesman}</span>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="px-3 py-3 text-xs text-[#9CA3AF] text-center">
                                    Tidak ada salesman ditemukan
                                </p>
                            )}
                        </div>

                        {/* Clear all footer */}
                        {selected.length > 0 && (
                            <div className="px-3 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-xs text-[#10B981] hover:text-emerald-700 font-medium"
                                >
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FilterBar({
    filters,
    availableMonths,
    availableSalesman,
    onChange,
    onReset,
    className = "",
}: FilterBarProps) {
    // Local state for search — we debounce before propagating upward
    const [rawSearch, setRawSearch] = useState(filters.searchQuery);

    // Sync local search state when filters are reset externally
    useEffect(() => {
        setRawSearch(filters.searchQuery);
    }, [filters.searchQuery]);

    // 300ms debounce for text search (Requirement 6.4)
    const debouncedSearch = useDebounce(rawSearch, 300);

    // Propagate debounced search to parent
    useEffect(() => {
        if (debouncedSearch !== filters.searchQuery) {
            onChange({ searchQuery: debouncedSearch });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleStartDate = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange({
                dateRange: {
                    startDate: e.target.value || null,
                    endDate: filters.dateRange.endDate,
                },
            });
        },
        [filters.dateRange.endDate, onChange]
    );

    const handleEndDate = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange({
                dateRange: {
                    startDate: filters.dateRange.startDate,
                    endDate: e.target.value || null,
                },
            });
        },
        [filters.dateRange.startDate, onChange]
    );

    const handleMonthChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange({ selectedMonth: e.target.value || null });
        },
        [onChange]
    );

    const handleSalesmanChange = useCallback(
        (selected: string[]) => {
            onChange({ selectedSalesman: selected });
        },
        [onChange]
    );

    const handleSearchClear = useCallback(() => {
        setRawSearch("");
        onChange({ searchQuery: "" });
    }, [onChange]);

    const handleReset = useCallback(() => {
        setRawSearch("");
        onReset();
    }, [onReset]);

    // ── Active filter check ───────────────────────────────────────────────────

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.dateRange.startDate ||
            filters.dateRange.endDate ||
            filters.selectedMonth ||
            filters.selectedSalesman.length > 0 ||
            filters.searchQuery
        );
    }, [filters]);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm ${className}`}
        >
            {/* ── Header row ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#111827]">Filter Dashboard</h3>
                    {hasActiveFilters && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-700">
                            Aktif
                        </span>
                    )}
                </div>

                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#6B7280] transition-colors"
                        aria-label="Reset semua filter"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset Filter
                    </motion.button>
                )}
            </div>

            {/* ── Filter controls grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* ── 1. Date Range Picker (Requirement 6.1) ─────────────────────── */}
                <fieldset className="space-y-2">
                    <legend className="block text-xs font-medium text-[#64748B] mb-1">
                        Rentang Tanggal
                    </legend>

                    {/* Start date */}
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]"
                            aria-hidden="true"
                        />
                        <input
                            type="date"
                            id="filter-date-start"
                            value={filters.dateRange.startDate ?? ""}
                            onChange={handleStartDate}
                            aria-label="Tanggal mulai"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                    </div>

                    {/* End date */}
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]"
                            aria-hidden="true"
                        />
                        <input
                            type="date"
                            id="filter-date-end"
                            value={filters.dateRange.endDate ?? ""}
                            onChange={handleEndDate}
                            min={filters.dateRange.startDate ?? undefined}
                            aria-label="Tanggal akhir"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                    </div>
                </fieldset>

                {/* ── 2. Month Dropdown (Requirement 6.2) ────────────────────────── */}
                <div className="space-y-2">
                    <label
                        htmlFor="filter-month"
                        className="block text-xs font-medium text-[#64748B]"
                    >
                        Bulan
                    </label>
                    <div className="relative">
                        <CalendarDays
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]"
                            aria-hidden="true"
                        />
                        <select
                            id="filter-month"
                            value={filters.selectedMonth ?? ""}
                            onChange={handleMonthChange}
                            className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Semua Bulan</option>
                            {availableMonths.map((month) => (
                                <option key={month} value={month}>
                                    {formatMonthLabel(month)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                {/* ── 3. Salesman Multi-Select (Requirement 6.3) ─────────────────── */}
                <div className="space-y-2">
                    <span
                        id="filter-salesman-label"
                        className="block text-xs font-medium text-[#64748B]"
                    >
                        Salesman
                    </span>
                    <SalesmanMultiSelect
                        available={availableSalesman}
                        selected={filters.selectedSalesman}
                        onChange={handleSalesmanChange}
                    />
                </div>

                {/* ── 4. Text Search Input (Requirement 6.4) ─────────────────────── */}
                <div className="space-y-2">
                    <label
                        htmlFor="filter-search"
                        className="block text-xs font-medium text-[#64748B]"
                    >
                        Pencarian
                    </label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]"
                            aria-hidden="true"
                        />
                        <input
                            id="filter-search"
                            type="search"
                            value={rawSearch}
                            onChange={(e) => setRawSearch(e.target.value)}
                            placeholder="Cari nama salesman..."
                            className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 placeholder:text-[#9CA3AF] transition-all"
                        />
                        {rawSearch && (
                            <button
                                type="button"
                                onClick={handleSearchClear}
                                aria-label="Hapus pencarian"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Active filter chips ─────────────────────────────────────────── */}
            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.div
                        key="chips"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-[#E5E7EB] overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">
                                Filter Aktif:
                            </span>

                            {/* Date range chip */}
                            {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                                <FilterChip
                                    label={`${filters.dateRange.startDate ?? "..."} → ${filters.dateRange.endDate ?? "..."}`}
                                    onRemove={() =>
                                        onChange({ dateRange: { startDate: null, endDate: null } })
                                    }
                                />
                            )}

                            {/* Month chip */}
                            {filters.selectedMonth && (
                                <FilterChip
                                    label={`Bulan: ${formatMonthLabel(filters.selectedMonth)}`}
                                    onRemove={() => onChange({ selectedMonth: null })}
                                />
                            )}

                            {/* Salesman chips */}
                            {filters.selectedSalesman.map((s) => (
                                <FilterChip
                                    key={s}
                                    label={s}
                                    onRemove={() =>
                                        onChange({
                                            selectedSalesman: filters.selectedSalesman.filter(
                                                (x) => x !== s
                                            ),
                                        })
                                    }
                                />
                            ))}

                            {/* Search chip */}
                            {filters.searchQuery && (
                                <FilterChip
                                    label={`"${filters.searchQuery}"`}
                                    onRemove={() => {
                                        setRawSearch("");
                                        onChange({ searchQuery: "" });
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── FilterChip helper ────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#065F46] text-[11px] font-medium">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Hapus filter ${label}`}
                className="w-3.5 h-3.5 rounded-full hover:bg-emerald-200 flex items-center justify-center transition-colors"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}
