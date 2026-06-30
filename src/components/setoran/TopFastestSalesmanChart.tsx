"use client";

/**
 * TopFastestSalesmanChart — Top 10 Salesman Tercepat (Horizontal Bar, Green).
 */

import { memo } from "react";
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
import type { SalesmanAvgItem } from "@/types/setoran";

// ─── Green gradient shades ────────────────────────────────────────────────────

const GREEN_SHADES = [
    "#16A34A", "#22C55E", "#4ADE80", "#86EFAC", "#BBF7D0",
    "#16A34A", "#22C55E", "#4ADE80", "#86EFAC", "#BBF7D0",
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: {
    active?: boolean;
    payload?: { payload: SalesmanAvgItem }[];
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-0.5">{d.salesman}</p>
            <p className="text-emerald-600 font-bold">{d.durasiFormatted}</p>
            <p className="text-[#9CA3AF]">Avg: {d.avgMinutes} menit</p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    data: SalesmanAvgItem[];
}

export const TopFastestSalesmanChart = memo(function TopFastestSalesmanChart({ data }: Props) {
    if (!data.length) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center" style={{ height: 320 }}>
                <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Top 10 Salesman Tercepat</p>
                <p className="text-xs text-[#64748B]">Rata-rata durasi tercepat (menit)</p>
            </div>
            <div style={{ height: Math.max(220, data.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        barSize={18}
                        margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={(v) => `${v}m`}
                            tick={{ fontSize: 10, fill: "#9CA3AF" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="salesman"
                            tick={{ fontSize: 10, fill: "#374151" }}
                            axisLine={false}
                            tickLine={false}
                            width={112}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="avgMinutes" name="Avg Durasi" radius={[0, 6, 6, 0]}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={GREEN_SHADES[i] ?? GREEN_SHADES[4]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
