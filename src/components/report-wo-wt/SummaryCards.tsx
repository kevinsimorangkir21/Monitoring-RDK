"use client";

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Layers, type LucideIcon } from "lucide-react";
import { KPI } from "@/mock/reportWoWt";

function useCountUp(target: number, duration = 1000, decimals = 1): string {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            setVal(+(target * (1 - Math.pow(1 - p, 3))).toFixed(decimals));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration, decimals]);
    return val.toFixed(decimals);
}

interface CardProps {
    title: string;
    value: number;
    unit?: string;
    percentChange: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    accentBorder: string;
    delay?: number;
}

const SummaryCard = memo(function SummaryCard({
    title, value, unit = "%", percentChange,
    icon: Icon, iconBg, iconColor, valueColor, accentBorder, delay = 0,
}: CardProps) {
    const count = useCountUp(value);
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
                        {count}{unit}
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

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
                title="Global WO-WT"
                value={KPI.globalWoWt}
                percentChange={+1.8}
                icon={Activity}
                iconBg="bg-[#DC2626]/10"
                iconColor="text-[#DC2626]"
                valueColor="text-[#DC2626]"
                accentBorder="border-l-[#DC2626]"
                delay={0}
            />
            <SummaryCard
                title="ZWP1"
                value={KPI.zwp1}
                percentChange={+2.4}
                icon={Layers}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                valueColor="text-blue-700"
                accentBorder="border-l-blue-500"
                delay={0.06}
            />
            <SummaryCard
                title="ZWP2"
                value={KPI.zwp2}
                percentChange={+1.1}
                icon={Layers}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                valueColor="text-violet-700"
                accentBorder="border-l-violet-500"
                delay={0.12}
            />
            <SummaryCard
                title="ZWP4"
                value={KPI.zwp4}
                percentChange={+2.0}
                icon={Layers}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-700"
                accentBorder="border-l-emerald-500"
                delay={0.18}
            />
            <SummaryCard
                title="ZWP5"
                value={KPI.zwp5}
                percentChange={-0.6}
                icon={Layers}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
                valueColor="text-orange-700"
                accentBorder="border-l-orange-500"
                delay={0.24}
            />
        </div>
    );
}
