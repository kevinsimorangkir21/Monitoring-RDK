"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Filter, Search, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SetoranFilter } from "@/types/setoran";
import { BULAN_OPTIONS, SALESMAN_OPTIONS } from "@/mock/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    filters: SetoranFilter;
    onChange: (filters: Partial<SetoranFilter>) => void;
    onReset?: () => void;
    className?: string;
}

interface DateRangeState {
    startDate: string;
    endDate: string;
}

// ─── Helper hooks ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// ─── FilterBar Component ──────────────────────────────────────────────────────

export default function FilterBar({
    filters,
    onChange,
    onReset,
    className = ""
}: FilterBarProps) {
    // ── Local state for immediate UI updates ──────────────────────────────────
    const [searchInput, setSearchInput] = useState(filters.search);
    const [salesmanSearch, setSalesmanSearch] = useState("");
    const [selectedSalesman, setSelectedSalesman] = useState<string[]>([]);
    const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeState>({
        startDate: filters.dateFrom,
        endDate: filters.dateTo,
    });

    // ── Debounced values ──────────────────────────────────────────────────────
    const debouncedSearch = useDebounce(searchInput, 300);
    const debouncedSalesmanSearch = useDebounce(salesmanSearch, 300);

    // ── Update parent when debounced search changes ──────────────────────────
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            onChange({ search: debouncedSearch });
        }
    }, [debouncedSearch, filters.search, onChange]);

    // ── Filtered salesman options based on search ────────────────────────────
    const filteredSalesmanOptions = useMemo(() => {
        if (!debouncedSalesmanSearch.trim()) {
            return SALESMAN_OPTIONS;
        }
        const searchTerm = debouncedSalesmanSearch.toLowerCase();
        return SALESMAN_OPTIONS.filter(name =>
            name.toLowerCase().includes(searchTerm)
        );
    }, [debouncedSalesmanSearch]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleDateRangeChange = useCallback((field: 'startDate' | 'endDate', value: string) => {
        const newRange = { ...dateRange, [field]: value };
        setDateRange(newRange);

        // Update parent immediately for date changes
        onChange({
            dateFrom: newRange.startDate,
            dateTo: newRange.endDate
        });
    }, [dateRange, onChange]);

    const handleMonthChange = useCallback((month: string) => {
        onChange({ bulan: month });
    }, [onChange]);

    const handleSalesmanToggle = useCallback((salesman: string) => {
        const newSelected = selectedSalesman.includes(salesman)
            ? selectedSalesman.filter(s => s !== salesman)
            : [...selectedSalesman, salesman];

        setSelectedSalesman(newSelected);

        // For now, we'll store the selected salesman in the search field
        // In a real implementation, you might want to extend SetoranFilter interface
        onChange({ search: newSelected.join(", ") });
    }, [selectedSalesman, onChange]);

    const handleReset = useCallback(() => {
        setSearchInput("");
        setSalesmanSearch("");
        setSelectedSalesman([]);
        setDateRange({ startDate: "", endDate: "" });
        onReset?.();
        onChange({
            search: "",
            bulan: "",
            tanggal: "",
            dateFrom: "",
            dateTo: ""
        });
    }, [onChange, onReset]);

    // ── Check if filters are active ──────────────────────────────────────────
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.search ||
            filters.bulan ||
            filters.dateFrom ||
            filters.dateTo ||
            selectedSalesman.length > 0
        );
    }, [filters, selectedSalesman.length]);

    return (
        <div className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm ${className}`}>
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#374151]" />
                    <h3 className="text-sm font-semibold text-[#111827]">Filter Dashboard</h3>
                </div>

                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#6B7280] transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Reset Semua Filter
                    </motion.button>
                )}
            </div>

            {/* ── Filter Controls ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* ── Date Range Picker ─────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#374151]">
                        Rentang Tanggal
                    </label>
                    <div className="space-y-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                            <input
                                id="date-start"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                                placeholder="Tanggal Mulai"
                                aria-label="Tanggal Mulai"
                                className="w-full h-9 pl-10 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                            <input
                                id="date-end"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                                placeholder="Tanggal Akhir"
                                aria-label="Tanggal Akhir"
                                className="w-full h-9 pl-10 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Month Dropdown ────────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <label htmlFor="month-select" className="block text-xs font-medium text-[#374151]">
                        Bulan
                    </label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <select
                            id="month-select"
                            value={filters.bulan}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="w-full h-9 pl-10 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#374151] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Semua Bulan</option>
                            {BULAN_OPTIONS.map((bulan) => (
                                <option key={bulan} value={bulan}>
                                    {bulan}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                    </div>
                </div>

                {/* ── Salesman Multi-Select ─────────────────────────────────────────── */}
                <div className="space-y-2">
                    <label htmlFor="salesman-dropdown" className="block text-xs font-medium text-[#374151]">
                        Salesman
                    </label>
                    <div className="relative">
                        <button
                            id="salesman-dropdown"
                            type="button"
                            onClick={() => setShowSalesmanDropdown(!showSalesmanDropdown)}
                            className="w-full h-9 px-3 rounded-xl border border-[#E5E7EB] text-xs text-left bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 transition-all flex items-center justify-between"
                            aria-expanded={showSalesmanDropdown}
                            aria-haspopup="listbox"
                        >
                            <span className="truncate">
                                {selectedSalesman.length === 0
                                    ? "Pilih Salesman..."
                                    : selectedSalesman.length === 1
                                        ? selectedSalesman[0]
                                        : `${selectedSalesman.length} salesman dipilih`
                                }
                            </span>
                            <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform ${showSalesmanDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showSalesmanDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 max-h-60 overflow-hidden"
                                >
                                    {/* Search input inside dropdown */}
                                    <div className="p-3 border-b border-[#E5E7EB]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9CA3AF]" />
                                            <input
                                                type="text"
                                                value={salesmanSearch}
                                                onChange={(e) => setSalesmanSearch(e.target.value)}
                                                placeholder="Cari salesman..."
                                                className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Options list */}
                                    <div className="max-h-40 overflow-y-auto">
                                        {filteredSalesmanOptions.length > 0 ? (
                                            filteredSalesmanOptions.map((salesman) => (
                                                <label
                                                    key={salesman}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSalesman.includes(salesman)}
                                                        onChange={() => handleSalesmanToggle(salesman)}
                                                        className="w-3 h-3 rounded border-[#D1D5DB] text-[#DC2626] focus:ring-[#DC2626] focus:ring-1"
                                                    />
                                                    <span className="text-xs text-[#374151] truncate">
                                                        {salesman}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-[#9CA3AF] text-center">
                                                Tidak ada salesman ditemukan
                                            </div>
                                        )}
                                    </div>

                                    {selectedSalesman.length > 0 && (
                                        <div className="p-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSalesman([]);
                                                    onChange({ search: "" });
                                                }}
                                                className="text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium"
                                            >
                                                Hapus Semua Pilihan
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Text Search Input ─────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <label htmlFor="search-input" className="block text-xs font-medium text-[#374151]">
                        Pencarian
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <input
                            id="search-input"
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari nama salesman..."
                            className="w-full h-9 pl-10 pr-3 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Active Filters Summary ────────────────────────────────────────── */}
            {hasActiveFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-[#E5E7EB]"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-[#6B7280]">Filter Aktif:</span>

                        {filters.search && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs">
                                Pencarian: &quot;{filters.search}&quot;
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput("");
                                        onChange({ search: "" });
                                    }}
                                    className="w-3 h-3 hover:bg-[#DC2626]/20 rounded-full flex items-center justify-center"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            </div>
                        )}

                        {filters.bulan && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs">
                                Bulan: {filters.bulan}
                                <button
                                    type="button"
                                    onClick={() => onChange({ bulan: "" })}
                                    className="w-3 h-3 hover:bg-[#DC2626]/20 rounded-full flex items-center justify-center"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            </div>
                        )}

                        {(filters.dateFrom || filters.dateTo) && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs">
                                Tanggal: {filters.dateFrom || '...'} - {filters.dateTo || '...'}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDateRange({ startDate: "", endDate: "" });
                                        onChange({ dateFrom: "", dateTo: "" });
                                    }}
                                    className="w-3 h-3 hover:bg-[#DC2626]/20 rounded-full flex items-center justify-center"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            </div>
                        )}

                        {selectedSalesman.length > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs">
                                {selectedSalesman.length} Salesman
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSalesman([]);
                                        onChange({ search: "" });
                                    }}
                                    className="w-3 h-3 hover:bg-[#DC2626]/20 rounded-full flex items-center justify-center"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}