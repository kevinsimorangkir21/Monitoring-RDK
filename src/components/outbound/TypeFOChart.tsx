"use client";

/**
 * TypeFOChart — Chart 2: Persebaran Type FO
 * Grouped vertical bar chart: S1 / S2 / S3 / S4.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Cell, ResponsiveContainer, LabelList,
} from "recharts";
import { typeFOData } from "@/mock/outbound";

const TYPE_COLORS: Record<string, string> = {
    S1: "#DC2626",
    S2: "#2563EB",
    S3: "#7C3AED",
    S4: "#16A34A",
};

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">Type {label}</p>
            <p className="font-bold" style={{ color: payload[0].fill }}>
                {payload[0].value} FO
            </p>
        </div>
    );
}

export default function TypeFOChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[320px] flex flex-col shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Persebaran Type FO</p>
                <p className="text-xs text-[#64748B]">Distribusi FO berdasarkan S-Type</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={typeFOData}
                        margin={{ top: 16, right: 8, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="type"
                            tick={{ fill: "#64748B", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#64748B", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={30}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Bar dataKey="jumlah" name="Jumlah FO" radius={[6, 6, 0, 0]} maxBarSize={52}>
                            <LabelList
                                dataKey="jumlah"
                                position="top"
                                style={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }}
                            />
                            {typeFOData.map((entry) => (
                                <Cell
                                    key={entry.type}
                                    fill={TYPE_COLORS[entry.type] ?? "#64748B"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
