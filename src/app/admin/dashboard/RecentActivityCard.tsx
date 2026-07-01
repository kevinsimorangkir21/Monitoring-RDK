"use client";

/**
 * RecentActivityCard — Card Recent Activity di dashboard.
 * Tampilkan maks 10 aktivitas terbaru.
 * Empty state jika belum ada aktivitas.
 */

import { useState, useMemo, memo } from "react";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useActivity, MAX_DISPLAYED } from "./activityStore";
import ActivityItem from "./ActivityItem";

const RecentActivityCard = memo(function RecentActivityCard() {
    const { activities } = useActivity();
    const [showAll, setShowAll] = useState(false);

    const displayed = useMemo(
        () => (showAll ? activities : activities.slice(0, MAX_DISPLAYED)),
        [activities, showAll]
    );

    const hasMore = activities.length > MAX_DISPLAYED;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-[#DC2626]" />
                    <h2 className="font-semibold text-lg text-[#111827]">Recent Activity</h2>
                </div>
                {activities.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-semibold text-red-700">
                        {activities.length} aktivitas
                    </span>
                )}
            </div>

            {/* List */}
            {activities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={28} className="text-[#D1D5DB]" />
                    <p className="text-sm text-[#9CA3AF]">Belum ada aktivitas terbaru.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1">
                        {displayed.map((entry) => (
                            <ActivityItem key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {/* Show all / collapse button */}
                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setShowAll((v) => !v)}
                            className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#DC2626] hover:text-red-700 transition-colors self-center"
                        >
                            {showAll ? (
                                <><ChevronUp size={14} />Sembunyikan</>
                            ) : (
                                <><ChevronDown size={14} />Lihat Semua ({activities.length})</>
                            )}
                        </button>
                    )}
                </>
            )}
        </div>
    );
});

export default RecentActivityCard;
