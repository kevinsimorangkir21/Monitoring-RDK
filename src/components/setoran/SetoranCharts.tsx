"use client";

/**
 * SetoranCharts — 2 horizontal bar charts.
 *   1. LongestChart  — Top 5 Durasi Terlama (red gradient)
 *   2. FastestChart  — Top 5 Durasi Tercepat (blue gradient)
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { longestChartData, fastestChartData } from "@/mock/setoran";
import type { DurasiChartItem } from "@/types/setoran";

// ─── Shared card ──────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">{title}</p>
                {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

// ─── Shared tooltip ───────────────────────────────────────────────────────────

function DurasiTooltip({ active, payload }: {
    active?: boolean;
    payload?: { payload: DurasiChartItem }[];
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-0.5">{d.salesman}</p>
            <p className="font-mono text-[#374151]">{d.durasi}</p>
            <p className="text-[#9CA3AF]">{d.durasiMinutes} menit</p>
        </div>
    );
}

// ─── Red gradient colours (darkest = rank 1) ──────────────────────────────────

const RED_SHADES = ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FECACA"];
const BLUE_SHADES = ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

// ─── 1. Longest Chart ─────────────────────────────────────────────────────────

export const LongestChart = memo(function LongestChart() {
    return (
        <ChartCard
            title="Durasi Setoran Harian Terlama"
            subtitle="Top 5 salesman dengan durasi setoran terlama"
        >
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={longestChartData}
                    layout="vertical"
                    barSize={18}
                    margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                        type="number"
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="salesman"
                        tick={{ fontSize: 10, fill: "#374151" }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                    />
                    <Tooltip content={<DurasiTooltip />} />
                    <Bar dataKey="durasiMinutes" name="Durasi" radius={[0, 6, 6, 0]}>
                        {longestChartData.map((_, i) => (
                            <Cell key={i} fill={RED_SHADES[i] ?? RED_SHADES[4]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 2. Fastest Chart ─────────────────────────────────────────────────────────

export const FastestChart = memo(function FastestChart() {
    return (
        <ChartCard
            title="Durasi Setoran Harian Tercepat"
            subtitle="Top 5 salesman dengan durasi setoran tercepat"
        >
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={fastestChartData}
                    layout="vertical"
                    barSize={18}
                    margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                        type="number"
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="salesman"
                        tick={{ fontSize: 10, fill: "#374151" }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                    />
                    <Tooltip content={<DurasiTooltip />} />
                    <Bar dataKey="durasiMinutes" name="Durasi" radius={[0, 6, 6, 0]}>
                        {fastestChartData.map((_, i) => (
                            <Cell key={i} fill={BLUE_SHADES[i] ?? BLUE_SHADES[4]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});
