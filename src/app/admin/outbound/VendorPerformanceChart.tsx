"use client";

/**
 * VendorPerformanceChart — Horizontal Bar Chart performa vendor.
 *
 *   Y-axis (category) : nama vendor
 *   X-axis (value)    : jumlah delivery (count records)
 *   Layout            : "vertical" (horizontal bar chart)
 *
 * Warna bar: satu warna konsisten #10B981 (emerald)
 *
 * Requirements: 6.1–6.7
 */

import { memo, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import type { OutboundRecord } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_COLOR = "#10B981"; // emerald

// ─── Data Transformation ──────────────────────────────────────────────────────

interface VendorDataPoint {
    vendor: string;
    count: number;
}

export function buildVendorData(records: OutboundRecord[]): VendorDataPoint[] {
    const freq: Record<string, number> = {};

    for (const r of records) {
        freq[r.vendor] = (freq[r.vendor] ?? 0) + 1;
    }

    return Object.entries(freq)
        .map(([vendor, count]) => ({ vendor, count }))
        .sort((a, b) => b.count - a.count);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    payload?: VendorDataPoint;
    value?: number;
}

function VendorTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
}) {
    if (!active || !payload?.length || !payload[0]?.payload) return null;

    const { vendor, count } = payload[0].payload;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: BAR_COLOR }}
                />
                <span className="font-semibold text-[#111827] truncate">{vendor}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B]">Jumlah Delivery</span>
                <span className="font-bold text-[#111827]">{count.toLocaleString("id-ID")}</span>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ChartEmpty() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col"
            style={{ minHeight: 280 }}
        >
            <div className="mb-3 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">Performa Vendor</h2>
                <p className="text-xs text-[#64748B]">Jumlah delivery per vendor</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data outbound.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface VendorPerformanceChartProps {
    data: OutboundRecord[];
}

export const VendorPerformanceChart = memo(function VendorPerformanceChart({
    data,
}: VendorPerformanceChartProps) {
    const chartData = useMemo(() => buildVendorData(data), [data]);

    if (data.length === 0 || chartData.length === 0) return <ChartEmpty />;

    const maxCount = Math.max(...chartData.map((d) => d.count));

    // Dynamic height: at least 240px, grow with number of vendors
    const chartHeight = Math.max(240, chartData.length * 48);

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5"
            role="img"
            aria-label="Grafik performa vendor"
        >
            <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111827]">Performa Vendor</h2>
                <p className="text-xs text-[#64748B]">Jumlah delivery per vendor</p>
            </div>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F3F4F6"
                        horizontal={false}
                    />
                    {/* Y-axis: category (vendor names) */}
                    <YAxis
                        dataKey="vendor"
                        type="category"
                        tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={140}
                    />
                    {/* X-axis: value (delivery count) */}
                    <XAxis
                        type="number"
                        domain={[0, Math.ceil(maxCount * 1.15)]}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<VendorTooltip />}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar
                        dataKey="count"
                        name="Jumlah Delivery"
                        fill={BAR_COLOR}
                        radius={[0, 4, 4, 0]}
                        maxBarSize={36}
                        isAnimationActive
                        animationDuration={700}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});

export default VendorPerformanceChart;
