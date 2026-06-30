"use client";

/**
 * SupplyContributionChart — Kontribusi Supply per Plant.
 * Vertical BarChart: jumlah mobil inbound per plant supply.
 * Lazy-loaded via dynamic() in the page.
 */

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { bongkaranByPlantData } from "@/mock/inbound";
import type { KontribusiSupplyItem } from "@/types/inbound";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipProps {
    active?: boolean;
    payload?: { value: number; payload: KontribusiSupplyItem }[];
    label?: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[160px]">
            <div className="flex justify-between gap-6 mb-0.5">
                <span className="text-[#64748B]">Plant</span>
                <span className="font-bold text-[#111827]">{label}</span>
            </div>
            <div className="flex justify-between gap-6">
                <span className="text-[#64748B]">Jumlah Mobil</span>
                <span className="font-bold text-[#F59E0B]">
                    {Number(payload[0].value).toLocaleString("id-ID")}
                </span>
            </div>
        </div>
    );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";
const BAR_FILL = "#F59E0B";
const BAR_ACTIVE = "#D97706";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupplyContributionChart() {
    const data = bongkaranByPlantData;

    if (!data.length) {
        return (
            <div
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex items-center justify-center"
                style={{ height: 320 }}
            >
                <p className="text-sm text-[#9CA3AF]">Belum ada data bongkaran by plant.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            {/* Header */}
            <div className="mb-3 shrink-0">
                <p className="text-sm font-semibold text-[#111827]">Bongkaran by Plant</p>
                <p className="text-xs text-[#64748B]">Jumlah mobil inbound berdasarkan plant</p>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                        barCategoryGap="30%"
                    >
                        {/* Horizontal + vertical grid — matches old dashboard style */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />

                        {/* X Axis — plant code */}
                        <XAxis
                            dataKey="plant"
                            tick={{ ...TICK_STYLE, fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* Y Axis — totalMobil */}
                        <YAxis
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        />

                        {/* Bar — Total Mobil (#F59E0B amber) */}
                        <Bar
                            dataKey="totalMobil"
                            name="Total Mobil"
                            fill={BAR_FILL}
                            activeBar={{ fill: BAR_ACTIVE }}
                            radius={[5, 5, 0, 0]}
                            maxBarSize={36}
                            isAnimationActive
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
