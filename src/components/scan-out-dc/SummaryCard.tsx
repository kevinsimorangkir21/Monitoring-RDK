"use client";

/**
 * SummaryCard — KPI card with count-up, percentage trend, and hover lift.
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

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

export interface SummaryCardProps {
    title: string;
    numericValue: number;
    percentChange: number;   // positive = up, negative = down
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
}: SummaryCardProps) {
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
                        <span>{Math.abs(percentChange)}% hari ini</span>
                    </div>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
});

export default SummaryCard;
