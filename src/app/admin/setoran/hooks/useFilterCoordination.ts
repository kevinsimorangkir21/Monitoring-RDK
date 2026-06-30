"use client";

/**
 * useFilterCoordination — Centralised filter state management hook
 *
 * Responsibilities (Requirements 6.1 – 6.5):
 *   • Hold the single source-of-truth SetoranFilters state
 *   • Derive availableMonths / availableSalesman from raw data
 *   • Apply filters in the required order:
 *       dateRange → month → salesman → searchQuery
 *   • Expose updateFilters, resetFilters, and selective-clear operations
 *   • Debounce the search input (300 ms) internally so callers don't need to
 *
 * Usage:
 *   const { filteredData, filters, updateFilters, resetFilters, ... } =
 *     useFilterCoordination(rawData);
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { SetoranRecord } from "@/types/setoran";
import type { SetoranFilters } from "../components/FilterBar";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Debounce delay (ms) applied to the search query */
const SEARCH_DEBOUNCE_MS = 300;

/** Empty filter state — used as the initial value and on full reset */
export const INITIAL_FILTERS: SetoranFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedMonth: null,
    selectedSalesman: [],
    searchQuery: "",
};

// ─── Internal debounce hook ───────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// ─── Individual filter functions ─────────────────────────────────────────────

/**
 * 1. Date range filter (primary temporal filter).
 *    Uses lexicographic comparison — valid because tanggal is "YYYY-MM-DD".
 */
function applyDateRangeFilter(
    data: SetoranRecord[],
    startDate: string | null,
    endDate: string | null
): SetoranRecord[] {
    if (!startDate && !endDate) return data;

    return data.filter((record) => {
        const d = record.tanggal;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
    });
}

/**
 * 2. Month filter (secondary temporal refinement).
 *    selectedMonth is "YYYY-MM"; we match against the first 7 chars of tanggal.
 *    NOTE: record.bulan is a human-readable string ("Juni 2025"), so we rely
 *    on tanggal for a reliable YYYY-MM comparison.
 */
function applyMonthFilter(
    data: SetoranRecord[],
    selectedMonth: string | null
): SetoranRecord[] {
    if (!selectedMonth) return data;
    return data.filter((record) => record.tanggal.slice(0, 7) === selectedMonth);
}

/**
 * 3. Salesman filter (entity-based filtering).
 */
function applySalesmanFilter(
    data: SetoranRecord[],
    selectedSalesman: string[]
): SetoranRecord[] {
    if (selectedSalesman.length === 0) return data;
    return data.filter((record) => selectedSalesman.includes(record.namaSalesman));
}

/**
 * 4. Text search filter (applied last — most expensive, fewest records remain).
 *    Searches salesman name and date string.
 */
function applySearchFilter(data: SetoranRecord[], searchQuery: string): SetoranRecord[] {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
        (record) =>
            record.namaSalesman.toLowerCase().includes(q) ||
            record.tanggal.includes(q)
    );
}

/**
 * Compose all four filters in the required order.
 *
 * Pipeline: dateRange → month → salesman → searchQuery
 */
function applyAllFilters(data: SetoranRecord[], filters: SetoranFilters): SetoranRecord[] {
    let result = data;
    result = applyDateRangeFilter(result, filters.dateRange.startDate, filters.dateRange.endDate);
    result = applyMonthFilter(result, filters.selectedMonth);
    result = applySalesmanFilter(result, filters.selectedSalesman);
    result = applySearchFilter(result, filters.searchQuery);
    return result;
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseFilterCoordinationResult {
    /** Current filter state (read-only snapshot) */
    filters: SetoranFilters;
    /** Records after all filters have been applied */
    filteredData: SetoranRecord[];
    /** Unique months (YYYY-MM) derived from rawData, sorted ascending */
    availableMonths: string[];
    /** Unique salesman names derived from rawData, sorted alphabetically */
    availableSalesman: string[];
    /** Merge a partial filter update into the current state */
    updateFilters: (partial: Partial<SetoranFilters>) => void;
    /** Reset all filters to their initial (empty) state */
    resetFilters: () => void;
    /** Clear only the date range filter */
    clearDateRange: () => void;
    /** Clear only the month filter */
    clearMonth: () => void;
    /** Clear only the salesman selection */
    clearSalesman: () => void;
    /** Clear only the search query */
    clearSearch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFilterCoordination
 *
 * Centralises all filter state for the Setoran Dashboard so that every widget
 * (KPI cards, charts, table) consumes the same filtered dataset.
 *
 * @param rawData — The unfiltered SetoranRecord array (typically memoised at
 *                  the dashboard level so its reference is stable).
 */
export function useFilterCoordination(rawData: SetoranRecord[]): UseFilterCoordinationResult {
    // ── Filter state ──────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<SetoranFilters>(INITIAL_FILTERS);

    // ── Debounced search ──────────────────────────────────────────────────────
    // The search query is written into filters.searchQuery immediately so the
    // FilterBar can display what was typed, but filteredData only reacts to the
    // debounced value to avoid excessive recalculation while the user types.
    const debouncedSearch = useDebounce(filters.searchQuery, SEARCH_DEBOUNCE_MS);

    // Effective filters: replace live searchQuery with debounced value
    const effectiveFilters = useMemo<SetoranFilters>(
        () => ({ ...filters, searchQuery: debouncedSearch }),
        [filters, debouncedSearch]
    );

    // ── Derived filter options ────────────────────────────────────────────────

    /** Unique "YYYY-MM" months extracted from tanggal, sorted ascending */
    const availableMonths = useMemo<string[]>(() => {
        const set = new Set<string>();
        for (const record of rawData) {
            set.add(record.tanggal.slice(0, 7));
        }
        return [...set].sort();
    }, [rawData]);

    /** Unique salesman names, sorted alphabetically */
    const availableSalesman = useMemo<string[]>(() => {
        const set = new Set<string>();
        for (const record of rawData) {
            set.add(record.namaSalesman);
        }
        return [...set].sort();
    }, [rawData]);

    // ── Filtered dataset (single source of truth) ─────────────────────────────
    const filteredData = useMemo<SetoranRecord[]>(
        () => applyAllFilters(rawData, effectiveFilters),
        [rawData, effectiveFilters]
    );

    // ── Actions ───────────────────────────────────────────────────────────────

    const updateFilters = useCallback((partial: Partial<SetoranFilters>) => {
        setFilters((prev) => ({ ...prev, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const clearDateRange = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            dateRange: { startDate: null, endDate: null },
        }));
    }, []);

    const clearMonth = useCallback(() => {
        setFilters((prev) => ({ ...prev, selectedMonth: null }));
    }, []);

    const clearSalesman = useCallback(() => {
        setFilters((prev) => ({ ...prev, selectedSalesman: [] }));
    }, []);

    const clearSearch = useCallback(() => {
        setFilters((prev) => ({ ...prev, searchQuery: "" }));
    }, []);

    // ── Result ────────────────────────────────────────────────────────────────
    return {
        filters,
        filteredData,
        availableMonths,
        availableSalesman,
        updateFilters,
        resetFilters,
        clearDateRange,
        clearMonth,
        clearSalesman,
        clearSearch,
    };
}
