"use client";

/**
 * StatusFOChart — Klasifikasi Status FO
 * ComposedChart: grouped bars per status per day + Line (Total FO).
 * Full-width, height ≈ 380px.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { klasifikasiStatusFOData } from "@/mock/outbound";
import type { KlasifikasiStatusFOItem } from "@/types/outbound";

// ─── Series config ────────────────────────────────────────────────────────────

const BARS: { key: keyof Omit<KlasifikasiStatusFOItem, "tanggal" | "totalFO">; label: string; color: string }[] = [
    { key: "draft", label: "Draft", color: "#94A3B8" },
    { key: "released", label: "Released", color: "#3B82F6" },
    { key: "loading", label: "Loading", color: "#F59E0B" },
    { key: "completed", label: "Completed", color: "#10B981" },
    { key: "cancelled", label: "Cancelled", color: "#EF4444" },
];

const LINE_COLOR = "#0EA5E9";

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
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[180px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="flex items-center justify-between gap-6 mb-1 last:mb-0"
                >
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2 h-2 rounded-sm"
                            style={{ background: entry.color }}
                        />
                        <span className="text-[#374151] font-medium">{entry.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {Number(entry.value).toLocaleString("id-ID")}
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

export default function StatusFOChart() {
    const data = klasifikasiStatusFOData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 380 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data klasifikasi status FO.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col w-full"
            style={{ height: 380 }}
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Klasifikasi Status FO</p>
                <p className="text-xs text-[#64748B]">
                    Distribusi Freight Order berdasarkan status setiap hari
                </p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 4, right: 12, left: -12, bottom: 24 }}
                        barCategoryGap="20%"
                        barGap={2}
                    >
                        {/* Horizontal grid only */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
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

                        {/* Y Axis — shared */}
                        <YAxis
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />

                        {/* Custom legend below */}
                        <Legend content={<CustomLegend />} />

                        {/* Status bars */}
                        {BARS.map((b) => (
                            <Bar
                                key={b.key}
                                dataKey={b.key}
                                name={b.label}
                                fill={b.color}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={14}
                                legendType="square"
                                isAnimationActive
                                animationDuration={700}
                            />
                        ))}

                        {/* Line — Total FO */}
                        <Line
                            type="monotone"
                            dataKey="totalFO"
                            name="Total FO"
                            stroke={LINE_COLOR}
                            strokeWidth={3}
                            dot={{ fill: LINE_COLOR, r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            legendType="line"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
