"use client";

/**
 * SummaryCard (Outbound) — Animated KPI card.
 * Two variants:
 *   - "count"   : shows a plain count-up integer
 *   - "percent" : shows percentage + sub-label (jumlah mobil)
 * Visual design is consistent with the Inbound SummaryCard.
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// ─── Count-up hook ─────────────────────────────────────────────────────────────

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

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SummaryCardProps {
    title: string;
    /** Integer used for count-up */
    numericValue: number;
    /** Optional percent string shown instead of count, e.g. "18.3%" */
    percentLabel?: string;
    /** Sub-text below main value e.g. "57 Mobil" */
    subLabel?: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    accentBorder: string;
    delay?: number;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SummaryCard = memo(function SummaryCard({
    title,
    numericValue,
    percentLabel,
    subLabel,
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
            {/* Icon */}
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
            >
                <Icon size={22} className={iconColor} />
            </div>

            {/* Text */}
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#64748B] mb-0.5 truncate">{title}</p>

                {/* Main value: percent or plain count */}
                {percentLabel ? (
                    <p className={`text-2xl font-bold leading-none ${valueColor}`}>
                        {percentLabel}
                    </p>
                ) : (
                    <p className={`text-2xl font-bold leading-none ${valueColor}`}>
                        {count.toLocaleString("id-ID")}
                    </p>
                )}

                {/* Sub-label: jumlah mobil */}
                {subLabel && (
                    <p className="text-xs text-[#64748B] mt-1 font-medium">{subLabel}</p>
                )}
            </div>
        </motion.div>
    );
});

export default SummaryCard;
