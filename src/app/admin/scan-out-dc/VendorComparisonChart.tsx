"use client";

/**
 * VendorComparisonChart — Perbandingan Rata-rata Jam Scan Out Vendor.
 * Horizontal Bar Chart (kiri).
 * Empty state: "Belum ada data Scan Out."
 */

import { memo } from "react";
import {
    BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import type { VendorAvgPoint } from "./types";
import { decimalToTime } from "./scanOutStore";

const COLORS = ["#DC2626", "#2563EB", "#7C3AED", "#D97706", "#059669", "#0891B2"];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TTEntry { value: number; color?: string }
interface TTProps { active?: boolean; payload?: TTEntry[]; label?: string }

function ChartTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#DC2626]">Avg: {decimalToTime(payload[0].value)}</p>
        </div>
    );
}

function fmtTick(v: number): string {
    if (!isFinite(v)) return "";
    return decimalToTime(v);
}

const AXIS = { fill: "#64748B", fontSize: 11 };

// ─── Props ────────────────────────────────────────────────────────────────────

interface VendorComparisonChartProps {
    data: VendorAvgPoint[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const VendorComparisonChart = memo(function VendorComparisonChart({ data }: VendorComparisonChartProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[300px]">
            <div className="mb-4 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">
                    Perbandingan Rata-rata Jam Scan Out Vendor
                </p>
                <p className="text-xs text-[#64748B]">Avg jam scan out per vendor</p>
            </div>
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Scan Out.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 4, right: 40, left: 4, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ ...AXIS, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtTick}
                                domain={["auto", "auto"]}
                            />
                            <YAxis
                                type="category"
                                dataKey="vendor"
                                tick={AXIS}
                                axisLine={false}
                                tickLine={false}
                                width={60}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar
                                dataKey="avgScanOut"
                                name="Avg Scan Out"
                                radius={[0, 5, 5, 0]}
                                maxBarSize={22}
                            >
                                {data.map((_, i) => (
                                    <Cell key={`v-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default VendorComparisonChart;
