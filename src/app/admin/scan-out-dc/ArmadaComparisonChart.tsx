"use client";

/**
 * ArmadaComparisonChart — Bedah Rata-rata Jam Scan Out Per Armada.
 * Vertical Bar Chart (kanan).
 * Dapat difilter per vendor via dropdown.
 * Empty state: "Belum ada data Scan Out."
 */

import { memo, useMemo, useCallback, useState } from "react";
import {
    BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import type { ArmadaPoint, ScanOutEntry } from "./types";
import { decimalToTime, timeToDecimal } from "./scanOutStore";
import { ChevronDown } from "lucide-react";

const COLORS = ["#DC2626", "#2563EB", "#7C3AED", "#D97706", "#059669", "#0891B2", "#EC4899"];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TTEntry { value: number; name: string }
interface TTProps { active?: boolean; payload?: TTEntry[]; label?: string }

function ChartTooltip({ active, payload, label }: TTProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-[#111827] mb-1">{label}</p>
            <p className="font-bold text-[#2563EB]">Avg: {decimalToTime(payload[0].value)}</p>
        </div>
    );
}

function fmtTick(v: number): string {
    if (!isFinite(v)) return "";
    return decimalToTime(v);
}

function fmtXTick(v: string): string {
    // Truncate long nopol if needed
    return v.length > 10 ? v.slice(0, 10) + "…" : v;
}

const AXIS = { fill: "#64748B", fontSize: 11 };

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArmadaComparisonChartProps {
    records: ScanOutEntry[];
    vendors: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const ArmadaComparisonChart = memo(function ArmadaComparisonChart({
    records,
    vendors,
}: ArmadaComparisonChartProps) {
    const [selectedVendor, setSelectedVendor] = useState<string>("");

    const handleVendorChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedVendor(e.target.value),
        []
    );

    const chartData = useMemo((): ArmadaPoint[] => {
        const filtered = selectedVendor
            ? records.filter((r) => r.vendor === selectedVendor)
            : records;

        const map: Record<string, number[]> = {};
        for (const r of filtered) {
            if (!map[r.nopol]) map[r.nopol] = [];
            const d = timeToDecimal(r.jamScanOut);
            if (isFinite(d) && d > 0) map[r.nopol].push(d);
        }
        return Object.entries(map)
            .map(([nopol, vals]) => ({
                nopol,
                avgScanOut: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
            }))
            .sort((a, b) => a.avgScanOut - b.avgScanOut);
    }, [records, selectedVendor]);

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm flex flex-col h-[300px]">
            <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
                <div>
                    <p className="text-sm font-semibold text-[#111827]">
                        Bedah Rata-rata Jam Scan Out Per Armada
                    </p>
                    <p className="text-xs text-[#64748B]">Avg jam scan out per nopol armada</p>
                </div>
                {/* Vendor dropdown */}
                <div className="relative shrink-0">
                    <select
                        value={selectedVendor}
                        onChange={handleVendorChange}
                        className="h-8 pl-3 pr-8 rounded-xl border border-[#E5E7EB] text-xs text-[#374151] bg-white outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 appearance-none cursor-pointer"
                    >
                        <option value="">Semua Vendor</option>
                        {vendors.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <ChevronDown
                        size={12}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                    />
                </div>
            </div>
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[#9CA3AF]">Belum ada data Scan Out.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 4, right: 12, left: -4, bottom: 20 }}
                            barCategoryGap="25%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis
                                dataKey="nopol"
                                tick={{ ...AXIS, textAnchor: "end" }}
                                angle={-35}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tickFormatter={fmtXTick}
                            />
                            <YAxis
                                tick={{ ...AXIS, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={42}
                                domain={["auto", "auto"]}
                                tickFormatter={fmtTick}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar
                                dataKey="avgScanOut"
                                name="Avg Scan Out"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={32}
                                isAnimationActive
                                animationDuration={700}
                            >
                                {chartData.map((_, i) => (
                                    <Cell key={`a-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});

export default ArmadaComparisonChart;
