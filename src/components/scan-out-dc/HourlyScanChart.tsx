"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { hourlyScanData } from "@/mock/scanOutDC";

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">{payload[0].value} scan</p>
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function HourlyScanChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Scan Out per Jam</p>
                <p className="text-xs text-[#64748B]">Volume scan per jam hari ini</p>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyScanData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="jam" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={30} />
                        <Tooltip content={<Tip />} />
                        <Line type="monotone" dataKey="total" name="Scan" stroke="#2563EB" strokeWidth={2.5}
                            dot={{ fill: "#2563EB", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}
                            isAnimationActive animationDuration={800} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
