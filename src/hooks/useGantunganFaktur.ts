"use client";

/**
 * useGantunganFaktur — Data hook for Gantungan Faktur page.
 * Owns sort, search, pagination state.
 * Returns paginated records + summary counts.
 */

import { useState, useMemo, useCallback } from "react";
import type { FakturRecord, FakturSort, FakturSortKey } from "@/types/gantunganFaktur";
import { fakturRecords } from "@/mock/gantunganFaktur";

function applySort(records: FakturRecord[], sort: FakturSort | null): FakturRecord[] {
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

function applySearch(records: FakturRecord[], q: string): FakturRecord[] {
    if (!q.trim()) return records;
    const lq = q.toLowerCase();
    return records.filter(
        (r) =>
            r.vendor.toLowerCase().includes(lq) ||
            r.nomorInvoice.toLowerCase().includes(lq) ||
            r.nomorFaktur.toLowerCase().includes(lq) ||
            r.nomorDO.toLowerCase().includes(lq) ||
            r.nomorPolisi.toLowerCase().includes(lq) ||
            r.plant.toLowerCase().includes(lq) ||
            r.status.toLowerCase().includes(lq)
    );
}

export function useGantunganFaktur() {
    const [sort, setSort] = useState<FakturSort | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applySearch(applySort(fakturRecords, sort), search),
        [sort, search]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: FakturSortKey) => {
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
