"use client";

import { memo } from "react";
import type { ClaimStatus } from "@/types/claimVendor";

const STYLES: Record<ClaimStatus, string> = {
    "Waiting Approval": "bg-amber-50  text-amber-700  border-amber-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-50    text-red-700    border-red-200",
};

const DOTS: Record<ClaimStatus, string> = {
    "Waiting Approval": "bg-amber-500",
    "Approved": "bg-emerald-500",
    "Rejected": "bg-red-500",
};

interface Props { status: ClaimStatus; dot?: boolean; }

const StatusBadge = memo(function StatusBadge({ status, dot = true }: Props) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status]}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status]}`} />}
            {status}
        </span>
    );
});

export default StatusBadge;
