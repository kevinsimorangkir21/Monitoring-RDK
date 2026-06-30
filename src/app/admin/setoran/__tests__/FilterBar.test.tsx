/**
 * Unit tests for FilterBar component
 *
 * Requirements: 6.1 (date range picker), 6.2 (month dropdown),
 *               6.3 (salesman multi-select), 6.4 (text search with debounce)
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../components/FilterBar';
import type { SetoranFilters } from '../components/FilterBar';

// ─── Mock framer-motion to avoid animation complexity in tests ────────────────

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ─── Test Fixtures ─────────────────────────────────────────────────────────────

const defaultFilters: SetoranFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedMonth: null,
    selectedSalesman: [],
    searchQuery: '',
};

const availableMonths = ['2025-04', '2025-05', '2025-06'];
const availableSalesman = ['Andi Wijaya', 'Budi Santoso', 'Citra Lestari', 'Dian Permata'];

function renderFilterBar(
    overrides: Partial<SetoranFilters> = {},
    handlers: { onChange?: MockInstance; onReset?: MockInstance } = {}
) {
    const onChangeMock = handlers.onChange ?? vi.fn();
    const onResetMock = handlers.onReset ?? vi.fn();
    const filters: SetoranFilters = { ...defaultFilters, ...overrides };

    const result = render(
        <FilterBar
            filters={filters}
            availableMonths={availableMonths}
            availableSalesman={availableSalesman}
            onChange={onChangeMock as unknown as (filters: Partial<SetoranFilters>) => void}
            onReset={onResetMock as unknown as () => void}
        />
    );

    return { ...result, onChange: onChangeMock, onReset: onResetMock };
}

// ─── Test Suite ────────────────────────────────────────────────────────────────

describe('FilterBar', () => {

    // ── Rendering ────────────────────────────────────────────────────────────

    describe('initial render', () => {
        it('renders the filter header', () => {
            renderFilterBar();
            expect(screen.getByText('Filter Dashboard')).toBeInTheDocument();
        });

        it('renders all four filter controls', () => {
            renderFilterBar();
            // Date range (Requirement 6.1)
            expect(screen.getByLabelText('Tanggal mulai')).toBeInTheDocument();
            expect(screen.getByLabelText('Tanggal akhir')).toBeInTheDocument();
            // Month dropdown (Requirement 6.2)
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            // Salesman multi-select (Requirement 6.3)
            expect(screen.getByRole('button', { name: /pilih salesman/i })).toBeInTheDocument();
            // Text search (Requirement 6.4)
            expect(screen.getByPlaceholderText('Cari nama salesman...')).toBeInTheDocument();
        });

        it('does not show the reset button when no filters are active', () => {
            renderFilterBar();
            expect(screen.queryByRole('button', { name: /reset semua filter/i })).not.toBeInTheDocument();
        });

        it('does not show the "Aktif" badge when no filters are active', () => {
            renderFilterBar();
            expect(screen.queryByText('Aktif')).not.toBeInTheDocument();
        });
    });

    // ── Requirement 6.1: Date Range Picker ───────────────────────────────────

    describe('Requirement 6.1 — date range picker', () => {
        it('renders start and end date inputs with correct initial empty values', () => {
            renderFilterBar();
            expect(screen.getByLabelText('Tanggal mulai')).toHaveValue('');
            expect(screen.getByLabelText('Tanggal akhir')).toHaveValue('');
        });

        it('reflects an existing startDate from props', () => {
            renderFilterBar({ dateRange: { startDate: '2025-06-01', endDate: null } });
            expect(screen.getByLabelText('Tanggal mulai')).toHaveValue('2025-06-01');
        });

        it('reflects an existing endDate from props', () => {
            renderFilterBar({ dateRange: { startDate: null, endDate: '2025-06-30' } });
            expect(screen.getByLabelText('Tanggal akhir')).toHaveValue('2025-06-30');
        });

        it('calls onChange with updated startDate when start date changes', () => {
            const { onChange } = renderFilterBar();

            fireEvent.change(screen.getByLabelText('Tanggal mulai'), {
                target: { value: '2025-06-01' },
            });

            expect(onChange).toHaveBeenCalledWith({
                dateRange: { startDate: '2025-06-01', endDate: null },
            });
        });

        it('calls onChange with updated endDate when end date changes', () => {
            const { onChange } = renderFilterBar({
                dateRange: { startDate: '2025-06-01', endDate: null },
            });

            fireEvent.change(screen.getByLabelText('Tanggal akhir'), {
                target: { value: '2025-06-30' },
            });

            expect(onChange).toHaveBeenCalledWith({
                dateRange: { startDate: '2025-06-01', endDate: '2025-06-30' },
            });
        });

        it('calls onChange with null startDate when date is cleared', () => {
            const { onChange } = renderFilterBar({
                dateRange: { startDate: '2025-06-01', endDate: null },
            });

            fireEvent.change(screen.getByLabelText('Tanggal mulai'), {
                target: { value: '' },
            });

            expect(onChange).toHaveBeenCalledWith({
                dateRange: { startDate: null, endDate: null },
            });
        });

        it('preserves existing endDate when only startDate changes', () => {
            const { onChange } = renderFilterBar({
                dateRange: { startDate: null, endDate: '2025-06-30' },
            });

            fireEvent.change(screen.getByLabelText('Tanggal mulai'), {
                target: { value: '2025-06-10' },
            });

            expect(onChange).toHaveBeenCalledWith({
                dateRange: { startDate: '2025-06-10', endDate: '2025-06-30' },
            });
        });

        it('shows a date-range chip in active filter chips when date range is set', () => {
            renderFilterBar({ dateRange: { startDate: '2025-06-01', endDate: '2025-06-30' } });
            expect(screen.getByText('2025-06-01 → 2025-06-30')).toBeInTheDocument();
        });

        it('removes date range when its chip remove button is clicked', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({
                dateRange: { startDate: '2025-06-01', endDate: '2025-06-30' },
            });

            const chipSpan = screen.getByText('2025-06-01 → 2025-06-30').closest('span')!;
            await user.click(within(chipSpan).getByRole('button'));

            expect(onChange).toHaveBeenCalledWith({
                dateRange: { startDate: null, endDate: null },
            });
        });
    });

    // ── Requirement 6.2: Month Dropdown ──────────────────────────────────────

    describe('Requirement 6.2 — month dropdown filter', () => {
        it('renders "Semua Bulan" as the default option', () => {
            renderFilterBar();
            expect(screen.getByRole('combobox')).toHaveValue('');
        });

        it('populates dropdown with available months plus the "Semua Bulan" option', () => {
            renderFilterBar();
            const select = screen.getByRole('combobox');
            const options = within(select).getAllByRole('option');
            // 3 months + 1 default
            expect(options.length).toBe(4);
        });

        it('formats months in Indonesian locale', () => {
            renderFilterBar();
            // "2025-06" should be formatted as "Juni 2025"
            expect(screen.getByRole('option', { name: 'Juni 2025' })).toBeInTheDocument();
        });

        it('reflects selectedMonth from props', () => {
            renderFilterBar({ selectedMonth: '2025-06' });
            expect(screen.getByRole('combobox')).toHaveValue('2025-06');
        });

        it('calls onChange with selectedMonth when a month is selected', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar();

            await user.selectOptions(screen.getByRole('combobox'), '2025-06');

            expect(onChange).toHaveBeenCalledWith({ selectedMonth: '2025-06' });
        });

        it('calls onChange with null when "Semua Bulan" is selected', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({ selectedMonth: '2025-06' });

            await user.selectOptions(screen.getByRole('combobox'), '');

            expect(onChange).toHaveBeenCalledWith({ selectedMonth: null });
        });

        it('shows a month chip in active filters when month is selected', () => {
            renderFilterBar({ selectedMonth: '2025-06' });
            expect(screen.getByText('Bulan: Juni 2025')).toBeInTheDocument();
        });

        it('removes month filter when its chip remove button is clicked', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({ selectedMonth: '2025-06' });

            const chipSpan = screen.getByText('Bulan: Juni 2025').closest('span')!;
            await user.click(within(chipSpan).getByRole('button'));

            expect(onChange).toHaveBeenCalledWith({ selectedMonth: null });
        });
    });

    // ── Requirement 6.3: Salesman Multi-Select ────────────────────────────────

    describe('Requirement 6.3 — salesman multi-select dropdown', () => {
        it('shows "Pilih Salesman..." when nothing is selected', () => {
            renderFilterBar();
            expect(screen.getByRole('button', { name: /pilih salesman/i })).toBeInTheDocument();
        });

        it('shows selected salesman name in the trigger button when exactly one is selected', () => {
            renderFilterBar({ selectedSalesman: ['Andi Wijaya'] });
            // The dropdown trigger button has aria-haspopup="listbox"
            // It should contain a span with the salesman name
            const triggers = screen.getAllByRole('button', { name: /andi wijaya/i });
            const dropdownTrigger = triggers.find(
                el => el.getAttribute('aria-haspopup') === 'listbox'
            );
            expect(dropdownTrigger).toBeDefined();
            expect(dropdownTrigger).toBeInTheDocument();
        });

        it('shows count label when multiple salesman are selected', () => {
            renderFilterBar({ selectedSalesman: ['Andi Wijaya', 'Budi Santoso'] });
            expect(screen.getByText('2 salesman dipilih')).toBeInTheDocument();
        });

        it('opens dropdown when trigger is clicked', async () => {
            const user = userEvent.setup();
            renderFilterBar();
            await user.click(screen.getByRole('button', { name: /pilih salesman/i }));
            expect(screen.getByPlaceholderText('Cari salesman...')).toBeInTheDocument();
        });

        it('lists all available salesman in the dropdown', async () => {
            const user = userEvent.setup();
            renderFilterBar();
            await user.click(screen.getByRole('button', { name: /pilih salesman/i }));

            for (const name of availableSalesman) {
                expect(screen.getByRole('option', { name })).toBeInTheDocument();
            }
        });

        it('calls onChange when a salesman is selected', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar();

            await user.click(screen.getByRole('button', { name: /pilih salesman/i }));
            await user.click(screen.getByRole('option', { name: 'Andi Wijaya' }));

            expect(onChange).toHaveBeenCalledWith({
                selectedSalesman: ['Andi Wijaya'],
            });
        });

        it('calls onChange with removed salesman when a selected option is unchecked', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({
                selectedSalesman: ['Andi Wijaya', 'Budi Santoso'],
            });

            await user.click(screen.getByRole('button', { name: /2 salesman dipilih/i }));
            await user.click(screen.getByRole('option', { name: 'Andi Wijaya' }));

            expect(onChange).toHaveBeenCalledWith({
                selectedSalesman: ['Budi Santoso'],
            });
        });

        it('calls onChange with empty array when "Hapus Semua Pilihan" is clicked', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({
                selectedSalesman: ['Andi Wijaya', 'Budi Santoso'],
            });

            await user.click(screen.getByRole('button', { name: /2 salesman dipilih/i }));
            await user.click(screen.getByRole('button', { name: /hapus semua pilihan/i }));

            expect(onChange).toHaveBeenCalledWith({ selectedSalesman: [] });
        });

        it('shows individual chips for each selected salesman in the active filters area', () => {
            renderFilterBar({ selectedSalesman: ['Andi Wijaya', 'Budi Santoso'] });
            // There are chips with aria-label "Hapus filter <name>"
            expect(screen.getByRole('button', { name: 'Hapus filter Andi Wijaya' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Hapus filter Budi Santoso' })).toBeInTheDocument();
        });

        it('removes a single salesman chip when its remove button is clicked', async () => {
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({
                selectedSalesman: ['Andi Wijaya', 'Budi Santoso'],
            });

            await user.click(screen.getByRole('button', { name: 'Hapus filter Andi Wijaya' }));

            expect(onChange).toHaveBeenCalledWith({
                selectedSalesman: ['Budi Santoso'],
            });
        });
    });

    // ── Requirement 6.3: Salesman Search (within dropdown) ───────────────────
    //
    // These tests use fireEvent + fake timers so we can control the 300ms
    // debounce inside SalesmanMultiSelect without waitFor deadlocks.

    describe('Requirement 6.3 — salesman dropdown search / filtering', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('filters the options list based on debounced search input', () => {
            renderFilterBar();

            // Open dropdown with real click (fireEvent doesn't need timers)
            fireEvent.click(screen.getByRole('button', { name: /pilih salesman/i }));

            const searchInput = screen.getByPlaceholderText('Cari salesman...');
            fireEvent.change(searchInput, { target: { value: 'andi' } });

            // Advance past the 300ms debounce
            act(() => { vi.advanceTimersByTime(400); });

            expect(screen.getByRole('option', { name: 'Andi Wijaya' })).toBeInTheDocument();
            expect(screen.queryByRole('option', { name: 'Budi Santoso' })).not.toBeInTheDocument();
        });

        it('shows "Tidak ada salesman ditemukan" when search has no matches', () => {
            renderFilterBar();
            fireEvent.click(screen.getByRole('button', { name: /pilih salesman/i }));

            fireEvent.change(screen.getByPlaceholderText('Cari salesman...'), {
                target: { value: 'xyz_no_match' },
            });
            act(() => { vi.advanceTimersByTime(400); });

            expect(screen.getByText('Tidak ada salesman ditemukan')).toBeInTheDocument();
        });

        it('shows all options when dropdown search is cleared', () => {
            renderFilterBar();
            fireEvent.click(screen.getByRole('button', { name: /pilih salesman/i }));

            const searchInput = screen.getByPlaceholderText('Cari salesman...');

            // Type to filter
            fireEvent.change(searchInput, { target: { value: 'andi' } });
            act(() => { vi.advanceTimersByTime(400); });

            // Then clear
            fireEvent.change(searchInput, { target: { value: '' } });
            act(() => { vi.advanceTimersByTime(400); });

            for (const name of availableSalesman) {
                expect(screen.getByRole('option', { name })).toBeInTheDocument();
            }
        });
    });

    // ── Requirement 6.4: Text Search with 300ms Debounce ─────────────────────

    describe('Requirement 6.4 — text search input with 300ms debounce', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('renders the search input', () => {
            renderFilterBar();
            expect(screen.getByPlaceholderText('Cari nama salesman...')).toBeInTheDocument();
        });

        it('does NOT call onChange with searchQuery before the debounce delay elapses', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
            const { onChange } = renderFilterBar();

            // Type but DON'T advance timers past threshold
            fireEvent.change(screen.getByPlaceholderText('Cari nama salesman...'), {
                target: { value: 'A' },
            });

            // Advance just under the debounce threshold
            act(() => { vi.advanceTimersByTime(299); });

            expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ searchQuery: 'A' }));
        });

        it('calls onChange with searchQuery after 300ms debounce', async () => {
            const { onChange } = renderFilterBar();

            fireEvent.change(screen.getByPlaceholderText('Cari nama salesman...'), {
                target: { value: 'Andi' },
            });

            // Advance past the debounce threshold
            act(() => { vi.advanceTimersByTime(300); });

            expect(onChange).toHaveBeenCalledWith({ searchQuery: 'Andi' });
        });

        it('only fires onChange once when typing rapidly (debounce coalescing)', async () => {
            const { onChange } = renderFilterBar();
            const input = screen.getByPlaceholderText('Cari nama salesman...');

            // Simulate rapid typing: each keystroke resets the debounce
            fireEvent.change(input, { target: { value: 'A' } });
            act(() => { vi.advanceTimersByTime(100); });
            fireEvent.change(input, { target: { value: 'An' } });
            act(() => { vi.advanceTimersByTime(100); });
            fireEvent.change(input, { target: { value: 'And' } });
            act(() => { vi.advanceTimersByTime(100); });
            fireEvent.change(input, { target: { value: 'Andi' } });

            // Fire the final debounce
            act(() => { vi.advanceTimersByTime(300); });

            const searchCalls = onChange.mock.calls.filter(
                (call: any[]) => call[0]?.searchQuery !== undefined
            );
            // Only the final value 'Andi' should have triggered a propagation
            expect(searchCalls.length).toBe(1);
            expect(searchCalls[0][0]).toEqual({ searchQuery: 'Andi' });
        });

        it('shows the clear (X) button while there is search text', () => {
            renderFilterBar();
            const input = screen.getByPlaceholderText('Cari nama salesman...');

            fireEvent.change(input, { target: { value: 'Andi' } });

            expect(screen.getByRole('button', { name: /hapus pencarian/i })).toBeInTheDocument();
        });

        it('does NOT show the clear (X) button when search is empty', () => {
            renderFilterBar();
            expect(screen.queryByRole('button', { name: /hapus pencarian/i })).not.toBeInTheDocument();
        });

        it('clears search input immediately when the X button is clicked', () => {
            const { onChange } = renderFilterBar();
            const input = screen.getByPlaceholderText('Cari nama salesman...');

            fireEvent.change(input, { target: { value: 'Andi' } });
            expect(input).toHaveValue('Andi');

            fireEvent.click(screen.getByRole('button', { name: /hapus pencarian/i }));

            expect(input).toHaveValue('');
            expect(onChange).toHaveBeenCalledWith({ searchQuery: '' });
        });

        it('shows a search chip with quoted text in active filters area', () => {
            // chips rely on filters.searchQuery prop, not local rawSearch
            vi.useRealTimers();
            renderFilterBar({ searchQuery: 'Andi' });
            expect(screen.getByText('"Andi"')).toBeInTheDocument();
        });

        it('removes the search chip when its remove button is clicked', async () => {
            vi.useRealTimers();
            const user = userEvent.setup();
            const { onChange } = renderFilterBar({ searchQuery: 'Andi' });

            const chipSpan = screen.getByText('"Andi"').closest('span')!;
            await user.click(within(chipSpan).getByRole('button'));

            expect(onChange).toHaveBeenCalledWith({ searchQuery: '' });
        });

        it('syncs local rawSearch when filters.searchQuery is reset to empty externally', () => {
            vi.useRealTimers();
            const { rerender } = renderFilterBar({ searchQuery: 'Andi' });

            const input = screen.getByPlaceholderText('Cari nama salesman...');
            expect(input).toHaveValue('Andi');

            rerender(
                <FilterBar
                    filters={{ ...defaultFilters, searchQuery: '' }}
                    availableMonths={availableMonths}
                    availableSalesman={availableSalesman}
                    onChange={vi.fn()}
                    onReset={vi.fn()}
                />
            );

            expect(input).toHaveValue('');
        });
    });

    // ── Active filter indicators ──────────────────────────────────────────────

    describe('active filter indicators', () => {
        it('shows "Aktif" badge when any filter is active', () => {
            renderFilterBar({ searchQuery: 'test' });
            expect(screen.getByText('Aktif')).toBeInTheDocument();
        });

        it('shows the reset button when any filter is active', () => {
            renderFilterBar({ selectedMonth: '2025-06' });
            expect(screen.getByRole('button', { name: /reset semua filter/i })).toBeInTheDocument();
        });

        it('calls onReset when reset button is clicked', async () => {
            const user = userEvent.setup();
            const { onReset } = renderFilterBar({ selectedMonth: '2025-06' });

            await user.click(screen.getByRole('button', { name: /reset semua filter/i }));

            expect(onReset).toHaveBeenCalledTimes(1);
        });

        it('shows active filter chips section when filters are applied', () => {
            renderFilterBar({
                dateRange: { startDate: '2025-06-01', endDate: '2025-06-30' },
                selectedMonth: '2025-06',
                selectedSalesman: ['Andi Wijaya'],
                searchQuery: 'test',
            });

            expect(screen.getByText('Filter Aktif:')).toBeInTheDocument();
        });

        it('does not show filter chips when no filters are active', () => {
            renderFilterBar();
            expect(screen.queryByText('Filter Aktif:')).not.toBeInTheDocument();
        });
    });

    // ── hasActiveFilters logic ────────────────────────────────────────────────

    describe('hasActiveFilters detection', () => {
        it.each([
            ['startDate only', { dateRange: { startDate: '2025-06-01', endDate: null } }],
            ['endDate only', { dateRange: { startDate: null, endDate: '2025-06-30' } }],
            ['selectedMonth', { selectedMonth: '2025-06' }],
            ['selectedSalesman', { selectedSalesman: ['Andi'] }],
            ['searchQuery', { searchQuery: 'hello' }],
        ])('detects active filter for %s', (_label, overrides) => {
            renderFilterBar(overrides);
            expect(screen.getByText('Aktif')).toBeInTheDocument();
        });

        it('does not show "Aktif" when all filters are default/empty', () => {
            renderFilterBar();
            expect(screen.queryByText('Aktif')).not.toBeInTheDocument();
        });
    });
});
