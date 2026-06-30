/**
 * Unit Tests for SetoranTable component
 *
 * Requirements:
 *   5.1 — Display detailed data table with setoran records
 *   5.2 — Columns: Tanggal, Nama Salesman, Pulang Kunjungan, Setoran ke Kasir, Durasi
 *   5.3 — Search filtering: table shows only matching records; search highlighting
 *   5.4 — Filter changes: table updates to display filtered records
 *   5.5 — Responsive design for different screen sizes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    SetoranTable,
    highlightText,
    formatTanggal,
    PAGE_SIZE_OPTIONS,
} from '../SetoranTable';
import type { SetoranTableProps } from '../SetoranTable';
import type { SetoranRecord } from '@/types/setoran';

// ─── Test Fixtures ─────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<SetoranRecord> = {}): SetoranRecord {
    return {
        id: 'rec-1',
        tanggal: '2025-06-28',
        bulan: 'Juni 2025',
        namaSalesman: 'Andi Wijaya',
        pulangKunjungan: '16:30',
        setoranKasir: '17:05',
        durasiSeconds: 2100,
        durasi: '00:35:00',
        status: 'Normal',
        waktuPulang: '2025-06-28T16:30:00.000Z',
        waktuSetoran: '2025-06-28T17:05:00.000Z',
        ...overrides,
    };
}

/** Build an array of distinct records for pagination / filtering tests */
function makeRecords(count: number, overrides: Partial<SetoranRecord> = {}): SetoranRecord[] {
    return Array.from({ length: count }, (_, i) =>
        makeRecord({
            id: `rec-${i + 1}`,
            tanggal: `2025-06-${String(i + 1).padStart(2, '0')}`,
            namaSalesman: `Salesman ${String.fromCharCode(65 + (i % 26))}`,
            durasiSeconds: 1800 + i * 60,
            ...overrides,
        })
    );
}

function renderTable(props: Partial<SetoranTableProps> = {}) {
    const merged: SetoranTableProps = {
        data: [],
        loading: false,
        searchQuery: '',
        ...props,
    };
    return render(<SetoranTable {...merged} />);
}

// ─── highlightText unit tests ─────────────────────────────────────────────────

describe('highlightText', () => {
    it('returns plain text when query is empty', () => {
        const result = highlightText('Andi Wijaya', '');
        expect(result).toBe('Andi Wijaya');
    });

    it('returns plain text when query is whitespace only', () => {
        const result = highlightText('Andi Wijaya', '   ');
        expect(result).toBe('Andi Wijaya');
    });

    it('returns plain text when query has no match', () => {
        const result = highlightText('Andi Wijaya', 'xyz');
        expect(result).toBe('Andi Wijaya');
    });

    it('returns a React node with highlighted parts when query matches', () => {
        const result = highlightText('Andi Wijaya', 'Andi');
        // Should not be a plain string any more
        expect(typeof result).not.toBe('string');
    });

    it('is case-insensitive', () => {
        const result = highlightText('Andi Wijaya', 'andi');
        expect(typeof result).not.toBe('string');
    });

    it('escapes special regex characters in the query', () => {
        // Should not throw for regex metacharacters
        expect(() => highlightText('price $100 (USD)', '$100 (')).not.toThrow();
    });
});

// ─── formatTanggal unit tests ─────────────────────────────────────────────────

describe('formatTanggal', () => {
    it('converts an ISO date string to a localised display', () => {
        const formatted = formatTanggal('2025-06-28');
        // Should contain the day, a short month name, and the year
        expect(formatted).toMatch(/28/);
        expect(formatted).toMatch(/2025/);
    });

    it('returns the input value gracefully when the date is invalid', () => {
        const input = 'not-a-date';
        const result = formatTanggal(input);
        // Should not throw, and return something sensible
        expect(typeof result).toBe('string');
    });
});

// ─── Requirement 5.1 — Render table with records ──────────────────────────────

describe('Requirement 5.1 — table renders setoran records', () => {
    it('renders the table section with the correct aria label', () => {
        renderTable();
        expect(screen.getByRole('region', { name: 'Scroll tabel' })).toBeInTheDocument();
    });

    it('renders the "Detail Setoran" header', () => {
        renderTable();
        expect(screen.getByText('Detail Setoran')).toBeInTheDocument();
    });

    it('shows an empty state message when data is empty', () => {
        renderTable({ data: [] });
        expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
    });

    it('renders data rows when records are provided', () => {
        renderTable({ data: makeRecords(3) });
        // Each row renders the salesman name
        expect(screen.getByText('Salesman A')).toBeInTheDocument();
        expect(screen.getByText('Salesman B')).toBeInTheDocument();
        expect(screen.getByText('Salesman C')).toBeInTheDocument();
    });

    it('displays total record count in the header', () => {
        renderTable({ data: makeRecords(5) });
        expect(screen.getByText('5 total record')).toBeInTheDocument();
    });

    it('shows loading skeleton rows when loading=true', () => {
        renderTable({ loading: true });
        // Skeleton rows are aria-hidden
        const skeletonRows = document.querySelectorAll('tr[aria-hidden="true"]');
        expect(skeletonRows.length).toBe(5);
    });

    it('does not show total record count while loading', () => {
        renderTable({ loading: true, data: makeRecords(3) });
        expect(screen.queryByText(/total record/)).not.toBeInTheDocument();
    });
});

// ─── Requirement 5.2 — Correct columns are present ────────────────────────────

describe('Requirement 5.2 — table columns', () => {
    it('renders Tanggal column header', () => {
        renderTable();
        expect(screen.getByRole('columnheader', { name: /tanggal/i })).toBeInTheDocument();
    });

    it('renders Nama Salesman column header', () => {
        renderTable();
        expect(screen.getByRole('columnheader', { name: /nama salesman/i })).toBeInTheDocument();
    });

    it('renders Pulang Kunjungan column header', () => {
        renderTable();
        expect(screen.getByRole('columnheader', { name: /pulang kunjungan/i })).toBeInTheDocument();
    });

    it('renders Setoran ke Kasir column header', () => {
        renderTable();
        expect(screen.getByRole('columnheader', { name: /setoran ke kasir/i })).toBeInTheDocument();
    });

    it('renders Durasi column header', () => {
        renderTable();
        expect(screen.getByRole('columnheader', { name: /durasi/i })).toBeInTheDocument();
    });

    it('displays correct data in each cell for a single record', () => {
        const record = makeRecord({
            tanggal: '2025-06-28',
            namaSalesman: 'Budi Santoso',
            pulangKunjungan: '16:30',
            setoranKasir: '17:10',
            durasi: '00:40:00',
            status: 'Normal',
        });

        renderTable({ data: [record] });

        expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
        expect(screen.getByText('16:30')).toBeInTheDocument();
        expect(screen.getByText('17:10')).toBeInTheDocument();
        expect(screen.getByText('00:40:00')).toBeInTheDocument();
    });

    it('renders status badges for each data row', () => {
        const records = [
            makeRecord({ id: 'r1', status: 'Fast' }),
            makeRecord({ id: 'r2', status: 'Normal' }),
            makeRecord({ id: 'r3', status: 'Slow' }),
        ];
        renderTable({ data: records });

        expect(screen.getByText('Fast')).toBeInTheDocument();
        expect(screen.getByText('Normal')).toBeInTheDocument();
        expect(screen.getByText('Slow')).toBeInTheDocument();
    });
});

// ─── Requirement 5.3 — Search highlighting ────────────────────────────────────

describe('Requirement 5.3 — search highlighting in Nama Salesman cells', () => {
    it('highlights the matching part of a salesman name', () => {
        const record = makeRecord({ namaSalesman: 'Andi Wijaya' });
        renderTable({ data: [record], searchQuery: 'Andi' });

        // The highlight span should appear inside the row
        const highlightedEl = document.querySelector('span.bg-yellow-200');
        expect(highlightedEl).not.toBeNull();
        expect(highlightedEl!.textContent).toBe('Andi');
    });

    it('does not render highlight spans when search query is empty', () => {
        const record = makeRecord({ namaSalesman: 'Andi Wijaya' });
        renderTable({ data: [record], searchQuery: '' });

        const highlightedEl = document.querySelector('span.bg-yellow-200');
        expect(highlightedEl).toBeNull();
    });

    it('highlighting is case-insensitive', () => {
        const record = makeRecord({ namaSalesman: 'Andi Wijaya' });
        renderTable({ data: [record], searchQuery: 'andi' });

        const highlightedEl = document.querySelector('span.bg-yellow-200');
        expect(highlightedEl).not.toBeNull();
    });

    it('does not highlight when there is no match', () => {
        const record = makeRecord({ namaSalesman: 'Andi Wijaya' });
        renderTable({ data: [record], searchQuery: 'xyz' });

        const highlightedEl = document.querySelector('span.bg-yellow-200');
        expect(highlightedEl).toBeNull();
    });

    it('table resets to page 1 when data prop changes (filter applied)', () => {
        const { rerender } = renderTable({ data: makeRecords(25) });

        // Navigate to page 2
        fireEvent.click(screen.getByRole('button', { name: 'Halaman berikutnya' }));
        expect(screen.getByRole('button', { name: 'Halaman 2', current: 'page' })).toBeInTheDocument();

        // Simulate filter change — new data prop
        rerender(<SetoranTable data={makeRecords(25, { namaSalesman: 'Updated' })} />);

        // Should be back on page 1
        expect(screen.getByRole('button', { name: 'Halaman 1', current: 'page' })).toBeInTheDocument();
    });
});

// ─── Requirement 5.4 — Table updates when filters change ──────────────────────

describe('Requirement 5.4 — table updates when filters/data change', () => {
    it('shows only the records provided in the data prop', () => {
        const { rerender } = renderTable({
            data: [
                makeRecord({ id: 'r1', namaSalesman: 'Andi Wijaya' }),
                makeRecord({ id: 'r2', namaSalesman: 'Budi Santoso' }),
            ],
        });

        expect(screen.getByText('Andi Wijaya')).toBeInTheDocument();
        expect(screen.getByText('Budi Santoso')).toBeInTheDocument();

        // Simulate filter: only Andi remains after parent-level filtering
        rerender(
            <SetoranTable data={[makeRecord({ id: 'r1', namaSalesman: 'Andi Wijaya' })]} />
        );

        expect(screen.getByText('Andi Wijaya')).toBeInTheDocument();
        expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
    });

    it('shows the empty state when filtered data becomes empty', () => {
        const { rerender } = renderTable({
            data: [makeRecord({ id: 'r1', namaSalesman: 'Andi Wijaya' })],
        });

        expect(screen.getByText('Andi Wijaya')).toBeInTheDocument();

        rerender(<SetoranTable data={[]} />);

        expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
    });

    it('can sort by Tanggal ascending on first click', async () => {
        const records = [
            makeRecord({ id: 'r1', tanggal: '2025-06-10', namaSalesman: 'Later' }),
            makeRecord({ id: 'r2', tanggal: '2025-06-05', namaSalesman: 'Earlier' }),
        ];
        renderTable({ data: records });

        const sortBtn = screen.getByRole('button', { name: /urutkan berdasarkan tanggal/i });
        fireEvent.click(sortBtn);

        const rows = screen.getAllByRole('row');
        // First data row (after header) should now show the earlier date
        expect(within(rows[1]).getByText('Earlier')).toBeInTheDocument();
    });

    it('can sort by Tanggal descending on second click', async () => {
        const records = [
            makeRecord({ id: 'r1', tanggal: '2025-06-05', namaSalesman: 'Earlier' }),
            makeRecord({ id: 'r2', tanggal: '2025-06-10', namaSalesman: 'Later' }),
        ];
        renderTable({ data: records });

        const sortBtn = screen.getByRole('button', { name: /urutkan berdasarkan tanggal/i });
        fireEvent.click(sortBtn); // asc
        fireEvent.click(sortBtn); // desc

        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('Later')).toBeInTheDocument();
    });

    it('clears sorting on third click of the same column', async () => {
        const records = [
            makeRecord({ id: 'r1', tanggal: '2025-06-10', namaSalesman: 'Later' }),
            makeRecord({ id: 'r2', tanggal: '2025-06-05', namaSalesman: 'Earlier' }),
        ];
        renderTable({ data: records });

        const sortBtn = screen.getByRole('button', { name: /urutkan berdasarkan tanggal/i });
        fireEvent.click(sortBtn); // asc → Earlier first
        fireEvent.click(sortBtn); // desc → Later first
        fireEvent.click(sortBtn); // clear → original order

        // Without a sort the first record in prop order should appear first
        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('Later')).toBeInTheDocument();
    });

    it('can sort by Durasi', () => {
        const records = [
            makeRecord({ id: 'r1', durasiSeconds: 3600, namaSalesman: 'Slow' }),
            makeRecord({ id: 'r2', durasiSeconds: 900, namaSalesman: 'Fast' }),
        ];
        renderTable({ data: records });

        const sortBtn = screen.getByRole('button', { name: /urutkan berdasarkan durasi/i });
        fireEvent.click(sortBtn); // asc

        const rows = screen.getAllByRole('row');
        // Fast (900s) should come before Slow (3600s) in ascending order
        expect(within(rows[1]).getByText('Fast')).toBeInTheDocument();
    });
});

// ─── Pagination ────────────────────────────────────────────────────────────────

describe('Pagination', () => {
    it('does not render pagination when there are no records', () => {
        renderTable({ data: [] });
        expect(screen.queryByRole('navigation', { name: /navigasi halaman/i })).not.toBeInTheDocument();
    });

    it('does not render pagination while loading', () => {
        renderTable({ data: makeRecords(20), loading: true });
        expect(screen.queryByRole('navigation', { name: /navigasi halaman/i })).not.toBeInTheDocument();
    });

    it('renders pagination when there are records', () => {
        renderTable({ data: makeRecords(20) });
        expect(screen.getByRole('navigation', { name: /navigasi halaman/i })).toBeInTheDocument();
    });

    it('shows the range indicator "1–10 dari 15"', () => {
        renderTable({ data: makeRecords(15) });
        expect(screen.getByText(/1–10 dari 15/)).toBeInTheDocument();
    });

    it('shows first page records by default', () => {
        // 11 records — only first 10 should appear on page 1
        const records = makeRecords(11);
        renderTable({ data: records });
        expect(screen.getByText('Salesman A')).toBeInTheDocument();
        // Salesman K (index 10) should not appear on page 1
        expect(screen.queryByText('Salesman K')).not.toBeInTheDocument();
    });

    it('navigates to the next page', () => {
        renderTable({ data: makeRecords(11) });

        fireEvent.click(screen.getByRole('button', { name: 'Halaman berikutnya' }));

        expect(screen.getByText('Salesman K')).toBeInTheDocument();
    });

    it('navigates to the previous page', () => {
        renderTable({ data: makeRecords(11) });

        // Go to page 2
        fireEvent.click(screen.getByRole('button', { name: 'Halaman berikutnya' }));
        expect(screen.getByText('Salesman K')).toBeInTheDocument();

        // Go back to page 1
        fireEvent.click(screen.getByRole('button', { name: 'Halaman sebelumnya' }));
        expect(screen.getByText('Salesman A')).toBeInTheDocument();
        expect(screen.queryByText('Salesman K')).not.toBeInTheDocument();
    });

    it('navigates to the first page via ChevronsLeft', () => {
        renderTable({ data: makeRecords(25) });

        fireEvent.click(screen.getByRole('button', { name: 'Halaman berikutnya' }));
        expect(screen.getByRole('button', { name: 'Halaman 2', current: 'page' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Halaman pertama' }));
        expect(screen.getByRole('button', { name: 'Halaman 1', current: 'page' })).toBeInTheDocument();
    });

    it('navigates to the last page via ChevronsRight', () => {
        const records = makeRecords(25); // 3 pages (10+10+5)
        renderTable({ data: records });

        fireEvent.click(screen.getByRole('button', { name: 'Halaman terakhir' }));
        // On page 3, range should be "21–25 dari 25"
        expect(screen.getByText(/21–25 dari 25/)).toBeInTheDocument();
    });

    it('disables Previous / First buttons on page 1', () => {
        renderTable({ data: makeRecords(20) });

        expect(screen.getByRole('button', { name: 'Halaman pertama' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Halaman sebelumnya' })).toBeDisabled();
    });

    it('disables Next / Last buttons on the last page', () => {
        renderTable({ data: makeRecords(5) }); // Only 1 page

        expect(screen.getByRole('button', { name: 'Halaman berikutnya' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Halaman terakhir' })).toBeDisabled();
    });

    it('page size selector is rendered with all PAGE_SIZE_OPTIONS', () => {
        renderTable({ data: makeRecords(5) });

        const select = screen.getByRole('combobox', { name: /baris per halaman/i });
        PAGE_SIZE_OPTIONS.forEach((size) => {
            expect(within(select).getByRole('option', { name: String(size) })).toBeInTheDocument();
        });
    });

    it('changes page size and resets to page 1', async () => {
        const user = userEvent.setup();
        renderTable({ data: makeRecords(30) });

        // Navigate to page 2 first
        fireEvent.click(screen.getByRole('button', { name: 'Halaman berikutnya' }));
        expect(screen.getByRole('button', { name: 'Halaman 2', current: 'page' })).toBeInTheDocument();

        // Change page size to 25
        const select = screen.getByRole('combobox', { name: /baris per halaman/i });
        await user.selectOptions(select, '25');

        // Should reset to page 1 and show 25 items
        expect(screen.getByRole('button', { name: 'Halaman 1', current: 'page' })).toBeInTheDocument();
        expect(screen.getByText(/1–25 dari 30/)).toBeInTheDocument();
    });

    it('shows all records on a single page when page size > total records', async () => {
        const user = userEvent.setup();
        renderTable({ data: makeRecords(15) });

        const select = screen.getByRole('combobox', { name: /baris per halaman/i });
        await user.selectOptions(select, '25');

        expect(screen.getByText(/1–15 dari 15/)).toBeInTheDocument();
    });
});

// ─── Requirement 5.5 — Responsive design ──────────────────────────────────────

describe('Requirement 5.5 — responsive layout', () => {
    it('wraps the table in an overflow-x-auto container for horizontal scroll', () => {
        renderTable({ data: makeRecords(3) });

        const scrollRegion = screen.getByRole('region', { name: 'Scroll tabel' });
        expect(scrollRegion).toHaveClass('overflow-x-auto');
    });

    it('all column headers define a minimum width (min-w-*) via className', () => {
        renderTable();

        const headers = screen.getAllByRole('columnheader');
        headers.forEach((th) => {
            expect(th.className).toMatch(/min-w-\[/);
        });
    });

    it('pagination control layout adapts with sm:flex-row class', () => {
        renderTable({ data: makeRecords(5) });

        // The pagination wrapper div should include the responsive flex class
        const paginationEl = screen.getByRole('navigation', { name: /navigasi halaman/i }).closest('div');
        // Check the parent wrapper has the responsive flex classes
        expect(paginationEl?.parentElement?.className).toMatch(/sm:flex-row/);
    });
});
