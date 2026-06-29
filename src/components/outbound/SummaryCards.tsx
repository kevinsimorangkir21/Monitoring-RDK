"use client";

/**
 * SummaryCards (Outbound) — 4-card KPI row.
 *
 * Card 1 — Total Mobil Muat   (plain count, Truck icon, red accent)
 * Card 2 — Muat Inap          (percent + jumlah mobil, amber)
 * Card 3 — Muat Pagi          (percent + jumlah mobil, sky blue)
 * Card 4 — Rit 2              (percent + jumlah mobil, green)
 *
 * Matches original HTML dashboard structure exactly.
 */

import { Truck, Moon, Sunrise, RotateCcw } from "lucide-react";
import SummaryCard from "./SummaryCard";
import { OUTBOUND_SUMMARY } from "@/mock/outbound";

export default function SummaryCards() {
    const { totalMobilMuat, muatInap, muatPagi, rit2 } = OUTBOUND_SUMMARY;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 — Total Mobil Muat */}
            <SummaryCard
                title="Total Mobil Muat"
                numericValue={totalMobilMuat}
                icon={Truck}
                iconBg="bg-red-50"
                iconColor="text-[#DC2626]"
                valueColor="text-[#DC2626]"
                accentBorder="border-l-[#DC2626]"
                delay={0}
            />

            {/* Card 2 — Muat Inap */}
            <SummaryCard
                title="Muat Inap"
                numericValue={muatInap.count}
                percentLabel={`${muatInap.percent}%`}
                subLabel={`${muatInap.count} Mobil`}
                icon={Moon}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                valueColor="text-amber-600"
                accentBorder="border-l-amber-500"
                delay={0.07}
            />

            {/* Card 3 — Muat Pagi */}
            <SummaryCard
                title="Muat Pagi"
                numericValue={muatPagi.count}
                percentLabel={`${muatPagi.percent}%`}
                subLabel={`${muatPagi.count} Mobil`}
                icon={Sunrise}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
                valueColor="text-sky-600"
                accentBorder="border-l-sky-500"
                delay={0.14}
            />

            {/* Card 4 — Rit 2 */}
            <SummaryCard
                title="Rit 2"
                numericValue={rit2.count}
                percentLabel={`${rit2.percent}%`}
                subLabel={`${rit2.count} Mobil`}
                icon={RotateCcw}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-600"
                accentBorder="border-l-emerald-500"
                delay={0.21}
            />
        </div>
    );
}
