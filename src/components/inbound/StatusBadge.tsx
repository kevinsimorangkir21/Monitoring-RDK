"use client";

/**
 * StatusBadge — Light enterprise status chip.
 * Used in the Inbound Detail table.
 */

import { memo } from "react";
import type { InboundStatus } from "@/types/inbound";

const STYLES: Record<InboundStatus, string> = {
    Completed: "bg-emerald-50  text-emerald-700  border-emerald-200",
    Progress: "bg-blue-50     text-blue-700     border-blue-200",
    Pending: "bg-amber-50    text-amber-700    border-amber-200",
    Delay: "bg-red-50      text-red-700      border-red-200",
};

const DOT_COLORS: Record<InboundStatus, string> = {
    Completed: "bg-emerald-500",
    Progress: "bg-blue-500",
    Pending: "bg-amber-500",
    Delay: "bg-red-500",
};

interface StatusBadgeProps {
    status: InboundStatus;
    dot?: boolean;
}

const StatusBadge = memo(function StatusBadge({ status, dot = true }: StatusBadgeProps) {
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
