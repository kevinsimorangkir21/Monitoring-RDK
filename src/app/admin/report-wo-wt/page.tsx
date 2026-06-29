"use client";

/**
 * /admin/report-wo-wt — Report WO-WT Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header    — title, subtitle, Refresh, Export Excel, Last Update
 *   2. KPI Cards      — Global WO-WT | ZWP1 | ZWP2 | ZWP4 | ZWP5
 *   3. Charts Row 1   — Daily Trend (full width)
 *   4. Charts Row 2   — Comparison + Radar
 *   5. Detail Table   — Wavepick Activity Log
 *   6. Detail Drawer  — Full wavepick info + zone breakdown + timeline
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { RefreshCw, Download } from "lucide-react";

import { useReportWoWt } from "@/hooks/useReportWoWt";
import type { WavepickRecord } from "@/types/reportWoWt";

import SummaryCards from "@/components/report-wo-wt/SummaryCards";
import WavepickTable from "@/components/report-wo-wt/WavepickTable";

// ── Lazy charts ────────────────────────────────────────────────────────────────
const DailyTrendChart = dynamic(
    () => import("@/components/report-wo-wt/WoWtCharts").then((m) => ({ default: m.DailyTrendChart })),
    { ssr: false, loading: () => <ChartSkeleton h={324} /> }
);
const ComparisonChart = dynamic(
    () => import("@/components/report-wo-wt/WoWtCharts").then((m) => ({ default: m.ComparisonChart })),
    { ssr: false, loading: () => <ChartSkeleton h={300} /> }
);
const RadarChartComponent = dynamic(
    () => import("@/components/report-wo-wt/WoWtCharts").then((m) => ({ default: m.RadarChartComponent })),
    { ssr: false, loading: () => <ChartSkeleton h={300} /> }
);

const DetailDrawer = dynamic(
    () => import("@/components/report-wo-wt/DetailDrawer"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChartSkeleton({ h = 324 }: { h?: number }) {
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

// ─── Header action buttons ────────────────────────────────────────────────────

function RefreshBtn({ onRefresh }: { onRefresh: () => Promise<void> }) {
    const [spin, setSpin] = useState(false);
    const handle = useCallback(async () => {
        if (spin) return;
        setSpin(true);
        try { await onRefresh(); } finally { setTimeout(() => setSpin(false), 700); }
    }, [spin, onRefresh]);
    return (
        <button
            onClick={handle}
            disabled={spin}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
            <motion.span
                animate={spin ? { rotate: 360 } : { rotate: 0 }}
                transition={spin ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}}
                className="flex"
            >
                <RefreshCw size={14} />
            </motion.span>
            Refresh
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportWoWtPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, search,
        setPage, setPageSize,
        handleSort, handleSearchChange,
    } = useReportWoWt();

    const [selectedRecord, setSelectedRecord] = useState<WavepickRecord | null>(null);

    const handleExport = useCallback(() => {
        console.info("Export Report WO-WT — totalRecords:", totalRecords);
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
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Report WO-WT</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitoring Performa Wavepick Order — Work Time per Zone
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#9CA3AF] hidden sm:block">
                        Diperbarui: {lastUpdateLabel()}
                    </span>
                    <RefreshBtn onRefresh={handleRefresh} />
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Download size={14} />Export Excel
                    </button>
                </div>
            </motion.div>

            {/* ── 2. KPI Cards ────────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <SummaryCards />
            </motion.div>

            {/* ── 3. Daily Trend (full width) ──────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <DailyTrendChart />
            </motion.div>

            {/* ── 4. Comparison + Radar ────────────────────────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <ComparisonChart />
                <RadarChartComponent />
            </motion.div>

            {/* ── 5. Detail Table ──────────────────────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <WavepickTable
                    paginated={paginated}
                    totalRecords={totalRecords}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    sort={sort}
                    search={search}
                    onSort={handleSort}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onSearchChange={handleSearchChange}
                    onRowView={setSelectedRecord}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            </motion.div>

            {/* ── 6. Detail Drawer ─────────────────────────────────────────────── */}
            <DetailDrawer
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </div>
    );
}
