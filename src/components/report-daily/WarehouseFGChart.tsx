"use client";

/**
 * WarehouseFGChart — Jam Pulang vs Qty Picking
 * ComposedChart:
 *   Stacked Bar → Qty Picking Box (#3B82F6) + Qty Picking PCS (#8B5CF6)
 *   Line        → Jam Pulang (#EC4899) on right YAxis
 * Full-width, height ≈ 400px.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { jamPulangPickingData } from "@/mock/reportDaily";
import type { JamPulangPickingItem } from "@/types/reportDaily";

// ─── Helper: fractional hour → "HH:mm" ───────────────────────────────────────

function fmtJam(v: number): string {
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[210px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="flex items-center justify-between gap-6 mb-1 last:mb-0"
                >
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{ background: entry.color }}
                        />
                        <span className="text-[#374151] font-medium">{entry.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {entry.dataKey === "jamPulang"
                            ? fmtJam(entry.value)
                            : Number(entry.value).toLocaleString("id-ID")}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

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

// ─── Constants ────────────────────────────────────────────────────────────────

const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseFGChart() {
    const data: JamPulangPickingItem[] = jamPulangPickingData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 400 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data Jam Pulang vs Qty Picking.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col w-full"
            style={{ height: 400 }}
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Jam Pulang vs Qty Picking</p>
                <p className="text-xs text-[#64748B]">
                    Perbandingan Qty Picking Box, Qty Picking PCS, dan Jam Pulang per hari
                </p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 4, right: 40, left: 4, bottom: 24 }}
                        barCategoryGap="25%"
                    >
                        {/* Horizontal + thin vertical grid */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={true}
                            horizontal={true}
                        />

                        {/* X Axis — tanggal, rotated -35° */}
                        <XAxis
                            dataKey="tanggal"
                            tick={{ ...TICK_STYLE, textAnchor: "end" }}
                            angle={-35}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                        />

                        {/* Left Y Axis — Qty Picking Box + Qty Picking PCS */}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => v.toLocaleString("id-ID")}
                            width={52}
                        />

                        {/* Right Y Axis — Jam Pulang [0, 24] */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 24]}
                            ticks={[0, 5, 10, 15, 20, 24]}
                            tickFormatter={(v: number) => String(v)}
                            width={28}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />

                        {/* Custom legend below */}
                        <Legend content={<CustomLegend />} />

                        {/* Bar 1 — Qty Picking Box (#3B82F6) — bottom of stack */}
                        <Bar
                            yAxisId="left"
                            dataKey="qtyPickingBox"
                            name="Qty Picking Box"
                            fill="#3B82F6"
                            stackId="qty"
                            radius={[0, 0, 0, 0]}
                            maxBarSize={40}
                            legendType="square"
                            isAnimationActive
                            animationDuration={700}
                        />

                        {/* Bar 2 — Qty Picking PCS (#8B5CF6) — top of stack */}
                        <Bar
                            yAxisId="left"
                            dataKey="qtyPickingPcs"
                            name="Qty Picking Pcs"
                            fill="#8B5CF6"
                            stackId="qty"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={40}
                            legendType="square"
                            isAnimationActive
                            animationDuration={700}
                        />

                        {/* Line — Jam Pulang (#EC4899) on right Y-axis */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="jamPulang"
                            name="Jam Pulang"
                            stroke="#EC4899"
                            strokeWidth={3}
                            dot={{ fill: "#EC4899", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            legendType="line"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
