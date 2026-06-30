"use client";

/**
 * DeliveryTrendChart — ComposedChart tren pengiriman harian.
 *
 *   Bar  (Y-axis kiri,  yAxisId="delivery") : count records per hari — Total Delivery
 *   Line (Y-axis kanan, yAxisId="box")      : SUM totalBox per hari  — Total Box
 *
 *   X-axis   : label tanggal singkat ("01 Jun", "02 Jun", …)
 *   Tooltip  : white card, border, rounded-xl, shadow
 *   Legend   : square untuk Bar, line untuk Line
 *   Wrapper  : ResponsiveContainer height 320
 *
 * Requirements: 5.1–5.9
 */

import { memo, useMemo } from "react";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { OutboundRecord } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_BAR = "#10B981";  // emerald  — Total Delivery (count)
const COLOR_LINE = "#3B82F6"; // blue     — Total Box

const TICK_STYLE = { fill: "#64748B", fontSize: 11 };
const GRID_COLOR = "#F1F5F9";

// Short month names in Indonesian
const BULAN_ID = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// ─── Data Transformation ──────────────────────────────────────────────────────

interface DailyDataPoint {
    /** "YYYY-MM-DD" used for sorting */
    isoDate: string;
    /** "01 Jun", "02 Jun", … — X-axis label */
    label: string;
    count: number;
    totalBox: number;
}

export function buildDailyTrendData(records: OutboundRecord[]): DailyDataPoint[] {
    const map = new Map<string, { count: number; totalBox: number }>();

    for (const r of records) {
        const existing = map.get(r.tanggal);
        if (existing) {
            existing.count += 1;
            existing.totalBox += r.totalBox;
        } else {
            map.set(r.tanggal, { count: 1, totalBox: r.totalBox });
        }
    }

    const points: DailyDataPoint[] = [];

    map.forEach((value, isoDate) => {
        const [, monthStr, dayStr] = isoDate.split("-");
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const monthLabel = BULAN_ID[month - 1] ?? monthStr;
        const label = `${String(day).padStart(2, "0")} ${monthLabel}`;
        points.push({ isoDate, label, count: value.count, totalBox: value.totalBox });
    });

    // Sort ascending by date
    points.sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    return points;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
}

function DeliveryTrendTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const deliveryEntry = payload.find((p) => p.dataKey === "count");
    const boxEntry = payload.find((p) => p.dataKey === "totalBox");

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg px-4 py-3 text-xs min-w-[190px]">
            <p className="font-semibold text-[#111827] mb-2">{label}</p>
            {deliveryEntry && (
                <div className="flex items-center justify-between gap-6 mb-1">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{ background: deliveryEntry.color }}
                        />
                        <span className="text-[#64748B]">Total Delivery</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {deliveryEntry.value.toLocaleString("id-ID")}
                    </span>
                </div>
            )}
            {boxEntry && (
                <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-5 h-[3px] rounded-full"
                            style={{ background: boxEntry.color }}
                        />
                        <span className="text-[#64748B]">Total Box</span>
                    </span>
                    <span className="font-bold text-[#111827]">
                        {boxEntry.value.toLocaleString("id-ID")}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

interface LegendPayloadItem {
    value: string;
    color: string;
    type: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
    if (!payload?.length) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 pt-2">
            {payload.map((entry) => (
                <div key={entry.value} className="flex items-center gap-1.5">
                    {entry.type === "line" ? (
                        <span
                            className="inline-block w-5 h-[3px] rounded-full"
                            style={{ background: entry.color }}
                        />
                    ) : (
                        <span
                            className="inline-block w-3 h-3 rounded-sm"
                            style={{ background: entry.color }}
                        />
                    )}
                    <span className="text-[11px] text-[#64748B] font-medium">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ChartEmpty() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col" style={{ height: 320 }}>
            <div className="mb-3 shrink-0">
                <h2 className="text-sm font-bold text-[#111827]">Tren Pengiriman Harian</h2>
                <p className="text-xs text-[#64748B]">Jumlah delivery dan total box per hari</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">Belum ada data outbound.</p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DeliveryTrendChartProps {
    data: OutboundRecord[];
}

export const DeliveryTrendChart = memo(function DeliveryTrendChart({
    data,
}: DeliveryTrendChartProps) {
    const chartData = useMemo(() => buildDailyTrendData(data), [data]);

    if (data.length === 0 || chartData.length === 0) return <ChartEmpty />;

    return (
        <div
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5"
            role="img"
            aria-label="Grafik tren pengiriman harian"
        >
            <div className="mb-3">
                <h2 className="text-sm font-bold text-[#111827]">Tren Pengiriman Harian</h2>
                <p className="text-xs text-[#64748B]">Jumlah delivery dan total box per hari</p>
            </div>

            <ResponsiveContainer width="100%" height={268}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 4, right: 24, left: -8, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={GRID_COLOR}
                        vertical={false}
                    />

                    {/* X-axis: formatted date label */}
                    <XAxis
                        dataKey="label"
                        tick={{ ...TICK_STYLE, textAnchor: "end" }}
                        angle={-35}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                    />

                    {/* Left Y-axis: delivery count */}
                    <YAxis
                        yAxisId="delivery"
                        orientation="left"
                        tick={TICK_STYLE}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                        allowDecimals={false}
                        label={{
                            value: "Delivery",
                            angle: -90,
                            position: "insideLeft",
                            offset: 12,
                            style: { fontSize: 10, fill: "#9CA3AF" },
                        }}
                    />

                    {/* Right Y-axis: total box */}
                    <YAxis
                        yAxisId="box"
                        orientation="right"
                        tick={TICK_STYLE}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        allowDecimals={false}
                        label={{
                            value: "Box",
                            angle: 90,
                            position: "insideRight",
                            offset: 12,
                            style: { fontSize: 10, fill: "#9CA3AF" },
                        }}
                    />

                    <Tooltip
                        content={<DeliveryTrendTooltip />}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />

                    <Legend content={<CustomLegend />} />

                    {/* Bar — Total Delivery (left axis) */}
                    <Bar
                        yAxisId="delivery"
                        dataKey="count"
                        name="Total Delivery"
                        fill={COLOR_BAR}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={28}
                        legendType="square"
                        isAnimationActive
                        animationDuration={700}
                    />

                    {/* Line — Total Box (right axis) */}
                    <Line
                        yAxisId="box"
                        type="monotone"
                        dataKey="totalBox"
                        name="Total Box"
                        stroke={COLOR_LINE}
                        strokeWidth={2.5}
                        dot={{ fill: COLOR_LINE, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        legendType="line"
                        isAnimationActive
                        animationDuration={700}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
});

export default DeliveryTrendChart;
