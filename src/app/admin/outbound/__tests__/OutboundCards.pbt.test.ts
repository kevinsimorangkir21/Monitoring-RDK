// Feature: outbound-refactor, Property 1: KPI Invariant
// Updated: status values = "Muat Pagi" | "Muat Inap" only

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
    calculateKPIs,
    isMuatInap,
    isMuatPagi,
    isRit2,
} from "../OutboundCards";
import type { OutboundRecord } from "../types";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const arbTimeString = fc.oneof(
    fc
        .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
        .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`),
    fc.oneof(
        fc.constant(""),
        fc.constant("25:00"),
        fc.constant("abc"),
        fc.constant("12:60"),
        fc.string({ minLength: 0, maxLength: 8 }),
    )
);

const arbDateString = fc
    .tuple(
        fc.integer({ min: 2024, max: 2027 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
    )
    .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

const arbOutboundRecord = (): fc.Arbitrary<OutboundRecord> =>
    fc.record<OutboundRecord>({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        tanggal: arbDateString,
        freightOrder: fc.string({ minLength: 1, maxLength: 20 }),
        mobilMuat: fc.string({ minLength: 1, maxLength: 20 }),
        sType: fc.oneof(
            fc.constant("Regular"),
            fc.constant("Express"),
            fc.constant("Cold"),
            fc.constant("Charter"),
            fc.constant("Special"),
        ),
        assignJob: fc.string({ minLength: 1, maxLength: 20 }),
        jamTerima: arbTimeString,
        // Updated: only valid STATUS values
        status: fc.oneof(
            fc.constant("Muat Pagi" as const),
            fc.constant("Muat Inap" as const),
        ),
        selesaiMuat: arbTimeString,
        hari: fc.oneof(
            fc.constant("Senin"),
            fc.constant("Selasa"),
            fc.constant("Rabu"),
            fc.constant("Kamis"),
            fc.constant("Jumat"),
            fc.constant("Sabtu"),
            fc.constant("Minggu"),
            fc.constant("Inap"),
        ),
        putaran: fc.oneof(
            fc.constant("1"),
            fc.constant("2"),
            fc.constant("3"),
        ),
        st: fc.integer({ min: 0, max: 9999 }),
        h2: fc.integer({ min: 0, max: 9999 }),
        jamRunning: arbTimeString,
    });

const arbRecordArray = fc.array(arbOutboundRecord(), { minLength: 0, maxLength: 50 });
const arbNonEmptyRecordArray = fc.array(arbOutboundRecord(), { minLength: 1, maxLength: 50 });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("OutboundCards — Property 1: KPI Invariant", () => {
    it("Property 1a: muatInap + muatPagi + rit2 ≤ total for any record array (including empty)", () => {
        fc.assert(
            fc.property(arbRecordArray, (records) => {
                const { total, muatInap, muatPagi, rit2 } = calculateKPIs(records);

                expect(muatInap).toBeGreaterThanOrEqual(0);
                expect(muatPagi).toBeGreaterThanOrEqual(0);
                expect(rit2).toBeGreaterThanOrEqual(0);
                expect(muatInap).toBeLessThanOrEqual(total);
                expect(muatPagi).toBeLessThanOrEqual(total);
                expect(rit2).toBeLessThanOrEqual(total);

                expect(muatInap + muatPagi + rit2).toBeLessThanOrEqual(total);
            }),
            { numRuns: 100 }
        );
    });

    it("Property 1b: percentages equal (count/total)*100 within ±0.5% for non-empty arrays", () => {
        fc.assert(
            fc.property(arbNonEmptyRecordArray, (records) => {
                const { total, muatInap, muatPagi, rit2 } = calculateKPIs(records);

                expect(total).toBeGreaterThan(0);

                const expectedMuatInapPct = (muatInap / total) * 100;
                const expectedMuatPagiPct = (muatPagi / total) * 100;
                const expectedRit2Pct = (rit2 / total) * 100;

                const computedMuatInapPct = (muatInap / total) * 100;
                const computedMuatPagiPct = (muatPagi / total) * 100;
                const computedRit2Pct = (rit2 / total) * 100;

                expect(Math.abs(computedMuatInapPct - expectedMuatInapPct)).toBeLessThanOrEqual(0.5);
                expect(Math.abs(computedMuatPagiPct - expectedMuatPagiPct)).toBeLessThanOrEqual(0.5);
                expect(Math.abs(computedRit2Pct - expectedRit2Pct)).toBeLessThanOrEqual(0.5);

                expect(computedMuatInapPct).toBeGreaterThanOrEqual(0);
                expect(computedMuatInapPct).toBeLessThanOrEqual(100);
                expect(computedMuatPagiPct).toBeGreaterThanOrEqual(0);
                expect(computedMuatPagiPct).toBeLessThanOrEqual(100);
                expect(computedRit2Pct).toBeGreaterThanOrEqual(0);
                expect(computedRit2Pct).toBeLessThanOrEqual(100);
            }),
            { numRuns: 100 }
        );
    });

    it("Edge case: empty array produces all-zero KPIs", () => {
        const result = calculateKPIs([]);
        expect(result.total).toBe(0);
        expect(result.muatInap).toBe(0);
        expect(result.muatPagi).toBe(0);
        expect(result.rit2).toBe(0);
    });

    it("Predicate invariant: isMuatInap and isMuatPagi are mutually exclusive for valid HH:MM jamTerima without hari=Inap", () => {
        fc.assert(
            fc.property(
                fc
                    .tuple(
                        fc.integer({ min: 0, max: 23 }),
                        fc.integer({ min: 0, max: 59 }),
                    )
                    .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`),
                (jamTerima) => {
                    const record: OutboundRecord = {
                        id: "test-id",
                        tanggal: "2026-01-01",
                        freightOrder: "FO-001",
                        mobilMuat: "B 1234 AB",
                        sType: "Regular",
                        assignJob: "JOB-001",
                        jamTerima,
                        status: "Muat Pagi",
                        selesaiMuat: "10:00",
                        hari: "Senin",
                        putaran: "1",
                        st: 0,
                        h2: 0,
                        jamRunning: "00:00",
                    };

                    const inap = isMuatInap(record);
                    const pagi = isMuatPagi(record);

                    expect(inap && pagi).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });
});
