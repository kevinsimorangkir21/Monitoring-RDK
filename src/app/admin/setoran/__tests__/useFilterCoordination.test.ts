/**
 * Unit tests for useFilterCoordination hook
 *
 * Validates Requirements 6.1–6.5:
 *   6.1 — date range filter
 *   6.2 — month filter
 *   6.3 — salesman filter
 *   6.4 — search query with 300ms debounce
 *   6.5 — all dashboard widgets consume the same filtered dataset
 *
 * Tests cover:
 *   - Filter application order: dateRange → month → salesman → searchQuery
 *   - Selective clear operations (clearDateRange, clearMonth, clearSalesman, clearSearch)
 *   - Full reset (resetFilters / clearAll)
 *   - Derived filter options (availableMonths, availableSalesman)
 *   - Debounced search (300ms)
 *   - Single filtered dataset returned for all consumers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useFilterCoordination,
    INITIAL_FILTERS,
} from '../hooks/useFilterCoordination';
import type { SetoranRecord } from '@/types/setoran';

// ─── Fixture Helpers ─────────────────────────────────────────────────────────

function makeRecord(
    namaSalesman: string,
    tanggal: string,
    overrides: Partial<SetoranRecord> = {}
): SetoranRecord {
    const [year, month] = tanggal.split('-');
    const monthNames = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return {
        id: `${namaSalesman}-${tanggal}`,
        tanggal,
        bulan: `${monthNames[parseInt(month)]} ${year}`,
        namaSalesman,
        pulangKunjungan: '16:00',
        setoranKasir: '17:00',
        durasiSeconds: 3600,
        durasi: '01:00:00',
        status: 'Normal',
        waktuPulang: `${tanggal}T16:00:00`,
        waktuSetoran: `${tanggal}T17:00:00`,
        ...overrides,
    };
}

// Sample dataset spanning 2 months and 3 salesmen
const SAMPLE_DATA: SetoranRecord[] = [
    makeRecord('Andi', '2025-05-10'),
    makeRecord('Andi', '2025-05-15'),
    makeRecord('Budi', '2025-05-20'),
    makeRecord('Budi', '2025-06-01'),
    makeRecord('Citra', '2025-06-10'),
    makeRecord('Citra', '2025-06-20'),
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useFilterCoordination', () => {

    // ── Initial state ─────────────────────────────────────────────────────────

    describe('initial state', () => {
        it('returns all raw records as filteredData when no filters are active', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));
            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });

        it('initialises filters to INITIAL_FILTERS (empty state)', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));
            expect(result.current.filters).toEqual(INITIAL_FILTERS);
        });

        it('derives availableMonths from raw data, sorted ascending', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));
            expect(result.current.availableMonths).toEqual(['2025-05', '2025-06']);
        });

        it('derives availableSalesman from raw data, sorted alphabetically', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));
            expect(result.current.availableSalesman).toEqual(['Andi', 'Budi', 'Citra']);
        });

        it('returns empty filteredData when rawData is empty', () => {
            const { result } = renderHook(() => useFilterCoordination([]));
            expect(result.current.filteredData).toHaveLength(0);
        });
    });

    // ── Requirement 6.1: Date range filter ───────────────────────────────────

    describe('Requirement 6.1 — date range filter', () => {
        it('filters out records before startDate', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-06-01', endDate: null },
                });
            });

            // Records on or after 2025-06-01
            for (const record of result.current.filteredData) {
                expect(record.tanggal >= '2025-06-01').toBe(true);
            }
        });

        it('filters out records after endDate', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: null, endDate: '2025-05-31' },
                });
            });

            for (const record of result.current.filteredData) {
                expect(record.tanggal <= '2025-05-31').toBe(true);
            }
        });

        it('filters correctly when both startDate and endDate are provided', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-05-15', endDate: '2025-06-01' },
                });
            });

            expect(result.current.filteredData).toHaveLength(3);
            const dates = result.current.filteredData.map(r => r.tanggal);
            expect(dates).toContain('2025-05-15');
            expect(dates).toContain('2025-05-20');
            expect(dates).toContain('2025-06-01');
        });

        it('returns all records when both startDate and endDate are null', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-06-01', endDate: null },
                });
            });
            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: null, endDate: null },
                });
            });

            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });

        it('clearDateRange resets only the date range filter', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-06-01', endDate: null },
                    selectedMonth: '2025-06',
                });
            });

            act(() => {
                result.current.clearDateRange();
            });

            expect(result.current.filters.dateRange).toEqual({ startDate: null, endDate: null });
            // Month filter should still be active
            expect(result.current.filters.selectedMonth).toBe('2025-06');
        });
    });

    // ── Requirement 6.2: Month filter ────────────────────────────────────────

    describe('Requirement 6.2 — month filter', () => {
        it('returns only records for the selected month', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedMonth: '2025-05' });
            });

            for (const record of result.current.filteredData) {
                expect(record.tanggal.slice(0, 7)).toBe('2025-05');
            }
        });

        it('returns only June records when "2025-06" is selected', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedMonth: '2025-06' });
            });

            expect(result.current.filteredData).toHaveLength(3);
        });

        it('returns all records when selectedMonth is null', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedMonth: '2025-05' });
            });
            act(() => {
                result.current.updateFilters({ selectedMonth: null });
            });

            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });

        it('clearMonth resets only the month filter', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    selectedMonth: '2025-06',
                    selectedSalesman: ['Citra'],
                });
            });

            act(() => {
                result.current.clearMonth();
            });

            expect(result.current.filters.selectedMonth).toBeNull();
            // Salesman filter should still be active
            expect(result.current.filters.selectedSalesman).toEqual(['Citra']);
        });
    });

    // ── Requirement 6.3: Salesman filter ─────────────────────────────────────

    describe('Requirement 6.3 — salesman filter', () => {
        it('returns only records for the selected salesman', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Andi'] });
            });

            for (const record of result.current.filteredData) {
                expect(record.namaSalesman).toBe('Andi');
            }
            expect(result.current.filteredData).toHaveLength(2);
        });

        it('supports multiple salesman selection (OR logic)', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Andi', 'Citra'] });
            });

            const names = result.current.filteredData.map(r => r.namaSalesman);
            expect(names.every(n => ['Andi', 'Citra'].includes(n))).toBe(true);
            expect(result.current.filteredData).toHaveLength(4);
        });

        it('returns all records when selectedSalesman is empty', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Andi'] });
            });
            act(() => {
                result.current.updateFilters({ selectedSalesman: [] });
            });

            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });

        it('clearSalesman resets only the salesman filter', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    selectedSalesman: ['Andi'],
                    selectedMonth: '2025-05',
                });
            });

            act(() => {
                result.current.clearSalesman();
            });

            expect(result.current.filters.selectedSalesman).toEqual([]);
            // Month filter should still be active
            expect(result.current.filters.selectedMonth).toBe('2025-05');
        });
    });

    // ── Requirement 6.4: Search query with 300ms debounce ────────────────────

    describe('Requirement 6.4 — search query with 300ms debounce', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('does NOT immediately update filteredData when searchQuery is set', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: 'Andi' });
            });

            // Before debounce fires, filteredData should still contain all records
            // (because debouncedSearch is still '' internally)
            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });

        it('updates filteredData after 300ms debounce has elapsed', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: 'Andi' });
            });

            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(result.current.filteredData).toHaveLength(2);
            for (const record of result.current.filteredData) {
                expect(record.namaSalesman).toBe('Andi');
            }
        });

        it('debounces rapid updates — only the last value fires', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: 'A' });
            });
            act(() => { vi.advanceTimersByTime(100); });
            act(() => {
                result.current.updateFilters({ searchQuery: 'An' });
            });
            act(() => { vi.advanceTimersByTime(100); });
            act(() => {
                result.current.updateFilters({ searchQuery: 'Andi' });
            });

            // Before final debounce — still all records
            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);

            act(() => { vi.advanceTimersByTime(300); });

            // Only "Andi" records after debounce resolves
            expect(result.current.filteredData).toHaveLength(2);
        });

        it('is case-insensitive when matching salesman names', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: 'andi' });
            });
            act(() => { vi.advanceTimersByTime(300); });

            expect(result.current.filteredData).toHaveLength(2);
        });

        it('also matches on tanggal (date string)', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: '2025-06-10' });
            });
            act(() => { vi.advanceTimersByTime(300); });

            expect(result.current.filteredData).toHaveLength(1);
            expect(result.current.filteredData[0].tanggal).toBe('2025-06-10');
        });

        it('clearSearch resets the search query and filtered data returns to pre-search state', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ searchQuery: 'Andi' });
            });
            act(() => { vi.advanceTimersByTime(300); });
            expect(result.current.filteredData).toHaveLength(2);

            act(() => {
                result.current.clearSearch();
            });
            act(() => { vi.advanceTimersByTime(300); });

            expect(result.current.filters.searchQuery).toBe('');
            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });
    });

    // ── Filter application order ──────────────────────────────────────────────

    describe('filter application order: dateRange → month → salesman → search', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('applies date range first, then month, then salesman, then search', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            // Apply all four filters simultaneously
            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-05-01', endDate: '2025-06-30' },
                    selectedMonth: '2025-06',
                    selectedSalesman: ['Budi', 'Citra'],
                    searchQuery: 'Citra',
                });
            });

            // Before debounce fires on search
            // After dateRange + month + salesman: Budi(06-01) and Citra(06-10, 06-20)
            expect(result.current.filteredData).toHaveLength(3);

            // After debounce fires on search query ('Citra')
            act(() => { vi.advanceTimersByTime(300); });

            // Only Citra's 2 June records remain
            expect(result.current.filteredData).toHaveLength(2);
            for (const r of result.current.filteredData) {
                expect(r.namaSalesman).toBe('Citra');
            }
        });

        it('date range narrows the pool before month filter is applied', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            // Date range covers only part of May; then month filter = May
            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-05-12', endDate: '2025-05-31' },
                    selectedMonth: '2025-05',
                });
            });

            // Only records in May AND on or after 2025-05-12
            // 2025-05-10 excluded by date range; 2025-05-15 and 2025-05-20 remain
            expect(result.current.filteredData).toHaveLength(2);
        });
    });

    // ── Requirement 6.5: Single filtered dataset (shared state) ──────────────

    describe('Requirement 6.5 — single filtered dataset for all widgets', () => {
        it('returns the same filteredData reference for all consumers', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            const snapshot1 = result.current.filteredData;
            const snapshot2 = result.current.filteredData;

            // Same render → same reference
            expect(snapshot1).toBe(snapshot2);
        });

        it('updates filteredData consistently when a filter changes', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Andi'] });
            });

            // All consumers see the same filtered data
            expect(result.current.filteredData).toHaveLength(2);
            expect(result.current.filteredData.every(r => r.namaSalesman === 'Andi')).toBe(true);
        });
    });

    // ── resetFilters / clearAll ───────────────────────────────────────────────

    describe('resetFilters — clears all filters at once', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('resets all filters to INITIAL_FILTERS', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({
                    dateRange: { startDate: '2025-06-01', endDate: null },
                    selectedMonth: '2025-06',
                    selectedSalesman: ['Citra'],
                    searchQuery: 'Citra',
                });
            });

            act(() => {
                result.current.resetFilters();
            });

            expect(result.current.filters).toEqual(INITIAL_FILTERS);
        });

        it('returns all raw records after reset', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Andi'] });
            });

            act(() => {
                result.current.resetFilters();
            });

            // Advance past debounce to stabilise
            act(() => { vi.advanceTimersByTime(300); });

            expect(result.current.filteredData).toHaveLength(SAMPLE_DATA.length);
        });
    });

    // ── Derived filter options update when rawData changes ───────────────────

    describe('derived options update when rawData changes', () => {
        it('updates availableMonths when rawData prop changes', () => {
            const initialData = [makeRecord('Andi', '2025-05-10')];
            const { result, rerender } = renderHook(
                ({ data }: { data: SetoranRecord[] }) => useFilterCoordination(data),
                { initialProps: { data: initialData } }
            );

            expect(result.current.availableMonths).toEqual(['2025-05']);

            const newData = [
                ...initialData,
                makeRecord('Budi', '2025-07-01'),
            ];
            rerender({ data: newData });

            expect(result.current.availableMonths).toEqual(['2025-05', '2025-07']);
        });

        it('updates availableSalesman when rawData prop changes', () => {
            const initialData = [makeRecord('Andi', '2025-05-10')];
            const { result, rerender } = renderHook(
                ({ data }: { data: SetoranRecord[] }) => useFilterCoordination(data),
                { initialProps: { data: initialData } }
            );

            expect(result.current.availableSalesman).toEqual(['Andi']);

            const newData = [
                ...initialData,
                makeRecord('Zara', '2025-05-15'),
            ];
            rerender({ data: newData });

            expect(result.current.availableSalesman).toEqual(['Andi', 'Zara']);
        });
    });

    // ── updateFilters merges partial state ───────────────────────────────────

    describe('updateFilters — partial merge behaviour', () => {
        it('preserves unchanged filter fields when a partial update is applied', () => {
            const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

            // Set two filters
            act(() => {
                result.current.updateFilters({ selectedMonth: '2025-06' });
            });
            act(() => {
                result.current.updateFilters({ selectedSalesman: ['Citra'] });
            });

            // Both filters should be active
            expect(result.current.filters.selectedMonth).toBe('2025-06');
            expect(result.current.filters.selectedSalesman).toEqual(['Citra']);
        });
    });
});
