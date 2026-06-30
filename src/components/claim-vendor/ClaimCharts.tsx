"use client";

/**
 * ClaimCharts — Charts for Claim Vendor dashboard.
 *
 *   ClaimTrendChart   — Area chart using Value (IDR), not count
 *   ClaimByVendorChart — Grouped bar: Total Claim | Payment | Outstanding
 *
 * ClaimByCategoryChart and ApprovalProgressChart removed per revision spec.
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend,
} from "recharts";
import { claimTrendData, claimByVendorData } from "@/mock/claimVendor";
import type { ClaimByVendorItem } from "@/types/claimVendor";

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtRp(v: number): string {
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
    return `Rp ${(v / 1_000_000).toFixed(0)}M`;
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="mb-4">
                <p className="text-sm font-bold text-[#111827]">{title}</p>
                {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
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

// ─── 1. Claim Trend (Value-based) ─────────────────────────────────────────────

export const ClaimTrendChart = memo(function ClaimTrendChart() {
    return (
        <ChartCard
            title="Claim Trend"
            subtitle="Total nilai klaim, approved, dan rejected per hari (IDR)"
        >
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={claimTrendData} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradTotalNilai" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradApprovedNilai" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRejectedNilai" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="tanggal"
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                        formatter={(v: number, name: string) => [fmtRp(v), name]}
                    />
                    <Legend content={<CustomLegend />} />
                    <Area
                        type="monotone"
                        dataKey="totalNilai"
                        name="Total"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#gradTotalNilai)"
                        dot={{ r: 3, fill: "#3B82F6" }}
                        legendType="line"
                    />
                    <Area
                        type="monotone"
                        dataKey="approvedNilai"
                        name="Approved"
                        stroke="#16A34A"
                        strokeWidth={2}
                        fill="url(#gradApprovedNilai)"
                        dot={{ r: 3, fill: "#16A34A" }}
                        legendType="line"
                    />
                    <Area
                        type="monotone"
                        dataKey="rejectedNilai"
                        name="Rejected"
                        stroke="#DC2626"
                        strokeWidth={2}
                        fill="url(#gradRejectedNilai)"
                        dot={{ r: 3, fill: "#DC2626" }}
                        legendType="line"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── Vendor tooltip ───────────────────────────────────────────────────────────

interface VendorTooltipEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: ClaimByVendorItem;
}

function VendorTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: VendorTooltipEntry[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[200px]">
            <p className="font-semibold text-[#111827] mb-2 truncate max-w-[180px]">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                        <span className="text-[#374151] font-medium">{p.name}</span>
                    </span>
                    <span className="font-bold text-[#111827]">{fmtRp(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

// ─── 2. Claim by Vendor — Grouped Bar: Total | Payment | Outstanding ──────────

export const ClaimByVendorChart = memo(function ClaimByVendorChart() {
    // Shorten vendor names for the Y-axis
    const data = claimByVendorData.map((d) => ({
        ...d,
        vendorShort: d.vendor.replace(/^(PT|CV|UD)\s+/, "").slice(0, 14),
    }));

    return (
        <ChartCard
            title="Claim by Vendor"
            subtitle="Total Claim · Payment · Outstanding (IDR)"
        >
            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={data}
                    margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                    barCategoryGap="20%"
                    barGap={3}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="vendorShort"
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={40}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <Tooltip content={<VendorTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    {/* Bar 1 — Total Claim */}
                    <Bar
                        dataKey="nilai"
                        name="Total Claim"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />

                    {/* Bar 2 — Payment (Approved) */}
                    <Bar
                        dataKey="paymentNilai"
                        name="Payment"
                        fill="#16A34A"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />

                    {/* Bar 3 — Outstanding */}
                    <Bar
                        dataKey="outstandingNilai"
                        name="Outstanding"
                        fill="#DC2626"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});
