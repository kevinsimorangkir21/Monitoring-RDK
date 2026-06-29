"use client";

/**
 * useScanOutDC — Data hook for Scan Out DC page.
 * Owns sort, search, pagination, and selected-record state.
 * Filters live in the sidebar.
 */

import { useState, useMemo, useCallback } from "react";
import type { ScanOutRecord, ScanOutSort, ScanOutSortKey } from "@/types/scanOutDC";
import { scanOutRecords } from "@/mock/scanOutDC";

function applySort(records: ScanOutRecord[], sort: ScanOutSort | null) {
    if (!sort) return records;
    return [...records].sort((a, b) => {
        const cmp = String(a[sort.key]).localeCompare(String(b[sort.key]));
        return sort.direction === "asc" ? cmp : -cmp;
    });
}

function applySearch(records: ScanOutRecord[], q: string) {
    if (!q.trim()) return records;
    const lq = q.toLowerCase();
    return records.filter(
        (r) =>
            r.nomorFO.toLowerCase().includes(lq) ||
            r.nomorDO.toLowerCase().includes(lq) ||
            r.nomorPolisi.toLowerCase().includes(lq) ||
            r.distributionCenter.toLowerCase().includes(lq) ||
            r.driver.toLowerCase().includes(lq) ||
            r.status.toLowerCase().includes(lq)
    );
}

export function useScanOutDC() {
    const [sort, setSort] = useState<ScanOutSort | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applySearch(applySort(scanOutRecords, sort), search),
        [sort, search]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: ScanOutSortKey) => {
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
