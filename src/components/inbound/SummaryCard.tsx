"use client";

/**
 * SummaryCard — Single KPI card (Total Mobil / Total Box).
 * Count-up animation on mount. Left accent border. Light enterprise theme.
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1100): number {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * ease));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);
    return val;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SummaryCardProps {
    title: string;
    numericValue: number;
    icon: LucideIcon;
    /** Tailwind bg class for icon container */
    iconBg: string;
    /** Tailwind text class for icon */
    iconColor: string;
    /** Tailwind text class for the big number */
    valueColor: string;
    /** Tailwind border-l color class */
    accentBorder: string;
    delay?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SummaryCard = memo(function SummaryCard({
    title,
    numericValue,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor,
    accentBorder,
    delay = 0,
}: SummaryCardProps) {
    const count = useCountUp(numericValue);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-5 flex items-center gap-4 border-l-4 ${accentBorder} shadow-sm`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#64748B] mb-0.5">{title}</p>
                <p className={`text-2xl font-bold leading-none ${valueColor}`}>
                    {count.toLocaleString("id-ID")}
                </p>
            </div>
        </motion.div>
    );
});

export default SummaryCard;
