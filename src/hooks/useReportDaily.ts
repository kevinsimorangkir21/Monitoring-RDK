"use client";

/**
 * useReportDaily — Data hook for the Report Daily page.
 * Owns: active tab, sort, search, pagination per tab.
 * Filters stay in the sidebar.
 */

import { useState, useMemo, useCallback } from "react";
import type {
    ReportDailyTab,
    DailyRecord,
    DailyRecordSort,
    DailyRecordSortKey,
} from "@/types/reportDaily";
import {
    transportRecords,
    warehouseFGRecords,
    warehouseBSRecords,
} from "@/mock/reportDaily";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortRecords(records: DailyRecord[], sort: DailyRecordSort | null) {
    if (!sort) return records;
    return [...records].sort((a, b) => {
        const cmp = String(a[sort.key]).localeCompare(String(b[sort.key]));
        return sort.direction === "asc" ? cmp : -cmp;
    });
}

function searchRecords(records: DailyRecord[], q: string) {
    if (!q.trim()) return records;
    const lq = q.toLowerCase();
    return records.filter(
        (r) =>
            r.division.toLowerCase().includes(lq) ||
            r.jenisReport.toLowerCase().includes(lq) ||
            r.keterangan.toLowerCase().includes(lq) ||
            r.informasiTambahan.toLowerCase().includes(lq)
    );
}

// ─── Records map ──────────────────────────────────────────────────────────────

const RECORDS: Record<ReportDailyTab, DailyRecord[]> = {
    "transport": transportRecords,
    "warehouse-fg": warehouseFGRecords,
    "warehouse-bs": warehouseBSRecords,
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useReportDaily() {
    const [activeTab, setActiveTab] = useState<ReportDailyTab>("transport");
    const [sort, setSort] = useState<DailyRecordSort | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset page + sort + search when switching tabs
    const handleTabChange = useCallback((tab: ReportDailyTab) => {
        setActiveTab(tab);
        setPage(1);
        setSort(null);
        setSearch("");
    }, []);

    const handleSort = useCallback((key: DailyRecordSortKey) => {
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

    const processed = useMemo(() => {
        const base = RECORDS[activeTab];
        return searchRecords(sortRecords(base, sort), search);
    }, [activeTab, sort, search]);

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    return {
        activeTab,
        handleTabChange,
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
