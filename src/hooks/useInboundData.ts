"use client";

/**
 * useInboundData — Custom hook that owns filter + sort state and derived data.
 * Centralises all data logic so components stay presentational.
 */

import { useState, useMemo, useCallback } from "react";
import type { FilterState, SortState, InboundRecord } from "@/types/inbound";
import { EMPTY_FILTER } from "@/types/inbound";
import { inboundRecords } from "@/mock/inbound";

// ─── Filter predicate ─────────────────────────────────────────────────────────

function applyFilters(records: InboundRecord[], f: FilterState): InboundRecord[] {
    return records.filter((r) => {
        const date = r.tanggal.slice(0, 10);
        if (f.dateFrom && date < f.dateFrom) return false;
        if (f.dateTo && date > f.dateTo) return false;
        if (f.plant && r.plant !== f.plant) return false;
        if (f.supplier && r.supplier !== f.supplier) return false;
        if (f.jenisBongkaran && r.jenisBongkaran !== f.jenisBongkaran) return false;
        if (f.nomorFO && !r.nomorFO.toLowerCase().includes(f.nomorFO.toLowerCase())) return false;
        if (f.noPolisi && !r.noPolisi.toLowerCase().includes(f.noPolisi.toLowerCase())) return false;
        if (f.status && r.status !== f.status) return false;
        return true;
    });
}

// ─── Sort comparator ──────────────────────────────────────────────────────────

function applySort(records: InboundRecord[], sort: SortState | null): InboundRecord[] {
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInboundData() {
    const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
    const [sort, setSort] = useState<SortState | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    /** All records after filter (used for charts/summary too) */
    const filtered = useMemo(
        () => applyFilters(inboundRecords, filters),
        [filters]
    );

    /** Filtered + sorted, then searched */
    const processed = useMemo(() => {
        const sorted = applySort(filtered, sort);
        if (!search.trim()) return sorted;
        const q = search.toLowerCase();
        return sorted.filter(
            (r) =>
                r.nomorFO.toLowerCase().includes(q) ||
                r.noPolisi.toLowerCase().includes(q) ||
                r.plant.toLowerCase().includes(q) ||
                r.supplier.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q) ||
                r.driver.toLowerCase().includes(q)
        );
    }, [filtered, sort, search]);

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSearch = useCallback((f: FilterState) => {
        setFilters(f);
        setPage(1);
    }, []);

    const handleReset = useCallback(() => {
        setFilters(EMPTY_FILTER);
        setSort(null);
        setSearch("");
        setPage(1);
    }, []);

    const handleSort = useCallback((key: SortState["key"]) => {
        setSort((prev) =>
            prev?.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
        setPage(1);
    }, []);

    const handleTableSearch = useCallback((q: string) => {
        setSearch(q);
        setPage(1);
    }, []);

    return {
        // data
        allRecords: inboundRecords,
        filtered,
        paginated,
        totalRecords: processed.length,
        // pagination
        page: safePage,
        pageSize,
        totalPages,
        setPage,
        setPageSize,
        // sort
        sort,
        handleSort,
        // search
        search,
        handleTableSearch,
        // filter
        filters,
        handleSearch,
        handleReset,
    };
}
