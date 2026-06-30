"use client";

/**
 * useSetoran — Data hook for Setoran ke Kasir page.
 * Owns sort, filter (search | bulan | tanggal | dateFrom | dateTo), pagination.
 * Also derives all chart data from the filtered record set.
 */

import { useState, useMemo, useCallback } from "react";
import type {
    SetoranRecord,
    SetoranSort,
    SetoranSortKey,
    SetoranFilter,
    DailyAverageItem,
    SalesmanAvgItem,
    DistribusiItem,
} from "@/types/setoran";
import { setoranRecords } from "@/mock/setoran";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
        if (filter.search.trim() && !r.namaSalesman.toLowerCase().includes(filter.search.toLowerCase())) return false;
        if (filter.bulan && r.bulan !== filter.bulan) return false;
        if (filter.tanggal && r.tanggal !== filter.tanggal) return false;
        if (filter.dateFrom && r.tanggal < filter.dateFrom) return false;
        if (filter.dateTo && r.tanggal > filter.dateTo) return false;
        return true;
    });
}

function shortDate(iso: string): string {
    try {
        const [, mm, dd] = iso.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        return `${parseInt(dd)} ${months[parseInt(mm) - 1] ?? mm}`;
    } catch { return iso; }
}

function fmtMinutes(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m} menit`;
}

// ─── Derived chart computations (all O(n)) ────────────────────────────────────

function computeDailyAverage(records: SetoranRecord[]): DailyAverageItem[] {
    const map = new Map<string, { total: number; count: number }>();
    for (const r of records) {
        const existing = map.get(r.tanggal) ?? { total: 0, count: 0 };
        map.set(r.tanggal, { total: existing.total + r.durasiSeconds, count: existing.count + 1 });
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, { total, count }]) => ({
            tanggal,
            tanggalLabel: shortDate(tanggal),
            avgMinutes: +((total / count) / 60).toFixed(1),
        }));
}

function computeSalesmanAvg(records: SetoranRecord[]): Map<string, { total: number; count: number }> {
    const map = new Map<string, { total: number; count: number }>();
    for (const r of records) {
        const e = map.get(r.namaSalesman) ?? { total: 0, count: 0 };
        map.set(r.namaSalesman, { total: e.total + r.durasiSeconds, count: e.count + 1 });
    }
    return map;
}

function computeTop10(
    salesmanMap: Map<string, { total: number; count: number }>,
    order: "desc" | "asc",
    limit = 10
): SalesmanAvgItem[] {
    return [...salesmanMap.entries()]
        .map(([salesman, { total, count }]) => {
            const avgSec = total / count;
            const avgMin = +(avgSec / 60).toFixed(1);
            return { salesman, avgMinutes: avgMin, durasiFormatted: fmtMinutes(Math.round(avgSec)) };
        })
        .sort((a, b) => order === "desc" ? b.avgMinutes - a.avgMinutes : a.avgMinutes - b.avgMinutes)
        .slice(0, limit);
}

function computeDistribusi(records: SetoranRecord[]): DistribusiItem[] {
    const buckets = [
        { label: "< 15 Menit", min: 0, max: 900, color: "#10B981" },
        { label: "15–30 Menit", min: 900, max: 1800, color: "#3B82F6" },
        { label: "30–60 Menit", min: 1800, max: 3600, color: "#F59E0B" },
        { label: "> 60 Menit", min: 3600, max: Infinity, color: "#DC2626" },
    ];
    const counts = buckets.map((b) => ({
        ...b,
        value: records.filter((r) => r.durasiSeconds >= b.min && r.durasiSeconds < b.max).length,
    }));
    const total = records.length;
    return counts.map(({ label, color, value }) => ({
        label,
        value,
        color,
        pct: total > 0 ? +((value / total) * 100).toFixed(1) : 0,
    }));
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSetoran() {
    const [sort, setSort] = useState<SetoranSort | null>(null);
    const [filter, setFilter] = useState<SetoranFilter>({
        search: "", bulan: "", tanggal: "", dateFrom: "", dateTo: "",
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // All records matching filter (unsorted for charts, sorted for table)
    const filtered = useMemo(() => applyFilter(setoranRecords, filter), [filter]);
    const processed = useMemo(() => applySort(filtered, sort), [filtered, sort]);

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    // ── KPI derived from filtered ────────────────────────────────────────────
    const kpi = useMemo(() => {
        if (!filtered.length) return null;
        const totalSec = filtered.reduce((s, r) => s + r.durasiSeconds, 0);
        const avgSec = Math.round(totalSec / filtered.length);
        const sortedBy = [...filtered].sort((a, b) => a.durasiSeconds - b.durasiSeconds);
        return {
            avgDurasiSeconds: avgSec,
            avgDurasi: fmtMinutes(avgSec),
            totalSetoran: filtered.length,
            fastestRecord: sortedBy[0],
            longestRecord: sortedBy[sortedBy.length - 1],
        };
    }, [filtered]);

    // ── Chart data derived from filtered ─────────────────────────────────────
    const dailyAverage = useMemo(() => computeDailyAverage(filtered), [filtered]);
    const salesmanMap = useMemo(() => computeSalesmanAvg(filtered), [filtered]);
    const top10Longest = useMemo(() => computeTop10(salesmanMap, "desc", 10), [salesmanMap]);
    const top10Fastest = useMemo(() => computeTop10(salesmanMap, "asc", 10), [salesmanMap]);
    const distribusi = useMemo(() => computeDistribusi(filtered), [filtered]);

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
        // table
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
        // kpi
        kpi,
        // charts
        dailyAverage,
        top10Longest,
        top10Fastest,
        distribusi,
    };
}
