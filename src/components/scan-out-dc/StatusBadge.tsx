"use client";

import { memo } from "react";
import type { ScanStatus } from "@/types/scanOutDC";

const STYLES: Record<ScanStatus, string> = {
    Completed: "bg-emerald-50  text-emerald-700  border-emerald-200",
    Pending: "bg-amber-50    text-amber-700    border-amber-200",
    Failed: "bg-red-50      text-red-700      border-red-200",
    Processing: "bg-blue-50     text-blue-700     border-blue-200",
};

const DOTS: Record<ScanStatus, string> = {
    Completed: "bg-emerald-500",
    Pending: "bg-amber-500",
    Failed: "bg-red-500",
    Processing: "bg-blue-500",
};

interface StatusBadgeProps { status: ScanStatus; dot?: boolean; }

const StatusBadge = memo(function StatusBadge({ status, dot = true }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status]}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status]}`} />}
            {status}
        </span>
    );
});

export default StatusBadge;
