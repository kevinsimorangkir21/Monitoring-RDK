"use client";

/**
 * WOWTCards — 4 KPI cards for the WO-WT dashboard.
 *
 * Cards:
 *   1. Average WO-WT Global
 *   2. Wavepick Terbaik  (highest WO-WT Global average)
 *   3. Wavepick Terendah (lowest  WO-WT Global average)
 *   4. Total Wavepick    (filtered record count)
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Hash } from "lucide-react";
import type { WoWtRecord, WoWtKPIs } from "./types";

// ─── KPI Calculation ──────────────────────────────────────────────────────────

/** Exported for unit-test access */
export function calculateKPIs(data: WoWtRecord[]): WoWtKPIs | null {
    if (data.length === 0) return null;

    // Average Global WO-WT across all rows
    const totalGlobal = data.reduce((s, r) => s + r.woWtGlobal, 0);
    const averageGlobal = totalGlobal / data.length;

    // Average WO-WT Global per wavepick name
    const wpMap = new Map<string, { total: number; count: number }>();
    for (const r of data) {
        const prev = wpMap.get(r.wavepick) ?? { total: 0, count: 0 };
        wpMap.set(r.wavepick, { total: prev.total + r.woWtGlobal, count: prev.count + 1 });
    }

    const wpAverages = Array.from(wpMap.entries()).map(([name, { total, count }]) => ({
        name,
        value: total / count,
    }));

    const bestWavepick = wpAverages.reduce((best, cur) =>
        cur.value > best.value ? cur : best
    );
    const worstWavepick = wpAverages.reduce((worst, cur) =>
        cur.value < worst.value ? cur : worst
    );

    return { averageGlobal, bestWavepick, worstWavepick, totalRecords: data.length };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    title, primary, secondary, icon: Icon,
    iconBg, iconColor, accentBorder, delay,
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
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`} aria-hidden="true">
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.article>
    );
});

const EmptyKpiCard = memo(function EmptyKpiCard({
    title, icon: Icon, iconBg, iconColor, accentBorder, delay,
}: Omit<KpiCardProps, "primary" | "secondary">) {
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
                    <p className="text-xs text-[#9CA3AF] mt-1.5">Belum ada data</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`} aria-hidden="true">
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface WOWTCardsProps {
    data: WoWtRecord[];
    loading?: boolean;
}

function CardSkeleton() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
                    <div className="h-6 bg-[#F3F4F6] rounded w-1/2" />
                    <div className="h-3 bg-[#F3F4F6] rounded w-2/3" />
                </div>
                <div className="w-11 h-11 bg-[#F3F4F6] rounded-xl shrink-0" />
            </div>
        </div>
    );
}

export const WOWTCards = memo(function WOWTCards({ data, loading = false }: WOWTCardsProps) {
    const kpis = useMemo(() => calculateKPIs(data), [data]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    const CONFIGS = {
        average: { icon: Activity, iconBg: "bg-blue-50", iconColor: "text-blue-600", accentBorder: "border-l-blue-500" },
        best: { icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accentBorder: "border-l-emerald-500" },
        worst: { icon: TrendingDown, iconBg: "bg-red-50", iconColor: "text-[#DC2626]", accentBorder: "border-l-[#DC2626]" },
        total: { icon: Hash, iconBg: "bg-violet-50", iconColor: "text-violet-600", accentBorder: "border-l-violet-500" },
    } as const;

    if (!kpis) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-label="KPI Cards — no data">
                <EmptyKpiCard title="Average WO-WT Global" {...CONFIGS.average} delay={0} />
                <EmptyKpiCard title="Wavepick Terbaik"     {...CONFIGS.best} delay={0.07} />
                <EmptyKpiCard title="Wavepick Terendah"    {...CONFIGS.worst} delay={0.14} />
                <EmptyKpiCard title="Total Wavepick"       {...CONFIGS.total} delay={0.21} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-label="KPI Cards">
            <KpiCard
                title="Average WO-WT Global"
                primary={`${kpis.averageGlobal.toFixed(1)}%`}
                secondary={`Dari ${kpis.totalRecords.toLocaleString("id-ID")} data`}
                {...CONFIGS.average} delay={0}
            />
            <KpiCard
                title="Wavepick Terbaik"
                primary={kpis.bestWavepick?.name ?? "—"}
                secondary={kpis.bestWavepick ? `Rata-rata: ${kpis.bestWavepick.value.toFixed(1)}%` : undefined}
                {...CONFIGS.best} delay={0.07}
            />
            <KpiCard
                title="Wavepick Terendah"
                primary={kpis.worstWavepick?.name ?? "—"}
                secondary={kpis.worstWavepick ? `Rata-rata: ${kpis.worstWavepick.value.toFixed(1)}%` : undefined}
                {...CONFIGS.worst} delay={0.14}
            />
            <KpiCard
                title="Total Wavepick"
                primary={kpis.totalRecords.toLocaleString("id-ID")}
                secondary="Data dalam filter"
                {...CONFIGS.total} delay={0.21}
            />
        </div>
    );
});

export default WOWTCards;
