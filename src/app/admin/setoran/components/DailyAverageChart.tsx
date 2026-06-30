"use client";

/**
 * DailyAverageChart — Tren Rata-rata Durasi Harian
 *
 * Renders a Recharts LineChart showing the daily average setoran duration
 * across the filtered dataset.
 *
 * Chart Specifications:
 *   - LineChart inside ResponsiveContainer (Requirement 2.2, 8.1)
 *   - X-axis: dates formatted as "DD Mon" (Requirement 2.4)
 *   - Y-axis: average duration in minutes (Requirement 2.4)
 *   - Smooth monotone curve with data-point markers (Requirement 2.5)
 *   - Custom Wings Group–styled tooltip (Requirement 8.2)
 *   - Loading skeleton and empty state
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5, 8.1, 8.2
 */

import React, { memo, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { DailyAverageItem, SetoranRecord } from "@/types/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyAverageChartProps {
    /** Filtered setoran records — chart derives daily averages internally */
    data: SetoranRecord[];
    /** Shows loading skeleton when true */
    loading?: boolean;
    /** Optional date range label shown in the subtitle */
    dateRange?: { start: string; end: string };
}

interface TooltipEntry {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Wings Group green — primary data colour */
const LINE_COLOR = "#10B981";
const TICK_STYLE = { fill: "#64748B", fontSize: 11 } as const;
const GRID_COLOR = "#F1F5F9";
const CHART_MARGIN = { top: 8, right: 16, left: -8, bottom: 24 } as const;

// ─── Data Transformation ──────────────────────────────────────────────────────

/**
 * Derives daily average duration data from a flat list of setoran records.
 *
 * Groups records by `tanggal` (YYYY-MM-DD), computes the mean durasiSeconds
 * for each day, and returns an array sorted chronologically.
 *
 * Requirements: 2.1
 */
export function calculateDailyAverages(records: SetoranRecord[]): DailyAverageItem[] {
    if (records.length === 0) return [];

    // Group total seconds and count by date
    const dayMap = new Map<string, { totalSeconds: number; count: number }>();
    for (const record of records) {
        const existing = dayMap.get(record.tanggal) ?? { totalSeconds: 0, count: 0 };
        dayMap.set(record.tanggal, {
            totalSeconds: existing.totalSeconds + record.durasiSeconds,
            count: existing.count + 1,
        });
    }

    // Build sorted array
    return Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, { totalSeconds, count }]) => {
            const avgSeconds = totalSeconds / count;
            const avgMinutes = Math.round((avgSeconds / 60) * 10) / 10; // 1 d.p.

            // Format label: "28 Jun" from "2025-06-28"
            const tanggalLabel = formatDateLabel(tanggal);

            return { tanggal, tanggalLabel, avgMinutes };
        });
}

/**
 * Converts a YYYY-MM-DD string to a short "D Mon" label,
 * e.g. "2025-06-28" → "28 Jun".
 */
function formatDateLabel(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    const MONTHS = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const monthName = MONTHS[(month ?? 1) - 1] ?? String(month);
    return `${day} ${monthName} ${year}`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

/** Wings Group–styled tooltip for the daily average chart. */
function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[180px]">
            <p className="font-bold text-[#111827] mb-2">{label}</p>
            <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: entry?.color ?? LINE_COLOR }}
                    />
                    <span style={{ color: entry?.color ?? LINE_COLOR }} className="font-medium">
                        Rata-rata Durasi
                    </span>
                </span>
                <span className="font-bold text-[#111827]">
                    {entry?.value != null
                        ? `${entry.value} menit`
                        : "—"}
                </span>
            </div>
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm animate-pulse"
            style={{ height: 320 }}
            aria-busy="true"
            aria-label="Memuat grafik rata-rata harian"
        >
            <div className="mb-3 space-y-1.5">
                <div className="h-3.5 bg-[#F3F4F6] rounded w-2/5" />
                <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
            </div>
            <div className="h-[240px] bg-[#F9FAFB] rounded-xl" />
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ChartEmpty() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
        >
            <div className="mb-2 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">Tren Rata-rata Durasi Harian</h2>
                <p className="text-xs text-[#64748B]">Rata-rata durasi setoran per hari</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data untuk ditampilkan.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * DailyAverageChart renders a responsive line chart showing the daily average
 * setoran duration trend across the filtered dataset.
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5, 8.1, 8.2
 */
export const DailyAverageChart = memo(function DailyAverageChart({
    data,
    loading = false,
    dateRange,
}: DailyAverageChartProps) {
    // Derive daily averages from the filtered records (Requirement 2.1)
    const chartData = useMemo(() => calculateDailyAverages(data), [data]);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) return <ChartSkeleton />;

    // ── Empty state ───────────────────────────────────────────────────────────
    if (chartData.length === 0) return <ChartEmpty />;

    // Build subtitle from dateRange or data boundaries
    const firstDate = chartData[0]?.tanggalLabel ?? "";
    const lastDate = chartData[chartData.length - 1]?.tanggalLabel ?? "";
    const subtitle = dateRange
        ? `${dateRange.start} — ${dateRange.end}`
        : `${firstDate} — ${lastDate}`;

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: 320 }}
            role="img"
            aria-label={`Grafik tren rata-rata durasi setoran harian: ${subtitle}`}
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">
                    Tren Rata-rata Durasi Harian
                </h2>
                <p className="text-xs text-[#64748B]">{subtitle}</p>
            </div>

            {/* Chart — fills remaining height (Requirement 2.2, 8.1) */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={CHART_MARGIN}>
                        {/* Horizontal grid only */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />

                        {/* X-axis — date labels (Requirement 2.4) */}
                        <XAxis
                            dataKey="tanggalLabel"
                            tick={{ ...TICK_STYLE, textAnchor: "middle" }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />

                        {/* Y-axis — duration in minutes (Requirement 2.4) */}
                        <YAxis
                            tick={TICK_STYLE}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                            tickFormatter={(v: number) => `${v}`}
                            label={{
                                value: "menit",
                                angle: -90,
                                position: "insideLeft",
                                offset: 12,
                                style: { fill: "#94A3B8", fontSize: 10 },
                            }}
                        />

                        {/* Custom tooltip (Requirement 8.2) */}
                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                        />

                        {/* Smooth monotone line with dot markers (Requirement 2.5) */}
                        <Line
                            type="monotone"
                            dataKey="avgMinutes"
                            name="Rata-rata Durasi"
                            stroke={LINE_COLOR}
                            strokeWidth={3}
                            dot={{ fill: LINE_COLOR, r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: LINE_COLOR }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default DailyAverageChart;
