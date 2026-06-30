"use client";

/**
 * DistributionCenterChart — Scan Out by Distribution Center (horizontal bar).
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { dcData } from "@/mock/scanOutDC";

const COLORS = ["#DC2626", "#2563EB", "#7C3AED", "#D97706", "#059669"];

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">{payload[0].value} scan</p>
        </div>
    );
}

export default function DistributionCenterChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Scan Out by Vendor</p>
                <p className="text-xs text-[#64748B]">Total scan per vendor</p>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dcData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="dc" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} width={92} />
                        <Tooltip content={<Tip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Bar dataKey="total" name="Total" radius={[0, 5, 5, 0]} maxBarSize={18}>
                            {dcData.map((_, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
