"use client";

/**
 * WarehouseBSChart — In dan Out Warehouse Bad Stock
 * Grouped Bar Chart: Masuk (In) vs Keluar (Out) per day.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { badStockData } from "@/mock/reportDaily";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[160px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((e: any) => (
                <div key={e.name} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    <span className="font-bold text-[#111827]">{e.value} SKU</span>
                </div>
            ))}
        </div>
    );
}

const AXIS = { fill: "#64748B", fontSize: 11 };

export default function WarehouseBSChart() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">In dan Out Warehouse Bad Stock</p>
                <p className="text-xs text-[#64748B]">Pergerakan stock masuk vs keluar per hari</p>
            </div>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={badStockData}
                        margin={{ top: 4, right: 12, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tanggal" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={30} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }}
                            iconType="circle"
                            iconSize={7}
                        />
                        <Bar dataKey="masuk" name="Masuk" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="keluar" name="Keluar" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="repack" name="Repack" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
