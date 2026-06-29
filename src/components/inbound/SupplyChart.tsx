"use client";

/**
 * SupplyChart — Kontribusi Supply: horizontal bar chart. Light mode.
 */

import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { supplierContributionData } from "@/mock/inbound";

const COLORS = ["#DC2626", "#2563EB", "#7C3AED", "#D97706", "#059669", "#0284C7"];

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">{Number(payload[0].value).toLocaleString("id-ID")} box</p>
        </div>
    );
}

export default function SupplyChart() {
    const sorted = [...supplierContributionData].sort((a, b) => b.totalBox - a.totalBox);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[340px] flex flex-col shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Kontribusi Supply</p>
                <p className="text-xs text-[#64748B]">Total box per supplier</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis
                            type="number"
                            tick={{ fill: "#64748B", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            type="category"
                            dataKey="supplier"
                            tick={{ fill: "#64748B", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            width={108}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Bar dataKey="totalBox" name="Total Box" radius={[0, 5, 5, 0]} maxBarSize={18}>
                            {sorted.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
