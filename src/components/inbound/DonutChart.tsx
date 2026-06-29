"use client";

/**
 * DonutChart — Produktivitas Bongkar. Light mode.
 * Donut chart with inline legend + mini progress bars.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { produktivitasData } from "@/mock/inbound";

// Updated colors for light backgrounds — still vivid but visible on white
const LIGHT_COLORS = ["#16A34A", "#DC2626", "#2563EB"];

function ChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827]">{item.name}</p>
            <p style={{ color: item.payload.color }} className="font-bold mt-0.5">{item.value}%</p>
        </div>
    );
}

export default function DonutChart() {
    const data = produktivitasData.map((d, i) => ({ ...d, color: LIGHT_COLORS[i] ?? d.color }));
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[340px] flex flex-col shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Produktivitas Bongkar</p>
                <p className="text-xs text-[#64748B]">Distribusi status penyelesaian</p>
            </div>

            <div className="flex-1 flex items-center gap-4 min-h-0">
                {/* Donut */}
                <div className="w-[160px] h-[160px] shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%" cy="50%"
                                innerRadius={52} outerRadius={72}
                                paddingAngle={3}
                                dataKey="value"
                                isAnimationActive
                                animationBegin={200}
                                animationDuration={900}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold text-[#111827]">{total}%</p>
                        <p className="text-[10px] text-[#64748B]">Total</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 flex-1">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#64748B] truncate">{item.name}</p>
                                <div className="mt-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${item.value}%`, background: item.color }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-bold shrink-0" style={{ color: item.color }}>
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
