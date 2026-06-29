"use client";

/**
 * useSetoran — Data hook for Setoran ke Kasir page.
 * Owns sort, search, filter, pagination state.
 */

import { useState, useMemo, useCallback } from "react";
import type { SetoranRecord, SetoranSort, SetoranSortKey, SetoranFilter } from "@/types/setoran";
import { setoranRecords } from "@/mock/setoran";

function applySort(records: SetoranRecord[], sort: SetoranSort | null): SetoranRecord[] {
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

function applyFilter(records: SetoranRecord[], filter: SetoranFilter): SetoranRecord[] {
    return records.filter((r) => {
        const matchSearch = !filter.search.trim() ||
            r.namaSalesman.toLowerCase().includes(filter.search.toLowerCase());
        const matchBulan = !filter.bulan || r.bulan === filter.bulan;
        const matchTgl = !filter.tanggal || r.tanggal === filter.tanggal;
        return matchSearch && matchBulan && matchTgl;
    });
}

export function useSetoran() {
    const [sort, setSort] = useState<SetoranSort | null>(null);
    const [filter, setFilter] = useState<SetoranFilter>({ search: "", bulan: "", tanggal: "" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applyFilter(applySort(setoranRecords, sort), filter),
        [sort, filter]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: SetoranSortKey) => {
        setSort((prev) =>
            prev?.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
        setPage(1);
    }, []);

    const handleFilterChange = useCallback((patch: Partial<SetoranFilter>) => {
        setFilter((prev) => ({ ...prev, ...patch }));
        setPage(1);
    }, []);

    return {
        paginated,
        totalRecords: processed.length,
        page: safePage,
        pageSize,
        totalPages,
        sort,
        filter,
        setPage,
        setPageSize,
        handleSort,
        handleFilterChange,
    };
}
