"use client";

/**
 * DailyAverageChart — Daily Average Durasi Setoran (LineChart).
 * X: Tanggal  Y: Average Durasi (Menit)  Line: Blue
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import type { DailyAverageItem } from "@/types/setoran";

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const mins = payload[0].value;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    const fmt = h > 0 ? `${h}j ${m}m` : `${m} menit`;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">Avg: {fmt}</p>
            <p className="text-[#9CA3AF]">{mins} menit</p>
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    data: DailyAverageItem[];
}

export const DailyAverageChart = memo(function DailyAverageChart({ data }: Props) {
    if (!data.length) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center" style={{ height: 280 }}>
                <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Daily Average Durasi Setoran</p>
                <p className="text-xs text-[#64748B]">Rata-rata durasi setoran per hari (menit)</p>
            </div>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="tanggalLabel"
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                            tickFormatter={(v) => `${v}m`}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="avgMinutes"
                            name="Avg Durasi"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: "#2563EB" }}
                            isAnimationActive
                            animationDuration={800}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
