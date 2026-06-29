"use client";

/**
 * BarChart — Jumlah Bongkaran per Plant (SlipSheet vs Curah). Light mode.
 */

import {
    BarChart as RBarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { bongkaranData } from "@/mock/inbound";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e: any) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">{e.value}</span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function BongkaranBarChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[340px] flex flex-col shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Jumlah Bongkaran</p>
                <p className="text-xs text-[#64748B]">SlipSheet vs Curah per Plant</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={bongkaranData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="plant" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }} iconType="circle" iconSize={7} />
                        <Bar dataKey="slipSheet" name="SlipSheet" fill="#7C3AED" radius={[5, 5, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="curah" name="Curah" fill="#DC2626" radius={[5, 5, 0, 0]} maxBarSize={28} />
                    </RBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
