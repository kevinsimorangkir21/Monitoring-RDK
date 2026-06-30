/**
 * setoranStore.ts
 *
 * Server-side in-memory store for SetoranRecord data.
 * Starts empty — records are populated exclusively via the POST /api/setoran
 * endpoint (CRUD operations). No mock seeding is performed.
 *
 * In production the Node.js module cache persists for the lifetime of the
 * process — sufficient for an in-memory prototype.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import type { SetoranRecord } from "@/types/setoran";

// ─── Module-level store ───────────────────────────────────────────────────────

let _store: Map<string, SetoranRecord> | null = null;

/**
 * Returns the singleton store Map.
 * Initialised as an empty Map on first call — no mock seeding.
 */
function getStore(): Map<string, SetoranRecord> {
    if (!_store) {
        _store = new Map();
    }
    return _store;
}

// ─── Public store API ─────────────────────────────────────────────────────────

export const setoranStore = {
    /** Return a snapshot of all records as an array. */
    getAll: (): SetoranRecord[] => [...getStore().values()],

    /** Look up a single record by id. Returns undefined if not found. */
    getById: (id: string): SetoranRecord | undefined => getStore().get(id),

    /** Persist a new record. The caller is responsible for supplying a unique id. */
    create: (record: SetoranRecord): SetoranRecord => {
        getStore().set(record.id, record);
        return record;
    },

    /**
     * Replace an existing record.
     * Returns the updated record, or null if the id does not exist.
     */
    update: (id: string, record: SetoranRecord): SetoranRecord | null => {
        if (!getStore().has(id)) return null;
        getStore().set(id, record);
        return record;
    },

    /**
     * Remove a record by id.
     * Returns true if the record existed and was deleted, false otherwise.
     */
    delete: (id: string): boolean => getStore().delete(id),
};

// ─── Test utility ─────────────────────────────────────────────────────────────

/**
 * Reset the lazy store back to null so the next call to any store method
 * re-seeds from the generator. Use this in tests to ensure isolation.
 */
export function __resetStore(): void {
    _store = null;
}
