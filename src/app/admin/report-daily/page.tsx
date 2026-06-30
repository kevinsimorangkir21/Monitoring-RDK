"use client";

/**
 * /admin/report-daily — Report Daily Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Daily Operational Performance Dashboard with three tabs:
 *   Transport    | Warehouse FG | Warehouse BS
 *
 * Transport tab:
 *   - Chart: Gantungan Volume vs Count DO
 *   - Table: TransportPivotTable (rows = Jenis Report, columns = Tanggal)
 *     Title: "Detail Report"
 *
 * Warehouse FG tab:
 *   - Chart: Jam Pulang vs Qty Picking
 *   - Table: DailyTable
 *
 * Warehouse BS tab:
 *   - Chart 1: In/Out Bad Stock (with Repack series)
 *   - Chart 2: Trend Stock On Hand
 *   - Table: DailyTable
 */

import { useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

import { useReportDaily } from "@/hooks/useReportDaily";
import { transportRecords } from "@/mock/reportDaily";

import SegmentTabs from "@/components/report-daily/SegmentTabs";
import DailyTable from "@/components/report-daily/DailyTable";
import TransportPivotTable from "@/components/report-daily/TransportPivotTable";

const TransportChart = dynamic(
    () => import("@/components/report-daily/TransportChart"),
    { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);
const WarehouseFGChart = dynamic(
    () => import("@/components/report-daily/WarehouseFGChart"),
    { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);
const WarehouseBSChart = dynamic(
    () => import("@/components/report-daily/WarehouseBSChart"),
    { ssr: false, loading: () => <ChartSkeleton height={290} /> }
);
const StockOnHandChart = dynamic(
    () => import("@/components/report-daily/StockOnHandChart"),
    { ssr: false, loading: () => <ChartSkeleton height={290} /> }
);

function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm"
            style={{ height }}
        />
    );
}

const tabVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
};

export default function ReportDailyPage() {
    const {
        activeTab,
        handleTabChange,
        paginated,
        totalRecords,
        page,
        pageSize,
        totalPages,
        sort,
        search,
        setPage,
        setPageSize,
        handleSort,
        handleSearchChange,
    } = useReportDaily();

    const handleExport = useCallback(() => {
        console.info("Export Excel — tab:", activeTab, "records:", totalRecords);
    }, [activeTab, totalRecords]);

    const handleRefresh = useCallback(async () => {
        await new Promise((r) => setTimeout(r, 700));
    }, []);

    return (
        <div className="space-y-5">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-xl font-bold text-[#111827] leading-tight">
                    Report Daily
                </h1>
                <p className="text-xs text-[#64748B] mt-1">
                    Daily Operational Performance Dashboard
                    <span className="mx-1.5 text-[#D1D5DB]">·</span>
                    <span className="font-medium text-[#374151]">28 Jun 2025</span>
                </p>
            </div>

            {/* ── Segment Tabs ────────────────────────────────────────────────── */}
            <SegmentTabs active={activeTab} onChange={handleTabChange} />

            {/* ── Tab Content ─────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait" initial={false}>

                {/* ── Transport tab ─────────────────────────────────────────────── */}
                {activeTab === "transport" && (
                    <motion.div
                        key="transport"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                    >
                        <TransportChart />
                        {/*
                         * Pivot table: rows = Jenis Report, columns = Tanggal
                         * Uses the full transportRecords (not paginated) so all
                         * date columns are always visible.
                         */}
                        <TransportPivotTable records={transportRecords} />
                    </motion.div>
                )}

                {/* ── Warehouse FG tab ─────────────────────────────────────────── */}
                {activeTab === "warehouse-fg" && (
                    <motion.div
                        key="warehouse-fg"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                    >
                        <WarehouseFGChart />
                        <DailyTable
                            title="Informasi Detail Laporan Harian Warehouse FG"
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
                            onExport={handleExport}
                            onRefresh={handleRefresh}
                        />
                    </motion.div>
                )}

                {/* ── Warehouse BS tab ─────────────────────────────────────────── */}
                {activeTab === "warehouse-bs" && (
                    <motion.div
                        key="warehouse-bs"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <WarehouseBSChart />
                            <StockOnHandChart />
                        </div>
                        <DailyTable
                            title="Informasi Detail Laporan Harian Warehouse BS"
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
                            onExport={handleExport}
                            onRefresh={handleRefresh}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
