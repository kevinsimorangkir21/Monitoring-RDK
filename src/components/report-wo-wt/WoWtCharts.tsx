"use client";

/**
 * WoWtCharts — 3 charts for Report WO-WT dashboard.
 *   1. DailyTrendChart   — Daily WO-WT Trend (Multi Line)
 *   2. ComparisonChart   — Average WO-WT Comparison (Horizontal Bar)
 *   3. RadarChart        — WO-WT Distribution (Radar)
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    RadarChart as RechartRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { dailyTrendData, comparisonData, radarData } from "@/mock/reportWoWt";

// ─── Zone colours ──────────────────────────────────────────────────────────────

const ZONE_COLOR: Record<string, string> = {
    ZWP1: "#DC2626",
    ZWP2: "#3B82F6",
    ZWP4: "#10B981",
    ZWP5: "#F59E0B",
};

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

function PctTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; name: string; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {p.value.toFixed(1)}%
                </p>
            ))}
        </div>
    );
}

// ─── 1. Daily WO-WT Trend (Multi Line) ───────────────────────────────────────

export const DailyTrendChart = memo(function DailyTrendChart() {
    return (
        <ChartCard
            title="Daily WO-WT Trend"
            subtitle="Tren performa WO-WT per zone (7 hari terakhir)"
        >
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyTrendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[75, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={38}
                    />
                    <Tooltip content={<PctTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {(["ZWP1", "ZWP2", "ZWP4", "ZWP5"] as const).map((zone) => (
                        <Line
                            key={zone}
                            type="monotone"
                            dataKey={zone}
                            stroke={ZONE_COLOR[zone]}
                            strokeWidth={2.5}
                            dot={{ r: 3.5, fill: ZONE_COLOR[zone], strokeWidth: 0 }}
                            activeDot={{ r: 5.5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 2. Average WO-WT Comparison (Horizontal Bar) ────────────────────────────

function ComparisonTooltip({ active, payload }: {
    active?: boolean;
    payload?: { value: number; payload: { zone: string } }[];
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827]">{payload[0].payload.zone}</p>
            <p className="text-[#DC2626]">{payload[0].value.toFixed(1)}%</p>
        </div>
    );
}

export const ComparisonChart = memo(function ComparisonChart() {
    return (
        <ChartCard
            title="Average WO-WT Comparison"
            subtitle="Perbandingan rata-rata WO-WT antar zone"
        >
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={comparisonData}
                    layout="vertical"
                    barSize={20}
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[75, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="zone"
                        tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <Tooltip content={<ComparisonTooltip />} />
                    <Bar dataKey="value" name="WO-WT" radius={[0, 8, 8, 0]}>
                        {comparisonData.map((entry) => (
                            <rect key={entry.zone} fill={ZONE_COLOR[entry.zone]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
                {comparisonData.map((d) => (
                    <div key={d.zone} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ZONE_COLOR[d.zone] }} />
                        <span className="text-xs text-[#374151] font-medium">{d.zone}</span>
                        <span className="text-xs font-bold" style={{ color: ZONE_COLOR[d.zone] }}>{d.value.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
});

// ─── 3. WO-WT Distribution (Radar) ───────────────────────────────────────────

export const RadarChartComponent = memo(function RadarChartComponent() {
    return (
        <ChartCard
            title="WO-WT Distribution"
            subtitle="Distribusi performa WO-WT per zone"
        >
            <ResponsiveContainer width="100%" height={260}>
                <RechartRadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[70, 100]}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Radar
                        name="WO-WT"
                        dataKey="value"
                        stroke="#DC2626"
                        fill="#DC2626"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#DC2626", strokeWidth: 0 }}
                    />
                    <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}%`, "WO-WT"]}
                        contentStyle={{
                            fontSize: 12,
                            borderRadius: 10,
                            border: "1px solid #E5E7EB",
                        }}
                    />
                </RechartRadarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});
