"use client";

/**
 * DailyTrendChart — Daily Scan Trend (Area Chart).
 */

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dailyTrendData } from "@/mock/scanOutDC";

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#DC2626]">{payload[0].value} scan</p>
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function DailyTrendChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Daily Scan Trend</p>
                <p className="text-xs text-[#64748B]">Total scan per hari (7 hari terakhir)</p>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
                        <Tooltip content={<Tip />} />
                        <Area type="monotone" dataKey="total" name="Total Scan" stroke="#DC2626" strokeWidth={2.5}
                            fill="url(#scanGrad)" dot={{ fill: "#DC2626", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }}
                            isAnimationActive animationDuration={800} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
