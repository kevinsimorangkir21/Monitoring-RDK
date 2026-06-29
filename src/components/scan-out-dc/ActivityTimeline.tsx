"use client";

/**
 * ActivityTimeline — Recent Scan Out activities card.
 * Columns: Time | FO Number | DC | Operator | Status
 */

import { memo } from "react";
import { activityData } from "@/mock/scanOutDC";
import StatusBadge from "./StatusBadge";

const ActivityTimeline = memo(function ActivityTimeline() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold text-[#111827]">Aktivitas Terbaru</p>
                <p className="text-xs text-[#64748B]">Real-time Scan Out activity</p>
            </div>

            <div className="space-y-0">
                {activityData.map((item, i) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 py-3 ${i < activityData.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
                    >
                        {/* Time */}
                        <span className="text-xs font-semibold text-[#64748B] w-10 shrink-0">{item.time}</span>

                        {/* Dot connector */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className={`w-2 h-2 rounded-full ${item.status === "Completed" ? "bg-emerald-500" :
                                    item.status === "Processing" ? "bg-blue-500" :
                                        item.status === "Pending" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                        </div>

                        {/* FO + DC */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#111827] truncate">{item.nomorFO}</p>
                            <p className="text-[11px] text-[#64748B] truncate">{item.dc}</p>
                        </div>

                        {/* Operator */}
                        <span className="text-[11px] text-[#64748B] hidden sm:block shrink-0 w-20 text-right truncate">
                            {item.operator}
                        </span>

                        {/* Status */}
                        <div className="shrink-0">
                            <StatusBadge status={item.status} dot={false} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ActivityTimeline;
