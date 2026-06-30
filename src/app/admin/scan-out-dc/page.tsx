"use client";

/**
 * /admin/scan-out-dc — Scan Out DC Monitoring Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header           — title, subtitle, Refresh, Export, Last Update
 *   2. KPI Cards             — Total Scan Out | Completed | Pending | Failed
 *   3. Scan Out per Hour     — Line chart (full width)
 *   4. Scan Out by Vendor    — Horizontal bar chart (full width)
 *   5. Average Jam Scan Out  — Bar chart (full width, kendaraan sebelum 10:00)
 *   6. Detail Table          — Scan Out DC Detail with drawer on View
 *
 * Removed per revision spec: SuccessRateChart (Success vs Failed Scan),
 *   ActivityTimeline (Aktivitas Terbaru).
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

import { useScanOutDC } from "@/hooks/useScanOutDC";
import type { ScanOutRecord } from "@/types/scanOutDC";

import SummaryCards from "@/components/scan-out-dc/SummaryCards";
import ScanOutTable from "@/components/scan-out-dc/ScanOutTable";
import ExportButton from "@/components/scan-out-dc/ExportButton";
import RefreshButton from "@/components/scan-out-dc/RefreshButton";

// ── Lazy-loaded charts ─────────────────────────────────────────────────────────
const HourlyScanChart = dynamic(
    () => import("@/components/scan-out-dc/HourlyScanChart"),
    { ssr: false, loading: () => <ChartSkeleton h={268} /> }
);
const DistributionCenterChart = dynamic(
    () => import("@/components/scan-out-dc/DistributionCenterChart"),
    { ssr: false, loading: () => <ChartSkeleton h={268} /> }
);
const DailyTrendChart = dynamic(
    () => import("@/components/scan-out-dc/DailyTrendChart"),
    { ssr: false, loading: () => <ChartSkeleton h={268} /> }
);

// ── Lazy-loaded drawer ─────────────────────────────────────────────────────────
const DetailDrawer = dynamic(
    () => import("@/components/scan-out-dc/DetailDrawer"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ChartSkeleton({ h = 268 }: { h?: number }) {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm"
            style={{ height: h }}
        />
    );
}

function lastUpdateLabel() {
    return new Date().toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ScanOutDCPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, search,
        setPage, setPageSize,
        handleSort, handleSearchChange,
    } = useScanOutDC();

    const [selectedRecord, setSelectedRecord] = useState<ScanOutRecord | null>(null);

    const handleExport = useCallback(() => {
        console.info("Export — totalRecords:", totalRecords);
    }, [totalRecords]);

    const handleRefresh = useCallback(async () => {
        await new Promise((r) => setTimeout(r, 700));
    }, []);

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Scan Out DC</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Scan Out by Vendor Monitoring Dashboard
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

            {/* ── 2. KPI Cards ───────────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <SummaryCards />
            </motion.div>

            {/* ── 3. Scan Out per Hour (full width) ──────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <HourlyScanChart />
            </motion.div>

            {/* ── 4. Scan Out by Vendor (full width) ─────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <DistributionCenterChart />
            </motion.div>

            {/* ── 5. Average Jam Scan Out (full width) ────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <DailyTrendChart />
            </motion.div>

            {/* ── 6. Detail Table ────────────────────────────────────────────────── */}
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <ScanOutTable
                    paginated={paginated}
                    totalRecords={totalRecords}
                    page={page} pageSize={pageSize} totalPages={totalPages}
                    sort={sort} search={search}
                    onSort={handleSort}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onSearchChange={handleSearchChange}
                    onRowView={setSelectedRecord}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            </motion.div>

            {/* ── 7. Detail Drawer ───────────────────────────────────────────────── */}
            <DetailDrawer
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </div>
    );
}
