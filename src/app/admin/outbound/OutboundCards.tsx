"use client";

/**
 * OutboundCards — 4 KPI summary cards for the Outbound dashboard.
 *
 *   1. Total Delivery    — count of records in filtered data
 *   2. Total Box         — SUM of totalBox across all filtered records
 *   3. Total Qty         — SUM of totalQty across all filtered records
 *   4. Status FO Dominan — statusFO with the highest record count, shown as "NAME (count)"
 *
 * Requirements: 3.1–3.9
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, Package, Archive, Activity } from "lucide-react";
import type { OutboundRecord } from "./types";

// ─── KPI Calculation ──────────────────────────────────────────────────────────

interface OutboundKPIs {
    totalDelivery: number;
    totalBox: number;
    totalQty: number;
    dominantStatusFO: { name: string; count: number } | null;
}

function calculateKPIs(data: OutboundRecord[]): OutboundKPIs {
    const totalDelivery = data.length;
    const totalBox = data.reduce((s, r) => s + r.totalBox, 0);
    const totalQty = data.reduce((s, r) => s + r.totalQty, 0);

    // Build frequency map for statusFO
    let dominantStatusFO: OutboundKPIs["dominantStatusFO"] = null;
    if (data.length > 0) {
        const freqMap = new Map<string, number>();
        for (const r of data) {
            freqMap.set(r.statusFO, (freqMap.get(r.statusFO) ?? 0) + 1);
        }
        let maxCount = -Infinity;
        for (const [name, count] of freqMap) {
            if (count > maxCount) {
                maxCount = count;
                dominantStatusFO = { name, count };
            }
        }
    }

    return { totalDelivery, totalBox, totalQty, dominantStatusFO };
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
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 ${accentBorder} shadow-sm`}
            aria-label={`${title}: ${primary}`}
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

// ─── Card config constants ────────────────────────────────────────────────────

const CARD_CONFIG = {
    delivery: {
        icon: Truck,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        accentBorder: "border-l-emerald-500",
    },
    box: {
        icon: Package,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        accentBorder: "border-l-blue-500",
    },
    qty: {
        icon: Archive,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        accentBorder: "border-l-orange-500",
    },
    statusFO: {
        icon: Activity,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        accentBorder: "border-l-violet-500",
    },
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────

interface OutboundCardsProps {
    data: OutboundRecord[];
}

export const OutboundCards = memo(function OutboundCards({ data }: OutboundCardsProps) {
    const kpis = useMemo(() => calculateKPIs(data), [data]);

    const dominantPrimary =
        kpis.dominantStatusFO !== null
            ? `${kpis.dominantStatusFO.name} (${kpis.dominantStatusFO.count})`
            : "—";

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
            aria-label="Outbound KPI Cards"
        >
            <KpiCard
                title="Total Delivery"
                primary={kpis.totalDelivery.toLocaleString("id-ID")}
                secondary="Jumlah pengiriman"
                {...CARD_CONFIG.delivery}
                delay={0}
            />
            <KpiCard
                title="Total Box"
                primary={kpis.totalBox.toLocaleString("id-ID")}
                secondary="Kardus terkirim"
                {...CARD_CONFIG.box}
                delay={0.07}
            />
            <KpiCard
                title="Total Qty"
                primary={kpis.totalQty.toLocaleString("id-ID")}
                secondary="Item terkirim"
                {...CARD_CONFIG.qty}
                delay={0.14}
            />
            <KpiCard
                title="Status FO Dominan"
                primary={dominantPrimary}
                secondary={
                    kpis.dominantStatusFO !== null
                        ? "Status paling sering"
                        : "Belum ada data"
                }
                {...CARD_CONFIG.statusFO}
                delay={0.21}
            />
        </div>
    );
});

export default OutboundCards;
