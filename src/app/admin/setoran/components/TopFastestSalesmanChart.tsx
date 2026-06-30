"use client";

/**
 * TopFastestSalesmanChart — Horizontal bar chart showing the top 10 salesman
 * with the shortest average setoran duration (fastest performers).
 *
 * Uses a green color scheme (#10B981) as a success indicator for fast performance.
 *
 * Data processing:
 *   - Groups SetoranRecord[] by namaSalesman
 *   - Calculates average duration in minutes per salesman
 *   - Sorts ascending by averageDuration and takes the top 10 shortest (fastest)
 *
 * Chart specs (from design.md):
 *   - BarChart layout="horizontal", height=360
 *   - Bar fill: #10B981, radius: [0, 4, 4, 0], maxBarSize=32
 *   - XAxis: type="number" (duration in minutes)
 *   - YAxis: type="category", dataKey="salesman", width=80
 *   - Margin: { top: 4, right: 20, left: 60, bottom: 20 }
 *   - Card wrapper: bg-white, border-[#E5E7EB], rounded-[18px]
 *
 * Requirements: 3.1, 3.3, 3.5, 8.1, 8.2
 */

import React, { memo, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { SetoranRecord } from "@/types/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesmanRankingData {
    salesman: string;
    averageDuration: number; // minutes
    recordCount: number;
    rank: number; // 1-based ranking
}

export interface TopFastestSalesmanChartProps {
    /** Filtered setoran records to derive salesman rankings from */
    data: SetoranRecord[];
    /** Shows skeleton placeholder when true (Requirement 8.1) */
    loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_COLOR = "#10B981";
const TICK_STYLE = { fill: "#64748B", fontSize: 10 };
const GRID_COLOR = "#F1F5F9";
const CHART_HEIGHT = 360;
const CHART_MARGIN = { top: 4, right: 20, left: 60, bottom: 20 };

// ─── Data Transformation ──────────────────────────────────────────────────────

/**
 * Groups records by salesman, calculates average duration in minutes,
 * sorts ascending and returns the top 10 shortest (fastest) with 1-based rank.
 *
 * Requirements: 3.1, 3.3
 */
export function buildTop10Fastest(records: SetoranRecord[]): SalesmanRankingData[] {
    if (records.length === 0) return [];

    // Aggregate total duration seconds and record count per salesman
    const map = new Map<string, { totalSeconds: number; count: number }>();
    for (const record of records) {
        const entry = map.get(record.namaSalesman) ?? { totalSeconds: 0, count: 0 };
        map.set(record.namaSalesman, {
            totalSeconds: entry.totalSeconds + record.durasiSeconds,
            count: entry.count + 1,
        });
    }

    // Convert to SalesmanRankingData, sort ascending (shortest first), take top 10
    return Array.from(map.entries())
        .map(([salesman, { totalSeconds, count }]) => ({
            salesman,
            averageDuration: Math.round((totalSeconds / count / 60) * 10) / 10, // 1 dp
            recordCount: count,
            rank: 0, // assigned below
        }))
        .sort((a, b) => a.averageDuration - b.averageDuration)
        .slice(0, 10)
        .map((item, index) => ({ ...item, rank: index + 1 }));
}

// ─── Format Helper ────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}j ${mins}m`;
    return `${totalMinutes}m`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipEntry {
    value: number;
    payload?: SalesmanRankingData;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

function SalesmanTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const entry = payload[0];
    const record = entry.payload as SalesmanRankingData | undefined;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[180px]">
            <p className="font-bold text-[#111827] mb-2 truncate max-w-[160px]">
                {label}
            </p>
            <div className="flex items-center justify-between gap-6 mb-1">
                <span className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: BAR_COLOR }}
                    />
                    <span className="text-[#64748B]">Rata-rata Durasi</span>
                </span>
                <span className="font-bold text-[#111827]">
                    {formatDuration(entry.value)}
                </span>
            </div>
            {record && (
                <div className="flex items-center justify-between gap-6">
                    <span className="text-[#64748B]">Jumlah Transaksi</span>
                    <span className="font-bold text-[#111827]">
                        {record.recordCount.toLocaleString("id-ID")}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm animate-pulse flex flex-col gap-3"
            style={{ height: CHART_HEIGHT }}
            aria-label="Memuat chart"
            aria-busy="true"
        >
            <div className="h-4 bg-[#F3F4F6] rounded w-2/3" />
            <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
            <div className="flex-1 bg-[#F3F4F6] rounded-lg mt-2" />
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: CHART_HEIGHT }}
        >
            {/* Header */}
            <div className="mb-3 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">
                    Top 10 Salesman Tercepat
                </h2>
                <p className="text-xs text-[#64748B]">
                    Salesman dengan rata-rata durasi terpendek
                </p>
            </div>
            {/* Empty message */}
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Tidak ada data untuk ditampilkan.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * TopFastestSalesmanChart renders a horizontal bar chart of the 10 salesman
 * with the shortest average setoran duration (fastest performers).
 *
 * All data processing is memoized so parent only passes raw filtered records.
 *
 * Requirements: 3.1, 3.3, 3.5, 8.1, 8.2
 */
export const TopFastestSalesmanChart = memo(function TopFastestSalesmanChart({
    data,
    loading = false,
}: TopFastestSalesmanChartProps) {
    // Compute top-10 fastest ranking (Requirement 3.3)
    const chartData = useMemo(() => buildTop10Fastest(data), [data]);

    // ── Loading state (Requirement 8.1) ──────────────────────────────────────
    if (loading) return <ChartSkeleton />;

    // ── Empty state ──────────────────────────────────────────────────────────
    if (chartData.length === 0) return <EmptyState />;

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label="Grafik top 10 salesman dengan durasi setoran terpendek"
        >
            {/* Header */}
            <div className="mb-3 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">
                    Top 10 Salesman Tercepat
                </h2>
                <p className="text-xs text-[#64748B]">
                    Salesman dengan rata-rata durasi terpendek
                </p>
            </div>

            {/* Chart — ResponsiveContainer fulfils Requirement 3.5, 8.1, 8.2 */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="horizontal"
                        data={chartData}
                        margin={CHART_MARGIN}
                    >
                        {/* Vertical grid lines only (horizontal chart = value axis is X) */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            horizontal={false}
                        />

                        {/* X-axis: duration in minutes (number axis) */}
                        <XAxis
                            type="number"
                            tick={{ ...TICK_STYLE, fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            label={{
                                value: "Rata-rata Durasi (menit)",
                                position: "insideBottom",
                                offset: -10,
                                fill: "#64748B",
                                fontSize: 10,
                            }}
                        />

                        {/* Y-axis: salesman names (category axis) */}
                        <YAxis
                            type="category"
                            dataKey="salesman"
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                        />

                        {/* Custom tooltip */}
                        <Tooltip
                            content={<SalesmanTooltip />}
                            cursor={{ fill: "rgba(16,185,129,0.06)" }}
                        />

                        {/* Green bar — success indicator for fast performance (Requirement 3.3) */}
                        <Bar
                            dataKey="averageDuration"
                            fill={BAR_COLOR}
                            radius={[0, 4, 4, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default TopFastestSalesmanChart;
