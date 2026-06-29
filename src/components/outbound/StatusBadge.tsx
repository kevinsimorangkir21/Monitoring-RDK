"use client";

/**
 * StatusBadge (Outbound) — Light enterprise status chip.
 * Maps OutboundStatus values to semantic colours.
 */

import { memo } from "react";
import type { OutboundStatus } from "@/types/outbound";

const STYLES: Record<OutboundStatus, string> = {
    "Siap Muat": "bg-amber-50   text-amber-700   border-amber-200",
    "Muat Proses": "bg-blue-50    text-blue-700    border-blue-200",
    "Muat Selesai": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Berangkat": "bg-violet-50  text-violet-700  border-violet-200",
    "Inap": "bg-red-50     text-red-700     border-red-200",
};

const DOT_COLORS: Record<OutboundStatus, string> = {
    "Siap Muat": "bg-amber-500",
    "Muat Proses": "bg-blue-500",
    "Muat Selesai": "bg-emerald-500",
    "Berangkat": "bg-violet-500",
    "Inap": "bg-red-500",
};

interface StatusBadgeProps {
    status: OutboundStatus;
    dot?: boolean;
}

const StatusBadge = memo(function StatusBadge({
    status,
    dot = true,
}: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status]}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status]}`} />}
            {status}
        </span>
    );
});

export default StatusBadge;
