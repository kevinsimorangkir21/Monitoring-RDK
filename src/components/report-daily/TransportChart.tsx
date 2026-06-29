"use client";

/**
 * TransportChart — Gantungan Volume vs Count Delivery
 * ComposedChart: Bar (Volume) + Line (Count DO), dual Y-axis.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { gantunganData } from "@/mock/reportDaily";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[170px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e: any) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">
                        {Number(e.value).toLocaleString("id-ID")}
                    </span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function TransportChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Gantungan Volume vs Count Delivery</p>
                <p className="text-xs text-[#64748B]">Volume pengiriman (CBM) dibanding jumlah DO aktif</p>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={gantunganData}
                        margin={{ top: 4, right: 28, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis
                            yAxisId="left"
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                            label={{ value: "CBM", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 10, dy: 30 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={AXIS}
                            axisLine={false}
                            tickLine={false}
                            width={32}
                            label={{ value: "DO", angle: 90, position: "insideRight", fill: "#94A3B8", fontSize: 10, dy: -20 }}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 10 }}
                            iconType="circle"
                            iconSize={7}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="volume"
                            name="Volume (CBM)"
                            fill="#DC2626"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={36}
                        />
                        <Line
                            yAxisId="right"
                            dataKey="countDO"
                            name="Count DO"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            type="monotone"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
