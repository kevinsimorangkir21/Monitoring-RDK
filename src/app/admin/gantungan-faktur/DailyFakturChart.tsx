"use client";

/**
 * DailyFakturChart — Daily Faktur Trend (Recharts ComposedChart).
 *
 *   Bar  (left  Y) : Jumlah Dokumen (count per Tanggal)
 *   Line (right Y) : Total NET VALUE per Tanggal (SUM)
 *   X-axis         : Tanggal (aggregated daily)
 */

import { memo, useMemo } from "react";
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
import type { FakturRecord, DailyTrendPoint } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_COLOR = "#3B82F6";  // blue  — Jumlah Dokumen
const LINE_COLOR = "#10B981";  // emerald — NET VALUE

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function dateLabel(iso: string): string {
    const [, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTH_ABBR[(m ?? 1) - 1]}`;
}

function rpShort(v: number): string {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}Jt`;
    return v.toLocaleString("id-ID");
}

// ─── Data Transformation ──────────────────────────────────────────────────────

export function buildDailyTrend(records: FakturRecord[]): DailyTrendPoint[] {
    if (records.length === 0) return [];

    const map = new Map<string, { jumlah: number; netValue: number }>();
    for (const r of records) {
        const prev = map.get(r.tanggal) ?? { jumlah: 0, netValue: 0 };
        map.set(r.tanggal, { jumlah: prev.jumlah + 1, netValue: prev.netValue + r.netValue });
    }

    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => ({
            tanggal,
            tanggalLabel: dateLabel(tanggal),
            jumlah: v.jumlah,
            netValue: v.netValue,
        }));
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipEntry { name: string; value: number; color: string; dataKey: string }

function ChartTooltip({ active, payload, label }: {
    active?: boolean; payload?: TooltipEntry[]; label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[200px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                        <span className="text-[#374151] font-medium">{p.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {p.dataKey === "netValue"
                            ? `Rp ${p.value.toLocaleString("id-ID")}`
                            : p.value.toLocaleString("id-ID")}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

interface LegendEntry { value: string; color: string; type: string }

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
            {payload.map((e) => (
                <div key={e.value} className="flex items-center gap-1.5">
                    {e.type === "line" ? (
                        <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: e.color }} />
                    ) : (
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: e.color }} />
                    )}
                    <span className="text-[11px] text-[#64748B] font-medium">{e.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ChartEmpty() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col" style={{ height: 360 }}>
            <div className="mb-2 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">Daily Faktur Trend</h2>
                <p className="text-xs text-[#64748B]">Jumlah dokumen & total NET VALUE per hari</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data faktur.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DailyFakturChartProps { data: FakturRecord[] }

export const DailyFakturChart = memo(function DailyFakturChart({ data }: DailyFakturChartProps) {
    const chartData = useMemo(() => buildDailyTrend(data), [data]);

    if (chartData.length === 0) return <ChartEmpty />;

    const maxNetValue = Math.max(...chartData.map((d) => d.netValue));
    const nomDomain: [number, number] = [0, Math.ceil(maxNetValue * 1.15)];

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm"
            role="img"
            aria-label="Grafik tren harian faktur"
        >
            <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111827]">Daily Faktur Trend</h2>
                <p className="text-xs text-[#64748B]">Jumlah dokumen (Bar) & Total NET VALUE (Line) per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 52, left: -4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="tanggalLabel"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    {/* Left Y — document count */}
                    <YAxis
                        yAxisId="docs"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        label={{ value: "Dokumen", angle: -90, position: "insideLeft", offset: 10, style: { fill: "#94A3B8", fontSize: 10 } }}
                    />
                    {/* Right Y — net value */}
                    <YAxis
                        yAxisId="net"
                        orientation="right"
                        domain={nomDomain}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                        tickFormatter={rpShort}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    <Bar
                        yAxisId="docs"
                        dataKey="jumlah"
                        name="Jumlah Dokumen"
                        fill={BAR_COLOR}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />
                    <Line
                        yAxisId="net"
                        type="monotone"
                        dataKey="netValue"
                        name="NET VALUE"
                        stroke={LINE_COLOR}
                        strokeWidth={2.5}
                        dot={{ fill: LINE_COLOR, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        legendType="line"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
});

export default DailyFakturChart;
