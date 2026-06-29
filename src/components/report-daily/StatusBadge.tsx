"use client";

/**
 * StatusBadge — Report Daily status chip.
 * Used to visually tag Jenis Report values in the table.
 */

import { memo } from "react";

// Colour palette maps jenis report keywords → style class
const JENIS_STYLES: Record<string, string> = {
    "Gantungan DO": "bg-red-50    text-red-700    border-red-200",
    "Keterlambatan": "bg-amber-50  text-amber-700  border-amber-200",
    "Keberangkatan": "bg-blue-50   text-blue-700   border-blue-200",
    "Claim": "bg-orange-50 text-orange-700 border-orange-200",
    "Bahan Bakar": "bg-cyan-50   text-cyan-700   border-cyan-200",
    "Picking": "bg-violet-50 text-violet-700 border-violet-200",
    "Receiving": "bg-sky-50    text-sky-700    border-sky-200",
    "Stock Opname": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Putaway": "bg-teal-50   text-teal-700   border-teal-200",
    "Overtime": "bg-rose-50   text-rose-700   border-rose-200",
    "Stock Masuk": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Stock Keluar": "bg-red-50    text-red-700    border-red-200",
    "Stock On Hand": "bg-blue-50   text-blue-700   border-blue-200",
    "Investigasi": "bg-amber-50  text-amber-700  border-amber-200",
};

const DEFAULT = "bg-slate-50 text-slate-700 border-slate-200";

interface StatusBadgeProps {
    label: string;
}

const StatusBadge = memo(function StatusBadge({ label }: StatusBadgeProps) {
    const style = JENIS_STYLES[label] ?? DEFAULT;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}
        >
            {label}
        </span>
    );
});

export default StatusBadge;
