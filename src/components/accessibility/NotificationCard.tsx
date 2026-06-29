"use client";

import { memo } from "react";
import { Bell } from "lucide-react";
import type { NotificationPrefs } from "@/types/accessibility";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${checked ? "bg-[#DC2626]" : "bg-[#D1D5DB]"}`}
        >
            <span className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200" style={{ transform: checked ? "translateX(18px)" : "translateX(0)" }} />
        </button>
    );
}

function Row({ label, sub, checked, onChange, last = false }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; last?: boolean }) {
    return (
        <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-[#F3F4F6]"}`}>
            <div>
                <p className="text-xs font-semibold text-[#111827]">{label}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

interface Props { value: NotificationPrefs; onChange: (patch: Partial<NotificationPrefs>) => void; }

const NotificationCard = memo(function NotificationCard({ value, onChange }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Bell size={16} className="text-amber-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Notification Preferences</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Choose how you receive alerts</p>
                </div>
            </div>
            <Row label="Browser Notifications" sub="Show desktop push notifications" checked={value.browser} onChange={(v) => onChange({ browser: v })} />
            <Row label="Email Notifications" sub="Send important alerts to your email" checked={value.email} onChange={(v) => onChange({ email: v })} />
            <Row label="Sound Notifications" sub="Play sound for incoming alerts" checked={value.sound} onChange={(v) => onChange({ sound: v })} />
            <Row label="Report Reminder" sub="Remind to submit daily report" checked={value.reportReminder} onChange={(v) => onChange({ reportReminder: v })} />
            <Row label="Daily Summary" sub="Receive end-of-day summary email" checked={value.dailySummary} onChange={(v) => onChange({ dailySummary: v })} last />
        </div>
    );
});

export default NotificationCard;
