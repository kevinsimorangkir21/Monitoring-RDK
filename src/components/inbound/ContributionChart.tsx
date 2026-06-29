"use client";

/**
 * ContributionChart — Two-section chart panel:
 *   Section 2: Jumlah Bongkaran (grouped vertical BarChart)
 *   Section 3: Kontribusi Supply (horizontal BarChart, sorted descending)
 */

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { bongkaranData, supplierContributionData } from "@/data/inboundData";

// ─── Shared Custom Tooltip ────────────────────────────────────────────────────

interface TooltipPayloadItem {
    name: string;
    value: number;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-sm min-w-[160px]">
            <p className="font-semibold text-gray-800 mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex justify-between gap-4">
                    <span style={{ color: entry.color }} className="font-medium">
                        {entry.name}
                    </span>
                    <span className="text-gray-700 font-semibold">
                        {entry.value.toLocaleString("id-ID")}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Supplier bar colors — cycle through a palette
const SUPPLIER_COLORS = [
    "#dc2626",
    "#2563eb",
    "#7c3aed",
    "#16a34a",
    "#ea580c",
    "#0891b2",
];

// ─── Jumlah Bongkaran ─────────────────────────────────────────────────────────

function BongkaranChart() {
    return (
        <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
                Jumlah Bongkaran
            </h3>
            <p className="text-xs text-gray-400 mb-5">
                SlipSheet vs Curah per Plant
            </p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={bongkaranData}
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                        dataKey="plant"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Bar
                        dataKey="slipSheet"
                        name="SlipSheet"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                    />
                    <Bar
                        dataKey="curah"
                        name="Curah"
                        fill="#ea580c"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Kontribusi Supply ────────────────────────────────────────────────────────

function SupplyContributionChart() {
    // Sort descending for visual clarity
    const sorted = [...supplierContributionData].sort(
        (a, b) => b.totalBox - a.totalBox
    );

    return (
        <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
                Kontribusi Supply
            </h3>
            <p className="text-xs text-gray-400 mb-5">
                Total box per supplier
            </p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={sorted}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                        type="category"
                        dataKey="supplier"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                    />
                    <Tooltip
                        content={<ChartTooltip />}
                        formatter={(value: number) => value.toLocaleString("id-ID")}
                    />
                    <Bar dataKey="totalBox" name="Total Box" radius={[0, 6, 6, 0]} maxBarSize={20}>
                        {sorted.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={SUPPLIER_COLORS[index % SUPPLIER_COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Exported Wrapper ─────────────────────────────────────────────────────────

export default function ContributionChart() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BongkaranChart />
            <SupplyContributionChart />
        </div>
    );
}
