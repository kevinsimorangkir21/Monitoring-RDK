"use client";

/**
 * ProductivityChart — % Produktivitas Bongkar
 * Donut PieChart: distribusi jumlah mobil per interval waktu bongkar.
 * Lazy-loaded via dynamic() in the page.
 */

import { useCallback, useState } from "react";
import {
    PieChart, Pie, Cell,
    Tooltip, Sector, ResponsiveContainer,
} from "recharts";
import { produktivitasBongkarData } from "@/mock/inbound";
import type { ProduktivitasBongkarItem } from "@/types/inbound";

// ─── Colour palette (index-matched to the 6 intervals) ───────────────────────

const COLORS = [
    "#3B82F6", // 00:00-04:00
    "#10B981", // 04:00-08:00
    "#F59E0B", // 08:00-12:00
    "#EC4899", // 12:00-16:00
    "#8B5CF6", // 16:00-20:00
    "#EF4444", // 20:00-00:00
];

// ─── Active (hover) shape — slice expands slightly ───────────────────────────

interface ActiveShapeProps {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
}

function ActiveShape({
    cx, cy,
    innerRadius, outerRadius,
    startAngle, endAngle,
    fill,
}: ActiveShapeProps) {
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius - 2}
            outerRadius={outerRadius + 8}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
    payload: ProduktivitasBongkarItem & { pct: string };
    fill: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs shadow-lg min-w-[160px]">
            <p className="font-bold text-[#111827] mb-1">{d.interval}</p>
            <p style={{ color: payload[0].fill }} className="font-semibold">
                {Number(d.jumlahMobil).toLocaleString("id-ID")} Mobil ({d.pct}%)
            </p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductivityChart() {
    const data = produktivitasBongkarData;
    const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

    const onEnter = useCallback((_: unknown, idx: number) => setActiveIdx(idx), []);
    const onLeave = useCallback(() => setActiveIdx(undefined), []);

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 320 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data produktivitas bongkar.</p>
            </div>
        );
    }

    // Pre-compute total and per-item pct so Tooltip can access it
    const total = data.reduce((s, d) => s + d.jumlahMobil, 0);
    const enriched = data.map((d) => ({
        ...d,
        pct: total > 0 ? ((d.jumlahMobil / total) * 100).toFixed(1) : "0.0",
    }));

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">% Produktivitas Bongkar</p>
                <p className="text-xs text-[#64748B]">
                    Distribusi mobil berdasarkan interval waktu bongkar
                </p>
            </div>

            {/* Donut */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={enriched}
                            dataKey="jumlahMobil"
                            nameKey="interval"
                            cx="50%"
                            cy="50%"
                            innerRadius="48%"
                            outerRadius="72%"
                            paddingAngle={2}
                            stroke="#ffffff"
                            strokeWidth={2}
                            activeIndex={activeIdx}
                            activeShape={ActiveShape as never}
                            onMouseEnter={onEnter}
                            onMouseLeave={onLeave}
                            isAnimationActive
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {enriched.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend — rectangle icons, always below chart */}
            <div className="shrink-0 flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {enriched.map((d, i) => (
                    <div key={d.interval} className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-3 h-2.5 rounded-sm"
                            style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-[11px] text-[#374151] font-medium">
                            {d.interval}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
