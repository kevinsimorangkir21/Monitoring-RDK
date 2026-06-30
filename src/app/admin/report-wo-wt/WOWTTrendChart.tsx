"use client";

/**
 * WOWTTrendChart — Daily WO-WT Trend using Recharts ComposedChart.
 *
 * Bars : ZWP1, ZWP2, ZWP4, ZWP5
 * Line : WO-WT Global
 * Left Y-axis : zone values (%)
 * Right Y-axis: WO-WT Global line
 * Tooltip + Legend follow Wings Group design system.
 */

import { memo, useMemo } from "react";
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
import type { WoWtRecord, TrendDataPoint } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ZONE_COLOR: Record<string, string> = {
    ZWP1: "#3B82F6",
    ZWP2: "#8B5CF6",
    ZWP4: "#10B981",
    ZWP5: "#F59E0B",
};
const GLOBAL_COLOR = "#DC2626";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatLabel(iso: string): string {
    const [, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTH_ABBR[(m ?? 1) - 1]}`;
}

// ─── Data Transformation ──────────────────────────────────────────────────────

export function buildTrendData(records: WoWtRecord[]): TrendDataPoint[] {
    if (records.length === 0) return [];

    // Group by tanggal and aggregate zone averages
    const dayMap = new Map<string, { zwp1: number[]; zwp2: number[]; zwp4: number[]; zwp5: number[]; global: number[] }>();
    for (const r of records) {
        const entry = dayMap.get(r.tanggal) ?? { zwp1: [], zwp2: [], zwp4: [], zwp5: [], global: [] };
        entry.zwp1.push(r.zwp1);
        entry.zwp2.push(r.zwp2);
        entry.zwp4.push(r.zwp4);
        entry.zwp5.push(r.zwp5);
        entry.global.push(r.woWtGlobal);
        dayMap.set(r.tanggal, entry);
    }

    const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

    return Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => ({
            tanggal,
            tanggalLabel: formatLabel(tanggal),
            ZWP1: Math.round(avg(v.zwp1) * 10) / 10,
            ZWP2: Math.round(avg(v.zwp2) * 10) / 10,
            ZWP4: Math.round(avg(v.zwp4) * 10) / 10,
            ZWP5: Math.round(avg(v.zwp5) * 10) / 10,
            woWtGlobal: Math.round(avg(v.global) * 10) / 10,
        }));
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipEntry { name: string; value: number; color: string; dataKey: string }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[180px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                        <span className="text-[#374151] font-medium">{p.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">{p.value.toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

interface LegendEntry { value: string; color: string; type: string }

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
            {payload.map((e) => (
                <div key={e.value} className="flex items-center gap-1.5">
                    {e.type === "line" ? (
                        <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: e.color }} />
                    ) : (
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: e.color }} />
                    )}
                    <span className="text-[11px] text-[#64748B] font-medium">{e.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ChartEmpty() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col" style={{ height: 360 }}>
            <div className="mb-2 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">Daily WO-WT Trend</h2>
                <p className="text-xs text-[#64748B]">Tren WO-WT per zone + global</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data WO-WT.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface WOWTTrendChartProps { data: WoWtRecord[] }

export const WOWTTrendChart = memo(function WOWTTrendChart({ data }: WOWTTrendChartProps) {
    const chartData = useMemo(() => buildTrendData(data), [data]);

    if (chartData.length === 0) return <ChartEmpty />;

    // Dynamic Y-axis domain
    const allValues = chartData.flatMap((d) => [d.ZWP1, d.ZWP2, d.ZWP4, d.ZWP5]);
    const minVal = Math.max(0, Math.floor(Math.min(...allValues) - 5));
    const maxVal = Math.min(100, Math.ceil(Math.max(...allValues) + 5));

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm"
            role="img"
            aria-label="Grafik tren harian WO-WT"
        >
            <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111827]">Daily WO-WT Trend</h2>
                <p className="text-xs text-[#64748B]">Tren performa WO-WT per zone + global</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 4, right: 48, left: -4, bottom: 0 }}
                    barCategoryGap="25%"
                    barGap={2}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="tanggalLabel"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    {/* Left Y-axis — zone bars */}
                    <YAxis
                        yAxisId="zones"
                        domain={[minVal, maxVal]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    {/* Right Y-axis — global line */}
                    <YAxis
                        yAxisId="global"
                        orientation="right"
                        domain={[minVal, maxVal]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    {(["ZWP1", "ZWP2", "ZWP4", "ZWP5"] as const).map((zone) => (
                        <Bar
                            key={zone}
                            yAxisId="zones"
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

                    <Line
                        yAxisId="global"
                        type="monotone"
                        dataKey="woWtGlobal"
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

export default WOWTTrendChart;
