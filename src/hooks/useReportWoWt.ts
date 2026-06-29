"use client";

/**
 * useReportWoWt — Data hook for Report WO-WT page.
 * Owns sort, search, pagination state.
 */

import { useState, useMemo, useCallback } from "react";
import type { WavepickRecord, WavepickSort, WavepickSortKey } from "@/types/reportWoWt";
import { wavepickRecords } from "@/mock/reportWoWt";

function applySort(records: WavepickRecord[], sort: WavepickSort | null): WavepickRecord[] {
    if (!sort) return records;
    return [...records].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp =
            typeof av === "number" && typeof bv === "number"
                ? av - bv
                : String(av).localeCompare(String(bv));
        return sort.direction === "asc" ? cmp : -cmp;
    });
}

function applySearch(records: WavepickRecord[], q: string): WavepickRecord[] {
    if (!q.trim()) return records;
    const lq = q.toLowerCase();
    return records.filter(
        (r) =>
            r.wavepick.toLowerCase().includes(lq) ||
            r.operator.toLowerCase().includes(lq) ||
            r.shift.toLowerCase().includes(lq) ||
            r.status.toLowerCase().includes(lq) ||
            r.date.toLowerCase().includes(lq)
    );
}

export function useReportWoWt() {
    const [sort, setSort] = useState<WavepickSort | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applySearch(applySort(wavepickRecords, sort), search),
        [sort, search]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: WavepickSortKey) => {
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
