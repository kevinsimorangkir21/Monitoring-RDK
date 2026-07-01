"use client";

/**
 * BongkaranPlantChart — Chart 3 Kiri
 * Vertical Bar Chart: Plant Pabrik vs Jumlah Bongkaran (sorted desc).
 * Selalu dirender. Empty state: "Belum ada data Inbound."
 */

import { useMemo, memo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import type { InboundRecord, BongkaranByPlantPoint } from "./types";

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateBongkaranByPlant(data: InboundRecord[]): BongkaranByPlantPoint[] {
    const map: Record<string, number> = {};
    for (const r of data) {
        map[r.plantPabrik] = (map[r.plantPabrik] ?? 0) + 1;
    }
    return Object.entries(map)
        .map(([plant, jumlah]) => ({ plant, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah);
}

const COLORS = ["#DC2626", "#2563EB", "#F59E0B", "#16A34A", "#8B5CF6", "#0EA5E9"];
const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TTProps { active?: boolean; payload?: { value: number }[]; label?: string }
function CustomTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[140px]">
            <p className="font-semibold text-[#111827] mb-1">Plant: {label}</p>
            <p className="text-[#64748B]">Bongkaran: <span className="font-bold text-[#DC2626]">{Number(payload[0].value).toLocaleString("id-ID")}</span></p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const BongkaranPlantChart = memo(function BongkaranPlantChart({ data }: { data: InboundRecord[] }) {
    const chartData = useMemo(() => aggregateBongkaranByPlant(data), [data]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[320px]">
            <div className="mb-3 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Bongkaran by Plant</p>
                <p className="text-xs text-[#64748B]">Jumlah bongkaran per Plant Pabrik</p>
            </div>
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Inbound.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 16, right: 12, left: -12, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                            <XAxis dataKey="plant" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar dataKey="jumlah" name="Jumlah Bongkaran" radius={[6, 6, 0, 0]} maxBarSize={52}>
                                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                <LabelList dataKey="jumlah" position="top" style={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default BongkaranPlantChart;
