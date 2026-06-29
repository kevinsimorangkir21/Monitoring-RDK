"use client";

/**
 * FakturCharts — 4 charts for Gantungan Faktur dashboard.
 *   1. NominalChart      — Nominal Faktur Harian (Bar)
 *   2. DocumentChart     — Jumlah Dokumen Harian (Line)
 *   3. VendorChart       — Nominal per Vendor (Horizontal Bar)
 *   4. DistributionChart — Distribusi Nominal Faktur (Donut)
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    BarChart, Bar,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell,
    Legend,
} from "recharts";
import {
    nominalHarianData,
    dokumenHarianData,
    nominalPerVendorData,
    distribusiNominalData,
} from "@/mock/gantunganFaktur";
import { fmtCompact } from "@/utils/formatNumber";

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">{title}</p>
                {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function NominalTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; name: string; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: Rp {(p.value / 1_000_000).toFixed(1)}M
                </p>
            ))}
        </div>
    );
}

function CountTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; name: string; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {p.value} dokumen
                </p>
            ))}
        </div>
    );
}

// ─── 1. Nominal Faktur Harian (Bar) ──────────────────────────────────────────

export const NominalChart = memo(function NominalChart() {
    return (
        <ChartCard
            title="Nominal Faktur Harian"
            subtitle="Total nominal faktur per hari (7 hari terakhir)"
        >
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={nominalHarianData} barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<NominalTooltip />} />
                    <Bar dataKey="nominal" name="Nominal" fill="#DC2626" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 2. Jumlah Dokumen Harian (Line) ─────────────────────────────────────────

export const DocumentChart = memo(function DocumentChart() {
    return (
        <ChartCard
            title="Jumlah Dokumen Harian"
            subtitle="Total dokumen masuk per hari (7 hari terakhir)"
        >
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dokumenHarianData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CountTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="jumlah"
                        name="Dokumen"
                        stroke="#DC2626"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#DC2626", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#DC2626" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 3. Nominal per Vendor (Horizontal Bar) ───────────────────────────────────

function VendorTooltip({ active, payload }: {
    active?: boolean;
    payload?: { value: number; name: string }[];
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="text-[#DC2626] font-semibold">
                Rp {(payload[0].value / 1_000_000_000).toFixed(2)}B
            </p>
        </div>
    );
}

export const VendorChart = memo(function VendorChart() {
    return (
        <ChartCard
            title="Nominal per Vendor"
            subtitle="Akumulasi nominal faktur per vendor"
        >
            <ResponsiveContainer width="100%" height={260}>
                <BarChart
                    data={nominalPerVendorData}
                    layout="vertical"
                    barSize={16}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                        type="number"
                        tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="vendor"
                        tick={{ fontSize: 10, fill: "#374151" }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                    />
                    <Tooltip content={<VendorTooltip />} />
                    <Bar dataKey="nominal" name="Nominal" fill="#DC2626" radius={[0, 6, 6, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 4. Distribusi Nominal Faktur (Donut) ─────────────────────────────────────

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number;
    innerRadius: number; outerRadius: number; percent: number;
}) {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export const DistributionChart = memo(function DistributionChart() {
    const total = distribusiNominalData.reduce((s, d) => s + d.value, 0);

    return (
        <ChartCard
            title="Distribusi Nominal Faktur"
            subtitle="Persentase berdasarkan status"
        >
            <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                        <Pie
                            data={distribusiNominalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={90}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomLabel}
                            strokeWidth={0}
                        >
                            {distribusiNominalData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-2.5">
                    {distribusiNominalData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#111827]">{d.name}</p>
                                <p className="text-[11px] text-[#64748B]">
                                    {d.value} dok ({((d.value / total) * 100).toFixed(0)}%)
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="pt-1 border-t border-[#F3F4F6]">
                        <p className="text-[10px] text-[#9CA3AF]">Total</p>
                        <p className="text-sm font-bold text-[#111827]">{total} Dokumen</p>
                    </div>
                </div>
            </div>
        </ChartCard>
    );
});
