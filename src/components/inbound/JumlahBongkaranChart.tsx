"use client";

/**
 * JumlahBongkaranChart — Jumlah Bongkaran per hari.
 * Single BarChart: Total Box per tanggal.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { jumlahBongkaranData } from "@/mock/inbound";

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
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[160px]">
            <p className="font-semibold text-[#111827] mb-2">Tanggal: {label}</p>
            {payload.map((entry) => (
                <div
                    key={entry.name}
                    className="flex items-center justify-between gap-6"
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

// ─── Constants ────────────────────────────────────────────────────────────────

const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";

/** Y-axis formatter: 82500 → 82.5k, 105000 → 105k */
function fmtBox(v: number): string {
    if (v === 0) return "0";
    const k = v / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JumlahBongkaranChart() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            {/* Header */}
            <div className="mb-3 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Jumlah Bongkaran</p>
                <p className="text-xs text-[#64748B]">Total box bongkar per hari</p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={jumlahBongkaranData}
                        margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
                    >
                        {/* Horizontal grid only */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />

                        {/* X Axis — tanggal */}
                        <XAxis
                            dataKey="tanggal"
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* Y Axis — totalBox */}
                        <YAxis
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={fmtBox}
                            width={42}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />

                        {/* Legend with circle icons */}
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }}
                        />

                        {/* Bar — Total Box (#2563EB) */}
                        <Bar
                            dataKey="totalBox"
                            name="Total Box"
                            fill="#2563EB"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
