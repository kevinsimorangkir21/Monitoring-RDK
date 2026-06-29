"use client";

/**
 * /admin/outbound — Outbound Monitoring Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Migrated from HTML/Chart.js. Preserves original information hierarchy exactly.
 *
 * Design System (Light Mode):
 *   Background : #F5F7FB   Primary  : #DC2626
 *   Card       : #FFFFFF   Secondary: #2563EB
 *   Border     : #E5E7EB   Success  : #16A34A
 *   Text       : #111827   Warning  : #F59E0B
 *   Muted      : #64748B   Radius   : 18px
 *
 * Page Structure (exact original order):
 *   1. Page header
 *   2. KPI Cards  — Total Mobil Muat | Muat Inap | Muat Pagi | Rit 2
 *   3. Charts
 *      3a. Klasifikasi Status FO  (full-width)
 *      3b. Persebaran Type FO | Grouping Time STW  (2-col)
 *   4. Detail Table — "Informasi Detail Log Aktivitas Outbound per FO"
 *                     Columns: Tanggal | Freight Order | Mobil Muat | S-Type | Status | Jam Terima | Gate
 *
 * Filters: NOT on this page. They live in the sidebar (global filter architecture).
 */

import { useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// ── Data hook ──────────────────────────────────────────────────────────────────
import { useOutboundData } from "@/hooks/useOutboundData";

// ── KPI Cards (not lazy — above the fold, needed immediately) ─────────────────
import SummaryCards from "@/components/outbound/SummaryCards";

// ── Charts (lazy loaded for code splitting) ───────────────────────────────────
const StatusFOChart = dynamic(
    () => import("@/components/outbound/StatusFOChart"),
    { ssr: false, loading: () => <ChartSkeleton height={330} /> }
);
const TypeFOChart = dynamic(
    () => import("@/components/outbound/TypeFOChart"),
    { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);
const GroupingTimeChart = dynamic(
    () => import("@/components/outbound/GroupingTimeChart"),
    { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);

// ── Detail Table ──────────────────────────────────────────────────────────────
import OutboundTable from "@/components/outbound/OutboundTable";

// ─── Chart loading placeholder ────────────────────────────────────────────────

function ChartSkeleton({ height = 320 }: { height?: number }) {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm"
            style={{ height }}
        />
    );
}

// ─── Fade-up animation variants ───────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.36, delay: i * 0.07 },
    }),
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OutboundPage() {
    const {
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
    } = useOutboundData();

    const handleExport = useCallback(() => {
        // TODO: implement real XLSX export
        console.info("Export Excel triggered — totalRecords:", totalRecords);
    }, [totalRecords]);

    const handleRefresh = useCallback(async () => {
        // TODO: trigger real data re-fetch
        await new Promise((r) => setTimeout(r, 700));
    }, []);

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
                        Outbound Monitoring
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitor seluruh aktivitas outbound secara realtime
                        <span className="mx-1.5 text-[#D1D5DB]">·</span>
                        <span className="font-medium text-[#374151]">Periode: 28 Jun 2025</span>
                    </p>
                </div>
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          2. KPI Summary Cards
          Card 1 — Total Mobil Muat
          Card 2 — Muat Inap   (% + jumlah mobil, amber)
          Card 3 — Muat Pagi   (% + jumlah mobil, sky blue)
          Card 4 — Rit 2       (% + jumlah mobil, green)
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
          3a. Chart — Klasifikasi Status FO (full width)
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <StatusFOChart />
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          3b. Charts — Persebaran Type FO | Grouping Time STW
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <TypeFOChart />
                <GroupingTimeChart />
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────────────
          4. Detail Table
          Title   : "Informasi Detail Log Aktivitas Outbound per FO"
          Columns : Tanggal | Freight Order | Mobil Muat | S-Type |
                    Status | Jam Terima (Input FO) | Gate
      ────────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <OutboundTable
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

        </div>
    );
}
