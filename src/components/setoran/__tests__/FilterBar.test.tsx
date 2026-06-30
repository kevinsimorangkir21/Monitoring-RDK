import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../FilterBar';
import type { SetoranFilter } from '@/types/setoran';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => children,
}));

describe('FilterBar', () => {
    const mockOnChange = vi.fn();
    const mockOnReset = vi.fn();

    const defaultFilters: SetoranFilter = {
        search: '',
        bulan: '',
        tanggal: '',
        dateFrom: '',
        dateTo: '',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all filter controls correctly', () => {
        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        // Check if main elements are present
        expect(screen.getByText('Filter Dashboard')).toBeInTheDocument();
        expect(screen.getByLabelText('Bulan')).toBeInTheDocument();
        expect(screen.getByLabelText('Salesman')).toBeInTheDocument();
        expect(screen.getByLabelText('Pencarian')).toBeInTheDocument();
        expect(screen.getByLabelText('Tanggal Mulai')).toBeInTheDocument();
        expect(screen.getByLabelText('Tanggal Akhir')).toBeInTheDocument();
    });

    it('handles text search input correctly', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const searchInput = screen.getByPlaceholderText('Cari nama salesman...');

        // Type in search input
        await user.type(searchInput, 'Andi');

        // Should update immediately in input
        expect(searchInput).toHaveValue('Andi');
    });

    it('handles date range selection correctly', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const dateInputs = screen.getAllByDisplayValue('');
        const startDateInput = dateInputs.find(input => input.getAttribute('type') === 'date');

        if (startDateInput) {
            // Simulate date selection
            fireEvent.change(startDateInput, { target: { value: '2025-06-01' } });

            // Should call onChange with date filter
            expect(mockOnChange).toHaveBeenCalledWith({
                dateFrom: '2025-06-01',
                dateTo: '',
            });
        }
    });

    it('handles month dropdown selection correctly', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const monthSelect = screen.getByDisplayValue('Semua Bulan');

        // Select a month
        await user.selectOptions(monthSelect, 'Juni 2025');

        expect(mockOnChange).toHaveBeenCalledWith({ bulan: 'Juni 2025' });
    });

    it('shows active filter summary when filters are applied', () => {
        const filtersWithData: SetoranFilter = {
            search: 'Andi',
            bulan: 'Juni 2025',
            tanggal: '',
            dateFrom: '2025-06-01',
            dateTo: '2025-06-30',
        };

        render(
            <FilterBar
                filters={filtersWithData}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        // Should show filter summary
        expect(screen.getByText('Filter Aktif:')).toBeInTheDocument();
        expect(screen.getByText(/Pencarian:/)).toBeInTheDocument();
        expect(screen.getByText('Bulan: Juni 2025')).toBeInTheDocument();
    });

    it('shows reset button when filters are active', () => {
        const filtersWithData: SetoranFilter = {
            search: 'Andi',
            bulan: '',
            tanggal: '',
            dateFrom: '',
            dateTo: '',
        };

        render(
            <FilterBar
                filters={filtersWithData}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        expect(screen.getByText('Reset Semua Filter')).toBeInTheDocument();
    });

    it('calls reset function when reset button is clicked', async () => {
        const user = userEvent.setup();

        const filtersWithData: SetoranFilter = {
            search: 'Andi',
            bulan: 'Juni 2025',
            tanggal: '',
            dateFrom: '',
            dateTo: '',
        };

        render(
            <FilterBar
                filters={filtersWithData}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const resetButton = screen.getByText('Reset Semua Filter');
        await user.click(resetButton);

        expect(mockOnReset).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith({
            search: '',
            bulan: '',
            tanggal: '',
            dateFrom: '',
            dateTo: '',
        });
    });

    it('opens salesman dropdown when clicked', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const salesmanButton = screen.getByText('Pilih Salesman...');
        await user.click(salesmanButton);

        // Should show dropdown search input
        expect(screen.getByPlaceholderText('Cari salesman...')).toBeInTheDocument();
    });

    it('filters salesman options based on search', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        // Open dropdown
        const salesmanButton = screen.getByText('Pilih Salesman...');
        await user.click(salesmanButton);

        // Type in search
        const dropdownSearch = screen.getByPlaceholderText('Cari salesman...');
        await user.type(dropdownSearch, 'Andi');

        // Should filter results (we'll need to wait for debounce)
        await waitFor(() => {
            // The component should show filtered results
            expect(screen.getByText('Andi Wijaya')).toBeInTheDocument();
        }, { timeout: 500 });
    });

    it('handles individual filter clearing correctly', async () => {
        const user = userEvent.setup();

        const filtersWithData: SetoranFilter = {
            search: 'Andi',
            bulan: 'Juni 2025',
            tanggal: '',
            dateFrom: '',
            dateTo: '',
        };

        render(
            <FilterBar
                filters={filtersWithData}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        // Find and click the remove button for search filter
        const searchFilter = screen.getByText(/Pencarian:/).closest('div');
        if (searchFilter) {
            const removeButton = searchFilter.querySelector('button');
            if (removeButton) {
                await user.click(removeButton);
                expect(mockOnChange).toHaveBeenCalledWith({ search: '' });
            }
        }
    });

    it('validates date range inputs', async () => {
        const user = userEvent.setup();

        render(
            <FilterBar
                filters={defaultFilters}
                onChange={mockOnChange}
                onReset={mockOnReset}
            />
        );

        const dateInputs = screen.getAllByDisplayValue('');
        const startDateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
        const endDateInput = dateInputs.filter(input => input.getAttribute('type') === 'date')[1];

        if (startDateInput && endDateInput) {
            // Set start date
            fireEvent.change(startDateInput, { target: { value: '2025-06-01' } });

            // Set end date
            fireEvent.change(endDateInput, { target: { value: '2025-06-30' } });

            // Should call onChange for both dates
            expect(mockOnChange).toHaveBeenCalledWith({
                dateFrom: '2025-06-01',
                dateTo: '',
            });

            expect(mockOnChange).toHaveBeenCalledWith({
                dateFrom: '2025-06-01',
                dateTo: '2025-06-30',
            });
        }
    });
});