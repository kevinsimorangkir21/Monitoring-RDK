"use client";

/**
 * SetoranCards — Four KPI metric cards for the Setoran Dashboard.
 *
 * Calculates all KPIs internally from the provided data prop using useMemo.
 * Displays loading skeletons while data is being fetched.
 *
 * KPI Metrics:
 *   1. Average Durasi       — mean duration (in minutes) across filtered data
 *   2. Salesman Terlama     — salesman with longest average duration
 *   3. Salesman Tercepat    — salesman with shortest average duration
 *   4. Total Setoran        — count of filtered setoran records
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, TrendingUp, TrendingDown, Clock } from "lucide-react";
import type { SetoranRecord } from "@/types/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SetoranKPIs {
    /** Mean duration in minutes across filtered data (Requirement 1.2) */
    averageDuration: number;
    /** Salesman with the longest average duration (Requirement 1.3) */
    longestSalesman: {
        name: string;
        averageDuration: number; // minutes
    };
    /** Salesman with the shortest average duration (Requirement 1.4) */
    fastestSalesman: {
        name: string;
        averageDuration: number; // minutes
    };
    /** Count of filtered setoran records (Requirement 1.5) */
    totalRecords: number;
}

interface SetoranCardsProps {
    /** Filtered setoran records to derive KPIs from */
    data: SetoranRecord[];
    /** Shows skeleton placeholders when true (Requirement 1.1) */
    loading?: boolean;
}

// ─── KPI Calculation ──────────────────────────────────────────────────────────

/**
 * Calculates all four KPI metrics from a filtered dataset.
 * Returns null when the dataset is empty.
 *
 * Exported for unit testing purposes.
 */
export function calculateKPIs(data: SetoranRecord[]): SetoranKPIs | null {
    if (data.length === 0) return null;

    // Average duration across all filtered records (Requirement 1.2)
    const totalSeconds = data.reduce((sum, r) => sum + r.durasiSeconds, 0);
    const averageDurationSeconds = totalSeconds / data.length;
    const averageDuration = averageDurationSeconds / 60; // convert to minutes

    // Group records by salesman and compute each salesman's average duration
    const salesmanMap = new Map<string, { totalSeconds: number; count: number }>();
    for (const record of data) {
        const existing = salesmanMap.get(record.namaSalesman) ?? { totalSeconds: 0, count: 0 };
        salesmanMap.set(record.namaSalesman, {
            totalSeconds: existing.totalSeconds + record.durasiSeconds,
            count: existing.count + 1,
        });
    }

    // Convert map to sorted array of averages
    const salesmanAverages = Array.from(salesmanMap.entries()).map(([name, { totalSeconds, count }]) => ({
        name,
        averageDuration: totalSeconds / count / 60, // minutes
    }));

    // Salesman Terlama — max average duration (Requirement 1.3)
    const longestSalesman = salesmanAverages.reduce((prev, curr) =>
        curr.averageDuration > prev.averageDuration ? curr : prev
    );

    // Salesman Tercepat — min average duration (Requirement 1.4)
    const fastestSalesman = salesmanAverages.reduce((prev, curr) =>
        curr.averageDuration < prev.averageDuration ? curr : prev
    );

    return {
        averageDuration,
        longestSalesman,
        fastestSalesman,
        totalRecords: data.length, // Requirement 1.5
    };
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

/**
 * Format a duration in minutes to a human-readable string.
 * e.g. 95 → "1j 35m", 45 → "45m"
 *
 * Exported for unit testing purposes.
 */
export function formatDuration(minutes: number): string {
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}j ${mins}m`;
    return `${mins} menit`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CardSkeleton() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
                    <div className="h-6 bg-[#F3F4F6] rounded w-1/2" />
                    <div className="h-3 bg-[#F3F4F6] rounded w-2/3" />
                </div>
                <div className="w-11 h-11 bg-[#F3F4F6] rounded-xl shrink-0" />
            </div>
        </div>
    );
}

// ─── Individual KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    primary: string;
    secondary?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
    delay: number;
}

const KpiCard = memo(function KpiCard({
    title,
    primary,
    secondary,
    icon: Icon,
    iconBg,
    iconColor,
    accentBorder,
    delay,
}: KpiCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 ${accentBorder} shadow-sm`}
            aria-label={`${title}: ${primary}${secondary ? `, ${secondary}` : ""}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#111827] leading-none truncate">
                        {primary}
                    </p>
                    {secondary && (
                        <p className="text-xs text-[#64748B] mt-1.5 truncate">{secondary}</p>
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

// ─── Empty State Card ─────────────────────────────────────────────────────────

interface EmptyKpiCardProps {
    title: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
    delay: number;
}

const EmptyKpiCard = memo(function EmptyKpiCard({
    title,
    icon: Icon,
    iconBg,
    iconColor,
    accentBorder,
    delay,
}: EmptyKpiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 ${accentBorder} shadow-sm`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-2xl font-bold text-[#9CA3AF] leading-none">—</p>
                    <p className="text-xs text-[#9CA3AF] mt-1.5">Tidak ada data</p>
                </div>
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                    aria-hidden="true"
                >
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SetoranCards renders a 4-column responsive grid of KPI metric cards.
 *
 * All KPI calculations are performed internally via useMemo so the parent
 * only needs to pass the filtered dataset.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export const SetoranCards = memo(function SetoranCards({
    data,
    loading = false,
}: SetoranCardsProps) {
    // Compute all KPIs from the filtered dataset (Requirement 1.2–1.5)
    const kpis = useMemo(() => calculateKPIs(data), [data]);

    // ── Loading state — show skeletons (Requirement 1.1) ─────────────────────
    if (loading) {
        return (
            <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
                aria-label="Loading KPI cards"
                aria-busy="true"
            >
                {Array.from({ length: 4 }, (_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Card configuration constants
    const CARD_CONFIGS = {
        averageDurasi: {
            icon: Timer,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            accentBorder: "border-l-blue-500",
        },
        terlama: {
            icon: TrendingDown,
            iconBg: "bg-red-50",
            iconColor: "text-[#DC2626]",
            accentBorder: "border-l-[#DC2626]",
        },
        tercepat: {
            icon: TrendingUp,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            accentBorder: "border-l-emerald-500",
        },
        total: {
            icon: Clock,
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            accentBorder: "border-l-violet-500",
        },
    } as const;

    // ── Empty state — no data matching current filters ────────────────────────
    if (!kpis) {
        return (
            <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
                aria-label="KPI Cards — no data"
            >
                <EmptyKpiCard
                    title="Average Durasi"
                    {...CARD_CONFIGS.averageDurasi}
                    delay={0}
                />
                <EmptyKpiCard
                    title="Salesman Terlama"
                    {...CARD_CONFIGS.terlama}
                    delay={0.07}
                />
                <EmptyKpiCard
                    title="Salesman Tercepat"
                    {...CARD_CONFIGS.tercepat}
                    delay={0.14}
                />
                <EmptyKpiCard
                    title="Total Setoran"
                    {...CARD_CONFIGS.total}
                    delay={0.21}
                />
            </div>
        );
    }

    // ── Normal state — render KPI values ─────────────────────────────────────
    return (
        <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
            aria-label="KPI Cards"
        >
            {/* Card 1: Average Durasi (Requirement 1.2) */}
            <KpiCard
                title="Average Durasi"
                primary={formatDuration(kpis.averageDuration)}
                secondary={`Dari ${kpis.totalRecords.toLocaleString("id-ID")} transaksi`}
                {...CARD_CONFIGS.averageDurasi}
                delay={0}
            />

            {/* Card 2: Salesman Terlama (Requirement 1.3) */}
            <KpiCard
                title="Salesman Terlama"
                primary={kpis.longestSalesman.name}
                secondary={`Rata-rata: ${formatDuration(kpis.longestSalesman.averageDuration)}`}
                {...CARD_CONFIGS.terlama}
                delay={0.07}
            />

            {/* Card 3: Salesman Tercepat (Requirement 1.4) */}
            <KpiCard
                title="Salesman Tercepat"
                primary={kpis.fastestSalesman.name}
                secondary={`Rata-rata: ${formatDuration(kpis.fastestSalesman.averageDuration)}`}
                {...CARD_CONFIGS.tercepat}
                delay={0.14}
            />

            {/* Card 4: Total Setoran (Requirement 1.5) */}
            <KpiCard
                title="Total Setoran"
                primary={kpis.totalRecords.toLocaleString("id-ID")}
                secondary="Transaksi dalam filter"
                {...CARD_CONFIGS.total}
                delay={0.21}
            />
        </div>
    );
});

export default SetoranCards;
