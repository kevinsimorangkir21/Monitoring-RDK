"use client";

/**
 * useCrudOperations — Hook encapsulating create/update/delete with optimistic
 * updates, API calls, and rollback on failure.
 *
 * The hook is intentionally "dumb" about where rawData lives — it accepts
 * two callbacks from the parent (SetoranPage):
 *   - onOptimisticUpdate: apply a functional update to the data array
 *   - onRollback: restore the data array to a prior snapshot
 *
 * This keeps SetoranPage as the single owner of rawData while the hook
 * drives the async lifecycle and toast dispatch.
 *
 * Requirements: 1.1, 2.1, 3.1, 4.1, 15.1
 */

import { useState, useCallback, useRef } from "react";

import { computeDerivedFields } from "@/lib/setoranCalculations";
import type { SetoranRecord } from "@/types/setoran";
import type {
    SetoranFormValues,
    ToastMessage,
    UseCrudOperationsReturn,
    SetoranDataResponse,
    SetoranErrorResponse,
} from "@/app/admin/setoran/types/crud";

// ─── Options injected from the parent ────────────────────────────────────────

export interface UseCrudOperationsOptions {
    /** Apply a functional update to the rawData array (used for optimistic changes) */
    onOptimisticUpdate: (updater: (prev: SetoranRecord[]) => SetoranRecord[]) => void;
    /** Restore the rawData array to a prior snapshot on failure */
    onRollback: (prev: SetoranRecord[]) => void;
    /** Push a toast notification (id is assigned inside the hook) */
    onToast: (toast: Omit<ToastMessage, "id">) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useCrudOperations
 *
 * Requirements: 1.1, 2.1, 3.1, 4.1, 15.1
 */
export function useCrudOperations(
    options: UseCrudOperationsOptions
): UseCrudOperationsReturn {
    const { onOptimisticUpdate, onRollback, onToast } = options;

    // Per-operation loading flags
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Snapshot ref — stores the data array at the point of the optimistic update
    // so we can roll back without an extra closure capture.
    const snapshotRef = useRef<SetoranRecord[]>([]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Capture the current data array so we can roll back if the request fails. */
    function captureSnapshot(current: SetoranRecord[]) {
        snapshotRef.current = current;
    }

    /** Emit a toast with a generated id. */
    const emitToast = useCallback(
        (toast: Omit<ToastMessage, "id">) => {
            onToast(toast);
        },
        [onToast]
    );

    /**
     * Extract a human-readable error string from an API response.
     * Falls back to the fetch error message when the body isn't JSON.
     */
    async function extractErrorMessage(res: Response): Promise<string> {
        try {
            const body = (await res.json()) as Partial<SetoranErrorResponse>;
            return body.error ?? `Terjadi kesalahan (HTTP ${res.status})`;
        } catch {
            return `Terjadi kesalahan (HTTP ${res.status})`;
        }
    }

    // ── createRecord ──────────────────────────────────────────────────────────

    const createRecord = useCallback(
        async (values: SetoranFormValues): Promise<SetoranRecord | null> => {
            // 1. Compute derived fields — bail early when the input is invalid
            const derived = computeDerivedFields(
                values.tanggal,
                values.pulangKunjungan,
                values.setoranKasir
            );
            if (!derived) return null;

            // 2. Build the optimistic record with a temporary client-side id
            const optimisticId = crypto.randomUUID();
            const optimisticRecord: SetoranRecord = {
                id: optimisticId,
                tanggal: values.tanggal,
                namaSalesman: values.namaSalesman,
                pulangKunjungan: values.pulangKunjungan,
                setoranKasir: values.setoranKasir,
                durasiSeconds: derived.durasiSeconds,
                durasi: derived.durasi,
                status: derived.status,
                bulan: derived.bulan,
                waktuPulang: derived.waktuPulang,
                waktuSetoran: derived.waktuSetoran,
            };

            // 3. Snapshot current data & apply optimistic add
            onOptimisticUpdate((prev) => {
                captureSnapshot(prev);
                return [...prev, optimisticRecord];
            });

            setCreating(true);
            try {
                // 4. Call the API
                const res = await fetch("/api/setoran", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tanggal: values.tanggal,
                        namaSalesman: values.namaSalesman,
                        pulangKunjungan: values.pulangKunjungan,
                        setoranKasir: values.setoranKasir,
                    }),
                });

                if (res.status === 201) {
                    // 5. Replace optimistic record with the server record
                    const body = (await res.json()) as SetoranDataResponse;
                    const serverRecord = body.data;
                    onOptimisticUpdate((prev) =>
                        prev.map((r) => (r.id === optimisticId ? serverRecord : r))
                    );
                    emitToast({ variant: "success", message: "Data berhasil ditambahkan." });
                    return serverRecord;
                }

                // API returned an error
                const errorMsg = await extractErrorMessage(res);
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return null;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return null;
            } finally {
                setCreating(false);
            }
        },
        [onOptimisticUpdate, onRollback, emitToast]
    );

    // ── updateRecord ──────────────────────────────────────────────────────────

    const updateRecord = useCallback(
        async (
            id: string,
            values: SetoranFormValues
        ): Promise<SetoranRecord | null> => {
            // 1. Compute derived fields
            const derived = computeDerivedFields(
                values.tanggal,
                values.pulangKunjungan,
                values.setoranKasir
            );
            if (!derived) return null;

            // 2. Build the optimistic updated record
            const optimisticRecord: SetoranRecord = {
                id,
                tanggal: values.tanggal,
                namaSalesman: values.namaSalesman,
                pulangKunjungan: values.pulangKunjungan,
                setoranKasir: values.setoranKasir,
                durasiSeconds: derived.durasiSeconds,
                durasi: derived.durasi,
                status: derived.status,
                bulan: derived.bulan,
                waktuPulang: derived.waktuPulang,
                waktuSetoran: derived.waktuSetoran,
            };

            // 3. Snapshot + optimistic replace
            onOptimisticUpdate((prev) => {
                captureSnapshot(prev);
                return prev.map((r) => (r.id === id ? optimisticRecord : r));
            });

            setUpdating(true);
            try {
                // 4. Call the API
                const res = await fetch(`/api/setoran/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tanggal: values.tanggal,
                        namaSalesman: values.namaSalesman,
                        pulangKunjungan: values.pulangKunjungan,
                        setoranKasir: values.setoranKasir,
                    }),
                });

                if (res.status === 200) {
                    // 5. Reconcile with server record
                    const body = (await res.json()) as SetoranDataResponse;
                    const serverRecord = body.data;
                    onOptimisticUpdate((prev) =>
                        prev.map((r) => (r.id === id ? serverRecord : r))
                    );
                    emitToast({ variant: "success", message: "Data berhasil diperbarui." });
                    return serverRecord;
                }

                const errorMsg = await extractErrorMessage(res);
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return null;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return null;
            } finally {
                setUpdating(false);
            }
        },
        [onOptimisticUpdate, onRollback, emitToast]
    );

    // ── deleteRecord ──────────────────────────────────────────────────────────

    const deleteRecord = useCallback(
        async (id: string): Promise<boolean> => {
            // 1. Snapshot + optimistic removal
            onOptimisticUpdate((prev) => {
                captureSnapshot(prev);
                return prev.filter((r) => r.id !== id);
            });

            setDeleting(true);
            try {
                // 2. Call the API
                const res = await fetch(`/api/setoran/${id}`, {
                    method: "DELETE",
                });

                if (res.status === 200) {
                    emitToast({ variant: "success", message: "Data berhasil dihapus." });
                    return true;
                }

                const errorMsg = await extractErrorMessage(res);
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return false;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
                onRollback(snapshotRef.current);
                emitToast({ variant: "error", message: errorMsg });
                return false;
            } finally {
                setDeleting(false);
            }
        },
        [onOptimisticUpdate, onRollback, emitToast]
    );

    // ── Return ────────────────────────────────────────────────────────────────

    return {
        creating,
        updating,
        deleting,
        createRecord,
        updateRecord,
        deleteRecord,
    };
}
