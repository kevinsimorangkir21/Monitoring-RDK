"use client";

/**
 * SummaryCards — 4 animated KPI cards for Gantungan Faktur dashboard.
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp, TrendingDown,
    FileText, Wallet, Calculator, Clock,
    type LucideIcon,
} from "lucide-react";
import { KPI } from "@/mock/gantunganFaktur";
import { fmtNumber } from "@/utils/formatNumber";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000): number {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);
    return val;
}

// ─── Single card ─────────────────────────────────────────────────────────────

interface CardProps {
    title: string;
    displayValue: string;
    numericValue: number;
    percentChange: number;
    isCurrency?: boolean;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    accentBorder: string;
    delay?: number;
}

const SummaryCard = memo(function SummaryCard({
    title, displayValue, numericValue, percentChange, isCurrency = false,
    icon: Icon, iconBg, iconColor, valueColor, accentBorder, delay = 0,
}: CardProps) {
    const count = useCountUp(numericValue);
    const isUp = percentChange >= 0;

    const formatted = isCurrency
        ? `Rp ${fmtNumber(count)}`
        : count.toLocaleString("id-ID");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 ${accentBorder} shadow-sm`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-[#64748B] mb-1">{title}</p>
                    <p className={`text-2xl font-bold leading-none ${valueColor} ${isCurrency ? "text-lg" : ""}`}>
                        {formatted}
                    </p>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{Math.abs(percentChange)}% bulan ini</span>
                    </div>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
});

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                title="Total Dokumen"
                displayValue={KPI.totalDokumen.toLocaleString("id-ID")}
                numericValue={KPI.totalDokumen}
                percentChange={+6.2}
                isCurrency={false}
                icon={FileText}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                valueColor="text-blue-700"
                accentBorder="border-l-blue-500"
                delay={0}
            />
            <SummaryCard
                title="Total Nominal Faktur"
                displayValue={`Rp ${fmtNumber(KPI.totalNominal)}`}
                numericValue={KPI.totalNominal}
                percentChange={+9.1}
                isCurrency={true}
                icon={Wallet}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-700"
                accentBorder="border-l-emerald-500"
                delay={0.06}
            />
            <SummaryCard
                title="Rata-rata Nominal/Dokumen"
                displayValue={`Rp ${fmtNumber(KPI.rataRataNominal)}`}
                numericValue={KPI.rataRataNominal}
                percentChange={+2.8}
                isCurrency={true}
                icon={Calculator}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
                valueColor="text-orange-700"
                accentBorder="border-l-orange-500"
                delay={0.12}
            />
            <SummaryCard
                title="Outstanding Faktur"
                displayValue={KPI.outstanding.toLocaleString("id-ID")}
                numericValue={KPI.outstanding}
                percentChange={-3.4}
                isCurrency={false}
                icon={Clock}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                valueColor="text-red-700"
                accentBorder="border-l-red-500"
                delay={0.18}
            />
        </div>
    );
}
