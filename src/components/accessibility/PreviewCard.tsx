"use client";

import { memo } from "react";
import { Eye, Bell, Search, BarChart2 } from "lucide-react";
import type { AccessibilitySettings } from "@/types/accessibility";
import { ACCENT_OPTIONS, FONT_SIZE_OPTIONS, DENSITY_OPTIONS } from "@/mock/accessibility";

const ACCENT_HEX: Record<string, string> = Object.fromEntries(ACCENT_OPTIONS.map((o) => [o.value, o.hex]));

const DENSITY_PY: Record<string, string> = {
    comfortable: "py-3",
    compact: "py-1.5",
    spacious: "py-4",
};

const FONT_PX: Record<string, string> = {
    small: "text-[11px]",
    medium: "text-xs",
    large: "text-sm",
    xlarge: "text-base",
};

interface Props { settings: AccessibilitySettings; }

const PreviewCard = memo(function PreviewCard({ settings }: Props) {
    const accent = ACCENT_HEX[settings.accent] ?? "#DC2626";
    const densityPy = DENSITY_PY[settings.density] ?? "py-3";
    const fontSizeCls = FONT_PX[settings.fontSize] ?? "text-xs";
    const fsLabel = FONT_SIZE_OPTIONS.find((o) => o.value === settings.fontSize)?.label ?? "Medium";
    const densityLabel = DENSITY_OPTIONS.find((o) => o.value === settings.density)?.label ?? "Comfortable";
    const accentLabel = ACCENT_OPTIONS.find((o) => o.value === settings.accent)?.label ?? "Red";

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}1A` }}>
                    <Eye size={16} style={{ color: accent }} />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Accessibility Preview</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Live preview of your current settings</p>
                </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white" style={{ background: accent }}>
                    {settings.theme === "light" ? "Light Mode" : settings.theme === "dark" ? "Dark Mode" : "System"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
                    Font: {fsLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
                    Accent: {accentLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
                    {densityLabel}
                </span>
            </div>

            {/* Mock UI preview */}
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#F9FAFB]">
                {/* Mock header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md" style={{ background: accent }} />
                        <span className={`font-bold text-[#111827] ${fontSizeCls}`}>Monitoring RDK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Search size={13} className="text-[#9CA3AF]" />
                        <Bell size={13} className="text-[#9CA3AF]" />
                    </div>
                </div>

                {/* Mock rows */}
                {[
                    { label: "Total Dokumen", value: "214", color: "bg-blue-100 text-blue-700" },
                    { label: "Total Nominal", value: "Rp 8.347.250.000", color: "bg-emerald-100 text-emerald-700" },
                    { label: "Outstanding", value: "47", color: "bg-red-100 text-red-700" },
                ].map((row) => (
                    <div key={row.label} className={`flex items-center justify-between px-4 ${densityPy} border-b border-[#F3F4F6] last:border-none`}>
                        <span className={`text-[#374151] ${fontSizeCls}`}>{row.label}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                ))}

                {/* Mock button */}
                <div className="px-4 py-3 bg-white border-t border-[#E5E7EB] flex gap-2">
                    <button
                        className="h-7 px-3 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1"
                        style={{ background: accent }}
                    >
                        <BarChart2 size={11} />View Report
                    </button>
                    <button className="h-7 px-3 rounded-lg bg-[#F3F4F6] text-[#374151] text-[11px] font-semibold">Export</button>
                </div>
            </div>
        </div>
    );
});

export default PreviewCard;
