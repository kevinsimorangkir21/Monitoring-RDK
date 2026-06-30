"use client";

/**
 * DurationDistributionChart — Donut chart showing duration range distribution.
 *
 * Categorises each SetoranRecord by its durasiSeconds into four ranges:
 *   · 0–30 min  → green  (#10B981)
 *   · 30–60 min → amber  (#F59E0B)
 *   · 60–90 min → red    (#EF4444)
 *   · 90 min+   → purple (#8B5CF6)
 *
 * Chart specifications (from design.md):
 *   - PieChart inside ResponsiveContainer, height=320 (Requirement 8.1, 8.2)
 *   - Donut: innerRadius=60, outerRadius=100, paddingAngle=2
 *   - startAngle=90, endAngle=450 (start at top, clockwise full circle)
 *   - Percentage labels rendered on each segment (Requirement 4.4)
 *   - Legend at bottom with circle icons (Requirement 4.4)
 *   - Cell component for per-segment colour (Requirement 4.2)
 *   - Custom Wings Group–styled tooltip (Requirement 8.2)
 *   - Loading skeleton and empty state
 *
 * Requirements: 4.1, 4.2, 4.4, 4.5, 8.1, 8.2
 */

import React, { memo, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { SetoranRecord } from "@/types/setoran";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DurationDistributionChartProps {
    /** Filtered setoran records — distribution is calculated internally */
    data: SetoranRecord[];
    /** Shows loading skeleton when true (Requirement 8.1) */
    loading?: boolean;
}

interface DistributionSegment {
    category: string;
    count: number;
    percentage: number; // 0–100, rounded to 1 d.p.
    color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 320;

/**
 * Duration categories in seconds (upper bound exclusive, except the last).
 * Order matches the color palette in the design spec.
 */
const CATEGORIES: Array<{ label: string; color: string; maxSeconds: number }> = [
    { label: "0–30 mnt", color: "#10B981", maxSeconds: 30 * 60 },
    { label: "30–60 mnt", color: "#F59E0B", maxSeconds: 60 * 60 },
    { label: "60–90 mnt", color: "#EF4444", maxSeconds: 90 * 60 },
    { label: "90 mnt+", color: "#8B5CF6", maxSeconds: Infinity },
];

// ─── Data Transformation ──────────────────────────────────────────────────────

/**
 * Groups records into the four duration ranges and computes the percentage
 * for each category relative to the total record count.
 *
 * Requirements: 4.1, 4.2
 */
export function buildDistribution(records: SetoranRecord[]): DistributionSegment[] {
    if (records.length === 0) return [];

    // Initialise counts
    const counts: number[] = CATEGORIES.map(() => 0);

    for (const record of records) {
        // Find the first category whose maxSeconds exceeds durasiSeconds
        const index = CATEGORIES.findIndex(
            (cat) => record.durasiSeconds < cat.maxSeconds
        );
        const bucket = index === -1 ? CATEGORIES.length - 1 : index;
        counts[bucket] = (counts[bucket] ?? 0) + 1;
    }

    const total = records.length;

    return CATEGORIES.map((cat, i) => ({
        category: cat.label,
        count: counts[i] ?? 0,
        percentage: Math.round(((counts[i] ?? 0) / total) * 1000) / 10, // 1 d.p.
        color: cat.color,
    }));
}

// ─── Label Renderer ───────────────────────────────────────────────────────────

interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percentage: number;
}

const RADIAN = Math.PI / 180;

/**
 * Renders a percentage label positioned just outside each pie segment.
 * Segments with 0 % are hidden to avoid clutter.
 */
function PercentageLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
}: LabelProps) {
    if (percentage === 0) return null;

    const radius = outerRadius + 16;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#111827"
            fontSize={11}
            fontWeight={500}
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
        >
            {`${percentage}%`}
        </text>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    payload?: DistributionSegment;
    value?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
}

/** Wings Group–styled tooltip for the distribution chart. */
function DistributionTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const segment = payload[0]?.payload;
    if (!segment) return null;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg min-w-[180px]">
            <p className="font-bold text-[#111827] mb-2">{segment.category}</p>
            <div className="flex items-center justify-between gap-6 mb-1">
                <span className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: segment.color }}
                    />
                    <span className="text-[#64748B]">Persentase</span>
                </span>
                <span className="font-bold text-[#111827]">{segment.percentage}%</span>
            </div>
            <div className="flex items-center justify-between gap-6">
                <span className="text-[#64748B]">Jumlah</span>
                <span className="font-bold text-[#111827]">
                    {segment.count.toLocaleString("id-ID")} transaksi
                </span>
            </div>
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm animate-pulse flex flex-col gap-3"
            style={{ height: CHART_HEIGHT }}
            aria-label="Memuat chart distribusi"
            aria-busy="true"
        >
            <div className="h-4 bg-[#F3F4F6] rounded w-2/3" />
            <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
            {/* Donut placeholder */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-[#F3F4F6]" />
            </div>
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
            <div className="mb-3 shrink-0">
                <p className="text-sm font-bold text-[#111827]">
                    Distribusi Durasi
                </p>
                <p className="text-xs text-[#64748B]">
                    Sebaran durasi setoran per rentang waktu
                </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Tidak ada data untuk ditampilkan.</p>
            </div>
        </div>
    );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

interface LegendPayloadEntry {
    value: string;
    color: string;
}

interface CustomLegendProps {
    payload?: LegendPayloadEntry[];
}

/** Compact horizontal legend with colour circles and category labels. */
function CustomLegend({ payload }: CustomLegendProps) {
    if (!payload?.length) return null;

    return (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-1">
            {payload.map((entry) => (
                <li key={entry.value} className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: entry.color }}
                    />
                    <span className="text-[#374151]">{entry.value}</span>
                </li>
            ))}
        </ul>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * DurationDistributionChart renders a donut chart visualising how many
 * setoran records fall into each duration range.
 *
 * All data processing is memoized so the parent only passes filtered records.
 *
 * Requirements: 4.1, 4.2, 4.4, 4.5, 8.1, 8.2
 */
export const DurationDistributionChart = memo(function DurationDistributionChart({
    data,
    loading = false,
}: DurationDistributionChartProps) {
    // Compute distribution segments (Requirements 4.1, 4.2)
    const segments = useMemo(() => buildDistribution(data), [data]);

    // ── Loading state (Requirement 8.1) ──────────────────────────────────────
    if (loading) return <ChartSkeleton />;

    // ── Empty state ──────────────────────────────────────────────────────────
    if (data.length === 0) return <EmptyState />;

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label="Grafik distribusi durasi setoran"
        >
            {/* Header */}
            <div className="mb-2 shrink-0">
                <p className="text-sm font-bold text-[#111827]">Distribusi Durasi</p>
                <p className="text-xs text-[#64748B]">
                    Sebaran durasi setoran per rentang waktu
                </p>
            </div>

            {/* Chart — ResponsiveContainer fulfils Requirement 4.5, 8.1, 8.2 */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={segments}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={450}
                            labelLine={false}
                            label={(props: any) => (
                                <PercentageLabel
                                    cx={props.cx}
                                    cy={props.cy}
                                    midAngle={props.midAngle}
                                    innerRadius={props.innerRadius}
                                    outerRadius={props.outerRadius}
                                    percentage={props.percentage}
                                />
                            )}
                        >
                            {segments.map((segment, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={segment.color}
                                />
                            ))}
                        </Pie>

                        {/* Custom tooltip (Requirement 8.2) */}
                        <Tooltip content={<DistributionTooltip />} />

                        {/* Legend at bottom (Requirement 4.4) */}
                        <Legend
                            content={<CustomLegend />}
                            verticalAlign="bottom"
                            height={36}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default DurationDistributionChart;
