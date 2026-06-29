"use client";

/**
 * /admin/claim-vendor — Vendor Claim Monitoring Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header     — title, subtitle, Refresh, Export Excel, Last Update
 *   2. KPI Cards       — Total Claim | Waiting Approval | Approved | Rejected
 *   3. Charts Row 1    — Claim Trend (full width)
 *   4. Charts Row 2    — Claim by Vendor | Claim by Category | Approval Progress
 *   5. Detail Table    — Enterprise data grid with drawer on Detail action
 *   6. Detail Drawer   — Full claim info + timeline + Print / Download PDF
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// ── Hook ───────────────────────────────────────────────────────────────────────
import { useClaimVendor } from "@/hooks/useClaimVendor";
import type { ClaimRecord } from "@/types/claimVendor";

// ── Static components ──────────────────────────────────────────────────────────
import SummaryCards from "@/components/claim-vendor/SummaryCards";
import ClaimTable from "@/components/claim-vendor/ClaimTable";
import RefreshButton from "@/components/claim-vendor/RefreshButton";
import ExportButton from "@/components/claim-vendor/ExportButton";

// ── Lazy charts ────────────────────────────────────────────────────────────────
const ClaimTrendChart = dynamic(
    () => import("@/components/claim-vendor/ClaimCharts").then((m) => ({ default: m.ClaimTrendChart })),
    { ssr: false, loading: () => <ChartSkeleton h={284} /> }
);
const ClaimByVendorChart = dynamic(
    () => import("@/components/claim-vendor/ClaimCharts").then((m) => ({ default: m.ClaimByVendorChart })),
    { ssr: false, loading: () => <ChartSkeleton h={284} /> }
);
const ClaimByCategoryChart = dynamic(
    () => import("@/components/claim-vendor/ClaimCharts").then((m) => ({ default: m.ClaimByCategoryChart })),
    { ssr: false, loading: () => <ChartSkeleton h={284} /> }
);
const ApprovalProgressChart = dynamic(
    () => import("@/components/claim-vendor/ClaimCharts").then((m) => ({ default: m.ApprovalProgressChart })),
    { ssr: false, loading: () => <ChartSkeleton h={284} /> }
);

// ── Lazy drawer ────────────────────────────────────────────────────────────────
const DetailDrawer = dynamic(
    () => import("@/components/claim-vendor/DetailDrawer"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ChartSkeleton({ h = 284 }: { h?: number }) {
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

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ClaimVendorPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, search,
        setPage, setPageSize,
        handleSort, handleSearchChange,
    } = useClaimVendor();

    const [selectedRecord, setSelectedRecord] = useState<ClaimRecord | null>(null);

    const handleExport = useCallback(() => {
        console.info("Export Claim Vendor — totalRecords:", totalRecords);
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
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Claim Vendor</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Vendor Claim Monitoring Dashboard
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

            {/* ── 3. Claim Trend (full width) ──────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <ClaimTrendChart />
            </motion.div>

            {/* ── 4. Charts Row 2 ─────────────────────────────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
                <ClaimByVendorChart />
                <ClaimByCategoryChart />
                <ApprovalProgressChart />
            </motion.div>

            {/* ── 5. Detail Table ──────────────────────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <ClaimTable
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
