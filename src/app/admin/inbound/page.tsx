"use client";

/**
 * /admin/inbound — Inbound Monitoring Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Migrated from HTML/Chart.js. Preserves original information hierarchy exactly.
 *
 * Design System (Light Mode only — dark mode prepared via CSS vars for later):
 *   Background : #F5F7FB   Primary : #DC2626
 *   Card       : #FFFFFF   Secondary : #2563EB
 *   Border     : #E5E7EB   Success : #16A34A
 *   Text       : #111827   Warning : #F59E0B
 *   Muted      : #64748B   Radius : 18px
 *
 * Page Structure (exact original order):
 *   1. Page header — Inbound Monitoring title + period
 *   2. KPI Cards   — Total Mobil | Total Box | Komposisi Jenis Bongkaran (ONE card)
 *   3. Charts 2×2  — Report Harian | Jumlah Bongkaran | Kontribusi Supply | Produktivitas Bongkar
 *   4. Detail Table — "Informasi Detail Per Nomor FO (Inbound)"
 *                     Columns: Tanggal & Jam | Nomor FO | Nopol | Plant | Jenis Bongkaran | Total Box | Nomor GR
 *
 * Filters: NOT on this page. They live in the sidebar (global filter architecture).
 */

import { useCallback, useState } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// ── Data hook ──────────────────────────────────────────────────────────────────
import { useInboundData } from "@/hooks/useInboundData";

// ── Section 1: KPI Cards (static — no lazy loading needed) ────────────────────
import SummaryCards from "@/components/inbound/SummaryCards";

// ── Section 2: Charts (lazy loaded for code splitting) ────────────────────────
const DailyReportChart = dynamic(
    () => import("@/components/inbound/DailyReportChart"),
    { ssr: false, loading: () => <ChartSkeleton /> }
);
const JumlahBongkaranChart = dynamic(
    () => import("@/components/inbound/JumlahBongkaranChart"),
    { ssr: false, loading: () => <ChartSkeleton /> }
);
const SupplyContributionChart = dynamic(
    () => import("@/components/inbound/SupplyContributionChart"),
    { ssr: false, loading: () => <ChartSkeleton /> }
);
const ProductivityChart = dynamic(
    () => import("@/components/inbound/ProductivityChart"),
    { ssr: false, loading: () => <ChartSkeleton /> }
);

// ── Section 3: Detail Table ────────────────────────────────────────────────────
import InboundTable from "@/components/inbound/InboundTable";

// ── Loading states ─────────────────────────────────────────────────────────────
import LoadingSkeleton from "@/components/inbound/LoadingSkeleton";

// ─── Chart placeholder (shown while lazy chunks load) ─────────────────────────

function ChartSkeleton() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] h-[320px] animate-pulse shadow-sm" />
    );
}

// ─── Fade-up animation variants ────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.36, delay: i * 0.07 },
    }),
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InboundPage() {
    const {
        paginated,
        totalRecords,
        page,
        pageSize,
        totalPages,
        sort,
        search,
        handleSort,
        handleTableSearch,
        setPage,
        setPageSize,
    } = useInboundData();

    /** Stub — wire to real loading state from API */
    const [loading] = useState(false);

    const handleExport = useCallback(() => {
        // TODO: implement real XLSX export
        console.info("Export Excel triggered — totalRecords:", totalRecords);
    }, [totalRecords]);

    const handleRefresh = useCallback(async () => {
        // TODO: trigger real data re-fetch
        await new Promise((r) => setTimeout(r, 700));
    }, []);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="space-y-5">

            {/* ──────────────────────────────────────────────────────────────────────
          1. Page Header
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">
                        Inbound Monitoring
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitor seluruh aktivitas inbound secara realtime
                        <span className="mx-1.5 text-[#D1D5DB]">·</span>
                        <span className="font-medium text-[#374151]">Periode: 28 Jun 2025</span>
                    </p>
                </div>
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          2. KPI Summary Cards
          Card 1 — Total Mobil
          Card 2 — Total Box
          Card 3 — Komposisi Jenis Bongkaran (SlipSheet + Curah in ONE card)
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <SummaryCards />
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          3. Charts — Row 1
          [Report Harian]  [Jumlah Bongkaran]
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <DailyReportChart />
                <JumlahBongkaranChart />
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          3. Charts — Row 2
          [Kontribusi Supply]  [Produktivitas Bongkar]
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <SupplyContributionChart />
                <ProductivityChart />
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          4. Informasi Detail Per Nomor FO (Inbound)
          Columns: Tanggal & Jam | Nomor FO | Nopol | Plant |
                   Jenis Bongkaran | Total Box | Nomor GR
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <InboundTable
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
                    onSearchChange={handleTableSearch}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            </motion.div>

        </div>
    );
}
