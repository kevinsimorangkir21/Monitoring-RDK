"use client";

/**
 * JumlahBongkaranChart — Chart 2 Kanan
 * Vertical Bar Chart: X=Tanggal, Y=Jumlah Bongkaran.
 * Selalu dirender. Empty state: "Belum ada data Inbound."
 */

import { useMemo, memo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { InboundRecord, JumlahBongkaranPoint } from "./types";

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateJumlahBongkaran(data: InboundRecord[]): JumlahBongkaranPoint[] {
    const map: Record<string, number> = {};
    for (const r of data) {
        map[r.tanggal] = (map[r.tanggal] ?? 0) + 1;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, jumlah]) => {
            const d = new Date(tanggal);
            const label = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("id-ID", { month: "short" })}`;
            return { tanggal, tanggalLabel: label, jumlah };
        });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TTProps { active?: boolean; payload?: { value: number }[]; label?: string }
function CustomTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[150px]">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="text-[#64748B]">
                Bongkaran:{" "}
                <span className="font-bold text-[#DC2626]">
                    {Number(payload[0].value).toLocaleString("id-ID")}
                </span>
            </p>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const COLORS = ["#DC2626", "#2563EB", "#F59E0B", "#16A34A", "#8B5CF6", "#0EA5E9"];
const TICK = { fill: "#64748B", fontSize: 11 };
const GRID = "#F1F5F9";

const JumlahBongkaranChart = memo(function JumlahBongkaranChart({ data }: { data: InboundRecord[] }) {
    const chartData = useMemo(() => aggregateJumlahBongkaran(data), [data]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[320px]">
            <div className="mb-3 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Jumlah Bongkaran</p>
                <p className="text-xs text-[#64748B]">Jumlah bongkaran per tanggal</p>
            </div>
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Inbound.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 16, right: 12, left: -12, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                            <XAxis
                                dataKey="tanggalLabel"
                                tick={{ ...TICK, textAnchor: "end" }}
                                angle={-35}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis tick={TICK} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar dataKey="jumlah" name="Jumlah Bongkaran" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default JumlahBongkaranChart;
