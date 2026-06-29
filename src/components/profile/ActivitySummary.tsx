"use client";

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { LogIn, BarChart2, Zap, FileText } from "lucide-react";
import { activityStats } from "@/mock/profile";

function useCountUp(target: number, dur = 900): number {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, dur]);
    return val;
}

function fmtLogin(iso: string) {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface KpiProps { label: string; value: string | number; icon: React.ElementType; iconBg: string; iconColor: string; }

const KpiCard = memo(function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiProps) {
    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.07)" }}
            className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]"
        >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={16} className={iconColor} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-[#64748B] font-medium">{label}</p>
                <p className="text-sm font-bold text-[#111827]">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</p>
            </div>
        </motion.div>
    );
});

export default function ActivitySummary() {
    const totalLogin = useCountUp(activityStats.totalLogin);
    const totalActions = useCountUp(activityStats.totalActions);
    const reports = useCountUp(activityStats.reportsGenerated);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="mb-4">
                <p className="text-sm font-bold text-[#111827]">Activity Summary</p>
                <p className="text-xs text-[#64748B] mt-0.5">Your account usage statistics</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Total Login" value={totalLogin} icon={LogIn} iconBg="bg-blue-50" iconColor="text-blue-600" />
                <KpiCard label="Last Login" value={fmtLogin(activityStats.lastLogin)} icon={BarChart2} iconBg="bg-amber-50" iconColor="text-amber-600" />
                <KpiCard label="Total Actions" value={totalActions} icon={Zap} iconBg="bg-violet-50" iconColor="text-violet-600" />
                <KpiCard label="Reports Generated" value={reports} icon={FileText} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            </div>
        </div>
    );
}
