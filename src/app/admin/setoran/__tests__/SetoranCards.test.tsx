/**
 * Unit tests for KPI calculations in SetoranCards component.
 *
 * Tests the calculateKPIs function directly (pure logic) and the
 * SetoranCards component rendering to validate display output.
 *
 * Requirements: 1.1 (responsive grid), 1.2 (average duration),
 *               1.3 (salesman terlama), 1.4 (salesman tercepat),
 *               1.5 (total records)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    calculateKPIs,
    formatDuration,
    SetoranCards,
} from '../components/SetoranCards';
import type { SetoranRecord } from '@/types/setoran';

// ─── Mock framer-motion to avoid animation complexity in tests ────────────────

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ─── Fixture Helpers ──────────────────────────────────────────────────────────

/**
 * Build a minimal SetoranRecord for test purposes.
 * Only fields used by calculateKPIs are required.
 */
function makeRecord(
    namaSalesman: string,
    durasiSeconds: number,
    overrides: Partial<SetoranRecord> = {}
): SetoranRecord {
    return {
        id: `${namaSalesman}-${durasiSeconds}`,
        tanggal: '2025-06-01',
        bulan: 'Juni 2025',
        namaSalesman,
        pulangKunjungan: '16:00',
        setoranKasir: '17:00',
        durasiSeconds,
        durasi: '01:00:00',
        status: 'Normal',
        waktuPulang: '2025-06-01T16:00:00',
        waktuSetoran: '2025-06-01T17:00:00',
        ...overrides,
    };
}

// ─── calculateKPIs — pure logic unit tests ────────────────────────────────────

describe('calculateKPIs', () => {

    // ── Empty dataset (Requirement 1.2–1.5) ──────────────────────────────────

    describe('empty dataset', () => {
        it('returns null when given an empty array', () => {
            expect(calculateKPIs([])).toBeNull();
        });
    });

    // ── Single record ─────────────────────────────────────────────────────────

    describe('single record', () => {
        it('returns correct averageDuration in minutes from durasiSeconds', () => {
            // 600 seconds = 10 minutes
            const data = [makeRecord('Andi', 600)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.averageDuration).toBeCloseTo(10);
        });

        it('sets both longestSalesman and fastestSalesman to the only salesman', () => {
            const data = [makeRecord('Andi', 600)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.longestSalesman.name).toBe('Andi');
            expect(kpis.fastestSalesman.name).toBe('Andi');
        });

        it('sets longestSalesman.averageDuration to the record duration in minutes', () => {
            const data = [makeRecord('Andi', 1200)]; // 1200s = 20 min
            const kpis = calculateKPIs(data)!;
            expect(kpis.longestSalesman.averageDuration).toBeCloseTo(20);
        });

        it('sets totalRecords to 1', () => {
            const data = [makeRecord('Andi', 600)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.totalRecords).toBe(1);
        });
    });

    // ── Average duration accuracy (Requirement 1.2) ───────────────────────────

    describe('average duration calculation (Requirement 1.2)', () => {
        it('calculates the correct mean across multiple records', () => {
            // 3 records: 60s, 120s, 180s → total 360s → avg 120s = 2 min
            const data = [
                makeRecord('A', 60),
                makeRecord('B', 120),
                makeRecord('C', 180),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.averageDuration).toBeCloseTo(2);
        });

        it('converts durasiSeconds to minutes correctly (÷ 60)', () => {
            // Single record with 3600 seconds = 60 minutes
            const data = [makeRecord('A', 3600)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.averageDuration).toBeCloseTo(60);
        });

        it('handles non-round durations with precision', () => {
            // 90s = 1.5 min, 150s = 2.5 min → avg = 2 min
            const data = [makeRecord('A', 90), makeRecord('B', 150)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.averageDuration).toBeCloseTo(2);
        });

        it('handles very short durations (near zero)', () => {
            const data = [makeRecord('A', 1), makeRecord('B', 2)];
            const kpis = calculateKPIs(data)!;
            // (1+2) / 2 / 60 ≈ 0.025 min
            expect(kpis.averageDuration).toBeCloseTo(0.025);
        });

        it('handles very long durations correctly', () => {
            // 7200s = 120 min each
            const data = [makeRecord('A', 7200), makeRecord('B', 7200)];
            const kpis = calculateKPIs(data)!;
            expect(kpis.averageDuration).toBeCloseTo(120);
        });

        it('reflects totalRecords accurately', () => {
            const data = [
                makeRecord('A', 100),
                makeRecord('B', 200),
                makeRecord('C', 300),
                makeRecord('D', 400),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.totalRecords).toBe(4);
        });
    });

    // ── Salesman ranking logic (Requirements 1.3 and 1.4) ────────────────────

    describe('longestSalesman ranking (Requirement 1.3)', () => {
        it('identifies the salesman with the highest average duration', () => {
            const data = [
                makeRecord('Fast', 300),   // 5 min
                makeRecord('Slow', 3600),  // 60 min
                makeRecord('Mid', 1200),   // 20 min
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.longestSalesman.name).toBe('Slow');
        });

        it('reports the correct averageDuration (minutes) for the longest salesman', () => {
            const data = [
                makeRecord('Fast', 300),
                makeRecord('Slow', 3600),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.longestSalesman.averageDuration).toBeCloseTo(60);
        });

        it('averages multiple records per salesman before comparing', () => {
            // "Alice": 600s + 1200s → avg 900s = 15 min
            // "Bob":   3600s → avg 3600s = 60 min  ← longest
            const data = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 1200),
                makeRecord('Bob', 3600),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.longestSalesman.name).toBe('Bob');
            expect(kpis.longestSalesman.averageDuration).toBeCloseTo(60);
        });

        it('handles a single salesman appearing multiple times', () => {
            // All records belong to the same salesman
            const data = [
                makeRecord('Solo', 600),
                makeRecord('Solo', 1200),
            ];
            const kpis = calculateKPIs(data)!;
            // avg = (600+1200)/2 = 900s = 15 min
            expect(kpis.longestSalesman.name).toBe('Solo');
            expect(kpis.longestSalesman.averageDuration).toBeCloseTo(15);
        });
    });

    describe('fastestSalesman ranking (Requirement 1.4)', () => {
        it('identifies the salesman with the lowest average duration', () => {
            const data = [
                makeRecord('Fast', 300),   // 5 min
                makeRecord('Slow', 3600),  // 60 min
                makeRecord('Mid', 1200),   // 20 min
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.fastestSalesman.name).toBe('Fast');
        });

        it('reports the correct averageDuration (minutes) for the fastest salesman', () => {
            const data = [
                makeRecord('Fast', 300),
                makeRecord('Slow', 3600),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.fastestSalesman.averageDuration).toBeCloseTo(5);
        });

        it('averages multiple records per salesman before comparing', () => {
            // "Alice": 300s + 900s → avg 600s = 10 min  ← fastest
            // "Bob":   1800s → avg 1800s = 30 min
            const data = [
                makeRecord('Alice', 300),
                makeRecord('Alice', 900),
                makeRecord('Bob', 1800),
            ];
            const kpis = calculateKPIs(data)!;
            expect(kpis.fastestSalesman.name).toBe('Alice');
            expect(kpis.fastestSalesman.averageDuration).toBeCloseTo(10);
        });
    });

    // ── Tied durations edge case ──────────────────────────────────────────────

    describe('tied durations', () => {
        it('returns a deterministic result when all salesman have equal average durations', () => {
            // With ties, reduce takes the first one that becomes "prev" so
            // the last entry with the same value stays as winner for longest (curr > prev → only strict >).
            // What matters is: the function returns *some* valid salesman name, not crashes.
            const data = [
                makeRecord('Alice', 600),
                makeRecord('Bob', 600),
                makeRecord('Carol', 600),
            ];
            const kpis = calculateKPIs(data)!;
            const validNames = ['Alice', 'Bob', 'Carol'];
            expect(validNames).toContain(kpis.longestSalesman.name);
            expect(validNames).toContain(kpis.fastestSalesman.name);
            expect(kpis.longestSalesman.averageDuration).toBeCloseTo(10);
            expect(kpis.fastestSalesman.averageDuration).toBeCloseTo(10);
        });
    });

    // ── totalRecords (Requirement 1.5) ────────────────────────────────────────

    describe('totalRecords (Requirement 1.5)', () => {
        it('equals the number of records in the dataset', () => {
            const data = Array.from({ length: 7 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 60)
            );
            const kpis = calculateKPIs(data)!;
            expect(kpis.totalRecords).toBe(7);
        });

        it('counts all records including duplicates for the same salesman', () => {
            const data = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 600),
                makeRecord('Alice', 600),
            ];
            const kpis = calculateKPIs(data)!;
            // 3 raw records, even though one salesman
            expect(kpis.totalRecords).toBe(3);
        });
    });
});

// ─── formatDuration helper unit tests ────────────────────────────────────────

describe('formatDuration', () => {
    it('formats sub-60-minute values with "menit" suffix', () => {
        expect(formatDuration(45)).toBe('45 menit');
    });

    it('formats 0 minutes as "0 menit"', () => {
        expect(formatDuration(0)).toBe('0 menit');
    });

    it('formats exactly 60 minutes as "1j 0m"', () => {
        expect(formatDuration(60)).toBe('1j 0m');
    });

    it('formats 95 minutes as "1j 35m"', () => {
        expect(formatDuration(95)).toBe('1j 35m');
    });

    it('rounds fractional minutes before formatting', () => {
        // 45.6 rounds to 46
        expect(formatDuration(45.6)).toBe('46 menit');
        // 59.4 rounds to 59
        expect(formatDuration(59.4)).toBe('59 menit');
        // 59.5 rounds to 60 → "1j 0m"
        expect(formatDuration(59.5)).toBe('1j 0m');
    });
});

// ─── SetoranCards component rendering tests ───────────────────────────────────

describe('SetoranCards component', () => {

    // ── Loading state (Requirement 1.1) ───────────────────────────────────────

    describe('loading state (Requirement 1.1)', () => {
        it('renders 4 skeleton cards when loading=true', () => {
            const { container } = render(
                <SetoranCards data={[]} loading={true} />
            );
            // Skeleton cards have animate-pulse class
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(4);
        });

        it('renders a grid container with aria-busy=true while loading', () => {
            render(<SetoranCards data={[]} loading={true} />);
            const grid = screen.getByLabelText('Loading KPI cards');
            expect(grid).toHaveAttribute('aria-busy', 'true');
        });
    });

    // ── Empty state ────────────────────────────────────────────────────────────

    describe('empty data state', () => {
        it('renders "Tidak ada data" placeholders when data is empty', () => {
            render(<SetoranCards data={[]} />);
            const emptyMessages = screen.getAllByText('Tidak ada data');
            expect(emptyMessages.length).toBe(4);
        });

        it('renders em-dash "—" primary value for each card when data is empty', () => {
            render(<SetoranCards data={[]} />);
            const dashes = screen.getAllByText('—');
            expect(dashes.length).toBe(4);
        });

        it('renders all four card titles even with empty data', () => {
            render(<SetoranCards data={[]} />);
            expect(screen.getByText('Average Durasi')).toBeInTheDocument();
            expect(screen.getByText('Salesman Terlama')).toBeInTheDocument();
            expect(screen.getByText('Salesman Tercepat')).toBeInTheDocument();
            expect(screen.getByText('Total Setoran')).toBeInTheDocument();
        });
    });

    // ── Normal state with data ────────────────────────────────────────────────

    describe('normal state with data (Requirements 1.2–1.5)', () => {
        const testData: SetoranRecord[] = [
            makeRecord('Alice', 3000),   // 50 min
            makeRecord('Bob', 1200),     // 20 min
            makeRecord('Carol', 1800),   // 30 min
        ];
        // avg = (3000+1200+1800)/3 = 6000/3 = 2000s = ~33.33 min → "33 menit"

        it('shows formatted average duration (Requirement 1.2)', () => {
            render(<SetoranCards data={testData} />);
            // avg = 2000s / 60 = 33.33 min → Math.round(33.33) = 33 → "33 menit"
            expect(screen.getByText('33 menit')).toBeInTheDocument();
        });

        it('shows the salesman with the longest duration (Requirement 1.3)', () => {
            render(<SetoranCards data={testData} />);
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });

        it('shows the salesman with the fastest duration (Requirement 1.4)', () => {
            render(<SetoranCards data={testData} />);
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });

        it('shows total record count (Requirement 1.5)', () => {
            render(<SetoranCards data={testData} />);
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('shows a transaction count sub-label for average durasi card', () => {
            render(<SetoranCards data={testData} />);
            expect(screen.getByText('Dari 3 transaksi')).toBeInTheDocument();
        });

        it('renders all four card titles with data', () => {
            render(<SetoranCards data={testData} />);
            expect(screen.getByText('Average Durasi')).toBeInTheDocument();
            expect(screen.getByText('Salesman Terlama')).toBeInTheDocument();
            expect(screen.getByText('Salesman Tercepat')).toBeInTheDocument();
            expect(screen.getByText('Total Setoran')).toBeInTheDocument();
        });
    });

    // ── Single record edge case ────────────────────────────────────────────────

    describe('single record edge case', () => {
        it('renders correctly with a single record in the dataset', () => {
            const data = [makeRecord('Solo', 2400)]; // 40 min
            render(<SetoranCards data={data} />);
            // Both longest and fastest are "Solo"
            const soloElements = screen.getAllByText('Solo');
            expect(soloElements.length).toBe(2);
            // 40 menit average
            expect(screen.getByText('40 menit')).toBeInTheDocument();
            // total = 1
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });

    // ── Single salesman multiple records ─────────────────────────────────────

    describe('single salesman with multiple records', () => {
        it('correctly averages durations per salesman across multiple records', () => {
            // All records same salesman: 600s + 1800s = avg 1200s = 20 min
            const data = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 1800),
            ];
            render(<SetoranCards data={data} />);
            const aliceElements = screen.getAllByText('Alice');
            expect(aliceElements.length).toBe(2); // both longest & fastest
            expect(screen.getByText('20 menit')).toBeInTheDocument();
        });
    });

    // ── Responsive grid (Requirement 1.1) ────────────────────────────────────

    describe('responsive grid layout (Requirement 1.1)', () => {
        it('renders a grid container with 4-column layout classes', () => {
            const { container } = render(
                <SetoranCards data={[makeRecord('A', 600)]} />
            );
            const grid = container.firstElementChild;
            expect(grid?.className).toContain('grid');
            expect(grid?.className).toContain('lg:grid-cols-4');
        });
    });
});
