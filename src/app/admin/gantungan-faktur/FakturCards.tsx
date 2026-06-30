"use client";

/**
 * FakturCards — 4 KPI summary cards.
 *
 *   1. Total Nominal Faktur  — SUM of NET VALUE
 *   2. Total Dokumen         — count of records (SALES DOC count)
 *   3. Average Nominal Faktur — mean NET VALUE
 *   4. Customer Terbanyak    — customer with most documents
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Banknote, FileText, BarChart2, Users } from "lucide-react";
import type { FakturRecord, FakturKPIs } from "./types";

// ─── KPI Calculation ──────────────────────────────────────────────────────────

export function calculateKPIs(data: FakturRecord[]): FakturKPIs | null {
    if (data.length === 0) return null;

    const totalNetValue = data.reduce((s, r) => s + r.netValue, 0);
    const totalDokumen = data.length;
    const averageNetValue = totalNetValue / totalDokumen;

    // Customer with most documents
    const custMap = new Map<string, number>();
    for (const r of data) {
        custMap.set(r.customer, (custMap.get(r.customer) ?? 0) + 1);
    }
    let customerTerbanyak: FakturKPIs["customerTerbanyak"] = null;
    let maxCount = -Infinity;
    for (const [name, count] of custMap) {
        if (count > maxCount) { maxCount = count; customerTerbanyak = { name, count }; }
    }

    return { totalNetValue, totalDokumen, averageNetValue, customerTerbanyak };
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatRpCompact(v: number): string {
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(2)}M`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}Jt`;
    return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

function formatRpFull(v: number): string {
    return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
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
            aria-label={`${title}: ${primary}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#111827] leading-none truncate">{primary}</p>
                    {secondary && <p className="text-xs text-[#64748B] mt-1.5 truncate">{secondary}</p>}
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

// ─── Main Component ───────────────────────────────────────────────────────────

interface FakturCardsProps { data: FakturRecord[]; loading?: boolean }

export const FakturCards = memo(function FakturCards({ data, loading = false }: FakturCardsProps) {
    const kpis = useMemo(() => calculateKPIs(data), [data]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    const C = {
        total: { icon: Banknote, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accentBorder: "border-l-emerald-500" },
        docs: { icon: FileText, iconBg: "bg-blue-50", iconColor: "text-blue-600", accentBorder: "border-l-blue-500" },
        avg: { icon: BarChart2, iconBg: "bg-orange-50", iconColor: "text-orange-600", accentBorder: "border-l-orange-500" },
        custTop: { icon: Users, iconBg: "bg-violet-50", iconColor: "text-violet-600", accentBorder: "border-l-violet-500" },
    } as const;

    if (!kpis) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-label="KPI Cards — no data">
                <EmptyKpiCard title="Total Nominal Faktur"   {...C.total} delay={0} />
                <EmptyKpiCard title="Total Dokumen"          {...C.docs} delay={0.07} />
                <EmptyKpiCard title="Average Nominal Faktur" {...C.avg} delay={0.14} />
                <EmptyKpiCard title="Customer Terbanyak"     {...C.custTop} delay={0.21} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" aria-label="KPI Cards">
            <KpiCard
                title="Total Nominal Faktur"
                primary={formatRpCompact(kpis.totalNetValue)}
                secondary={formatRpFull(kpis.totalNetValue)}
                {...C.total} delay={0}
            />
            <KpiCard
                title="Total Dokumen"
                primary={kpis.totalDokumen.toLocaleString("id-ID")}
                secondary="Sales Doc dalam filter"
                {...C.docs} delay={0.07}
            />
            <KpiCard
                title="Average Nominal Faktur"
                primary={formatRpCompact(kpis.averageNetValue)}
                secondary={formatRpFull(Math.round(kpis.averageNetValue))}
                {...C.avg} delay={0.14}
            />
            <KpiCard
                title="Customer Terbanyak"
                primary={kpis.customerTerbanyak?.name ?? "—"}
                secondary={kpis.customerTerbanyak ? `${kpis.customerTerbanyak.count} dokumen` : undefined}
                {...C.custTop} delay={0.21}
            />
        </div>
    );
});

export default FakturCards;
