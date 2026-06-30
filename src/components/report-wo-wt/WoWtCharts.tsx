"use client";

/**
 * WoWtCharts — Charts for Report WO-WT dashboard.
 *   DailyTrendChart — ComposedChart: Bar (ZWP1-5) + Line (WO-WT Global)
 *
 * ComparisonChart and RadarChartComponent removed per revision spec.
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { dailyTrendData } from "@/mock/reportWoWt";

// ─── Zone colours ──────────────────────────────────────────────────────────────

const ZONE_COLOR: Record<string, string> = {
    ZWP1: "#DC2626",
    ZWP2: "#3B82F6",
    ZWP4: "#10B981",
    ZWP5: "#F59E0B",
};

const GLOBAL_COLOR = "#7C3AED";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
    type?: string;
}

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[180px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{ background: p.color }}
                        />
                        <span className="text-[#374151] font-medium">{p.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">{p.value.toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
            {payload.map((entry) => (
                <div key={entry.value} className="flex items-center gap-1.5">
                    {entry.type === "line" ? (
                        <span
                            className="inline-block w-5 h-[3px] rounded-full"
                            style={{ background: entry.color }}
                        />
                    ) : (
                        <span
                            className="inline-block w-3 h-3 rounded-sm"
                            style={{ background: entry.color }}
                        />
                    )}
                    <span className="text-[11px] text-[#64748B] font-medium">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── DailyTrendChart (ComposedChart: grouped bars + global line) ──────────────

export const DailyTrendChart = memo(function DailyTrendChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Daily WO-WT Trend</p>
                <p className="text-xs text-[#64748B]">
                    Tren performa WO-WT per zone + global (7 hari terakhir)
                </p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                    data={dailyTrendData}
                    margin={{ top: 4, right: 16, left: -4, bottom: 0 }}
                    barCategoryGap="25%"
                    barGap={2}
                >
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
                        width={40}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    {/* Grouped bars — one per zone */}
                    {(["ZWP1", "ZWP2", "ZWP4", "ZWP5"] as const).map((zone) => (
                        <Bar
                            key={zone}
                            dataKey={zone}
                            name={zone}
                            fill={ZONE_COLOR[zone]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={14}
                            legendType="square"
                            isAnimationActive
                            animationDuration={700}
                        />
                    ))}

                    {/* Line — WO-WT Global */}
                    <Line
                        type="monotone"
                        dataKey="globalWoWt"
                        name="WO-WT Global"
                        stroke={GLOBAL_COLOR}
                        strokeWidth={2.5}
                        dot={{ fill: GLOBAL_COLOR, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        legendType="line"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
});
