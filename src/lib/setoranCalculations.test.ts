/**
 * setoranCalculations.test.ts
 *
 * Property-based tests for pure calculation functions in setoranCalculations.ts.
 *
 * Task 1.2 — Property 1: Durasi always positive for valid inputs
 * Task 1.3 — Property 2: Derived fields are internally consistent
 * Task 1.4 — Property 3: Status thresholds are exhaustive and non-overlapping
 * Task 8.3 — Property 5: Total Setoran KPI equals filteredData.length
 */

import { describe, test, expect } from "vitest";
import fc from "fast-check";

import {
    computeDerivedFields,
    computeStatus,
    computeBulan,
    secondsToHHmmss,
} from "@/lib/setoranCalculations";

import { calculateKPIs } from "@/app/admin/setoran/components/SetoranCards";
import type { SetoranRecord } from "@/types/setoran";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Convert total minutes from midnight to "HH:mm" string */
function minutesToHHmm(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Task 1.2 — Property 1: Durasi always positive for valid inputs ───────────
// Validates: Requirements 2.2, 10.1, 10.3

describe("Property 1: Durasi always positive for valid inputs", () => {
    /**
     * **Validates: Requirements 2.2, 10.1, 10.3**
     *
     * For ALL inputs where setoranKasir ≤ pulangKunjungan,
     * computeDerivedFields must return null.
     */
    test("computeDerivedFields returns null for all inputs where setoranKasir ≤ pulangKunjungan", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1439 }), // pulang: minutes from midnight
                fc.integer({ min: 0, max: 1439 }), // setoran: minutes from midnight
                (pulangMin, setoranMin) => {
                    fc.pre(setoranMin <= pulangMin);

                    const pulang = minutesToHHmm(pulangMin);
                    const setoran = minutesToHHmm(setoranMin);
                    const result = computeDerivedFields("2025-07-01", pulang, setoran);

                    return result === null;
                }
            )
        );
    });

    /**
     * **Validates: Requirements 2.2, 10.1, 10.3**
     *
     * For ALL valid inputs (setoranMin > pulangMin),
     * computeDerivedFields must return a result with durasiSeconds > 0.
     */
    test("computeDerivedFields returns durasiSeconds > 0 for all valid inputs", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1439 }), // pulang: minutes from midnight
                fc.integer({ min: 0, max: 1439 }), // setoran: minutes from midnight
                (pulangMin, setoranMin) => {
                    fc.pre(setoranMin > pulangMin);

                    const pulang = minutesToHHmm(pulangMin);
                    const setoran = minutesToHHmm(setoranMin);
                    const result = computeDerivedFields("2025-07-01", pulang, setoran);

                    return result !== null && result.durasiSeconds > 0;
                }
            )
        );
    });
});

// ─── Task 1.3 — Property 2: Derived fields are internally consistent ──────────
// Validates: Requirements 10.1, 10.2, 10.3, 10.5

describe("Property 2: Derived fields are internally consistent", () => {
    /**
     * **Validates: Requirements 10.1, 10.2, 10.3, 10.5**
     *
     * For all valid random inputs (setoranMin > pulangMin):
     * - durasiSeconds === (setoranMinutes - pulangMinutes) * 60
     * - durasi === secondsToHHmmss(durasiSeconds)
     * - bulan === computeBulan(tanggal)
     * - status === computeStatus(durasiSeconds)
     */
    test("durasiSeconds, durasi, bulan and status are all internally consistent", () => {
        // Build a date arbitrary from valid year/month/day components to avoid
        // the discard cost of filtering random strings.
        const tanggalArb = fc
            .record({
                year: fc.integer({ min: 2020, max: 2030 }),
                month: fc.integer({ min: 1, max: 12 }),
                day: fc.integer({ min: 1, max: 28 }), // 28 is safe for all months
            })
            .map(
                ({ year, month, day }) =>
                    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            );

        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1438 }), // pulangMin
                fc.integer({ min: 1, max: 1439 }), // delta
                tanggalArb,
                (pulangMin, delta, tanggal) => {
                    const setoranMin = pulangMin + delta;
                    fc.pre(setoranMin <= 1439);

                    const pulang = minutesToHHmm(pulangMin);
                    const setoran = minutesToHHmm(setoranMin);
                    const result = computeDerivedFields(tanggal, pulang, setoran);

                    if (result === null) return false; // should not happen given pre-conditions

                    const expectedDurasiSeconds = delta * 60;

                    return (
                        result.durasiSeconds === expectedDurasiSeconds &&
                        result.durasi === secondsToHHmmss(result.durasiSeconds) &&
                        result.bulan === computeBulan(tanggal) &&
                        result.status === computeStatus(result.durasiSeconds)
                    );
                }
            )
        );
    });
});

// ─── Task 1.4 — Property 3: Status thresholds are exhaustive and non-overlapping
// Validates: Requirements 10.1, 12.2

describe("Property 3: Status thresholds are exhaustive and non-overlapping", () => {
    const VALID_STATUSES = new Set(["Fast", "Normal", "Slow"]);

    /**
     * **Validates: Requirements 10.1, 12.2**
     *
     * computeStatus always returns exactly one of "Fast" | "Normal" | "Slow"
     * for any non-negative integer input.
     */
    test("computeStatus always returns exactly one of Fast | Normal | Slow", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100000 }),
                (durasiSeconds) => {
                    const status = computeStatus(durasiSeconds);
                    return VALID_STATUSES.has(status);
                }
            )
        );
    });

    /**
     * **Validates: Requirements 10.1, 12.2**
     *
     * Boundary value tests for computeStatus thresholds.
     */
    test("computeStatus boundary: 1800s → Fast", () => {
        expect(computeStatus(1800)).toBe("Fast");
    });

    test("computeStatus boundary: 1801s → Normal", () => {
        expect(computeStatus(1801)).toBe("Normal");
    });

    test("computeStatus boundary: 3600s → Normal", () => {
        expect(computeStatus(3600)).toBe("Normal");
    });

    test("computeStatus boundary: 3601s → Slow", () => {
        expect(computeStatus(3601)).toBe("Slow");
    });
});

// ─── Task 8.3 — Property 5: Total Setoran KPI equals filteredData.length ─────
// Validates: Requirements 6.1, 6.2, 6.3, 6.4

describe("Property 5: Total Setoran KPI equals filteredData.length", () => {
    /**
     * Arbitrary generator for a minimal SetoranRecord.
     * Only the fields actually consumed by calculateKPIs need realistic values;
     * the rest can be fixed strings.
     */
    const setoranRecordArb: fc.Arbitrary<SetoranRecord> = fc
        .record({
            id: fc.uuid(),
            tanggal: fc
                .record({
                    year: fc.integer({ min: 2020, max: 2030 }),
                    month: fc.integer({ min: 1, max: 12 }),
                    day: fc.integer({ min: 1, max: 28 }),
                })
                .map(
                    ({ year, month, day }) =>
                        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                ),
            bulan: fc.constantFrom(
                "Januari 2025",
                "Februari 2025",
                "Maret 2025",
                "April 2025",
                "Mei 2025",
                "Juni 2025",
                "Juli 2025",
                "Agustus 2025",
                "September 2025",
                "Oktober 2025",
                "November 2025",
                "Desember 2025"
            ),
            namaSalesman: fc.stringMatching(/^[A-Za-z ]{3,20}$/),
            pulangKunjungan: fc
                .integer({ min: 0, max: 1438 })
                .map((m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`),
            setoranKasir: fc
                .integer({ min: 1, max: 1439 })
                .map((m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`),
            // durasiSeconds must be positive — use a value guaranteed > 0
            durasiSeconds: fc.integer({ min: 1, max: 86399 }),
            durasi: fc.constant("00:30:00"),
            status: fc.constantFrom("Fast" as const, "Normal" as const, "Slow" as const),
            waktuPulang: fc.constant("2025-07-01T16:00:00.000Z"),
            waktuSetoran: fc.constant("2025-07-01T17:00:00.000Z"),
        });

    /**
     * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
     *
     * For any non-empty array of SetoranRecord,
     * calculateKPIs(data).totalRecords must equal data.length.
     */
    test("calculateKPIs(filteredData).totalRecords === filteredData.length for any non-empty array", () => {
        fc.assert(
            fc.property(
                fc.array(setoranRecordArb, { minLength: 1, maxLength: 100 }),
                (filteredData) => {
                    const kpis = calculateKPIs(filteredData);
                    // calculateKPIs returns null only for empty arrays; we guard with minLength: 1
                    return kpis !== null && kpis.totalRecords === filteredData.length;
                }
            )
        );
    });

    /**
     * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
     *
     * For an empty array, calculateKPIs must return null
     * (no KPI card should be shown when there is no data).
     */
    test("calculateKPIs returns null for an empty array", () => {
        expect(calculateKPIs([])).toBeNull();
    });
});
