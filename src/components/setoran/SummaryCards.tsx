"use client";

/**
 * SummaryCards — 3 KPI cards for Setoran ke Kasir dashboard.
 *   1. AverageDurationCard  — Rata-rata Durasi Setoran
 *   2. LongestDurationCard  — Salesman Durasi Terlama
 *   3. FastestDurationCard  — Salesman Durasi Tercepat
 */

import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { Clock, Trophy, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { KPI } from "@/mock/setoran";

// ─── Count-up for seconds ─────────────────────────────────────────────────────

function useCountUpSeconds(target: number, duration = 1200): string {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
            setVal(v);
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    const h = Math.floor(val / 3600);
    const m = Math.floor((val % 3600) / 60);
    const s = val % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─── 1. Average Duration Card ─────────────────────────────────────────────────

export const AverageDurationCard = memo(function AverageDurationCard() {
    const displayed = useCountUpSeconds(KPI.avgDurasiSeconds);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 border-l-[#DC2626] shadow-sm"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-[#64748B] mb-1">Rata-rata Durasi Setoran</p>
                    <p className="text-2xl font-bold font-mono text-[#DC2626] leading-none">{displayed}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                        <TrendingDown size={12} />
                        <span>vs kemarin: {KPI.prevAvgDurasi}</span>
                    </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#DC2626]/10">
                    <Clock size={20} className="text-[#DC2626]" />
                </div>
            </div>
        </motion.div>
    );
});

// ─── 2. Longest Duration Card ─────────────────────────────────────────────────

export const LongestDurationCard = memo(function LongestDurationCard() {
    const r = KPI.longestRecord;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 border-l-[#DC2626] shadow-sm"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-[#64748B] mb-1">Salesman Durasi Terlama</p>
                    <p className="text-base font-bold text-[#111827] leading-tight truncate">{r.namaSalesman}</p>
                    <p className="text-xl font-bold font-mono text-red-600 mt-0.5">{r.durasi}</p>
                    <p className="text-[11px] text-[#64748B] mt-1">{r.tanggal}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-50">
                    <Trophy size={20} className="text-red-600" />
                </div>
            </div>
        </motion.div>
    );
});

// ─── 3. Fastest Duration Card ─────────────────────────────────────────────────

export const FastestDurationCard = memo(function FastestDurationCard() {
    const r = KPI.fastestRecord;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 border-l-[#2563EB] shadow-sm"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-[#64748B] mb-1">Salesman Durasi Tercepat</p>
                    <p className="text-base font-bold text-[#111827] leading-tight truncate">{r.namaSalesman}</p>
                    <p className="text-xl font-bold font-mono text-[#2563EB] mt-0.5">{r.durasi}</p>
                    <p className="text-[11px] text-[#64748B] mt-1">{r.tanggal}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                    <Zap size={20} className="text-[#2563EB]" />
                </div>
            </div>
        </motion.div>
    );
});

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AverageDurationCard />
            <LongestDurationCard />
            <FastestDurationCard />
        </div>
    );
}
