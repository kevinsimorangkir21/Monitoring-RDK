"use client";

/**
 * StatusFOChart — Horizontal Bar Chart distribusi Status FO.
 *
 *   Y-axis (category) : nama statusFO
 *   X-axis (value)    : jumlah records
 *   Layout            : "vertical" (horizontal bar chart)
 *
 * Warna per status:
 *   OPEN    → #10B981 (emerald)
 *   CLOSE   → #3B82F6 (blue)
 *   CANCEL  → #EF4444 (red)
 *   PARTIAL → #F59E0B (amber)
 *
 * Requirements: 4.1–4.8
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
    Cell,
} from "recharts";
import type { OutboundRecord, StatusFO } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusFO, string> = {
    OPEN: "#10B981",    // emerald
    CLOSE: "#3B82F6",   // blue
    CANCEL: "#EF4444",  // red
    PARTIAL: "#F59E0B", // amber
};

const ALL_STATUSES: StatusFO[] = ["OPEN", "CLOSE", "CANCEL", "PARTIAL"];

// ─── Data Transformation ──────────────────────────────────────────────────────

interface StatusFODataPoint {
    status: StatusFO;
    count: number;
    color: string;
}

export function buildStatusFOData(records: OutboundRecord[]): StatusFODataPoint[] {
    const freq: Record<StatusFO, number> = { OPEN: 0, CLOSE: 0, CANCEL: 0, PARTIAL: 0 };

    for (const r of records) {
        if (r.statusFO in freq) {
            freq[r.statusFO] += 1;
        }
    }

    return ALL_STATUSES
        .map((status) => ({
            status,
            count: freq[status],
            color: STATUS_COLORS[status],
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    payload?: StatusFODataPoint;
    value?: number;
}

function StatusFOTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
}) {
    if (!active || !payload?.length || !payload[0]?.payload) return null;

    const { status, count, color } = payload[0].payload;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: color }}
                />
                <span className="font-semibold text-[#111827]">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B]">Jumlah Records</span>
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
                <h2 className="text-sm font-bold text-[#111827]">Distribusi Status FO</h2>
                <p className="text-xs text-[#64748B]">Jumlah records per Status Freight Order</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data outbound.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StatusFOChartProps {
    data: OutboundRecord[];
}

export const StatusFOChart = memo(function StatusFOChart({ data }: StatusFOChartProps) {
    const chartData = useMemo(() => buildStatusFOData(data), [data]);

    if (data.length === 0 || chartData.length === 0) return <ChartEmpty />;

    const maxCount = Math.max(...chartData.map((d) => d.count));

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5"
            role="img"
            aria-label="Grafik distribusi status FO"
        >
            <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111827]">Distribusi Status FO</h2>
                <p className="text-xs text-[#64748B]">Jumlah records per Status Freight Order</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
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
                    {/* Y-axis: category (statusFO names) */}
                    <YAxis
                        dataKey="status"
                        type="category"
                        tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={64}
                    />
                    {/* X-axis: value (record count) */}
                    <XAxis
                        type="number"
                        domain={[0, Math.ceil(maxCount * 1.15)]}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<StatusFOTooltip />}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar
                        dataKey="count"
                        name="Jumlah Records"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={36}
                        isAnimationActive
                        animationDuration={700}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.status} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});

export default StatusFOChart;
