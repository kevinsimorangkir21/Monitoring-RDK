"use client";

/**
 * useClaimVendor — Data hook for Claim Vendor page.
 * Owns sort, search, pagination state.
 * Returns paginated records + summary counts.
 */

import { useState, useMemo, useCallback } from "react";
import type { ClaimRecord, ClaimSort, ClaimSortKey } from "@/types/claimVendor";
import { claimRecords } from "@/mock/claimVendor";

function applySort(records: ClaimRecord[], sort: ClaimSort | null): ClaimRecord[] {
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

function applySearch(records: ClaimRecord[], q: string): ClaimRecord[] {
    if (!q.trim()) return records;
    const lq = q.toLowerCase();
    return records.filter(
        (r) =>
            r.nomorClaim.toLowerCase().includes(lq) ||
            r.vendor.toLowerCase().includes(lq) ||
            r.invoice.toLowerCase().includes(lq) ||
            r.kategori.toLowerCase().includes(lq) ||
            r.pic.toLowerCase().includes(lq) ||
            r.status.toLowerCase().includes(lq)
    );
}

export function useClaimVendor() {
    const [sort, setSort] = useState<ClaimSort | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applySearch(applySort(claimRecords, sort), search),
        [sort, search]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: ClaimSortKey) => {
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
