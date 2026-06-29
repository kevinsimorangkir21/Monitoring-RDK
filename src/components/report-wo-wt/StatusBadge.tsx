"use client";

import { memo } from "react";
import type { WoWtStatus } from "@/types/reportWoWt";

const STYLES: Record<WoWtStatus, string> = {
    "Good": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Average": "bg-amber-50   text-amber-700   border-amber-200",
    "Below Target": "bg-red-50     text-red-700     border-red-200",
};

const DOTS: Record<WoWtStatus, string> = {
    "Good": "bg-emerald-500",
    "Average": "bg-amber-500",
    "Below Target": "bg-red-500",
};

interface Props { status: WoWtStatus; dot?: boolean; }

const StatusBadge = memo(function StatusBadge({ status, dot = true }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status]}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status]}`} />}
            {status}
        </span>
    );
});

export default StatusBadge;
