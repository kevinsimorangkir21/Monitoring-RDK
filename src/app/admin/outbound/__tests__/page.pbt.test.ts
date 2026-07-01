// Feature: outbound-refactor, Property 9: Create Invariant
// Feature: outbound-refactor, Property 10: Edit Invariant
// Feature: outbound-refactor, Property 11: Delete Invariant
// Updated: status values = "Muat Pagi" | "Muat Inap" only

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { OutboundRecord } from "../types";

// ─── Pure state-update functions (mirror page.tsx handler logic) ──────────────

function createRecord(data: OutboundRecord[], newRecord: OutboundRecord): OutboundRecord[] {
    return [newRecord, ...data];
}

function editRecord(data: OutboundRecord[], updated: OutboundRecord): OutboundRecord[] {
    return data.map((r) => (r.id === updated.id ? updated : r));
}

function deleteRecord(data: OutboundRecord[], id: string): OutboundRecord[] {
    return data.filter((r) => r.id !== id);
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const arbNonEmptyStr = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.trim().length > 0);

/** Updated: only Muat Pagi | Muat Inap */
const arbStatus = fc.oneof(
    fc.constant("Muat Pagi" as const),
    fc.constant("Muat Inap" as const),
);

const arbTimeStr = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

const arbDateStr = fc
    .tuple(
        fc.integer({ min: 2024, max: 2027 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
    )
    .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

const arbOutboundRecord: fc.Arbitrary<OutboundRecord> = fc.record({
    id: fc.uuid(),
    tanggal: arbDateStr,
    freightOrder: arbNonEmptyStr,
    mobilMuat: arbNonEmptyStr,
    sType: arbNonEmptyStr,
    assignJob: arbNonEmptyStr,
    jamTerima: arbTimeStr,
    status: arbStatus,
    selesaiMuat: arbTimeStr,
    hari: arbNonEmptyStr,
    putaran: arbNonEmptyStr,
    st: fc.integer({ min: 0, max: 9999 }),
    h2: fc.integer({ min: 0, max: 9999 }),
    jamRunning: arbTimeStr,
});

const arbDataArray = fc.array(arbOutboundRecord, { minLength: 0, maxLength: 50 });
const arbNonEmptyDataArray = fc.array(arbOutboundRecord, { minLength: 1, maxLength: 50 });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("page.tsx CRUD — Property 9: Create State Invariant", () => {
    it("Property 9: create increases data.length by exactly 1 and new record is present", () => {
        fc.assert(
            fc.property(arbDataArray, arbOutboundRecord, (data, newRecord) => {
                const existingIds = new Set(data.map((r) => r.id));
                fc.pre(!existingIds.has(newRecord.id));

                const result = createRecord(data, newRecord);
                expect(result.length).toBe(data.length + 1);

                const found = result.find((r) => r.id === newRecord.id);
                expect(found).toBeDefined();
                expect(found).toEqual(newRecord);
            }),
            { numRuns: 100 },
        );
    });

    it("Property 9b: new record is prepended as the first element", () => {
        fc.assert(
            fc.property(arbDataArray, arbOutboundRecord, (data, newRecord) => {
                const existingIds = new Set(data.map((r) => r.id));
                fc.pre(!existingIds.has(newRecord.id));

                const result = createRecord(data, newRecord);
                expect(result[0]).toEqual(newRecord);
            }),
            { numRuns: 100 },
        );
    });

    it("Property 9c: all original records are still present after create", () => {
        fc.assert(
            fc.property(arbDataArray, arbOutboundRecord, (data, newRecord) => {
                const existingIds = new Set(data.map((r) => r.id));
                fc.pre(!existingIds.has(newRecord.id));

                const result = createRecord(data, newRecord);
                for (const original of data) {
                    const stillPresent = result.some((r) => r.id === original.id);
                    expect(stillPresent).toBe(true);
                }
            }),
            { numRuns: 100 },
        );
    });
});

describe("page.tsx CRUD — Property 10: Edit State Invariant", () => {
    it("Property 10: edit keeps data.length unchanged and record with matching id is updated", () => {
        fc.assert(
            fc.property(arbNonEmptyDataArray, fc.integer({ min: 0, max: 49 }), arbOutboundRecord,
                (data, rawIndex, arbitraryRecord) => {
                    const index = rawIndex % data.length;
                    const targetId = data[index].id;
                    const updated: OutboundRecord = { ...arbitraryRecord, id: targetId };
                    const result = editRecord(data, updated);

                    expect(result.length).toBe(data.length);

                    const found = result.find((r) => r.id === targetId);
                    expect(found).toBeDefined();
                    expect(found).toEqual(updated);
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Property 10b: records with non-matching ids are unchanged after edit", () => {
        fc.assert(
            fc.property(arbNonEmptyDataArray, fc.integer({ min: 0, max: 49 }), arbOutboundRecord,
                (data, rawIndex, arbitraryRecord) => {
                    const index = rawIndex % data.length;
                    const targetId = data[index].id;
                    const updated: OutboundRecord = { ...arbitraryRecord, id: targetId };
                    const result = editRecord(data, updated);

                    for (const original of data) {
                        if (original.id === targetId) continue;
                        const resultRecord = result.find((r) => r.id === original.id);
                        expect(resultRecord).toEqual(original);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});

describe("page.tsx CRUD — Property 11: Delete State Invariant", () => {
    it("Property 11: delete decreases data.length by exactly 1 and deleted id is absent", () => {
        fc.assert(
            fc.property(arbNonEmptyDataArray, fc.integer({ min: 0, max: 49 }),
                (data, rawIndex) => {
                    const index = rawIndex % data.length;
                    const targetId = data[index].id;

                    const idsAreUnique = new Set(data.map((r) => r.id)).size === data.length;
                    fc.pre(idsAreUnique);

                    const result = deleteRecord(data, targetId);

                    expect(result.length).toBe(data.length - 1);
                    const stillPresent = result.some((r) => r.id === targetId);
                    expect(stillPresent).toBe(false);
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Property 11b: all other records remain present after delete", () => {
        fc.assert(
            fc.property(arbNonEmptyDataArray, fc.integer({ min: 0, max: 49 }),
                (data, rawIndex) => {
                    const index = rawIndex % data.length;
                    const targetId = data[index].id;

                    const idsAreUnique = new Set(data.map((r) => r.id)).size === data.length;
                    fc.pre(idsAreUnique);

                    const result = deleteRecord(data, targetId);

                    for (const original of data) {
                        if (original.id === targetId) continue;
                        const stillPresent = result.some((r) => r.id === original.id);
                        expect(stillPresent).toBe(true);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    it("Property 11c: deleting from a single-element array produces an empty array", () => {
        fc.assert(
            fc.property(arbOutboundRecord, (record) => {
                const result = deleteRecord([record], record.id);
                expect(result.length).toBe(0);
                expect(result).toEqual([]);
            }),
            { numRuns: 100 },
        );
    });
});
