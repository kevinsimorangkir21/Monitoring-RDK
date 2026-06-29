"use client";

/**
 * useOutboundData — Data hook for Outbound Monitoring.
 * Owns sort, search and pagination state.
 * Filters live in the sidebar — not here.
 */

import { useState, useMemo, useCallback } from "react";
import type { OutboundRecord, OutboundSortState, OutboundSortKey } from "@/types/outbound";
import { outboundRecords } from "@/mock/outbound";

// ─── Sort ──────────────────────────────────────────────────────────────────────

function applySort(
    records: OutboundRecord[],
    sort: OutboundSortState | null
): OutboundRecord[] {
    if (!sort) return records;
    return [...records].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp = String(av).localeCompare(String(bv));
        return sort.direction === "asc" ? cmp : -cmp;
    });
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useOutboundData() {
    const [sort, setSort] = useState<OutboundSortState | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const processed = useMemo(() => {
        const sorted = applySort(outboundRecords, sort);
        if (!search.trim()) return sorted;
        const q = search.toLowerCase();
        return sorted.filter(
            (r) =>
                r.freightOrder.toLowerCase().includes(q) ||
                r.mobilMuat.toLowerCase().includes(q) ||
                r.sType.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q) ||
                r.gate.toLowerCase().includes(q) ||
                r.driver.toLowerCase().includes(q)
        );
    }, [sort, search]);

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: OutboundSortKey) => {
        setSort((prev) =>
            prev?.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
        setPage(1);
    }, []);

    const handleSearchChange = useCallback((q: string) => {
        setSearch(q);
        setPage(1);
    }, []);

    return {
        paginated,
        totalRecords: processed.length,
        page: safePage,
        pageSize,
        totalPages,
        sort,
        search,
        setPage,
        setPageSize,
        handleSort,
        handleSearchChange,
    };
}
