"use client";

/**
 * DailyReportChart — Report Harian
 * ComposedChart: Bar (slipsheet, #8B5CF6) + Bar (curah, #EF4444) + Line (totalFO, #10B981)
 * All series share a single Y-axis (left).
 * X-axis: tanggal (rotated -35°).
 * Legend: below chart, square icon for bars, line icon for line.
 */

import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { reportHarianData } from "@/mock/inbound";
import type { ReportHarianItem } from "@/types/inbound";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipEntry {
    name: string;
    value: number;
    color: string;
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
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[170px]">
            <p className="font-semibold text-[#111827] mb-2">Tanggal: {label}</p>
            {payload.map((entry) => (
                <div
                    key={entry.name}
                    className="flex items-center justify-between gap-6 mb-1 last:mb-0"
                >
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: entry.color }}
                        />
                        <span style={{ color: entry.color }} className="font-medium">
                            {entry.name}
                        </span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {Number(entry.value).toLocaleString("id-ID")}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Custom Legend — square for bar, line for line ────────────────────────────

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
            {payload.map((entry) => (
                <div key={entry.value} className="flex items-center gap-1.5">
                    {entry.type === "line" ? (
                        /* line icon */
                        <span
                            className="inline-block w-5 h-[3px] rounded-full"
                            style={{ background: entry.color }}
                        />
                    ) : (
                        /* square icon */
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

export default function DailyReportChart() {
    const data: ReportHarianItem[] = reportHarianData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 320 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data report harian.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Report Harian</p>
                <p className="text-xs text-[#64748B]">
                    Jumlah Slipsheet, Curah, dan Total FO per hari
                </p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 4, right: 12, left: -12, bottom: 20 }}
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

                        {/* Y Axis — shared for all series */}
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

                        {/* Legend — custom renderer, below chart */}
                        <Legend content={<CustomLegend />} />

                        {/* Bar — Slipsheet (#8B5CF6 violet) */}
                        <Bar
                            dataKey="slipsheet"
                            name="Slipsheet"
                            fill="#8B5CF6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                            legendType="square"
                        />

                        {/* Bar — Curah (#EF4444 red) */}
                        <Bar
                            dataKey="curah"
                            name="Curah"
                            fill="#EF4444"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                            legendType="square"
                        />

                        {/* Line — Total FO (#10B981 green) */}
                        <Line
                            type="monotone"
                            dataKey="totalFO"
                            name="Total FO"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: "#10B981", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            legendType="line"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
