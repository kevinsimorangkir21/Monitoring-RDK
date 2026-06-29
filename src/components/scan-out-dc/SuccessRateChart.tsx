"use client";

/**
 * SuccessRateChart — Success vs Failed Scan (Donut with legend).
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { successRateData } from "@/mock/scanOutDC";

function Tip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827]">{payload[0].name}</p>
            <p className="font-bold mt-0.5" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
        </div>
    );
}

export default function SuccessRateChart() {
    const total = successRateData.reduce((s, d) => s + d.value, 0);
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Success vs Failed Scan</p>
                <p className="text-xs text-[#64748B]">Distribusi status scan hari ini</p>
            </div>
            <div className="flex items-center gap-5">
                {/* Donut */}
                <div className="relative w-[130px] h-[130px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={successRateData} cx="50%" cy="50%" innerRadius={44} outerRadius={62}
                                paddingAngle={3} dataKey="value" isAnimationActive animationBegin={200} animationDuration={900}>
                                {successRateData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} stroke="none" />)}
                            </Pie>
                            <Tooltip content={<Tip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xl font-bold text-[#111827] leading-none">{total}%</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">Total</p>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-3 flex-1">
                    {successRateData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-[#64748B]">{item.name}</span>
                                    <span className="text-xs font-bold ml-2" style={{ color: item.color }}>{item.value}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
