"use client";

/**
 * SummaryCards — 4 animated KPI cards for Claim Vendor dashboard.
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Receipt, Clock, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import { KPI } from "@/mock/claimVendor";

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
    numericValue: number;
    percentChange: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    accentBorder: string;
    delay?: number;
}

const SummaryCard = memo(function SummaryCard({
    title, numericValue, percentChange,
    icon: Icon, iconBg, iconColor, valueColor, accentBorder, delay = 0,
}: CardProps) {
    const count = useCountUp(numericValue);
    const isUp = percentChange >= 0;

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
                    <p className={`text-2xl font-bold leading-none ${valueColor}`}>
                        {count.toLocaleString("id-ID")}
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
                title="Total Claim"
                numericValue={KPI.totalClaim}
                percentChange={+8.4}
                icon={Receipt}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                valueColor="text-blue-700"
                accentBorder="border-l-blue-500"
                delay={0}
            />
            <SummaryCard
                title="Waiting Approval"
                numericValue={KPI.waitingApproval}
                percentChange={+2.1}
                icon={Clock}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                valueColor="text-amber-700"
                accentBorder="border-l-amber-500"
                delay={0.06}
            />
            <SummaryCard
                title="Approved"
                numericValue={KPI.approved}
                percentChange={+5.3}
                icon={CheckCircle2}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-700"
                accentBorder="border-l-emerald-500"
                delay={0.12}
            />
            <SummaryCard
                title="Rejected"
                numericValue={KPI.rejected}
                percentChange={-1.8}
                icon={XCircle}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                valueColor="text-red-700"
                accentBorder="border-l-red-500"
                delay={0.18}
            />
        </div>
    );
}
