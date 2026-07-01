"use client";

/**
 * ClaimTrendChart — Pendingan Tagihan Claiman per tanggal.
 * Line Chart — belum dibayar & sudah dibayar per hari.
 * Empty state: "Belum ada data Claim Vendor."
 */

import { memo } from "react";
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "./types";
import { fmtRpCompact } from "./claimVendorStore";

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

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TTEntry { name: string; value: number; color: string }
interface TTProps { active?: boolean; payload?: TTEntry[]; label?: string }

function ChartTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[200px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">{fmtRpCompact(e.value)}</span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClaimTrendChartProps {
    data: TrendPoint[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const ClaimTrendChart = memo(function ClaimTrendChart({ data }: ClaimTrendChartProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[300px]">
            <div className="mb-4 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Pendingan Tagihan Claiman</p>
                <p className="text-xs text-[#64748B]">Nominal belum dibayarkan vs sudah dibayar per tanggal</p>
            </div>
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Claim Vendor.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 4, right: 12, left: -4, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ ...AXIS, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={52}
                                tickFormatter={(v) => fmtRpCompact(v).replace("Rp ", "")}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend content={<CustomLegend />} />
                            <Line
                                type="monotone"
                                dataKey="belumDibayar"
                                name="Belum Dibayar"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                dot={{ fill: "#F59E0B", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive
                                animationDuration={700}
                            />
                            <Line
                                type="monotone"
                                dataKey="sudahDibayar"
                                name="Sudah Dibayar"
                                stroke="#16A34A"
                                strokeWidth={2.5}
                                dot={{ fill: "#16A34A", r: 4, strokeWidth: 0 }}
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

export default ClaimTrendChart;
