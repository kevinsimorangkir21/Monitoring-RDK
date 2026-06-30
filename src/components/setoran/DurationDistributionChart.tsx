"use client";

/**
 * DurationDistributionChart — Distribusi Durasi (Donut Chart).
 * Buckets: < 15 Menit | 15–30 Menit | 30–60 Menit | > 60 Menit
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";
import type { DistribusiItem } from "@/types/setoran";
import type { PieLabelRenderProps } from "recharts";

// ─── Custom label ─────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function renderLabel(props: PieLabelRenderProps) {
    const cx = Number(props.cx ?? 0);
    const cy = Number(props.cy ?? 0);
    const mid = Number(props.midAngle ?? 0);
    const ir = Number(props.innerRadius ?? 0);
    const or = Number(props.outerRadius ?? 0);
    const pct = Number(props.percent ?? 0);
    if (pct < 0.05) return null;
    const r = ir + (or - ir) * 0.5;
    const x = cx + r * Math.cos(-mid * RADIAN);
    const y = cy + r * Math.sin(-mid * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 11, fontWeight: 700 }}>
            {`${(pct * 100).toFixed(0)}%`}
        </text>
    );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: {
    active?: boolean;
    payload?: { payload: DistribusiItem }[];
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-0.5">{d.label}</p>
            <p style={{ color: d.color }} className="font-bold">{d.value} transaksi</p>
            <p className="text-[#9CA3AF]">{d.pct}%</p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    data: DistribusiItem[];
    total: number;
}

export const DurationDistributionChart = memo(function DurationDistributionChart({ data, total }: Props) {
    const hasData = data.some((d) => d.value > 0);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Distribusi Durasi</p>
                <p className="text-xs text-[#64748B]">Pengelompokan berdasarkan rentang durasi</p>
            </div>

            {!hasData ? (
                <div className="h-[220px] flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-auto shrink-0">
                        <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={88}
                                    paddingAngle={3}
                                    labelLine={false}
                                    label={renderLabel}
                                    strokeWidth={0}
                                >
                                    {data.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                        {data.map((d) => (
                            <div key={d.label} className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#111827] leading-tight">{d.label}</p>
                                    <p className="text-[11px] text-[#64748B]">
                                        {d.value} transaksi · {d.pct}%
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-1 border-t border-[#F3F4F6] mt-1">
                            <p className="text-[10px] text-[#9CA3AF]">Total</p>
                            <p className="text-sm font-bold text-[#111827]">{total} Transaksi</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
