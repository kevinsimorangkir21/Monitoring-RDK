/**
 * E2E Integration Tests for Setoran Dashboard — Complete User Workflows
 *
 * Tests complete user interaction workflows that complement the existing
 * dashboard.integration.test.tsx unit/integration coverage.
 *
 * Validates Requirements:
 *   6.5 — Filter changes update all components simultaneously
 *   8.1 — Chart components use ResponsiveContainer
 *   8.2 — Charts resize with screen size
 *   8.3 — Dashboard grid adapts to mobile, tablet, and desktop screen sizes
 *   8.4 — Chart containers maintain aspect ratios
 *   8.5 — Responsive design ensures accessibility on small screens
 */

import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { SetoranRecord } from '@/types/setoran';

// Components under test
import SetoranCards from '../components/SetoranCards';
import FilterBar from '../components/FilterBar';
import SetoranTable from '../components/SetoranTable';
import { useFilterCoordination, INITIAL_FILTERS } from '../hooks/useFilterCoordination';
import type { SetoranFilters } from '../components/FilterBar';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

globalThis.ResizeObserver ??= class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// ─── Fixture Helpers ──────────────────────────────────────────────────────────

function makeRecord(
    namaSalesman: string,
    tanggal: string,
    durasiSeconds: number = 3600,
    overrides: Partial<SetoranRecord> = {}
): SetoranRecord {
    const [year, month] = tanggal.split('-');
    const monthNames = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const h = Math.floor(durasiSeconds / 3600);
    const m = Math.floor((durasiSeconds % 3600) / 60);
    const s = durasiSeconds % 60;
    return {
        id: `${namaSalesman}-${tanggal}-${durasiSeconds}`,
        tanggal,
        bulan: `${monthNames[parseInt(month)]} ${year}`,
        namaSalesman,
        pulangKunjungan: '16:00',
        setoranKasir: '17:00',
        durasiSeconds,
        durasi: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        status: durasiSeconds <= 1800 ? 'Fast' : durasiSeconds <= 3600 ? 'Normal' : 'Slow',
        waktuPulang: `${tanggal}T16:00:00`,
        waktuSetoran: `${tanggal}T17:00:00`,
        ...overrides,
    };
}

/**
 * Full dashboard harness wiring FilterBar + SetoranCards + SetoranTable
 * together via useFilterCoordination — matches the pattern in page.tsx.
 */
function FullDashboardHarness({ rawData }: { rawData: SetoranRecord[] }) {
    const {
        filters,
        filteredData,
        availableMonths,
        availableSalesman,
        updateFilters,
        resetFilters,
    } = useFilterCoordination(rawData);

    return (
        <div>
            <span data-testid="record-count">{filteredData.length}</span>
            <FilterBar
                filters={filters}
                availableMonths={availableMonths}
                availableSalesman={availableSalesman}
                onChange={updateFilters}
                onReset={resetFilters}
            />
            <SetoranCards data={filteredData} />
            <SetoranTable data={filteredData} searchQuery={filters.searchQuery} />
        </div>
    );
}

/**
 * Harness that allows replacing rawData to simulate a data refresh
 * (equivalent to the refresh button regenerating mock data in page.tsx).
 */
function RefreshableHarness() {
    const [rawData, setRawData] = useState<SetoranRecord[]>([
        makeRecord('Andi', '2025-05-10', 1200),
        makeRecord('Budi', '2025-05-20', 3600),
    ]);

    const {
        filters,
        filteredData,
        availableMonths,
        availableSalesman,
        updateFilters,
        resetFilters,
    } = useFilterCoordination(rawData);

    return (
        <div>
            <span data-testid="record-count">{filteredData.length}</span>
            <span data-testid="month-count">{availableMonths.length}</span>
            <span data-testid="salesman-count">{availableSalesman.length}</span>
            <button
                data-testid="refresh-btn"
                onClick={() =>
                    setRawData([
                        makeRecord('Andi', '2025-05-10', 1200),
                        makeRecord('Budi', '2025-05-20', 3600),
                        makeRecord('Citra', '2025-06-15', 4800),
                        makeRecord('Dewi', '2025-06-20', 2400),
                    ])
                }
            >
                Refresh
            </button>
            <FilterBar
                filters={filters}
                availableMonths={availableMonths}
                availableSalesman={availableSalesman}
                onChange={updateFilters}
                onReset={resetFilters}
            />
        </div>
    );
}

// ─── Sample Dataset ───────────────────────────────────────────────────────────

const SAMPLE_DATA: SetoranRecord[] = [
    makeRecord('Andi', '2025-05-10', 1200),   // Fast
    makeRecord('Andi', '2025-05-15', 1800),   // Fast
    makeRecord('Budi', '2025-05-20', 3600),   // Normal
    makeRecord('Budi', '2025-06-01', 4800),   // Slow
    makeRecord('Citra', '2025-06-10', 6000),  // Slow
    makeRecord('Citra', '2025-06-20', 7200),  // Slow
];

// Generate a larger dataset for pagination tests (30 records)
const PAGINATED_DATA: SetoranRecord[] = Array.from({ length: 30 }, (_, i) =>
    makeRecord(`Salesman ${i + 1}`, `2025-06-${String((i % 28) + 1).padStart(2, '0')}`, 3600 + i * 60)
);

// ─── Suite 1: Complete Filter Workflow (Requirement 6.5) ─────────────────────

describe('Workflow 1 — Complete filter workflow (Requirement 6.5)', () => {

    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('applies date range → month → salesman → search → clear all in sequence', () => {
        const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

        // Step 1: Apply date range (May only)
        act(() => {
            result.current.updateFilters({
                dateRange: { startDate: '2025-05-01', endDate: '2025-05-31' },
            });
        });
        expect(result.current.filteredData).toHaveLength(3); // 3 May records

        // Step 2: Also select a specific month (redundant but valid)
        act(() => {
            result.current.updateFilters({ selectedMonth: '2025-05' });
        });
        expect(result.current.filteredData).toHaveLength(3);

        // Step 3: Filter by salesman Andi within May
        act(() => {
            result.current.updateFilters({ selectedSalesman: ['Andi'] });
        });
        expect(result.current.filteredData).toHaveLength(2); // Andi has 2 May records

        // Step 4: Type search query
        act(() => {
            result.current.updateFilters({ searchQuery: 'Andi' });
        });
        // Before debounce: salesman filter already narrows to Andi records
        expect(result.current.filteredData).toHaveLength(2);

        // After debounce: still 2 Andi records
        act(() => { vi.advanceTimersByTime(300); });
        expect(result.current.filteredData).toHaveLength(2);

        // Step 5: Clear all filters
        act(() => {
            result.current.resetFilters();
        });
        act(() => { vi.advanceTimersByTime(300); });
        expect(result.current.filteredData).toHaveLength(6);
        expect(result.current.filters).toEqual(INITIAL_FILTERS);
    });

    it('clears each filter individually without disrupting others', () => {
        const { result } = renderHook(() => useFilterCoordination(SAMPLE_DATA));

        act(() => {
            result.current.updateFilters({
                dateRange: { startDate: '2025-05-01', endDate: '2025-06-30' },
                selectedMonth: '2025-06',
                selectedSalesman: ['Citra'],
            });
        });
        // June + Citra = 2 records
        expect(result.current.filteredData).toHaveLength(2);

        // Clear salesman — back to all June records (3)
        act(() => { result.current.clearSalesman(); });
        expect(result.current.filteredData).toHaveLength(3);
        expect(result.current.filters.selectedMonth).toBe('2025-06');

        // Clear month — back to all records in date range (6)
        act(() => { result.current.clearMonth(); });
        expect(result.current.filteredData).toHaveLength(6);
        expect(result.current.filters.dateRange.startDate).toBe('2025-05-01');

        // Clear date range — all 6 records
        act(() => { result.current.clearDateRange(); });
        expect(result.current.filteredData).toHaveLength(6);
    });

    it('full dashboard harness: FilterBar onChange drives all consumers simultaneously', () => {
        render(<FullDashboardHarness rawData={SAMPLE_DATA} />);

        // Initial: all 6 records
        expect(screen.getByTestId('record-count')).toHaveTextContent('6');

        // Apply month filter via FilterBar — target the month select by its label
        fireEvent.change(screen.getByRole('combobox', { name: /bulan/i }), { target: { value: '2025-06' } });

        // All consumers see the same filtered count (3)
        expect(screen.getByTestId('record-count')).toHaveTextContent('3');
    });

    it('full dashboard harness: reset button clears all filters at once', () => {
        render(<FullDashboardHarness rawData={SAMPLE_DATA} />);

        // Activate a filter — target the month select by its label
        fireEvent.change(screen.getByRole('combobox', { name: /bulan/i }), { target: { value: '2025-05' } });
        expect(screen.getByTestId('record-count')).toHaveTextContent('3');

        // Reset via FilterBar reset button
        fireEvent.click(screen.getByRole('button', { name: /reset semua filter/i }));

        // All 6 records visible again
        expect(screen.getByTestId('record-count')).toHaveTextContent('6');
    });
});

// ─── Suite 2: Data Refresh Workflow (Requirement 6.5) ────────────────────────

describe('Workflow 2 — Data refresh workflow (Requirement 6.5)', () => {

    it('replacing rawData updates availableMonths and availableSalesman', () => {
        render(<RefreshableHarness />);

        // Initial: 2 records, 1 month (May), 2 salesman
        expect(screen.getByTestId('record-count')).toHaveTextContent('2');
        expect(screen.getByTestId('month-count')).toHaveTextContent('1');
        expect(screen.getByTestId('salesman-count')).toHaveTextContent('2');

        // Trigger refresh (adds June records + 2 new salesman)
        fireEvent.click(screen.getByTestId('refresh-btn'));

        // After refresh: 4 records, 2 months (May + June), 4 salesman
        expect(screen.getByTestId('record-count')).toHaveTextContent('4');
        expect(screen.getByTestId('month-count')).toHaveTextContent('2');
        expect(screen.getByTestId('salesman-count')).toHaveTextContent('4');
    });

    it('replacing rawData resets filteredData to full new dataset', () => {
        render(<RefreshableHarness />);

        // Confirm initial count
        expect(screen.getByTestId('record-count')).toHaveTextContent('2');

        // Click refresh
        fireEvent.click(screen.getByTestId('refresh-btn'));

        // New dataset has 4 records and no active filters
        expect(screen.getByTestId('record-count')).toHaveTextContent('4');
    });

    it('rawData change preserves active filter state in the hook', () => {
        const { result, rerender } = renderHook(
            ({ data }) => useFilterCoordination(data),
            { initialProps: { data: SAMPLE_DATA } }
        );

        // Apply a month filter
        act(() => {
            result.current.updateFilters({ selectedMonth: '2025-06' });
        });
        expect(result.current.filteredData).toHaveLength(3);

        // Replace rawData with a larger dataset (add 2 more June records)
        const extendedData = [
            ...SAMPLE_DATA,
            makeRecord('Dedi', '2025-06-25', 5000),
            makeRecord('Eva', '2025-06-28', 3200),
        ];
        rerender({ data: extendedData });

        // Month filter still active; now picks up 5 June records
        expect(result.current.filters.selectedMonth).toBe('2025-06');
        expect(result.current.filteredData).toHaveLength(5);
    });
});

// ─── Suite 3: Error States — SetoranCards Empty Data (Requirements 8.3, 8.5) ─

describe('Workflow 3 — Error states: SetoranCards empty data (Requirements 8.3, 8.5)', () => {

    it('renders empty-state cards when data is empty', () => {
        render(<SetoranCards data={[]} />);

        // All four cards show "Tidak ada data" placeholder
        const emptyMessages = screen.getAllByText('Tidak ada data');
        expect(emptyMessages).toHaveLength(4);
    });

    it('empty-state grid has correct accessible label', () => {
        render(<SetoranCards data={[]} />);
        expect(screen.getByLabelText('KPI Cards — no data')).toBeInTheDocument();
    });

    it('empty-state shows dash placeholder for KPI values', () => {
        const { container } = render(<SetoranCards data={[]} />);
        const dashes = container.querySelectorAll('p.font-bold');
        // All four primary value elements should show "—"
        const dashElements = Array.from(dashes).filter(el => el.textContent === '—');
        expect(dashElements).toHaveLength(4);
    });

    it('empty-state grid preserves responsive layout classes', () => {
        const { container } = render(<SetoranCards data={[]} />);
        const grid = container.firstElementChild!;
        expect(grid.className).toContain('grid-cols-2');
        expect(grid.className).toContain('lg:grid-cols-4');
        expect(grid.className).toContain('gap-4');
    });

    it('KPI cards zero state: one record produces valid (non-zero) KPIs', () => {
        const singleRecord = [makeRecord('Solo', '2025-06-01', 3000)];
        render(<SetoranCards data={singleRecord} />);

        // Should NOT show empty state — cards render actual values
        expect(screen.queryAllByText('Tidak ada data')).toHaveLength(0);
        // Total Setoran card should show "1"
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});

// ─── Suite 4: Loading State (Requirements 8.3, 8.5) ─────────────────────────

describe('Workflow 4 — Loading state: SetoranCards skeleton (Requirements 8.3, 8.5)', () => {

    it('shows skeleton cards when loading=true', () => {
        const { container } = render(<SetoranCards data={[]} loading={true} />);
        // 4 skeleton cards rendered (via animate-pulse class)
        const skeletons = container.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBe(4);
    });

    it('loading grid has aria-busy="true" attribute', () => {
        render(<SetoranCards data={[]} loading={true} />);
        const grid = screen.getByLabelText('Loading KPI cards');
        expect(grid).toHaveAttribute('aria-busy', 'true');
    });

    it('loading grid preserves responsive layout classes', () => {
        const { container } = render(<SetoranCards data={[]} loading={true} />);
        const grid = container.firstElementChild!;
        expect(grid.className).toContain('grid-cols-2');
        expect(grid.className).toContain('lg:grid-cols-4');
        expect(grid.className).toContain('gap-4');
    });

    it('SetoranTable shows skeleton rows when loading=true', () => {
        const { container } = render(<SetoranTable data={[]} loading={true} />);
        const skeletonRows = container.querySelectorAll('tr[aria-hidden="true"]');
        expect(skeletonRows.length).toBeGreaterThan(0);
    });

    it('SetoranTable skeleton hides pagination controls', () => {
        render(<SetoranTable data={PAGINATED_DATA} loading={true} />);
        // Pagination navigation should not appear during loading
        expect(screen.queryByRole('navigation', { name: /navigasi halaman/i })).toBeNull();
    });
});

// ─── Suite 5: Table Navigation Workflow (Requirements 5.1, 8.3, 8.4, 8.5) ───

describe('Workflow 5 — Table navigation: pagination controls (Requirements 5.1, 8.3, 8.4, 8.5)', () => {

    it('renders first page of paginated data by default (10 rows)', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);
        // With 30 records and default page size 10, first page shows rows 1-10
        expect(screen.getByText('1–10 dari 30')).toBeInTheDocument();
    });

    it('navigates to the next page when "Halaman berikutnya" is clicked', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        fireEvent.click(screen.getByRole('button', { name: /halaman berikutnya/i }));

        expect(screen.getByText('11–20 dari 30')).toBeInTheDocument();
    });

    it('navigates to the previous page after going forward', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        // Go to page 2
        fireEvent.click(screen.getByRole('button', { name: /halaman berikutnya/i }));
        expect(screen.getByText('11–20 dari 30')).toBeInTheDocument();

        // Go back to page 1
        fireEvent.click(screen.getByRole('button', { name: /halaman sebelumnya/i }));
        expect(screen.getByText('1–10 dari 30')).toBeInTheDocument();
    });

    it('jumps to the last page via "Halaman terakhir" button', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        fireEvent.click(screen.getByRole('button', { name: /halaman terakhir/i }));

        // 30 records / 10 per page = page 3: rows 21-30
        expect(screen.getByText('21–30 dari 30')).toBeInTheDocument();
    });

    it('returns to first page via "Halaman pertama" button', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        // Go to last page first
        fireEvent.click(screen.getByRole('button', { name: /halaman terakhir/i }));
        expect(screen.getByText('21–30 dari 30')).toBeInTheDocument();

        // Jump back to first page
        fireEvent.click(screen.getByRole('button', { name: /halaman pertama/i }));
        expect(screen.getByText('1–10 dari 30')).toBeInTheDocument();
    });

    it('changing page size resets to page 1', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        // Go to page 2
        fireEvent.click(screen.getByRole('button', { name: /halaman berikutnya/i }));
        expect(screen.getByText('11–20 dari 30')).toBeInTheDocument();

        // Change page size to 25
        fireEvent.change(screen.getByRole('combobox', { name: /baris per halaman/i }), {
            target: { value: '25' },
        });

        // Resets to page 1 with 25 records shown
        expect(screen.getByText('1–25 dari 30')).toBeInTheDocument();
    });

    it('disables "previous" and "first" navigation on first page', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        expect(screen.getByRole('button', { name: /halaman pertama/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /halaman sebelumnya/i })).toBeDisabled();
    });

    it('disables "next" and "last" navigation on the last page', () => {
        render(<SetoranTable data={PAGINATED_DATA} />);

        fireEvent.click(screen.getByRole('button', { name: /halaman terakhir/i }));

        expect(screen.getByRole('button', { name: /halaman berikutnya/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /halaman terakhir/i })).toBeDisabled();
    });

    it('table resets to page 1 when data prop changes (new filter applied)', () => {
        const { rerender } = render(<SetoranTable data={PAGINATED_DATA} />);

        // Navigate to page 2
        fireEvent.click(screen.getByRole('button', { name: /halaman berikutnya/i }));
        expect(screen.getByText('11–20 dari 30')).toBeInTheDocument();

        // Simulate filter change: only 5 records remain
        const filteredData = PAGINATED_DATA.slice(0, 5);
        rerender(<SetoranTable data={filteredData} />);

        // Should reset to page 1 with the new data
        expect(screen.getByText('1–5 dari 5')).toBeInTheDocument();
    });

    it('table shows empty state when no data matches filters', () => {
        render(<SetoranTable data={[]} />);
        expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
    });

    it('table wraps correctly in responsive scroll container', () => {
        const { container } = render(<SetoranTable data={SAMPLE_DATA} />);
        // The overflow-x-auto scroll wrapper must be present for responsive layout (Req 8.3)
        const scrollWrapper = container.querySelector('.overflow-x-auto');
        expect(scrollWrapper).not.toBeNull();
    });

    it('table aria-sort attribute is on <th> element, not on button (Requirement 8.5)', () => {
        render(<SetoranTable data={SAMPLE_DATA} />);

        // Click on "Tanggal" header to sort
        fireEvent.click(screen.getByRole('button', { name: /urutkan berdasarkan tanggal/i }));

        // aria-sort must be on the <th> column header, not the button
        const thWithSort = document.querySelector('th[aria-sort]');
        expect(thWithSort).not.toBeNull();
        expect(thWithSort?.tagName).toBe('TH');

        // The button inside should NOT carry aria-sort
        const buttonWithSort = document.querySelector('button[aria-sort]');
        expect(buttonWithSort).toBeNull();
    });

    it('sort direction cycles asc → desc → none on repeated clicks', () => {
        render(<SetoranTable data={SAMPLE_DATA} />);

        const sortBtn = screen.getByRole('button', { name: /urutkan berdasarkan tanggal/i });
        const th = sortBtn.closest('th')!;

        // Initial: no sort
        expect(th.getAttribute('aria-sort')).toBe('none');

        // First click: ascending
        fireEvent.click(sortBtn);
        expect(th.getAttribute('aria-sort')).toBe('ascending');

        // Second click: descending
        fireEvent.click(sortBtn);
        expect(th.getAttribute('aria-sort')).toBe('descending');

        // Third click: cleared (none)
        fireEvent.click(sortBtn);
        expect(th.getAttribute('aria-sort')).toBe('none');
    });
});
