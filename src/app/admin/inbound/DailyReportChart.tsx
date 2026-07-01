"use client";

/**
 * DailyReportChart — Report Harian (ComposedChart)
 * Bar: Slipsheet (#8B5CF6) + Curah (#EF4444)
 * Line: Total FO (#10B981)
 * X-Axis: Tanggal
 * Single Y-Axis shared.
 * Empty state: tampil "Belum ada data Inbound."
 */

import { useMemo, memo } from "react";
import {
    ComposedChart, Bar, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { InboundRecord, ReportHarianPoint } from "./types";

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateReportHarian(data: InboundRecord[]): ReportHarianPoint[] {
    const map: Record<string, { slipsheet: number; curah: number; totalFO: number }> = {};
    for (const r of data) {
        if (!map[r.tanggal]) map[r.tanggal] = { slipsheet: 0, curah: 0, totalFO: 0 };
        if (r.jenisBongkaran === "SLIPSHEET") map[r.tanggal].slipsheet += 1;
        else if (r.jenisBongkaran === "CURAH") map[r.tanggal].curah += 1;
        map[r.tanggal].totalFO += 1;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => {
            const d = new Date(tanggal);
            const label = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("id-ID", { month: "short" })}`;
            return { tanggal, tanggalLabel: label, ...v };
        });
}

// ─── Legend ───────────────────────────────────────────────────────────────────

interface LegendItem { value: string; color: string; type: string }
function CustomLegend({ payload }: { payload?: LegendItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
            {payload.map((e) => (
                <div key={e.value} className="flex items-center gap-1.5">
                    {e.type === "line"
                        ? <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: e.color }} />
                        : <span className="inline-block w-3 h-3 rounded-sm" style={{ background: e.color }} />}
                    <span className="text-[11px] text-[#64748B] font-medium">{e.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TTEntry { name: string; value: number; color: string }
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TTEntry[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[170px]">
            <p className="font-semibold text-[#111827] mb-2">Tanggal: {label}</p>
            {payload.map((e) => (
                <div key={e.name} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: e.color }} />
                        <span style={{ color: e.color }} className="font-medium">{e.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">{Number(e.value).toLocaleString("id-ID")}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const TICK = { fill: "#64748B", fontSize: 11 };
const GRID = "#F1F5F9";

const DailyReportChart = memo(function DailyReportChart({ data }: { data: InboundRecord[] }) {
    const chartData = useMemo(() => aggregateReportHarian(data), [data]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[320px]">
            <div className="mb-2 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Report Harian</p>
                <p className="text-xs text-[#64748B]">Jumlah Slipsheet, Curah, dan Total FO per hari</p>
            </div>
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Inbound.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 4, right: 12, left: -12, bottom: 20 }}>
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
                            <Legend content={<CustomLegend />} />
                            <Bar dataKey="slipsheet" name="Slipsheet" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} legendType="square" />
                            <Bar dataKey="curah" name="Curah" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} legendType="square" />
                            <Line
                                type="monotone"
                                dataKey="totalFO"
                                name="Total FO"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: "#10B981", r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                legendType="line"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default DailyReportChart;
