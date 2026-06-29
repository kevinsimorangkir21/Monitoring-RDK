"use client";

import { memo } from "react";
import type { DurasiStatus } from "@/types/setoran";

const STYLES: Record<DurasiStatus, string> = {
    "Fast": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Normal": "bg-orange-50  text-orange-700  border-orange-200",
    "Slow": "bg-red-50     text-red-700     border-red-200",
};

const DOTS: Record<DurasiStatus, string> = {
    "Fast": "bg-emerald-500",
    "Normal": "bg-orange-500",
    "Slow": "bg-red-500",
};

interface Props {
    durasi: string;
    status: DurasiStatus;
    dot?: boolean;
}

const DurationBadge = memo(function DurationBadge({ durasi, status, dot = true }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono ${STYLES[status]}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOTS[status]}`} />}
            {durasi}
        </span>
    );
});

export default DurationBadge;
