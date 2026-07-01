/**
 * filters.ts — Pure filter logic for the Outbound module.
 *
 * Filters:
 *   - dateRange: ISO string comparison on "YYYY-MM-DD" tanggal field
 *   - selectedStatus: "Muat Pagi" | "Muat Inap"
 *   - searchQuery: case-insensitive substring match on freightOrder OR mobilMuat
 */

import type { OutboundRecord, OutboundFilters } from "./types";

// ─── Default filter state ─────────────────────────────────────────────────────

export const DEFAULT_FILTERS: OutboundFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedStatus: [],
    searchQuery: "",
};

// ─── applyFilters ─────────────────────────────────────────────────────────────

/**
 * Pure function — applies all active OutboundFilters to a data array.
 *
 * @param data    Full or partial array of OutboundRecord
 * @param filters Current filter state
 * @returns       Subset of data that satisfies every active filter
 */
export function applyFilters(
    data: OutboundRecord[],
    filters: OutboundFilters
): OutboundRecord[] {
    return data.filter((r) => {
        // ── Date range ─────────────────────────────────────────────────────────
        if (filters.dateRange.startDate && r.tanggal < filters.dateRange.startDate)
            return false;
        if (filters.dateRange.endDate && r.tanggal > filters.dateRange.endDate)
            return false;

        // ── Status filter ──────────────────────────────────────────────────────
        if (filters.selectedStatus.length > 0 && !filters.selectedStatus.includes(r.status))
            return false;

        // ── Free-text search (freightOrder OR mobilMuat, case-insensitive) ─────
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            if (
                !r.freightOrder.toLowerCase().includes(q) &&
                !r.mobilMuat.toLowerCase().includes(q)
            )
                return false;
        }

        return true;
    });
}
