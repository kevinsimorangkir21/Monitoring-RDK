/**
 * setoranStore.test.ts
 *
 * Task 2.2 — Property 6: Store operations are isolated
 * Task 2.3 — Unit tests for store CRUD operations
 */

import { describe, test, expect, beforeEach } from "vitest";
import fc from "fast-check";

import { setoranStore, __resetStore } from "@/lib/setoranStore";
import type { SetoranRecord } from "@/types/setoran";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Build a minimal valid SetoranRecord for test use */
function makeRecord(overrides: Partial<SetoranRecord> = {}): SetoranRecord {
    return {
        id: `test-${Math.random().toString(36).slice(2)}`,
        tanggal: "2025-07-01",
        bulan: "Juli 2025",
        namaSalesman: "Andi Wijaya",
        pulangKunjungan: "16:00",
        setoranKasir: "17:15",
        durasiSeconds: 4500,
        durasi: "01:15:00",
        status: "Slow",
        waktuPulang: "2025-07-01T09:00:00.000Z",
        waktuSetoran: "2025-07-01T10:15:00.000Z",
        ...overrides,
    };
}

// ─── Task 2.2 — Property 6: Store operations are isolated ────────────────────
// Validates: Requirements 7.3, 7.4, 14.2, 14.5

describe("Property 6: Store operations are isolated", () => {
    beforeEach(() => __resetStore());

    /**
     * **Validates: Requirements 7.3, 7.4, 14.2, 14.5**
     *
     * delete(id) must not mutate any record with a different id.
     * Snapshot getAll() (excluding the target), then delete, then verify
     * all non-targeted records remain unchanged.
     */
    test("delete(id) does not mutate records with a different id", () => {
        fc.assert(
            fc.property(
                // Arbitrary number of extra records to create (0–10)
                fc.integer({ min: 0, max: 10 }),
                (extraCount) => {
                    // Reset store to a clean seeded state before each run
                    __resetStore();

                    // Grab current seed records
                    const all = setoranStore.getAll();

                    // Pick the first record as deletion target (always exists — 300 seed records)
                    const target = all[0];

                    // Optionally add extra records so there's something to compare besides seed
                    const extra: SetoranRecord[] = [];
                    for (let i = 0; i < extraCount; i++) {
                        const r = makeRecord({ id: `extra-${i}` });
                        setoranStore.create(r);
                        extra.push(r);
                    }

                    // Snapshot all non-targeted records
                    const before = setoranStore
                        .getAll()
                        .filter((r) => r.id !== target.id);

                    // Delete the target
                    setoranStore.delete(target.id);

                    // Verify non-targeted records are unchanged
                    const after = setoranStore.getAll();

                    for (const snap of before) {
                        const found = after.find((r) => r.id === snap.id);
                        if (!found) return false; // record disappeared
                        // All fields must match
                        if (JSON.stringify(found) !== JSON.stringify(snap)) return false;
                    }

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });

    /**
     * **Validates: Requirements 7.3, 7.4, 14.2, 14.5**
     *
     * update(id, payload) must not mutate any record with a different id.
     * Snapshot getAll() (excluding the target), then update, then verify
     * all non-targeted records are unchanged.
     */
    test("update(id, payload) does not mutate records with a different id", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 10 }),
                (extraCount) => {
                    __resetStore();

                    const all = setoranStore.getAll();
                    const target = all[0];

                    for (let i = 0; i < extraCount; i++) {
                        setoranStore.create(makeRecord({ id: `extra-${i}` }));
                    }

                    // Snapshot non-targeted records
                    const before = setoranStore
                        .getAll()
                        .filter((r) => r.id !== target.id);

                    // Update target with a modified record
                    const updatedTarget: SetoranRecord = {
                        ...target,
                        namaSalesman: "Updated Name",
                        setoranKasir: "18:00",
                        durasiSeconds: 7200,
                        durasi: "02:00:00",
                        status: "Slow",
                    };
                    setoranStore.update(target.id, updatedTarget);

                    // Verify non-targeted records are unchanged
                    const after = setoranStore.getAll();

                    for (const snap of before) {
                        const found = after.find((r) => r.id === snap.id);
                        if (!found) return false;
                        if (JSON.stringify(found) !== JSON.stringify(snap)) return false;
                    }

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });
});

// ─── Task 2.3 — Unit tests for store CRUD operations ─────────────────────────
// Requirements: 7.1, 7.2, 7.3, 7.4

describe("setoranStore CRUD unit tests", () => {
    beforeEach(() => __resetStore());

    // 1. getAll returns seeded records
    test("getAll returns seeded records (length > 0, all elements have .id)", () => {
        const records = setoranStore.getAll();
        expect(records.length).toBeGreaterThan(0);
        for (const r of records) {
            expect(r.id).toBeDefined();
            expect(typeof r.id).toBe("string");
            expect(r.id.length).toBeGreaterThan(0);
        }
    });

    // 2. create increases getAll().length by 1 and getById returns the new record
    test("create increases getAll().length by 1 and getById returns the new record", () => {
        const before = setoranStore.getAll().length;

        const newRecord = makeRecord({ id: "unit-test-create-id" });
        setoranStore.create(newRecord);

        const after = setoranStore.getAll().length;
        expect(after).toBe(before + 1);

        const fetched = setoranStore.getById("unit-test-create-id");
        expect(fetched).toBeDefined();
        expect(fetched?.id).toBe("unit-test-create-id");
        expect(fetched?.namaSalesman).toBe(newRecord.namaSalesman);
    });

    // 3. update replaces the targeted record and getById reflects the change
    test("update replaces the targeted record's fields and getById reflects the change", () => {
        const original = makeRecord({ id: "unit-test-update-id" });
        setoranStore.create(original);

        const updated: SetoranRecord = {
            ...original,
            namaSalesman: "Updated Salesman",
            setoranKasir: "18:30",
            durasiSeconds: 9000,
            durasi: "02:30:00",
            status: "Slow",
        };
        const result = setoranStore.update("unit-test-update-id", updated);

        expect(result).not.toBeNull();
        const fetched = setoranStore.getById("unit-test-update-id");
        expect(fetched?.namaSalesman).toBe("Updated Salesman");
        expect(fetched?.setoranKasir).toBe("18:30");
        expect(fetched?.durasiSeconds).toBe(9000);
    });

    // 4. delete removes the record and getById returns undefined
    test("delete removes the record and getById returns undefined", () => {
        const record = makeRecord({ id: "unit-test-delete-id" });
        setoranStore.create(record);

        // Confirm it exists
        expect(setoranStore.getById("unit-test-delete-id")).toBeDefined();

        setoranStore.delete("unit-test-delete-id");

        expect(setoranStore.getById("unit-test-delete-id")).toBeUndefined();
    });

    // 5. delete returns false for an unknown id
    test("delete returns false for unknown id", () => {
        const result = setoranStore.delete("non-existent-id-xyz");
        expect(result).toBe(false);
    });
});
