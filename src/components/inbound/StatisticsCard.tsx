"use client";

/**
 * StatisticsCard — Animated KPI card. Light enterprise design.
 * Count-up animation on mount, hover lift effect.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * ease));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);
    return value;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatisticsCardProps {
    title: string;
    numericValue: number;
    suffix?: string;
    subLabel?: string;
    icon: LucideIcon;
    /** Tailwind bg class for icon container, e.g. "bg-emerald-50" */
    iconBg: string;
    /** Tailwind text class for icon, e.g. "text-emerald-600" */
    iconColor: string;
    /** Tailwind text class for value, e.g. "text-emerald-700" */
    valueColor: string;
    /** Tailwind border-l color class, e.g. "border-l-emerald-500" */
    accentBorder: string;
    delay?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatisticsCard({
    title,
    numericValue,
    suffix = "",
    subLabel,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor,
    accentBorder,
    delay = 0,
}: StatisticsCardProps) {
    const count = useCountUp(numericValue);

    const display =
        suffix === "%"
            ? (count / 10).toFixed(1) + "%" // 809 → "80.9%"
            : count.toLocaleString("id-ID");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", transition: { duration: 0.2 } }}
            className={`relative bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[120px] flex items-center gap-4 overflow-hidden cursor-default border-l-[3px] ${accentBorder}`}
        >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
            </div>

            {/* Text */}
            <div className="min-w-0">
                <p className="text-xs text-[#64748B] font-medium tracking-wide mb-0.5">{title}</p>
                <p className={`text-2xl font-bold leading-none ${valueColor}`}>{display}</p>
                {subLabel && (
                    <p className="text-[11px] text-[#64748B] mt-1 font-medium">{subLabel}</p>
                )}
            </div>
        </motion.div>
    );
}
