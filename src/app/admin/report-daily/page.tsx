"use client";

/**
 * /admin/report-daily — Report Daily Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Daily Operational Performance Dashboard with three tabs:
 *   Transport | Warehouse FG | Warehouse BS
 *
 * Design System (Light Mode):
 *   Background : #F5F7FB   Primary  : #DC2626
 *   Card       : #FFFFFF   Secondary: #2563EB
 *   Border     : #E5E7EB   Success  : #16A34A
 *   Text       : #111827   Warning  : #F59E0B
 *   Muted      : #64748B   Radius   : 18px
 *
 * Structure per tab:
 *   Transport    : Chart (Gantungan Volume vs Count DO)  →  Table
 *   Warehouse FG : Chart (Jam Pulang vs Qty Picking)    →  Table
 *   Warehouse BS : Chart 1 (In/Out Bad Stock)
 *                  Chart 2 (Trend Stock On Hand)         →  Table
 *
 * Filters: NOT on this page — they live in the sidebar.
 */

import { useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// ── Hook ───────────────────────────────────────────────────────────────────────
import { useReportDaily } from "@/hooks/useReportDaily";

// ── Segment tabs (lightweight — above the fold) ────────────────────────────────
import SegmentTabs from "@/components/report-daily/SegmentTabs";

// ── Table (static — always visible) ───────────────────────────────────────────
import DailyTable from "@/components/report-daily/DailyTable";

// ── Charts — lazy loaded for code splitting ────────────────────────────────────
const TransportChart = dynamic(
    () => import("@/components/report-daily/TransportChart"),
    { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);
const WarehouseFGChart = dynamic(
    () => import("@/components/report-daily/WarehouseFGChart"),
    { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);
const WarehouseBSChart = dynamic(
    () => import("@/components/report-daily/WarehouseBSChart"),
    { ssr: false, loading: () => <ChartSkeleton height={290} /> }
);
const StockOnHandChart = dynamic(
    () => import("@/components/report-daily/StockOnHandChart"),
    { ssr: false, loading: () => <ChartSkeleton height={290} /> }
);

// ─── Chart loading placeholder ─────────────────────────────────────────────────

function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm"
            style={{ height }}
        />
    );
}

// ─── Tab content fade animation ────────────────────────────────────────────────

const tabVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
};

// ─── Table title per tab ───────────────────────────────────────────────────────

const TABLE_TITLES = {
    "transport": "Informasi Detail Laporan Harian Transport",
    "warehouse-fg": "Informasi Detail Laporan Harian Warehouse FG",
    "warehouse-bs": "Informasi Detail Laporan Harian Warehouse BS",
} as const;

// ─── Page ──────────────────────────────────────────────────────────────────────

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

            {/* ── Page Header ────────────────────────────────────────────────────── */}
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

            {/* ── Segment Tabs ───────────────────────────────────────────────────── */}
            <SegmentTabs active={activeTab} onChange={handleTabChange} />

            {/* ── Tab Content ────────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait" initial={false}>
                {/* ─ Transport ─────────────────────────────────────────────────────── */}
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
                        <DailyTable
                            title={TABLE_TITLES["transport"]}
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

                {/* ─ Warehouse FG ──────────────────────────────────────────────────── */}
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
                            title={TABLE_TITLES["warehouse-fg"]}
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

                {/* ─ Warehouse BS ──────────────────────────────────────────────────── */}
                {activeTab === "warehouse-bs" && (
                    <motion.div
                        key="warehouse-bs"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                    >
                        {/* Two charts side by side on lg, stacked on mobile */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <WarehouseBSChart />
                            <StockOnHandChart />
                        </div>
                        <DailyTable
                            title={TABLE_TITLES["warehouse-bs"]}
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
