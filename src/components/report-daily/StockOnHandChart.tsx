"use client";

/**
 * StockOnHandChart — Trend Stock On Hand
 * Area Chart showing stock on hand trend over time.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { stockOnHandData } from "@/mock/reportDaily";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">
                {Number(payload[0].value).toLocaleString("id-ID")} unit
            </p>
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function StockOnHandChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Trend Stock On Hand</p>
                <p className="text-xs text-[#64748B]">Perkembangan total stock on hand per hari</p>
            </div>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={stockOnHandData}
                        margin={{ top: 4, right: 12, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                            width={38}
                            domain={["auto", "auto"]}
                            tickFormatter={(v: number) => v.toLocaleString("id-ID")}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="stockOnHand"
                            name="Stock On Hand"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            fill="url(#stockGradient)"
                            dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
