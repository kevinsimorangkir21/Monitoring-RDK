"use client";

/**
 * ReportChart — Report Harian: ComposedChart (Bar + Line). Light mode.
 */

import {
    ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { reportHarianData } from "@/mock/inbound";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[160px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e: any) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">{Number(e.value).toLocaleString("id-ID")}</span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };
const GRID = "#F1F5F9";

export default function ReportChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[340px] flex flex-col shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Report Harian</p>
                <p className="text-xs text-[#64748B]">Total mobil &amp; box per hari</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={reportHarianData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                        <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={AXIS} axisLine={false} tickLine={false} width={28} />
                        <YAxis yAxisId="right" orientation="right" tick={AXIS} axisLine={false} tickLine={false}
                            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} width={34} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }} iconType="circle" iconSize={7} />
                        <Bar yAxisId="left" dataKey="totalMobil" name="Total Mobil" fill="#DC2626" radius={[5, 5, 0, 0]} maxBarSize={32} />
                        <Bar yAxisId="left" dataKey="selesai" name="Selesai" fill="#16A34A" radius={[5, 5, 0, 0]} maxBarSize={32} />
                        <Line yAxisId="right" dataKey="totalBox" name="Total Box" stroke="#2563EB" strokeWidth={2.5}
                            dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} type="monotone" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
