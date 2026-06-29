"use client";

import { memo } from "react";
import { LogIn, Download, RefreshCw, FileText, LogOut, Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ActivityItem, ActivityType, ActivityStatus } from "@/types/profile";
import { recentActivities } from "@/mock/profile";

const TYPE_ICON: Record<ActivityType, React.ElementType> = {
    Login: LogIn,
    Export: Download,
    Update: RefreshCw,
    Report: FileText,
    Logout: LogOut,
    Security: Shield,
};

const TYPE_BG: Record<ActivityType, string> = {
    Login: "bg-blue-50",
    Export: "bg-emerald-50",
    Update: "bg-amber-50",
    Report: "bg-violet-50",
    Logout: "bg-gray-100",
    Security: "bg-red-50",
};

const TYPE_COLOR: Record<ActivityType, string> = {
    Login: "text-blue-600",
    Export: "text-emerald-600",
    Update: "text-amber-600",
    Report: "text-violet-600",
    Logout: "text-gray-500",
    Security: "text-red-600",
};

const STATUS_ICON: Record<ActivityStatus, React.ElementType> = {
    Success: CheckCircle2,
    Warning: AlertTriangle,
    Failed: XCircle,
};

const STATUS_COLOR: Record<ActivityStatus, string> = {
    Success: "text-emerald-500",
    Warning: "text-amber-500",
    Failed: "text-red-500",
};

function fmtTs(iso: string) {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function TimelineItem({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
    const Icon = TYPE_ICON[item.type];
    const SIcon = STATUS_ICON[item.status];
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_BG[item.type]}`}>
                    <Icon size={14} className={TYPE_COLOR[item.type]} />
                </div>
                {!isLast && <div className="w-0.5 flex-1 min-h-[20px] mt-1 bg-[#E5E7EB]" />}
            </div>
            <div className="pb-4 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#111827]">{item.description}</p>
                    <SIcon size={13} className={`shrink-0 mt-0.5 ${STATUS_COLOR[item.status]}`} />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{fmtTs(item.timestamp)}</p>
            </div>
        </div>
    );
}

const RecentActivity = memo(function RecentActivity() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="mb-4">
                <p className="text-sm font-bold text-[#111827]">Recent Activity</p>
                <p className="text-xs text-[#64748B] mt-0.5">Latest actions on your account</p>
            </div>
            <div>
                {recentActivities.map((item, i) => (
                    <TimelineItem key={item.id} item={item} isLast={i === recentActivities.length - 1} />
                ))}
            </div>
        </div>
    );
});

export default RecentActivity;
