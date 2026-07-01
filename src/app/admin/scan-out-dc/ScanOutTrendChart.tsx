"use client";

/**
 * ScanOutTrendChart — Grafik Kronologis Rata-rata Jam Scan Out.
 * Line Chart — scan out per hari.
 * Empty state: "Belum ada data Scan Out."
 */

import { memo } from "react";
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "./types";
import { decimalToTime } from "./scanOutStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTick(v: number): string {
    if (!isFinite(v)) return "";
    return decimalToTime(v);
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TTEntry { name: string; value: number; color: string }
interface TTProps { active?: boolean; payload?: TTEntry[]; label?: string }

function ChartTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[180px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">{decimalToTime(e.value)}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

interface LItem { value: string; color: string; type: string }
function CustomLegend({ payload }: { payload?: LItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
            {payload.map((e) => (
                <div key={e.value} className="flex items-center gap-1.5">
                    <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: e.color }} />
                    <span className="text-[11px] text-[#64748B] font-medium">{e.value}</span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScanOutTrendChartProps {
    data: TrendPoint[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const ScanOutTrendChart = memo(function ScanOutTrendChart({ data }: ScanOutTrendChartProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[280px]">
            <div className="mb-4 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Grafik Kronologis Rata-rata Jam Scan Out</p>
                <p className="text-xs text-[#64748B]">Rata-rata jam scan out dan scan in per hari</p>
            </div>
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Scan Out.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 4, right: 12, left: -8, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ ...AXIS, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={42}
                                domain={["auto", "auto"]}
                                tickFormatter={fmtTick}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend content={<CustomLegend />} />
                            <Line
                                type="monotone"
                                dataKey="avgScanOut"
                                name="Avg Scan Out"
                                stroke="#DC2626"
                                strokeWidth={2.5}
                                dot={{ fill: "#DC2626", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive
                                animationDuration={700}
                            />
                            <Line
                                type="monotone"
                                dataKey="avgScanIn"
                                name="Avg Scan In DC"
                                stroke="#2563EB"
                                strokeWidth={2.5}
                                dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive
                                animationDuration={700}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default ScanOutTrendChart;
