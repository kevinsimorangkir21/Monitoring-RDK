"use client";

/**
 * ActivityItem — Single row in Recent Activity card.
 * Icon color based on action type.
 */

import { memo } from "react";
import {
    PlusCircle, Pencil, Trash2, LogIn, LogOut,
} from "lucide-react";
import type { ActivityEntry, ActivityAction } from "./activityStore";
import { ACTION_COLOR } from "./activityStore";

// ─── Icon per action ──────────────────────────────────────────────────────────

const ActionIcon = memo(function ActionIcon({ action }: { action: ActivityAction }) {
    const color = ACTION_COLOR[action];
    const props = { size: 15, style: { color }, className: "shrink-0 mt-0.5" };
    switch (action) {
        case "create": return <PlusCircle {...props} />;
        case "edit": return <Pencil {...props} />;
        case "delete": return <Trash2 {...props} />;
        case "login": return <LogIn {...props} />;
        case "logout": return <LogOut {...props} />;
    }
});

// ─── Timestamp formatter ──────────────────────────────────────────────────────

function fmtTime(ts: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - ts.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} jam yang lalu`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "Kemarin";
    if (diffD < 7) return `${diffD} hari yang lalu`;

    return ts.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function fmtClock(ts: Date): string {
    return ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

const DOT_COLOR: Record<ActivityAction, string> = {
    create: "bg-green-500",
    edit: "bg-blue-500",
    delete: "bg-red-500",
    login: "bg-violet-500",
    logout: "bg-slate-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ActivityItemProps {
    entry: ActivityEntry;
}

const ActivityItem = memo(function ActivityItem({ entry }: ActivityItemProps) {
    const timeAgo = fmtTime(entry.timestamp);
    const clockStr = fmtClock(entry.timestamp);

    return (
        <div className="flex items-start gap-3 py-3 border-b border-[#F3F4F6] last:border-none">
            {/* Dot indicator */}
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[entry.action]}`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <ActionIcon action={entry.action} />
                    <p className="text-xs font-semibold text-[#111827] leading-snug truncate">
                        {entry.description}
                    </p>
                </div>
                <p className="text-[10px] text-[#9CA3AF]">
                    {entry.module} · {timeAgo}
                    {timeAgo === "Baru saja" || timeAgo.includes("menit") || timeAgo.includes("jam")
                        ? ` (${clockStr})`
                        : ` pukul ${clockStr}`}
                </p>
            </div>
        </div>
    );
});

export default ActivityItem;
