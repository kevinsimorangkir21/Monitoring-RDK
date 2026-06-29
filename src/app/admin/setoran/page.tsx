"use client";

/**
 * /admin/setoran — Setoran ke Kasir Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header    — title, subtitle, Refresh, Export Excel, Last Update
 *   2. KPI Cards      — Avg Durasi | Terlama | Tercepat
 *   3. Charts Row     — Longest (red) + Fastest (blue) horizontal bar charts
 *   4. Detail Table   — Sticky header, filters, sort, pagination
 *   5. Detail Drawer  — Full info + timeline + Download PDF / Print
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

import { useSetoran } from "@/hooks/useSetoran";
import type { SetoranRecord } from "@/types/setoran";

import SummaryCards from "@/components/setoran/SummaryCards";
import SetoranTable from "@/components/setoran/SetoranTable";
import RefreshButton from "@/components/setoran/RefreshButton";
import ExportButton from "@/components/setoran/ExportButton";

// ── Lazy charts ────────────────────────────────────────────────────────────────
const LongestChart = dynamic(
    () => import("@/components/setoran/SetoranCharts").then((m) => ({ default: m.LongestChart })),
    { ssr: false, loading: () => <ChartSkeleton h={280} /> }
);
const FastestChart = dynamic(
    () => import("@/components/setoran/SetoranCharts").then((m) => ({ default: m.FastestChart })),
    { ssr: false, loading: () => <ChartSkeleton h={280} /> }
);

const DetailDrawer = dynamic(
    () => import("@/components/setoran/DetailDrawer"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChartSkeleton({ h = 280 }: { h?: number }) {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm"
            style={{ height: h }}
        />
    );
}

function lastUpdateLabel() {
    return new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetoranPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, filter,
        setPage, setPageSize,
        handleSort, handleFilterChange,
    } = useSetoran();

    const [selectedRecord, setSelectedRecord] = useState<SetoranRecord | null>(null);

    const handleExport = useCallback(() => {
        console.info("Export Setoran — totalRecords:", totalRecords);
    }, [totalRecords]);

    const handleRefresh = useCallback(async () => {
        await new Promise<void>((r) => setTimeout(r, 700));
    }, []);

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ──────────────────────────────────────────────── */}
            <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Setoran ke Kasir</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitoring Durasi Setoran Salesman
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#9CA3AF] hidden sm:block">
                        Diperbarui: {lastUpdateLabel()}
                    </span>
                    <RefreshButton onRefresh={handleRefresh} />
                    <ExportButton onClick={handleExport} label="Export Excel" />
                </div>
            </motion.div>

            {/* ── 2. KPI Cards ────────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <SummaryCards />
            </motion.div>

            {/* ── 3. Charts ────────────────────────────────────────────────────── */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <LongestChart />
                <FastestChart />
            </motion.div>

            {/* ── 4. Detail Table ──────────────────────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <SetoranTable
                    paginated={paginated}
                    totalRecords={totalRecords}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    sort={sort}
                    filter={filter}
                    onSort={handleSort}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onFilterChange={handleFilterChange}
                    onRowView={setSelectedRecord}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            </motion.div>

            {/* ── 5. Detail Drawer ─────────────────────────────────────────────── */}
            <DetailDrawer
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </div>
    );
}
