"use client";

/**
 * FakturCharts — Charts for Gantungan Faktur dashboard.
 *
 *   NominalDokumenChart — Composed ComposedChart:
 *     Bar  = Jumlah Dokumen  (left  Y-axis, #DC2626)
 *     Line = Nominal Faktur  (right Y-axis, #2563EB)
 *     Dual Y-axis.
 *
 * NominalChart, DocumentChart, VendorChart, DistributionChart removed per spec.
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { nominalDokumenData } from "@/mock/gantunganFaktur";
import type { NominalDokumenItem } from "@/types/gantunganFaktur";

// ─── Helper: format nominal compact ──────────────────────────────────────────

function fmtNominal(v: number): string {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    return String(v);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
}

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[190px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
                        <span className="text-[#374151] font-medium">{entry.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {entry.dataKey === "nominal"
                            ? `Rp ${(entry.value / 1_000_000).toFixed(1)}M`
                            : `${entry.value} dok`}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 pt-2">
            {payload.map((entry) => (
                <div key={entry.value} className="flex items-center gap-1.5">
                    {entry.type === "line" ? (
                        <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: entry.color }} />
                    ) : (
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: entry.color }} />
                    )}
                    <span className="text-[11px] text-[#64748B] font-medium">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── NominalDokumenChart (ComposedChart with dual Y-axis) ─────────────────────

export const NominalDokumenChart = memo(function NominalDokumenChart() {
    const data: NominalDokumenItem[] = nominalDokumenData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 340 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data faktur.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Nominal & Dokumen Harian</p>
                <p className="text-xs text-[#64748B]">
                    Bar: Jumlah Dokumen (kiri) · Line: Nominal Faktur (kanan)
                </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                    data={data}
                    margin={{ top: 4, right: 48, left: 4, bottom: 0 }}
                    barCategoryGap="30%"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                        dataKey="tanggal"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    {/* Left Y — Jumlah Dokumen */}
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                        domain={[0, "auto"]}
                        label={{ value: "Dok", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 10, dy: 20 }}
                    />

                    {/* Right Y — Nominal Faktur */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tickFormatter={fmtNominal}
                        label={{ value: "Nominal", angle: 90, position: "insideRight", fill: "#94A3B8", fontSize: 10, dy: -30 }}
                    />

                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    {/* Bar — Jumlah Dokumen */}
                    <Bar
                        yAxisId="left"
                        dataKey="jumlah"
                        name="Jumlah Dokumen"
                        fill="#DC2626"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={36}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />

                    {/* Line — Nominal Faktur */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="nominal"
                        name="Nominal Faktur"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        legendType="line"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
});
