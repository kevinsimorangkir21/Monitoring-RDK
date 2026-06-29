"use client";

/**
 * GroupingTimeChart — Grouping Time STW
 * Vertical BarChart: jumlah FO per interval waktu STW.
 * Single series, pink/magenta (#EC4899).
 * Lazy-loaded via dynamic() in the page.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { groupingTimeSTWData } from "@/mock/outbound";
import type { GroupingTimeSTWItem } from "@/types/outbound";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipProps {
    active?: boolean;
    payload?: { value: number; payload: GroupingTimeSTWItem }[];
    label?: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[170px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            <div className="flex items-center justify-between gap-6">
                <span className="text-[#64748B]">Jumlah FO</span>
                <span className="font-bold text-[#EC4899]">
                    {Number(payload[0].value).toLocaleString("id-ID")}
                </span>
            </div>
        </div>
    );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";
const BAR_FILL = "#EC4899";
const BAR_ACTIVE = "#BE185D";

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroupingTimeChart() {
    const data = groupingTimeSTWData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 320 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data Grouping Time STW.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            {/* Header */}
            <div className="mb-3 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Grouping Time STW</p>
                <p className="text-xs text-[#64748B]">
                    Distribusi Freight Order berdasarkan rentang waktu STW
                </p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
                        barCategoryGap="30%"
                    >
                        {/* Horizontal grid only */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />

                        {/* X Axis — interval */}
                        <XAxis
                            dataKey="interval"
                            tick={{ ...TICK_STYLE, fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* Y Axis — jumlahFO */}
                        <YAxis
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            width={32}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        />

                        {/* Bar — Jumlah FO (#EC4899 pink) */}
                        <Bar
                            dataKey="jumlahFO"
                            name="Jumlah FO"
                            fill={BAR_FILL}
                            activeBar={{ fill: BAR_ACTIVE }}
                            radius={[5, 5, 0, 0]}
                            maxBarSize={70}
                            isAnimationActive
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
