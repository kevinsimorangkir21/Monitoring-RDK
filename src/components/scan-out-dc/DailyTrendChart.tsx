"use client";

/**
 * DailyTrendChart — Average Jam Scan Out (kendaraan sebelum 10:00).
 * Bar + Line Chart showing average scan-out time per day.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { dailyTrendData } from "@/mock/scanOutDC";
import type { DailyTrendItem } from "@/types/scanOutDC";

// ─── Helper: decimal hours → "HH:mm" ─────────────────────────────────────────

function fmtJam(v: number): string {
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function Tip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; payload: DailyTrendItem }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#DC2626]">
                Avg Scan Out: <span>{fmtJam(payload[0].value)}</span>
            </p>
            <p className="text-[#9CA3AF] mt-0.5">Kendaraan sebelum 10:00</p>
        </div>
    );
}

// ─── Y-axis tick formatter ────────────────────────────────────────────────────

function fmtTick(v: number): string {
    if (typeof v !== "number") return "";
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function DailyTrendChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Average Jam Scan Out</p>
                <p className="text-xs text-[#64748B]">
                    Rata-rata jam scan out kendaraan sebelum pukul 10:00 per hari
                </p>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dailyTrendData}
                        margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                        barCategoryGap="30%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="tanggal"
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ ...AXIS, fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                            domain={[6, 10]}
                            ticks={[6, 7, 8, 9, 10]}
                            tickFormatter={fmtTick}
                        />
                        <Tooltip content={<Tip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Bar
                            dataKey="avgJamScanOut"
                            name="Avg Scan Out"
                            fill="#DC2626"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={36}
                            isAnimationActive
                            animationDuration={800}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
