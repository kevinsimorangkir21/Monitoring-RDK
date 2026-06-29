"use client";

/**
 * SummaryCards — KPI row: Total Mobil | Total Box | Komposisi (one card).
 * Exactly 3 cards matching the original HTML dashboard structure.
 */

import { Truck, Package } from "lucide-react";
import SummaryCard from "./SummaryCard";
import CompositionCard from "./CompositionCard";
import { SUMMARY } from "@/mock/inbound";

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Total Mobil */}
            <SummaryCard
                title="Total Mobil"
                numericValue={SUMMARY.totalMobil}
                icon={Truck}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-700"
                accentBorder="border-l-emerald-500"
                delay={0}
            />

            {/* Card 2 — Total Box */}
            <SummaryCard
                title="Total Box"
                numericValue={SUMMARY.totalBox}
                icon={Package}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                valueColor="text-blue-700"
                accentBorder="border-l-blue-500"
                delay={0.07}
            />

            {/* Card 3 — Komposisi Jenis Bongkaran (SlipSheet + Curah in one card) */}
            <CompositionCard delay={0.14} />
        </div>
    );
}
