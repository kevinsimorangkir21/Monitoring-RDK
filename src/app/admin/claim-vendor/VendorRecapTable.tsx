"use client";

/**
 * VendorRecapTable — Rekapitulasi Vendor.
 * Kolom: Nama Vendor | Total Claiman | Lunas | Belum Bayar
 * Empty state: "Belum ada data."
 */

import { memo } from "react";
import type { VendorRecapRow } from "./types";
import { fmtRp } from "./claimVendorStore";

interface VendorRecapTableProps {
    data: VendorRecapRow[];
}

const VendorRecapTable = memo(function VendorRecapTable({ data }: VendorRecapTableProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
                <p className="text-sm font-bold text-[#111827]">Rekapitulasi Vendor</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                    Ringkasan nominal claim per vendor
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                            {["Nama Vendor", "Total Claiman", "Lunas", "Belum Bayar"].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#64748B] whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-sm text-[#9CA3AF]">
                                    Belum ada data.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.vendor}
                                    className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 text-xs font-semibold text-[#111827] whitespace-nowrap">
                                        {row.vendor}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-[#111827] whitespace-nowrap tabular-nums">
                                        {fmtRp(row.totalClaiman)}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-[#16A34A] whitespace-nowrap tabular-nums">
                                        {fmtRp(row.lunas)}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-amber-600 whitespace-nowrap tabular-nums">
                                        {fmtRp(row.belumBayar)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default VendorRecapTable;
