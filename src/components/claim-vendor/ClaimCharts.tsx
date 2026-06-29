"use client";

/**
 * ClaimCharts — 4 Recharts charts for Claim Vendor dashboard.
 *   1. ClaimTrendChart       — Line/Area: total, approved, rejected per day
 *   2. ClaimByVendorChart    — Horizontal Bar: claims per vendor
 *   3. ClaimByCategoryChart  — Pie/Donut: claims by category
 *   4. ApprovalProgressChart — Radial/Donut: approval progress
 */

import { memo } from "react";
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    RadialBarChart, RadialBar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend,
    LabelList,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import {
    claimTrendData,
    claimByVendorData,
    claimByCategoryData,
    approvalProgressData,
} from "@/mock/claimVendor";

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-[#111827]">{title}</p>
            {children}
        </div>
    );
}

// ─── 1. Claim Trend ───────────────────────────────────────────────────────────

export const ClaimTrendChart = memo(function ClaimTrendChart() {
    return (
        <ChartCard title="Claim Trend">
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={claimTrendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                        itemStyle={{ color: "#374151" }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="total" name="Total" stroke="#3B82F6" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 3, fill: "#3B82F6" }} />
                    <Area type="monotone" dataKey="approved" name="Approved" stroke="#16A34A" strokeWidth={2} fill="url(#gradApproved)" dot={{ r: 3, fill: "#16A34A" }} />
                    <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#DC2626" strokeWidth={2} fill="url(#gradRejected)" dot={{ r: 3, fill: "#DC2626" }} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 2. Claim by Vendor ───────────────────────────────────────────────────────

export const ClaimByVendorChart = memo(function ClaimByVendorChart() {
    return (
        <ChartCard title="Claim by Vendor">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    layout="vertical"
                    data={claimByVendorData}
                    margin={{ top: 4, right: 32, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis
                        type="category"
                        dataKey="vendor"
                        width={120}
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                        formatter={(v: number) => [v, "Jumlah Claim"]}
                    />
                    <Bar dataKey="total" name="Total Claim" fill="#DC2626" radius={[0, 6, 6, 0]} barSize={18}>
                        <LabelList dataKey="total" position="right" style={{ fontSize: 11, fill: "#374151" }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

// ─── 3. Claim by Category (Donut) ─────────────────────────────────────────────

const RADIAN = Math.PI / 180;
function CustomLabel(props: PieLabelRenderProps) {
    const cx = Number(props.cx ?? 0);
    const cy = Number(props.cy ?? 0);
    const midAngle = Number(props.midAngle ?? 0);
    const innerRadius = Number(props.innerRadius ?? 0);
    const outerRadius = Number(props.outerRadius ?? 0);
    const percent = Number(props.percent ?? 0);

    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    if (percent < 0.06) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export const ClaimByCategoryChart = memo(function ClaimByCategoryChart() {
    return (
        <ChartCard title="Claim by Category">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                        <Pie
                            data={claimByCategoryData}
                            dataKey="total"
                            nameKey="kategori"
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={82}
                            paddingAngle={3}
                            labelLine={false}
                            label={CustomLabel}
                        >
                            {claimByCategoryData.map((entry) => (
                                <Cell key={entry.kategori} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                            formatter={(v: number, name: string) => [v, name]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 min-w-0">
                    {claimByCategoryData.map((item) => (
                        <div key={item.kategori} className="flex items-center gap-2 text-xs text-[#374151]">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <span className="truncate">{item.kategori}</span>
                            <span className="ml-auto font-semibold text-[#111827] pl-2">{item.total}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ChartCard>
    );
});

// ─── 4. Approval Progress (Radial Bar) ───────────────────────────────────────

export const ApprovalProgressChart = memo(function ApprovalProgressChart() {
    return (
        <ChartCard title="Approval Progress">
            <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={80}
                    barSize={14}
                    data={approvalProgressData}
                    startAngle={90}
                    endAngle={-270}
                >
                    <RadialBar
                        dataKey="value"
                        cornerRadius={6}
                        background={{ fill: "#F3F4F6" }}
                        label={{ position: "insideStart", fill: "#fff", fontSize: 10, fontWeight: 700 }}
                    >
                        {approvalProgressData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </RadialBar>
                    <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                        formatter={(v: number, name: string) => [`${v}%`, name]}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 flex-wrap">
                {approvalProgressData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-[#374151]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span>{item.name}</span>
                        <span className="font-bold text-[#111827]">{item.value}%</span>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
});
