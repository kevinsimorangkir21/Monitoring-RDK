"use client";

/**
 * InboundCards — 3 KPI summary cards (Row 1).
 *
 *   1. Total Mobil       — jumlah seluruh transaksi
 *   2. Total Box         — SUM Total Box
 *   3. Komposisi Jenis Bongkaran — Slipsheet % + Curah % dalam satu card
 *
 * Empty state: menampilkan 0 / 0% tanpa NaN.
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, Package, Layers } from "lucide-react";
import type { InboundRecord, InboundKPIs } from "./types";

// ─── Pure computation ─────────────────────────────────────────────────────────

export function computeKPIs(data: InboundRecord[]): InboundKPIs {
    const totalMobil = data.length;
    let totalBox = 0;
    let slipsheetCount = 0;
    let curahCount = 0;

    for (const r of data) {
        totalBox += r.totalBox;
        if (r.jenisBongkaran === "SLIPSHEET") slipsheetCount += 1;
        else if (r.jenisBongkaran === "CURAH") curahCount += 1;
    }

    const pctSlipsheet = totalMobil > 0 ? (slipsheetCount / totalMobil) * 100 : 0;
    const pctCurah = totalMobil > 0 ? (curahCount / totalMobil) * 100 : 0;

    return {
        totalMobil,
        totalBox,
        slipsheet: { count: slipsheetCount, pct: pctSlipsheet },
        curah: { count: curahCount, pct: pctCurah },
    };
}

// ─── Simple KpiCard ───────────────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentBorder: string;
    delay: number;
}

const KpiCard = memo(function KpiCard({
    title, value, subtitle,
    icon: Icon, iconBg, iconColor, accentBorder, delay,
}: KpiCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 ${accentBorder} shadow-sm`}
            aria-label={`${title}: ${value}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-2">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#111827] leading-none">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-[#64748B] mt-1.5 truncate">{subtitle}</p>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`} aria-hidden="true">
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.article>
    );
});

// ─── Komposisi Jenis Bongkaran card ──────────────────────────────────────────

interface KomposisiCardProps {
    slipsheet: { count: number; pct: number };
    curah: { count: number; pct: number };
    delay: number;
}

const KomposisiCard = memo(function KomposisiCard({ slipsheet, curah, delay }: KomposisiCardProps) {
    const fmtPct = (n: number) => `${n.toFixed(1)}%`;

    return (
        <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 border-l-violet-500 shadow-sm"
            aria-label="Komposisi Jenis Bongkaran"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#64748B] mb-3">Komposisi Jenis Bongkaran</p>

                    {/* Slipsheet row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500 shrink-0" />
                            <span className="text-xs font-medium text-[#374151]">Slipsheet</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-[#111827]">{fmtPct(slipsheet.pct)}</span>
                            <span className="text-xs text-[#64748B] ml-1">({slipsheet.count} Mobil)</span>
                        </div>
                    </div>

                    {/* Progress bar Slipsheet */}
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mb-3">
                        <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${Math.min(slipsheet.pct, 100)}%` }}
                        />
                    </div>

                    {/* Curah row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#DC2626] shrink-0" />
                            <span className="text-xs font-medium text-[#374151]">Curah</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-[#111827]">{fmtPct(curah.pct)}</span>
                            <span className="text-xs text-[#64748B] ml-1">({curah.count} Mobil)</span>
                        </div>
                    </div>

                    {/* Progress bar Curah */}
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full">
                        <div
                            className="h-full bg-[#DC2626] rounded-full transition-all"
                            style={{ width: `${Math.min(curah.pct, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-50" aria-hidden="true">
                    <Layers size={20} className="text-violet-600" />
                </div>
            </div>
        </motion.article>
    );
});

// ─── Main ─────────────────────────────────────────────────────────────────────

interface InboundCardsProps { data: InboundRecord[] }

export const InboundCards = memo(function InboundCards({ data }: InboundCardsProps) {
    const kpis = useMemo(() => computeKPIs(data), [data]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5" aria-label="Inbound KPI Cards">
            {/* Card 1 — Total Mobil */}
            <KpiCard
                title="Total Mobil"
                value={kpis.totalMobil.toLocaleString("id-ID")}
                subtitle="Jumlah transaksi inbound"
                icon={Truck}
                iconBg="bg-red-50" iconColor="text-[#DC2626]"
                accentBorder="border-l-[#DC2626]"
                delay={0}
            />
            {/* Card 2 — Total Box */}
            <KpiCard
                title="Total Box"
                value={kpis.totalBox.toLocaleString("id-ID")}
                subtitle="Akumulasi seluruh box"
                icon={Package}
                iconBg="bg-blue-50" iconColor="text-[#2563EB]"
                accentBorder="border-l-[#2563EB]"
                delay={0.07}
            />
            {/* Card 3 — Komposisi Jenis Bongkaran */}
            <KomposisiCard
                slipsheet={kpis.slipsheet}
                curah={kpis.curah}
                delay={0.14}
            />
        </div>
    );
});

export default InboundCards;
