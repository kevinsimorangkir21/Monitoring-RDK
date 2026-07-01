"use client";

/**
 * OutboundCards — 4 KPI summary cards for the Outbound dashboard.
 *
 *   1. Total Mobil Muat — total record count in filtered data
 *   2. Muat Inap        — records loaded overnight (hari contains "Inap" OR jamTerima < "06:00")
 *   3. Muat Pagi        — records loaded in the morning (jamTerima between "06:00" and "10:00")
 *   4. Rit 2            — records where putaran === "2"
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, Moon, Sun, RotateCw } from "lucide-react";
import type { OutboundRecord } from "./types";

// ─── Classification Predicates (pure, exported for testability) ───────────────

/**
 * Muat Inap: overnight loading.
 * A record is Muat Inap if:
 *   - the `hari` field contains the word "Inap" (case-insensitive), OR
 *   - the `jamTerima` hour is before 06:00 (i.e. "HH:MM" where HH < 6)
 */
export function isMuatInap(record: OutboundRecord): boolean {
    if (record.hari.toLowerCase().includes("inap")) return true;
    const parts = record.jamTerima.split(":");
    if (parts.length !== 2) return false;
    const hour = parseInt(parts[0], 10);
    if (isNaN(hour)) return false;
    return hour < 6;
}

/**
 * Muat Pagi: morning loading.
 * A record is Muat Pagi if `jamTerima` is between "06:00" (inclusive) and "10:00" (exclusive),
 * AND it is NOT already classified as Muat Inap (to preserve mutual exclusion and the invariant
 * muatInap + muatPagi + rit2 ≤ total).
 */
export function isMuatPagi(record: OutboundRecord): boolean {
    if (isMuatInap(record)) return false;
    const parts = record.jamTerima.split(":");
    if (parts.length !== 2) return false;
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    if (isNaN(hour) || isNaN(minute)) return false;
    const totalMinutes = hour * 60 + minute;
    // 06:00 = 360 minutes, 10:00 = 600 minutes
    return totalMinutes >= 360 && totalMinutes < 600;
}

/**
 * Rit 2: second-round (or third-round) delivery that is NOT already
 * classified as Muat Inap or Muat Pagi.
 * This ensures the three KPI categories are mutually exclusive so that
 * muatInap + muatPagi + rit2 ≤ total always holds.
 */
export function isRit2(record: OutboundRecord): boolean {
    if (isMuatInap(record) || isMuatPagi(record)) return false;
    return record.putaran === "2" || record.putaran === "3";
}

// ─── KPI Calculation ──────────────────────────────────────────────────────────

export interface OutboundKPIs {
    total: number;
    muatInap: number;
    muatPagi: number;
    rit2: number;
}

/**
 * Compute all four KPI values from a (filtered) data array.
 * Each category is an independent filter applied to the same array,
 * so muatInap + muatPagi + rit2 ≤ total always holds.
 */
export function calculateKPIs(data: OutboundRecord[]): OutboundKPIs {
    const total = data.length;
    const muatInap = data.filter(isMuatInap).length;
    const muatPagi = data.filter(isMuatPagi).length;
    const rit2 = data.filter(isRit2).length;
    return { total, muatInap, muatPagi, rit2 };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a count/percentage pair for display. Returns "0" and "0%" when total is 0. */
function formatPct(count: number, total: number): string {
    if (total === 0) return "0%";
    return `${((count / total) * 100).toFixed(1)}%`;
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    count: number;
    pct?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
    delay: number;
}

const KpiCard = memo(function KpiCard({
    title,
    count,
    pct,
    icon: Icon,
    iconBg,
    iconColor,
    accentBorder,
    delay,
}: KpiCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 ${accentBorder} shadow-sm`}
            aria-label={`${title}: ${count}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#111827] leading-none">
                        {count.toLocaleString("id-ID")}
                    </p>
                    {pct !== undefined && (
                        <p className="text-xs text-[#64748B] mt-1.5">{pct} dari total</p>
                    )}
                </div>
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                    aria-hidden="true"
                >
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.article>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface OutboundCardsProps {
    data: OutboundRecord[];
}

export const OutboundCards = memo(function OutboundCards({ data }: OutboundCardsProps) {
    const kpis = useMemo(() => calculateKPIs(data), [data]);

    const muatInapPct = useMemo(() => formatPct(kpis.muatInap, kpis.total), [kpis]);
    const muatPagiPct = useMemo(() => formatPct(kpis.muatPagi, kpis.total), [kpis]);
    const rit2Pct = useMemo(() => formatPct(kpis.rit2, kpis.total), [kpis]);

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
            aria-label="Outbound KPI Cards"
        >
            {/* Card 1 — Total Mobil Muat */}
            <KpiCard
                title="Total Mobil Muat"
                count={kpis.total}
                icon={Truck}
                iconBg="bg-emerald-50"
                iconColor="text-[#10B981]"
                accentBorder="border-l-[#10B981]"
                delay={0}
            />

            {/* Card 2 — Muat Inap */}
            <KpiCard
                title="Muat Inap"
                count={kpis.muatInap}
                pct={muatInapPct}
                icon={Moon}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-500"
                accentBorder="border-l-indigo-400"
                delay={0.07}
            />

            {/* Card 3 — Muat Pagi */}
            <KpiCard
                title="Muat Pagi"
                count={kpis.muatPagi}
                pct={muatPagiPct}
                icon={Sun}
                iconBg="bg-amber-50"
                iconColor="text-amber-500"
                accentBorder="border-l-amber-400"
                delay={0.14}
            />

            {/* Card 4 — Rit 2 */}
            <KpiCard
                title="Rit 2"
                count={kpis.rit2}
                pct={rit2Pct}
                icon={RotateCw}
                iconBg="bg-sky-50"
                iconColor="text-sky-500"
                accentBorder="border-l-sky-400"
                delay={0.21}
            />
        </div>
    );
});

export default OutboundCards;
