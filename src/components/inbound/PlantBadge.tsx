"use client";

/**
 * PlantBadge — Light enterprise plant code chip.
 * Pastel fill, saturated text — readable on white table rows.
 */

import { memo } from "react";

const PALETTE: Record<string, string> = {
    PASM: "bg-violet-50 text-violet-700 border-violet-200",
    IMSM: "bg-cyan-50   text-cyan-700   border-cyan-200",
    U2: "bg-rose-50   text-rose-700   border-rose-200",
    LION: "bg-orange-50 text-orange-700 border-orange-200",
    TASE: "bg-teal-50   text-teal-700   border-teal-200",
};

const DEFAULT = "bg-slate-50 text-slate-700 border-slate-200";

interface PlantBadgeProps {
    plant: string;
}

const PlantBadge = memo(function PlantBadge({ plant }: PlantBadgeProps) {
    const style = PALETTE[plant] ?? DEFAULT;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-widest uppercase ${style}`}
        >
            {plant}
        </span>
    );
});

export default PlantBadge;
