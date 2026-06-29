"use client";

import { memo } from "react";
import type { UserStatus } from "@/types/users";

const STYLES: Record<UserStatus, string> = {
    "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Inactive": "bg-gray-50    text-gray-600    border-gray-200",
    "Suspended": "bg-red-50     text-red-700     border-red-200",
};

const DOTS: Record<UserStatus, string> = {
    "Active": "bg-emerald-500",
    "Inactive": "bg-gray-400",
    "Suspended": "bg-red-500",
};

interface Props { status: UserStatus; dot?: boolean; }

const StatusBadge = memo(function StatusBadge({ status, dot = true }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status]}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status]}`} />}
            {status}
        </span>
    );
});

export default StatusBadge;
