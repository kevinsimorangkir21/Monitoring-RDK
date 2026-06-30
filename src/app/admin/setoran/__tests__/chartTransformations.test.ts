/**
 * Unit tests for chart data transformation functions.
 *
 * Tests pure transformation logic (no rendering) for all four chart components:
 *   - calculateDailyAverages  (DailyAverageChart)
 *   - buildTop10Longest       (TopLongestSalesmanChart)
 *   - buildTop10Fastest       (TopFastestSalesmanChart)
 *   - buildDistribution       (DurationDistributionChart)
 *
 * Requirements: 2.1, 3.1, 4.1, 4.2
 */

import { describe, it, expect } from 'vitest';
import { calculateDailyAverages } from '../components/DailyAverageChart';
import { buildTop10Longest } from '../components/TopLongestSalesmanChart';
import { buildTop10Fastest } from '../components/TopFastestSalesmanChart';
import { buildDistribution } from '../components/DurationDistributionChart';
import type { SetoranRecord } from '@/types/setoran';

// ─── Fixture Helper ───────────────────────────────────────────────────────────

function makeRecord(
    namaSalesman: string,
    durasiSeconds: number,
    tanggal = '2025-06-01',
    overrides: Partial<SetoranRecord> = {}
): SetoranRecord {
    return {
        id: `${namaSalesman}-${durasiSeconds}-${tanggal}`,
        tanggal,
        bulan: 'Juni 2025',
        namaSalesman,
        pulangKunjungan: '16:00',
        setoranKasir: '17:00',
        durasiSeconds,
        durasi: '01:00:00',
        status: 'Normal',
        waktuPulang: `${tanggal}T16:00:00`,
        waktuSetoran: `${tanggal}T17:00:00`,
        ...overrides,
    };
}

// ─── calculateDailyAverages ───────────────────────────────────────────────────

describe('calculateDailyAverages (Requirement 2.1)', () => {

    describe('empty input', () => {
        it('returns an empty array when given no records', () => {
            expect(calculateDailyAverages([])).toEqual([]);
        });
    });

    describe('grouping by date', () => {
        it('returns one entry per unique date', () => {
            const records = [
                makeRecord('A', 600, '2025-06-01'),
                makeRecord('B', 600, '2025-06-02'),
                makeRecord('C', 600, '2025-06-03'),
            ];
            const result = calculateDailyAverages(records);
            expect(result).toHaveLength(3);
            expect(result.map(r => r.tanggal)).toEqual([
                '2025-06-01', '2025-06-02', '2025-06-03',
            ]);
        });

        it('groups multiple records on the same date into one entry', () => {
            const records = [
                makeRecord('A', 600, '2025-06-01'),
                makeRecord('B', 1200, '2025-06-01'),
                makeRecord('C', 600, '2025-06-02'),
            ];
            const result = calculateDailyAverages(records);
            expect(result).toHaveLength(2);
        });

        it('sorts entries chronologically by date', () => {
            const records = [
                makeRecord('A', 600, '2025-06-03'),
                makeRecord('B', 600, '2025-06-01'),
                makeRecord('C', 600, '2025-06-02'),
            ];
            const result = calculateDailyAverages(records);
            expect(result[0]?.tanggal).toBe('2025-06-01');
            expect(result[1]?.tanggal).toBe('2025-06-02');
            expect(result[2]?.tanggal).toBe('2025-06-03');
        });
    });

    describe('daily average calculation', () => {
        it('computes correct mean for a single record on a day', () => {
            // 3600s = 60 minutes
            const records = [makeRecord('A', 3600, '2025-06-01')];
            const result = calculateDailyAverages(records);
            expect(result[0]?.avgMinutes).toBeCloseTo(60, 1);
        });

        it('computes correct mean when multiple records share the same date', () => {
            // 600s + 1200s = 1800s total, avg = 900s = 15 min
            const records = [
                makeRecord('A', 600, '2025-06-01'),
                makeRecord('B', 1200, '2025-06-01'),
            ];
            const result = calculateDailyAverages(records);
            expect(result[0]?.avgMinutes).toBeCloseTo(15, 1);
        });

        it('rounds averages to one decimal place', () => {
            // 100s + 200s = 300s / 2 = 150s = 2.5 min → rounds to 2.5
            const records = [
                makeRecord('A', 100, '2025-06-01'),
                makeRecord('B', 200, '2025-06-01'),
            ];
            const result = calculateDailyAverages(records);
            expect(result[0]?.avgMinutes).toBe(2.5);
        });

        it('produces independent averages per day', () => {
            // Day 1: 1200s = 20 min; Day 2: 3600s = 60 min
            const records = [
                makeRecord('A', 1200, '2025-06-01'),
                makeRecord('B', 3600, '2025-06-02'),
            ];
            const result = calculateDailyAverages(records);
            expect(result[0]?.avgMinutes).toBeCloseTo(20, 1);
            expect(result[1]?.avgMinutes).toBeCloseTo(60, 1);
        });
    });

    describe('date label formatting', () => {
        it('generates a human-readable tanggalLabel from tanggal', () => {
            const records = [makeRecord('A', 600, '2025-06-28')];
            const result = calculateDailyAverages(records);
            // Should include day "28" and month abbreviation
            expect(result[0]?.tanggalLabel).toContain('28');
            expect(result[0]?.tanggalLabel).toContain('Jun');
        });

        it('preserves the original tanggal YYYY-MM-DD in the output', () => {
            const records = [makeRecord('A', 600, '2025-01-15')];
            const result = calculateDailyAverages(records);
            expect(result[0]?.tanggal).toBe('2025-01-15');
        });
    });

    describe('edge cases', () => {
        it('handles a single record correctly', () => {
            const records = [makeRecord('Solo', 900, '2025-06-10')];
            const result = calculateDailyAverages(records);
            expect(result).toHaveLength(1);
            expect(result[0]?.avgMinutes).toBeCloseTo(15, 1);
        });

        it('handles very short durations (near zero)', () => {
            const records = [makeRecord('A', 10, '2025-06-01')];
            const result = calculateDailyAverages(records);
            // 10s ≈ 0.2 min (rounded to 1dp)
            expect(result[0]?.avgMinutes).toBeCloseTo(0.2, 1);
        });

        it('handles very long durations', () => {
            // 7200s = 120 min
            const records = [makeRecord('A', 7200, '2025-06-01')];
            const result = calculateDailyAverages(records);
            expect(result[0]?.avgMinutes).toBeCloseTo(120, 1);
        });
    });
});

// ─── buildTop10Longest ────────────────────────────────────────────────────────

describe('buildTop10Longest (Requirement 3.1, 3.2)', () => {

    describe('empty input', () => {
        it('returns an empty array when given no records', () => {
            expect(buildTop10Longest([])).toEqual([]);
        });
    });

    describe('salesman average calculation', () => {
        it('calculates the correct average duration per salesman', () => {
            // Alice: 600s + 1200s → avg 900s = 15 min
            const records = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 1200),
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.salesman).toBe('Alice');
            expect(result[0]?.averageDuration).toBeCloseTo(15, 1);
        });

        it('rounds average duration to one decimal place', () => {
            // 100s + 200s = avg 150s = 2.5 min (already 1dp)
            const records = [
                makeRecord('Alice', 100),
                makeRecord('Alice', 200),
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.averageDuration).toBe(2.5);
        });

        it('counts the number of records per salesman', () => {
            const records = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 600),
                makeRecord('Alice', 600),
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.recordCount).toBe(3);
        });
    });

    describe('descending sort order (Requirement 3.2)', () => {
        it('sorts salesman by average duration in descending order', () => {
            const records = [
                makeRecord('Fast', 300),   // 5 min
                makeRecord('Slow', 3600),  // 60 min
                makeRecord('Mid', 1200),   // 20 min
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.salesman).toBe('Slow');
            expect(result[1]?.salesman).toBe('Mid');
            expect(result[2]?.salesman).toBe('Fast');
        });

        it('assigns ascending 1-based ranks matching sort order', () => {
            const records = [
                makeRecord('A', 300),
                makeRecord('B', 1200),
                makeRecord('C', 3600),
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.rank).toBe(1);
            expect(result[1]?.rank).toBe(2);
            expect(result[2]?.rank).toBe(3);
        });
    });

    describe('top-10 slicing', () => {
        it('returns at most 10 entries even when more salesman exist', () => {
            const records = Array.from({ length: 15 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 100)
            );
            const result = buildTop10Longest(records);
            expect(result.length).toBeLessThanOrEqual(10);
        });

        it('returns exactly 10 entries when there are exactly 10 salesman', () => {
            const records = Array.from({ length: 10 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 600)
            );
            const result = buildTop10Longest(records);
            expect(result).toHaveLength(10);
        });

        it('returns fewer than 10 entries when fewer salesman exist', () => {
            const records = [
                makeRecord('A', 600),
                makeRecord('B', 1200),
            ];
            const result = buildTop10Longest(records);
            expect(result).toHaveLength(2);
        });

        it('top-10 contains the salesman with the highest averages', () => {
            // 15 salesman, top one has 15*100 = 1500s = 25 min
            const records = Array.from({ length: 15 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 100)
            );
            const result = buildTop10Longest(records);
            // The 11th-15th highest should NOT be in the result
            // The top entry should be Salesman14 (1500s = 25 min)
            expect(result[0]?.salesman).toBe('Salesman14');
        });
    });

    describe('edge cases', () => {
        it('handles a single record correctly', () => {
            const records = [makeRecord('Solo', 1800)];
            const result = buildTop10Longest(records);
            expect(result).toHaveLength(1);
            expect(result[0]?.salesman).toBe('Solo');
            expect(result[0]?.averageDuration).toBeCloseTo(30, 1);
            expect(result[0]?.rank).toBe(1);
        });

        it('aggregates multiple records for same salesman before ranking', () => {
            // Alice: (600+3600)/2 = 2100s = 35 min
            // Bob:   1800s = 30 min
            // Alice should rank first
            const records = [
                makeRecord('Alice', 600),
                makeRecord('Alice', 3600),
                makeRecord('Bob', 1800),
            ];
            const result = buildTop10Longest(records);
            expect(result[0]?.salesman).toBe('Alice');
        });
    });
});

// ─── buildTop10Fastest ────────────────────────────────────────────────────────

describe('buildTop10Fastest (Requirement 3.1, 3.3)', () => {

    describe('empty input', () => {
        it('returns an empty array when given no records', () => {
            expect(buildTop10Fastest([])).toEqual([]);
        });
    });

    describe('salesman average calculation', () => {
        it('calculates the correct average duration per salesman', () => {
            // Alice: 300s + 900s → avg 600s = 10 min
            const records = [
                makeRecord('Alice', 300),
                makeRecord('Alice', 900),
            ];
            const result = buildTop10Fastest(records);
            expect(result[0]?.salesman).toBe('Alice');
            expect(result[0]?.averageDuration).toBeCloseTo(10, 1);
        });

        it('counts the number of records per salesman', () => {
            const records = [
                makeRecord('Alice', 300),
                makeRecord('Alice', 300),
            ];
            const result = buildTop10Fastest(records);
            expect(result[0]?.recordCount).toBe(2);
        });
    });

    describe('ascending sort order (Requirement 3.3)', () => {
        it('sorts salesman by average duration in ascending order (shortest first)', () => {
            const records = [
                makeRecord('Fast', 300),   // 5 min
                makeRecord('Slow', 3600),  // 60 min
                makeRecord('Mid', 1200),   // 20 min
            ];
            const result = buildTop10Fastest(records);
            expect(result[0]?.salesman).toBe('Fast');
            expect(result[1]?.salesman).toBe('Mid');
            expect(result[2]?.salesman).toBe('Slow');
        });

        it('assigns ascending 1-based ranks matching sort order', () => {
            const records = [
                makeRecord('A', 3600),
                makeRecord('B', 1200),
                makeRecord('C', 300),
            ];
            const result = buildTop10Fastest(records);
            expect(result[0]?.rank).toBe(1);
            expect(result[1]?.rank).toBe(2);
            expect(result[2]?.rank).toBe(3);
            // Fastest (C=5min) gets rank 1
            expect(result[0]?.salesman).toBe('C');
        });
    });

    describe('produces opposite order from buildTop10Longest', () => {
        it('fastest top-1 is the longest bottom-n and vice versa', () => {
            const records = [
                makeRecord('Fast', 300),   // 5 min
                makeRecord('Slow', 3600),  // 60 min
            ];
            const fastest = buildTop10Fastest(records);
            const longest = buildTop10Longest(records);
            expect(fastest[0]?.salesman).toBe('Fast');
            expect(longest[0]?.salesman).toBe('Slow');
        });
    });

    describe('top-10 slicing', () => {
        it('returns at most 10 entries even when more salesman exist', () => {
            const records = Array.from({ length: 15 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 100)
            );
            const result = buildTop10Fastest(records);
            expect(result.length).toBeLessThanOrEqual(10);
        });

        it('top-10 contains the salesman with the lowest averages', () => {
            // 15 salesman; Salesman0 has 100s (smallest), Salesman14 has 1500s (largest)
            const records = Array.from({ length: 15 }, (_, i) =>
                makeRecord(`Salesman${i}`, (i + 1) * 100)
            );
            const result = buildTop10Fastest(records);
            // Salesman0 (100s = ~1.7 min) should be rank 1 (fastest)
            expect(result[0]?.salesman).toBe('Salesman0');
            // Salesman14 (slowest) should NOT appear in the top 10 fastest
            const names = result.map(r => r.salesman);
            expect(names).not.toContain('Salesman14');
        });
    });

    describe('edge cases', () => {
        it('handles a single record correctly', () => {
            const records = [makeRecord('Solo', 300)];
            const result = buildTop10Fastest(records);
            expect(result).toHaveLength(1);
            expect(result[0]?.salesman).toBe('Solo');
            expect(result[0]?.averageDuration).toBeCloseTo(5, 1);
            expect(result[0]?.rank).toBe(1);
        });
    });
});

// ─── buildDistribution ────────────────────────────────────────────────────────

describe('buildDistribution (Requirement 4.1, 4.2)', () => {

    describe('empty input', () => {
        it('returns an empty array when given no records', () => {
            expect(buildDistribution([])).toEqual([]);
        });
    });

    describe('duration categorisation (Requirement 4.2)', () => {
        it('places a record with duration < 30 min into "0–30 mnt" bucket', () => {
            // 29 min 59 sec = 1799s
            const records = [makeRecord('A', 1799)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '0–30 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with exactly 30 min (1800s) into "30–60 mnt" bucket', () => {
            // boundary: 1800s is NOT < 1800 so falls into next category
            const records = [makeRecord('A', 1800)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '30–60 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with 45 min (2700s) into "30–60 mnt" bucket', () => {
            const records = [makeRecord('A', 2700)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '30–60 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with exactly 60 min (3600s) into "60–90 mnt" bucket', () => {
            const records = [makeRecord('A', 3600)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '60–90 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with 75 min (4500s) into "60–90 mnt" bucket', () => {
            const records = [makeRecord('A', 4500)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '60–90 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with exactly 90 min (5400s) into "90 mnt+" bucket', () => {
            const records = [makeRecord('A', 5400)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '90 mnt+');
            expect(bucket?.count).toBe(1);
        });

        it('places a record with > 90 min into "90 mnt+" bucket', () => {
            const records = [makeRecord('A', 7200)]; // 120 min
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '90 mnt+');
            expect(bucket?.count).toBe(1);
        });
    });

    describe('percentage calculations (Requirement 4.2)', () => {
        it('computes 100% for a single category when all records fall in it', () => {
            const records = [
                makeRecord('A', 300),
                makeRecord('B', 600),
                makeRecord('C', 900),
            ];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '0–30 mnt');
            expect(bucket?.percentage).toBe(100);
        });

        it('computes equal percentages when records are split evenly', () => {
            // 2 records in 0-30 min, 2 in 30-60 min → 50% each
            const records = [
                makeRecord('A', 600),   // 10 min
                makeRecord('B', 900),   // 15 min
                makeRecord('C', 2700),  // 45 min
                makeRecord('D', 3000),  // 50 min
            ];
            const result = buildDistribution(records);
            const low = result.find(r => r.category === '0–30 mnt');
            const mid = result.find(r => r.category === '30–60 mnt');
            expect(low?.percentage).toBe(50);
            expect(mid?.percentage).toBe(50);
        });

        it('percentages across all categories sum to 100', () => {
            const records = [
                makeRecord('A', 600),    // 0-30 min
                makeRecord('B', 2700),   // 30-60 min
                makeRecord('C', 4500),   // 60-90 min
                makeRecord('D', 7200),   // 90 min+
            ];
            const result = buildDistribution(records);
            const total = result.reduce((sum, r) => sum + r.percentage, 0);
            expect(total).toBeCloseTo(100, 1);
        });

        it('rounds percentage to one decimal place', () => {
            // 1 out of 3 records → 33.333...% → rounds to 33.3%
            const records = [
                makeRecord('A', 600),   // 0-30 min
                makeRecord('B', 2700),  // 30-60 min
                makeRecord('C', 4500),  // 60-90 min
            ];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '0–30 mnt');
            // 1/3 * 100 = 33.3333... → 33.3
            expect(bucket?.percentage).toBeCloseTo(33.3, 0);
        });
    });

    describe('structure and colour assignment', () => {
        it('always returns four categories with correct labels', () => {
            const records = [makeRecord('A', 600)];
            const result = buildDistribution(records);
            const labels = result.map(r => r.category);
            expect(labels).toContain('0–30 mnt');
            expect(labels).toContain('30–60 mnt');
            expect(labels).toContain('60–90 mnt');
            expect(labels).toContain('90 mnt+');
        });

        it('assigns a color to each category', () => {
            const records = [makeRecord('A', 600)];
            const result = buildDistribution(records);
            result.forEach(segment => {
                expect(segment.color).toBeTruthy();
                expect(segment.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });

        it('assigns green (#10B981) to the 0–30 mnt category', () => {
            const records = [makeRecord('A', 600)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '0–30 mnt');
            expect(bucket?.color).toBe('#10B981');
        });

        it('assigns purple (#8B5CF6) to the 90 mnt+ category', () => {
            const records = [makeRecord('A', 600)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '90 mnt+');
            expect(bucket?.color).toBe('#8B5CF6');
        });
    });

    describe('edge cases', () => {
        it('counts zero for categories with no records', () => {
            // All in 0-30 min
            const records = [makeRecord('A', 600), makeRecord('B', 900)];
            const result = buildDistribution(records);
            const emptyBuckets = result.filter(r => r.category !== '0–30 mnt');
            emptyBuckets.forEach(bucket => {
                expect(bucket.count).toBe(0);
                expect(bucket.percentage).toBe(0);
            });
        });

        it('handles very short durations (near zero seconds)', () => {
            const records = [makeRecord('A', 1)];
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '0–30 mnt');
            expect(bucket?.count).toBe(1);
        });

        it('handles very large durations', () => {
            const records = [makeRecord('A', 100000)]; // ~27 hours
            const result = buildDistribution(records);
            const bucket = result.find(r => r.category === '90 mnt+');
            expect(bucket?.count).toBe(1);
        });
    });
});
