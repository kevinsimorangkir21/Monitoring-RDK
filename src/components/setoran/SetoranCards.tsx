"use client";

/**
 * SetoranCards — 4 KPI summary cards.
 *   1. Average Durasi Setoran  (HH:mm format)
 *   2. Salesman Terlama        (name + durasi)
 *   3. Salesman Tercepat       (name + durasi)
 *   4. Total Setoran           (count)
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Timer, TrendingDown, TrendingUp, Hash } from "lucide-react";
import type { SetoranRecord } from "@/types/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIData {
    avgDurasiSeconds: number;
    avgDurasi: string;
    totalSetoran: number;
    fastestRecord: SetoranRecord | undefined;
    longestRecord: SetoranRecord | undefined;
}

interface Props {
    kpi: KPIData | null;
}

// ─── Single card ──────────────────────────────────────────────────────────────

function KpiCard({
    title,
    primary,
    secondary,
    icon: Icon,
    iconBg,
    iconColor,
    accent,
    delay,
}: {
    title: string;
    primary: string;
    secondary?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accent: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 ${accent} shadow-sm`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-2xl font-bold text-[#111827] leading-none truncate">
                        {primary}
                    </p>
                    {secondary && (
                        <p className="text-xs text-[#64748B] mt-1.5 truncate">{secondary}</p>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export const SetoranCards = memo(function SetoranCards({ kpi }: Props) {
    if (!kpi) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[100px] bg-white border border-[#E5E7EB] rounded-[18px] animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
                title="Average Durasi Setoran"
                primary={kpi.avgDurasi}
                secondary={`Dari ${kpi.totalSetoran} transaksi`}
                icon={Timer}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                accent="border-l-blue-500"
                delay={0}
            />
            <KpiCard
                title="Salesman Terlama"
                primary={kpi.longestRecord?.namaSalesman ?? "—"}
                secondary={kpi.longestRecord ? `Durasi: ${kpi.longestRecord.durasi}` : undefined}
                icon={TrendingDown}
                iconBg="bg-red-50"
                iconColor="text-[#DC2626]"
                accent="border-l-[#DC2626]"
                delay={0.07}
            />
            <KpiCard
                title="Salesman Tercepat"
                primary={kpi.fastestRecord?.namaSalesman ?? "—"}
                secondary={kpi.fastestRecord ? `Durasi: ${kpi.fastestRecord.durasi}` : undefined}
                icon={TrendingUp}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                accent="border-l-emerald-500"
                delay={0.14}
            />
            <KpiCard
                title="Total Setoran"
                primary={kpi.totalSetoran.toLocaleString("id-ID")}
                secondary="Transaksi dalam filter"
                icon={Hash}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                accent="border-l-violet-500"
                delay={0.21}
            />
        </div>
    );
});
