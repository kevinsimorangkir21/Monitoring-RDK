"use client";

/**
 * JenisBongkaranChart — Produktivitas Bongkar (Chart 3 Kanan)
 * Donut Chart: persentase SLIPSHEET vs CURAH.
 * Selalu dirender. Empty state: "Belum ada data Inbound."
 */

import { useMemo, memo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { InboundRecord, ProduktivitasItem } from "./types";

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateProduktivitas(data: InboundRecord[]): ProduktivitasItem[] {
    let slipsheet = 0;
    let curah = 0;
    for (const r of data) {
        if (r.jenisBongkaran === "SLIPSHEET") slipsheet += 1;
        else if (r.jenisBongkaran === "CURAH") curah += 1;
    }
    const total = slipsheet + curah;

    return [
        {
            name: "Slipsheet",
            value: slipsheet,
            color: "#8B5CF6",
        },
        {
            name: "Curah",
            value: curah,
            color: "#EF4444",
        },
    ].filter((item) => total > 0 || item.value === 0); // always show both
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

interface LegendItem { value: string; color: string; payload?: ProduktivitasItem }
function CustomLegend({ payload, total }: { payload?: LegendItem[]; total: number }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
            {payload.map((e) => {
                const count = e.payload?.value ?? 0;
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                return (
                    <div key={e.value} className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: e.color ?? "#9CA3AF" }} />
                        <span className="text-[11px] text-[#64748B] font-medium">{e.value}</span>
                        <span className="text-[11px] text-[#9CA3AF]">({pct}%)</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TTPayload { name: string; value: number; payload: ProduktivitasItem }
function CustomTooltip({ active, payload, total }: { active?: boolean; payload?: TTPayload[]; total: number }) {
    if (!active || !payload?.length) return null;
    const { name, value, payload: d } = payload[0];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[150px]">
            <p className="font-semibold text-[#111827] mb-1">{name}</p>
            <p className="text-[#64748B]">Jumlah: <span className="font-bold" style={{ color: d.color }}>{Number(value).toLocaleString("id-ID")}</span></p>
            <p className="text-[#64748B]">Persentase: <span className="font-bold" style={{ color: d.color }}>{pct}%</span></p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const JenisBongkaranChart = memo(function JenisBongkaranChart({ data }: { data: InboundRecord[] }) {
    const chartData = useMemo(() => aggregateProduktivitas(data), [data]);
    const total = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[320px]">
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Produktivitas Bongkar</p>
                <p className="text-xs text-[#64748B]">Distribusi Slipsheet dan Curah</p>
            </div>
            {total === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    {/* Render placeholder donut rings even when empty */}
                    <div className="relative w-28 h-28">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="36" fill="none" stroke="#8B5CF6" strokeWidth="14" strokeDasharray="66 47" strokeLinecap="round" opacity="0.15" />
                            <circle cx="50" cy="50" r="36" fill="none" stroke="#EF4444" strokeWidth="14" strokeDasharray="47 66" strokeDashoffset="-66" strokeLinecap="round" opacity="0.15" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-xs text-[#9CA3AF]">0 Mobil</p>
                        </div>
                    </div>
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Inbound.</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-violet-400 opacity-30" />
                            <span className="text-[11px] text-[#9CA3AF]">Slipsheet (0%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-sm bg-red-400 opacity-30" />
                            <span className="text-[11px] text-[#9CA3AF]">Curah (0%)</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius="45%"
                                outerRadius="65%"
                                paddingAngle={2}
                            >
                                {chartData.map((d, i) => (
                                    <Cell key={i} fill={d.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip total={total} />} />
                            <Legend content={<CustomLegend total={total} />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: "-10%" }}>
                        <p className="text-lg font-bold text-[#111827] leading-none">{total.toLocaleString("id-ID")}</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">Total</p>
                    </div>
                </div>
            )}
        </div>
    );
});

export default JenisBongkaranChart;
