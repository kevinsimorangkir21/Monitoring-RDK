"use client";

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, UserX, Shield, TrendingUp, type LucideIcon } from "lucide-react";
import { USER_KPI } from "@/mock/users";

function useCountUp(target: number, duration = 900): number {
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

interface CardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    accentBorder: string;
    delay?: number;
}

const SummaryCard = memo(function SummaryCard({ title, value, icon: Icon, iconBg, iconColor, valueColor, accentBorder, delay = 0 }: CardProps) {
    const count = useCountUp(value);
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
                    <p className={`text-3xl font-bold leading-none ${valueColor}`}>{count.toLocaleString("id-ID")}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                        <TrendingUp size={11} /><span>Total terdaftar</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Users" value={USER_KPI.total} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" valueColor="text-blue-700" accentBorder="border-l-blue-500" delay={0} />
            <SummaryCard title="Active Users" value={USER_KPI.active} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-700" accentBorder="border-l-emerald-500" delay={0.06} />
            <SummaryCard title="Inactive Users" value={USER_KPI.inactive} icon={UserX} iconBg="bg-orange-50" iconColor="text-orange-600" valueColor="text-orange-700" accentBorder="border-l-orange-500" delay={0.12} />
            <SummaryCard title="Administrators" value={USER_KPI.administrators} icon={Shield} iconBg="bg-red-50" iconColor="text-[#DC2626]" valueColor="text-[#DC2626]" accentBorder="border-l-[#DC2626]" delay={0.18} />
        </div>
    );
}
