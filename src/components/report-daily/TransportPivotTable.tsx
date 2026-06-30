"use client";

/**
 * TransportPivotTable — Detail Report (Transport tab)
 *
 * Format:
 *   Rows    = Jenis Report  (e.g. "Transport", "BSFG")
 *   Columns = Tanggal       (dynamic, one column per unique date in the data)
 *   Cell    = Keterangan / value for that jenisReport × tanggal combination
 *
 * Title is always "Detail Report".
 */

import { useMemo } from "react";
import type { DailyRecord } from "@/types/reportDaily";

interface Props {
    records: DailyRecord[];
}

// ─── Helper: short date label ────────────────────────────────────────────────

function shortDate(iso: string): string {
    // "2025-06-28" → "28 Jun"
    try {
        const [, month, day] = iso.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        return `${parseInt(day)} ${months[parseInt(month) - 1] ?? month}`;
    } catch {
        return iso;
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransportPivotTable({ records }: Props) {
    const { jenisReports, dates, pivot } = useMemo(() => {
        // Unique jenis reports (preserving insertion order)
        const jenisSet = new Set<string>();
        const dateSet = new Set<string>();
        records.forEach((r) => {
            jenisSet.add(r.jenisReport);
            dateSet.add(r.tanggal);
        });

        const jenisReports = Array.from(jenisSet);
        const dates = Array.from(dateSet).sort();   // ascending

        // pivot[jenisReport][tanggal] = keterangan
        const pivot: Record<string, Record<string, string>> = {};
        records.forEach((r) => {
            if (!pivot[r.jenisReport]) pivot[r.jenisReport] = {};
            pivot[r.jenisReport][r.tanggal] = r.keterangan;
        });

        return { jenisReports, dates, pivot };
    }, [records]);

    if (records.length === 0) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-8 shadow-sm text-center">
                <p className="text-sm text-[#9CA3AF]">Tidak ada data ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Title bar */}
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#111827]">Detail Report</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                        {records.length} record · {dates.length} tanggal
                    </p>
                </div>
            </div>

            {/* Scrollable pivot table */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full text-sm">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {/* First column header */}
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] whitespace-nowrap min-w-[140px] sticky left-0 bg-[#F9FAFB] z-10">
                                Jenis Report
                            </th>
                            {/* Date columns */}
                            {dates.map((d) => (
                                <th
                                    key={d}
                                    className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#64748B] whitespace-nowrap min-w-[96px]"
                                >
                                    {shortDate(d)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jenisReports.map((jenis, idx) => (
                            <tr
                                key={jenis}
                                className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors ${idx % 2 === 0 ? "" : "bg-[#FAFAFA]"
                                    }`}
                            >
                                {/* Row label */}
                                <td className="px-4 py-3 text-xs font-semibold text-[#374151] whitespace-nowrap sticky left-0 bg-inherit z-10">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold tracking-wide">
                                        {jenis}
                                    </span>
                                </td>
                                {/* Data cells */}
                                {dates.map((d) => {
                                    const val = pivot[jenis]?.[d];
                                    return (
                                        <td
                                            key={d}
                                            className="px-4 py-3 text-center text-xs text-[#374151]"
                                        >
                                            {val ? (
                                                <span className="font-medium">{val}</span>
                                            ) : (
                                                <span className="text-[#D1D5DB]">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
