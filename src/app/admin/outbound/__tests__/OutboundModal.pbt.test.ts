// Feature: outbound-refactor, Property 7: Form Validation
// Feature: outbound-refactor, Property 8: FO Uniqueness
// Updated: valid status = "Muat Pagi" | "Muat Inap" only

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validateOutboundForm } from "../OutboundModal";
import type { OutboundFormValues } from "../types";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const arbFilledField = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.trim().length > 0);

const arbWhitespaceField = fc.oneof(
    fc.constant(""),
    fc.constant("   "),
    fc.constant("\t"),
    fc.constant("\n"),
    fc.constant("  \t  "),
);

/** Valid status values — Muat Pagi | Muat Inap only */
const arbValidStatus = fc.oneof(
    fc.constant("Muat Pagi"),
    fc.constant("Muat Inap"),
);

const arbNonNegativeNumStr = fc.integer({ min: 0, max: 99999 }).map(String);
const arbNegativeNumStr = fc.integer({ min: -99999, max: -1 }).map(String);

const arbTimeStr = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

const arbValidFormValues: fc.Arbitrary<OutboundFormValues> = fc.record({
    tanggal: fc
        .tuple(
            fc.integer({ min: 2024, max: 2027 }),
            fc.integer({ min: 1, max: 12 }),
            fc.integer({ min: 1, max: 28 }),
        )
        .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`),
    freightOrder: fc.uuid(),
    mobilMuat: arbFilledField,
    sType: arbFilledField,
    assignJob: arbFilledField,
    jamTerima: arbTimeStr,
    status: arbValidStatus,
    selesaiMuat: arbTimeStr,
    hari: arbFilledField,
    putaran: arbFilledField,
    st: arbNonNegativeNumStr,
    h2: arbNonNegativeNumStr,
    jamRunning: arbTimeStr,
});

const ALL_FIELDS: Array<keyof OutboundFormValues> = [
    "tanggal", "freightOrder", "mobilMuat", "sType", "assignJob",
    "jamTerima", "status", "selesaiMuat", "hari", "putaran",
    "st", "h2", "jamRunning",
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("OutboundModal — Property 7: Form Validation", () => {
    it("Property 7a: every empty/whitespace field always produces a required error", () => {
        fc.assert(
            fc.property(
                arbValidFormValues,
                fc.array(
                    fc.integer({ min: 0, max: ALL_FIELDS.length - 1 }),
                    { minLength: 1, maxLength: ALL_FIELDS.length },
                ),
                arbWhitespaceField,
                (validValues, fieldIndices, whitespace) => {
                    const uniqueIndices = [...new Set(fieldIndices)];
                    const emptyFields = uniqueIndices.map((i) => ALL_FIELDS[i]);

                    const values: OutboundFormValues = { ...validValues };
                    for (const field of emptyFields) {
                        values[field] = whitespace;
                    }

                    const errors = validateOutboundForm(values, [], undefined);

                    for (const field of emptyFields) {
                        expect(
                            errors[field],
                            `Expected error for empty field "${field}"`,
                        ).toBeDefined();
                        expect(errors[field]).toBe("Field ini wajib diisi.");
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Property 7b: negative st always produces an error on the st field", () => {
        fc.assert(
            fc.property(arbValidFormValues, arbNegativeNumStr, (validValues, negSt) => {
                const values: OutboundFormValues = { ...validValues, st: negSt };
                const errors = validateOutboundForm(values, [], undefined);
                expect(errors.st).toBeDefined();
                expect(errors.st).toBe("ST harus bernilai 0 atau lebih.");
            }),
            { numRuns: 100 },
        );
    });

    it("Property 7c: negative h2 always produces an error on the h2 field", () => {
        fc.assert(
            fc.property(arbValidFormValues, arbNegativeNumStr, (validValues, negH2) => {
                const values: OutboundFormValues = { ...validValues, h2: negH2 };
                const errors = validateOutboundForm(values, [], undefined);
                expect(errors.h2).toBeDefined();
                expect(errors.h2).toBe("H2 harus bernilai 0 atau lebih.");
            }),
            { numRuns: 100 },
        );
    });

    it("Property 7d: both st and h2 negative → errors on both fields", () => {
        fc.assert(
            fc.property(
                arbValidFormValues, arbNegativeNumStr, arbNegativeNumStr,
                (validValues, negSt, negH2) => {
                    const values: OutboundFormValues = { ...validValues, st: negSt, h2: negH2 };
                    const errors = validateOutboundForm(values, [], undefined);
                    expect(errors.st).toBeDefined();
                    expect(errors.st).toBe("ST harus bernilai 0 atau lebih.");
                    expect(errors.h2).toBeDefined();
                    expect(errors.h2).toBe("H2 harus bernilai 0 atau lebih.");
                },
            ),
            { numRuns: 100 },
        );
    });
});

describe("OutboundModal — Property 8: FO Uniqueness", () => {
    it("Property 8: freightOrder present in existingFreightOrders always produces a duplicate error", () => {
        fc.assert(
            fc.property(
                fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
                arbValidFormValues,
                (existingFOs, validValues) => {
                    const duplicateFO = existingFOs[0];
                    const values: OutboundFormValues = { ...validValues, freightOrder: duplicateFO };
                    const errors = validateOutboundForm(values, existingFOs, undefined);
                    expect(errors.freightOrder).toBeDefined();
                    expect(errors.freightOrder).toBe("FREIGHT ORDER sudah terdaftar.");
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Property 8b: duplicate detection works for any element position in existingFreightOrders", () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
                    { minLength: 1, maxLength: 30 },
                ),
                fc.integer({ min: 0, max: 29 }),
                arbValidFormValues,
                (existingFOs, rawIndex, validValues) => {
                    const index = rawIndex % existingFOs.length;
                    const duplicateFO = existingFOs[index];
                    const values: OutboundFormValues = { ...validValues, freightOrder: duplicateFO };
                    const errors = validateOutboundForm(values, existingFOs, undefined);
                    expect(errors.freightOrder).toBeDefined();
                    expect(errors.freightOrder).toBe("FREIGHT ORDER sudah terdaftar.");
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Sanity: freightOrder absent from existingFreightOrders does NOT produce a duplicate error", () => {
        fc.assert(
            fc.property(
                arbValidFormValues,
                fc.array(fc.uuid(), { minLength: 0, maxLength: 20 }),
                (validValues, otherFOs) => {
                    const foValue = validValues.freightOrder;
                    const existingFOs = otherFOs.filter((fo) => fo !== foValue);
                    const errors = validateOutboundForm(validValues, existingFOs, undefined);
                    expect(errors.freightOrder).toBeUndefined();
                },
            ),
            { numRuns: 100 },
        );
    });
});
