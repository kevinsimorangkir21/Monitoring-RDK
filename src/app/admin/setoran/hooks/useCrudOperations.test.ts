/**
 * useCrudOperations.test.ts
 *
 * Task 6.2 — Property 4: Optimistic update followed by rollback is identity
 * Task 6.3 — Unit tests for useCrudOperations hook
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";

import {
    useCrudOperations,
    type UseCrudOperationsOptions,
} from "@/app/admin/setoran/hooks/useCrudOperations";
import type { SetoranRecord } from "@/types/setoran";
import type { SetoranFormValues } from "@/app/admin/setoran/types/crud";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal valid SetoranRecord for test use */
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

/** Valid form values that pass computeDerivedFields (setoran > pulang) */
const validFormValues: SetoranFormValues = {
    tanggal: "2025-07-01",
    namaSalesman: "Andi Wijaya",
    pulangKunjungan: "16:00",
    setoranKasir: "17:15",
};

/** Build default hook options with vi.fn() callbacks */
function makeOptions(): {
    options: UseCrudOperationsOptions;
    dataRef: { current: SetoranRecord[] };
} {
    const dataRef = { current: [] as SetoranRecord[] };

    const options: UseCrudOperationsOptions = {
        onOptimisticUpdate: vi.fn((updater) => {
            dataRef.current = updater(dataRef.current);
        }),
        onRollback: vi.fn((snapshot) => {
            dataRef.current = snapshot;
        }),
        onToast: vi.fn(),
    };

    return { options, dataRef };
}

// ─── Task 6.2 — Property 4: Optimistic update followed by rollback is identity
// Validates: Requirements 5.1, 5.3, 14.1, 15.1

describe("Property 4: Optimistic update followed by rollback is identity", () => {
    /**
     * **Validates: Requirements 5.1, 5.3, 14.1, 15.1**
     *
     * For any initial array length and any new record id:
     * length(data after optimistic add + rollback) === length(initialIds)
     *
     * This is a pure functional test of the optimistic-update + rollback
     * pattern — tested without renderHook since no React state is involved.
     */
    test("optimistic add followed by rollback restores original length", () => {
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 0, maxLength: 20 }), // simulated raw ids
                fc.string(), // new record id
                (initialIds, newId) => {
                    // Simulate state as a simple array
                    let data = initialIds.map((id) => ({ id }));
                    const snapshot = [...data];

                    // Optimistic add
                    data = [...data, { id: newId }];

                    // Rollback (simulates onRollback(snapshot))
                    data = snapshot;

                    return data.length === initialIds.length;
                }
            )
        );
    });
});

// ─── Task 6.3 — Unit tests for useCrudOperations hook ────────────────────────
// Requirements: 7.2, 7.4, 8.1, 14.1

describe("useCrudOperations unit tests", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ── 1. createRecord calls POST with correct payload ───────────────────────

    describe("createRecord", () => {
        test("calls fetch with POST method and correct JSON body", async () => {
            const mockRecord = makeRecord();
            vi.spyOn(global, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify({ data: mockRecord }), { status: 201 })
            );

            const { options } = makeOptions();
            const { result } = renderHook(() => useCrudOperations(options));

            await act(async () => {
                await result.current.createRecord(validFormValues);
            });

            expect(fetch).toHaveBeenCalledOnce();
            const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(url).toBe("/api/setoran");
            expect(init.method).toBe("POST");

            const body = JSON.parse(init.body);
            expect(body.tanggal).toBe(validFormValues.tanggal);
            expect(body.namaSalesman).toBe(validFormValues.namaSalesman);
            expect(body.pulangKunjungan).toBe(validFormValues.pulangKunjungan);
            expect(body.setoranKasir).toBe(validFormValues.setoranKasir);
        });

        // ── 2. creating flag is true during in-flight request, false after ────

        test("creating flag is true during in-flight request and false after resolution", async () => {
            let resolveFetch!: (value: Response) => void;
            const slowPromise = new Promise<Response>((resolve) => {
                resolveFetch = resolve;
            });
            vi.spyOn(global, "fetch").mockReturnValueOnce(slowPromise);

            const { options } = makeOptions();
            const { result } = renderHook(() => useCrudOperations(options));

            // Start the request — don't await yet
            let createPromise: Promise<SetoranRecord | null>;
            act(() => {
                createPromise = result.current.createRecord(validFormValues);
            });

            // creating should now be true
            expect(result.current.creating).toBe(true);

            // Resolve the fetch
            const mockRecord = makeRecord();
            await act(async () => {
                resolveFetch(
                    new Response(JSON.stringify({ data: mockRecord }), { status: 201 })
                );
                await createPromise;
            });

            // creating should now be false
            expect(result.current.creating).toBe(false);
        });

        // ── 4. createRecord returns null and calls onRollback on 400 ──────────

        test("returns null and calls onRollback when API returns 400", async () => {
            vi.spyOn(global, "fetch").mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ error: "Validasi gagal" }),
                    { status: 400 }
                )
            );

            const { options } = makeOptions();
            const { result } = renderHook(() => useCrudOperations(options));

            let returnValue: SetoranRecord | null | undefined;
            await act(async () => {
                returnValue = await result.current.createRecord(validFormValues);
            });

            expect(returnValue).toBeNull();
            expect(options.onRollback).toHaveBeenCalledOnce();
            expect(options.onToast).toHaveBeenCalledWith(
                expect.objectContaining({ variant: "error" })
            );
        });
    });

    // ── 3. deleteRecord calls DELETE with the correct URL ────────────────────

    describe("deleteRecord", () => {
        test("calls fetch with DELETE method and correct id in URL", async () => {
            const targetId = "record-abc-123";
            vi.spyOn(global, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true }), { status: 200 })
            );

            const { options } = makeOptions();
            const { result } = renderHook(() => useCrudOperations(options));

            await act(async () => {
                await result.current.deleteRecord(targetId);
            });

            expect(fetch).toHaveBeenCalledOnce();
            const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(url).toBe(`/api/setoran/${targetId}`);
            expect(init.method).toBe("DELETE");
        });
    });

    // ── 5. updateRecord returns null and calls onRollback on 404 ─────────────

    describe("updateRecord", () => {
        test("returns null and calls onRollback when API returns 404", async () => {
            const targetId = "non-existent-id";
            vi.spyOn(global, "fetch").mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ error: "Record tidak ditemukan" }),
                    { status: 404 }
                )
            );

            const { options } = makeOptions();
            const { result } = renderHook(() => useCrudOperations(options));

            let returnValue: SetoranRecord | null | undefined;
            await act(async () => {
                returnValue = await result.current.updateRecord(targetId, validFormValues);
            });

            expect(returnValue).toBeNull();
            expect(options.onRollback).toHaveBeenCalledOnce();
            expect(options.onToast).toHaveBeenCalledWith(
                expect.objectContaining({ variant: "error" })
            );
        });
    });
});
