// Feature: outbound-refactor, Property 5: Filter Subset
// Feature: outbound-refactor, Property 6: Filter Reset Idempotent
// Updated: removed selectedSType, status values = "Muat Pagi" | "Muat Inap"

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { applyFilters, DEFAULT_FILTERS } from "../filters";
import type { OutboundRecord, OutboundFilters, STATUS } from "../types";

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const statusArb = fc.constantFrom<STATUS>("Muat Pagi", "Muat Inap");

const dateStringArb = fc
    .tuple(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 })
    )
    .map(
        ([y, m, d]): string =>
            `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );

const timeStringArb = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(
        ([h, m]): string =>
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );

const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 20 });

const outboundRecordArb: fc.Arbitrary<OutboundRecord> = fc
    .tuple(
        fc.uuid(),
        dateStringArb,
        nonEmptyStringArb, // freightOrder
        nonEmptyStringArb, // mobilMuat
        fc.constantFrom("Regular", "Express", "Cold", "Special", "Economy"),
        nonEmptyStringArb, // assignJob
        timeStringArb,     // jamTerima
        statusArb,
        timeStringArb,     // selesaiMuat
        fc.constantFrom("Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"),
        nonEmptyStringArb, // putaran
        fc.integer({ min: 0, max: 300 }), // st
        fc.integer({ min: 0, max: 300 }), // h2
        timeStringArb      // jamRunning
    )
    .map(
        ([
            id, tanggal, freightOrder, mobilMuat, sType, assignJob,
            jamTerima, status, selesaiMuat, hari, putaran, st, h2, jamRunning,
        ]): OutboundRecord => ({
            id, tanggal, freightOrder, mobilMuat, sType, assignJob,
            jamTerima, status, selesaiMuat, hari, putaran, st, h2, jamRunning,
        })
    );

const outboundRecordArrayArb = fc.array(outboundRecordArb, {
    minLength: 0,
    maxLength: 30,
});

/**
 * Generator for arbitrary OutboundFilters.
 * No selectedSType — that field has been removed.
 */
const outboundFiltersArb: fc.Arbitrary<OutboundFilters> = fc.record({
    dateRange: fc.record({
        startDate: fc.option(dateStringArb, { nil: null }),
        endDate: fc.option(dateStringArb, { nil: null }),
    }),
    selectedStatus: fc.subarray(
        ["Muat Pagi", "Muat Inap"] as STATUS[],
        { minLength: 0, maxLength: 2 }
    ),
    searchQuery: fc.oneof(
        fc.constant(""),
        fc.string({ minLength: 1, maxLength: 8 })
    ),
});

// ─── Property 5: Filter Subset ────────────────────────────────────────────────

describe("FilterBar — Property 5: Filter Subset", () => {
    it("filtered result length is always ≤ input length for any filter combination", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, outboundFiltersArb, (data, filters) => {
                const result = applyFilters(data, filters);
                expect(result.length).toBeLessThanOrEqual(data.length);
            }),
            { numRuns: 100 }
        );
    });

    it("every record in the filtered result is also present in the original data", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, outboundFiltersArb, (data, filters) => {
                const result = applyFilters(data, filters);
                const dataIds = new Set(data.map((r) => r.id));
                for (const record of result) {
                    expect(dataIds.has(record.id)).toBe(true);
                }
            }),
            { numRuns: 100 }
        );
    });
});

// ─── Property 6: Filter Reset Idempotent ─────────────────────────────────────

describe("FilterBar — Property 6: Filter Reset Idempotent", () => {
    it("applying DEFAULT_FILTERS returns same length as input", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, (data) => {
                const result = applyFilters(data, DEFAULT_FILTERS);
                expect(result.length).toBe(data.length);
            }),
            { numRuns: 100 }
        );
    });

    it("applying DEFAULT_FILTERS returns the same records as the original data", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, (data) => {
                const result = applyFilters(data, DEFAULT_FILTERS);
                expect(result.length).toBe(data.length);
                const resultIds = result.map((r) => r.id);
                const dataIds = data.map((r) => r.id);
                expect(resultIds).toEqual(dataIds);
                for (let i = 0; i < data.length; i++) {
                    expect(result[i]).toEqual(data[i]);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("DEFAULT_FILTERS has all filter dimensions in the inactive (reset) state", () => {
        expect(DEFAULT_FILTERS.dateRange.startDate).toBeNull();
        expect(DEFAULT_FILTERS.dateRange.endDate).toBeNull();
        expect(DEFAULT_FILTERS.selectedStatus).toHaveLength(0);
        expect(DEFAULT_FILTERS.searchQuery).toBe("");
    });
});
