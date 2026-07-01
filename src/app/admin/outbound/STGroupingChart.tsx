"use client";

import { memo, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { OutboundRecord } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type STWBucket = "< 30 Menit" | "30–60 Menit" | "60–90 Menit" | "> 90 Menit";

interface STWDataPoint {
    bucket: STWBucket;
    count: number;
    color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET_ORDER: STWBucket[] = [
    "< 30 Menit",
    "30–60 Menit",
    "60–90 Menit",
    "> 90 Menit",
];

const BUCKET_COLORS: Record<STWBucket, string> = {
    "< 30 Menit": "#10B981",   // green  — fast
    "30–60 Menit": "#F59E0B",  // amber  — moderate
    "60–90 Menit": "#F97316",  // orange — slow
    "> 90 Menit": "#EF4444",   // red    — very slow
};

// ─── Pure Functions ───────────────────────────────────────────────────────────

/**
 * Parses a "HH:MM" time string into total minutes from midnight.
 * Returns null for empty, null, undefined, or non-matching input.
 */
export function parseTimeToMinutes(time: string): number | null {
    if (!time) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
}

/**
 * Computes the STW duration in minutes as selesaiMuat - jamTerima.
 * Handles overnight crossings by adding 1440 if result is negative.
 * Returns null if either time is missing or invalid.
 */
export function computeSTWMinutes(
    jamTerima: string,
    selesaiMuat: string
): number | null {
    const start = parseTimeToMinutes(jamTerima);
    const end = parseTimeToMinutes(selesaiMuat);
    if (start === null || end === null) return null;
    let diff = end - start;
    if (diff < 0) diff += 1440; // overnight: e.g. 23:00 → 01:00
    return diff;
}

/**
 * Maps a non-negative minute duration to its STW bucket label.
 */
export function bucketSTW(minutes: number): STWBucket {
    if (minutes < 30) return "< 30 Menit";
    if (minutes < 60) return "30–60 Menit";
    if (minutes < 90) return "60–90 Menit";
    return "> 90 Menit";
}

/**
 * Builds the four-bucket STW distribution from an array of OutboundRecord.
 * Always returns all 4 buckets in order, with count = 0 for empty buckets.
 * Records with invalid/empty jamTerima or selesaiMuat are excluded.
 */
export function buildSTWData(records: OutboundRecord[]): STWDataPoint[] {
    const counts: Record<STWBucket, number> = {
        "< 30 Menit": 0,
        "30–60 Menit": 0,
        "60–90 Menit": 0,
        "> 90 Menit": 0,
    };

    for (const record of records) {
        const minutes = computeSTWMinutes(record.jamTerima, record.selesaiMuat);
        if (minutes === null) continue;
        counts[bucketSTW(minutes)] += 1;
    }

    return BUCKET_ORDER.map((bucket) => ({
        bucket,
        count: counts[bucket],
        color: BUCKET_COLORS[bucket],
    }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: STWDataPoint }>;
}

function STWTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[160px]">
            <p className="font-semibold text-[#111827] mb-1">{point.bucket}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: point.color }}
                    />
                    <span className="text-[#64748B]">Jumlah</span>
                </span>
                <span className="font-bold text-[#111827]">{point.count}</span>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface STGroupingChartProps {
    data: OutboundRecord[];
}

function STGroupingChart({ data }: STGroupingChartProps) {
    const chartData = useMemo(() => buildSTWData(data), [data]);

    const isEmpty = chartData.every((d) => d.count === 0);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-6">
            {/* Header */}
            <p className="text-sm font-semibold text-[#111827] mb-4">Grouping Time STW</p>

            {/* Empty state */}
            {isEmpty ? (
                <div className="flex items-center justify-center h-[280px]">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data dengan waktu valid.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 4, right: 16, left: -8, bottom: 4 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="bucket"
                            tick={{ fill: "#64748B", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#64748B", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            width={32}
                        />
                        <Tooltip
                            content={<STWTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
                            {chartData.map((entry) => (
                                <Cell key={entry.bucket} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default memo(STGroupingChart);
