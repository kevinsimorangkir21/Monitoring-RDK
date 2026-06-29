"use client";

/**
 * /admin/gantungan-faktur — Nominal Gantungan Faktur Vendor Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header      — title, subtitle, Refresh, Export Excel, Last Update
 *   2. KPI Cards        — Total Dokumen | Total Nominal | Rata-rata | Outstanding
 *   3. Charts Row 1     — Nominal Harian (full width) | Dokumen Harian (full width)
 *   4. Charts Row 2     — Nominal per Vendor | Distribusi Nominal
 *   5. Detail Table     — Enterprise data grid with drawer on Detail action
 *   6. Detail Drawer    — Full faktur info + timeline + Print / Download PDF
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// ── Hook ───────────────────────────────────────────────────────────────────────
import { useGantunganFaktur } from "@/hooks/useGantunganFaktur";
import type { FakturRecord } from "@/types/gantunganFaktur";

// ── Static components ──────────────────────────────────────────────────────────
import SummaryCards from "@/components/gantungan-faktur/SummaryCards";
import FakturTable from "@/components/gantungan-faktur/FakturTable";
import RefreshButton from "@/components/gantungan-faktur/RefreshButton";
import ExportButton from "@/components/gantungan-faktur/ExportButton";

// ── Lazy charts ────────────────────────────────────────────────────────────────
const NominalChart = dynamic(
    () => import("@/components/gantungan-faktur/FakturCharts").then((m) => ({ default: m.NominalChart })),
    { ssr: false, loading: () => <ChartSkeleton h={316} /> }
);
const DocumentChart = dynamic(
    () => import("@/components/gantungan-faktur/FakturCharts").then((m) => ({ default: m.DocumentChart })),
    { ssr: false, loading: () => <ChartSkeleton h={316} /> }
);
const VendorChart = dynamic(
    () => import("@/components/gantungan-faktur/FakturCharts").then((m) => ({ default: m.VendorChart })),
    { ssr: false, loading: () => <ChartSkeleton h={316} /> }
);
const DistributionChart = dynamic(
    () => import("@/components/gantungan-faktur/FakturCharts").then((m) => ({ default: m.DistributionChart })),
    { ssr: false, loading: () => <ChartSkeleton h={316} /> }
);

// ── Lazy drawer ────────────────────────────────────────────────────────────────
const DetailDrawer = dynamic(
    () => import("@/components/gantungan-faktur/DetailDrawer"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ChartSkeleton({ h = 316 }: { h?: number }) {
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

export default function GantunganFakturPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, search,
        setPage, setPageSize,
        handleSort, handleSearchChange,
    } = useGantunganFaktur();

    const [selectedRecord, setSelectedRecord] = useState<FakturRecord | null>(null);

    const handleExport = useCallback(() => {
        console.info("Export Gantungan Faktur — totalRecords:", totalRecords);
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
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">
                        Nominal Gantungan Faktur
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitoring Nominal Gantungan Faktur Vendor
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

            {/* ── 3. Charts Row 1 — Nominal Harian + Dokumen Harian ────────────── */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <NominalChart />
                <DocumentChart />
            </motion.div>

            {/* ── 4. Charts Row 2 — Vendor + Distribution ─────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <VendorChart />
                <DistributionChart />
            </motion.div>

            {/* ── 5. Detail Table ──────────────────────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <FakturTable
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
