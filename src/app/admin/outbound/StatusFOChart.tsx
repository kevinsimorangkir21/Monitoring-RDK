"use client";

import { memo, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { OutboundRecord } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFODataPoint = {
    status: string;
    count: number;
    color: string;
};

// ─── Colors for the two valid statuses ───────────────────────────────────────

const STATUS_COLOR_MAP: Record<string, string> = {
    "Muat Pagi": "#F59E0B",  // amber — morning loading
    "Muat Inap": "#6366F1",  // indigo — overnight loading
};

// ─── Pure Transform ───────────────────────────────────────────────────────────

export function buildStatusFOData(records: OutboundRecord[]): StatusFODataPoint[] {
    const counts: Record<string, number> = {};

    for (const record of records) {
        counts[record.status] = (counts[record.status] ?? 0) + 1;
    }

    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
            status,
            count,
            color: STATUS_COLOR_MAP[status] ?? "#6B7280",
        }))
        .sort((a, b) => b.count - a.count);
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: StatusFODataPoint }>;
}

function StatusFOTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[140px]">
            <p className="font-semibold text-[#111827] mb-1">{point.status}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: point.color }} />
                    <span className="text-[#64748B]">Jumlah</span>
                </span>
                <span className="font-bold text-[#111827]">{point.count}</span>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StatusFOChartProps {
    data: OutboundRecord[];
}

function StatusFOChart({ data }: StatusFOChartProps) {
    const chartData = useMemo(() => buildStatusFOData(data), [data]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-6">
            <p className="text-sm font-semibold text-[#111827] mb-4">Status FO</p>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px]">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Outbound.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                    >
                        <XAxis
                            type="number"
                            tick={{ fill: "#64748B", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="status"
                            width={80}
                            tick={{ fill: "#64748B", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            content={<StatusFOTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36}>
                            {chartData.map((entry) => (
                                <Cell key={entry.status} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default memo(StatusFOChart);
