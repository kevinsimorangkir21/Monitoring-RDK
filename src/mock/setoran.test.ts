/**
 * Unit Tests for SetoranDataGenerator
 */

import { describe, it, expect } from 'vitest';
import { SetoranDataGenerator } from './setoran';
import type { SetoranRecord } from '@/types/setoran';

describe('SetoranDataGenerator', () => {
    const generator = new SetoranDataGenerator();

    describe('generateSetoranData', () => {
        it('should generate the requested number of records', () => {
            const count = 50;
            const data = generator.generateSetoranData(count);

            expect(data).toHaveLength(count);
        });

        it('should generate records with all required fields', () => {
            const data = generator.generateSetoranData(1);
            const record = data[0];

            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('tanggal');
            expect(record).toHaveProperty('bulan');
            expect(record).toHaveProperty('namaSalesman');
            expect(record).toHaveProperty('pulangKunjungan');
            expect(record).toHaveProperty('setoranKasir');
            expect(record).toHaveProperty('durasiSeconds');
            expect(record).toHaveProperty('durasi');
            expect(record).toHaveProperty('status');
            expect(record).toHaveProperty('waktuPulang');
            expect(record).toHaveProperty('waktuSetoran');
        });

        it('should generate realistic duration variations', () => {
            const data = generator.generateSetoranData(100);

            // Check duration ranges
            const durations = data.map(r => r.durasiSeconds);
            const minDuration = Math.min(...durations);
            const maxDuration = Math.max(...durations);

            // Should have realistic duration range (15 minutes to 3 hours)
            expect(minDuration).toBeGreaterThanOrEqual(15 * 60); // 15 minutes
            expect(maxDuration).toBeLessThanOrEqual(180 * 60); // 3 hours
        });

        it('should generate valid date formats', () => {
            const data = generator.generateSetoranData(10);

            data.forEach(record => {
                // Check tanggal format (YYYY-MM-DD)
                expect(record.tanggal).toMatch(/^\d{4}-\d{2}-\d{2}$/);

                // Check time formats (HH:mm)
                expect(record.pulangKunjungan).toMatch(/^\d{2}:\d{2}$/);
                expect(record.setoranKasir).toMatch(/^\d{2}:\d{2}$/);

                // Check ISO datetime formats
                expect(() => new Date(record.waktuPulang)).not.toThrow();
                expect(() => new Date(record.waktuSetoran)).not.toThrow();
            });
        });

        it('should generate valid status values', () => {
            const data = generator.generateSetoranData(50);
            const validStatuses = ['Fast', 'Normal', 'Slow'];

            data.forEach(record => {
                expect(validStatuses).toContain(record.status);
            });
        });
    });

    describe('generateForSalesman', () => {
        it('should generate records for specific salesman', () => {
            const salesmanNames = ['Test Salesman 1', 'Test Salesman 2'];
            const recordsPerSalesman = 5;
            const data = generator.generateForSalesman(salesmanNames, recordsPerSalesman);

            expect(data).toHaveLength(salesmanNames.length * recordsPerSalesman);

            // Check that all records have the specified salesman names
            const generatedSalesman = [...new Set(data.map(r => r.namaSalesman))];
            expect(generatedSalesman).toEqual(expect.arrayContaining(salesmanNames));
        });
    });

    describe('generateDateRange', () => {
        it('should generate records within specified date range', () => {
            const startDate = new Date('2025-01-01');
            const endDate = new Date('2025-01-05');
            const recordsPerDay = 3;

            const data = generator.generateDateRange(startDate, endDate, recordsPerDay);

            // Should have records for each day (5 days * 3 records = 15 total)
            expect(data).toHaveLength(5 * recordsPerDay);

            // Check date boundaries
            data.forEach(record => {
                const recordDate = new Date(record.tanggal);
                expect(recordDate).toBeInstanceOf(Date);
                expect(recordDate >= startDate).toBe(true);
                expect(recordDate <= endDate).toBe(true);
            });
        });
    });

    describe('generateEdgeCases', () => {
        it('should generate both very fast and very slow records', () => {
            const data = generator.generateEdgeCases();

            expect(data.length).toBeGreaterThan(0);

            const durations = data.map(r => r.durasiSeconds);
            const minDuration = Math.min(...durations);
            const maxDuration = Math.max(...durations);

            // Should have very short durations (< 15 minutes)
            expect(minDuration).toBeLessThan(15 * 60);

            // Should have very long durations (> 3 hours)
            expect(maxDuration).toBeGreaterThan(180 * 60);
        });
    });

    describe('getAvailableSalesman', () => {
        it('should return array of salesman names', () => {
            const salesmanNames = generator.getAvailableSalesman();

            expect(Array.isArray(salesmanNames)).toBe(true);
            expect(salesmanNames.length).toBeGreaterThan(0);
            expect(typeof salesmanNames[0]).toBe('string');
        });
    });
});