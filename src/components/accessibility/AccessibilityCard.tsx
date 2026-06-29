"use client";

import { memo } from "react";
import { Accessibility } from "lucide-react";
import type { AccessibilityToggles } from "@/types/accessibility";

interface ToggleRowProps {
    label: string;
    sub: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    last?: boolean;
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => !disabled && onChange(!checked)}
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-[#DC2626]" : "bg-[#D1D5DB]"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <span
                className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: checked ? "translateX(18px)" : "translateX(0)" }}
            />
        </button>
    );
}

function ToggleRow({ label, sub, checked, onChange, last = false }: ToggleRowProps) {
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

interface Props {
    value: AccessibilityToggles;
    onChange: (patch: Partial<AccessibilityToggles>) => void;
}

const AccessibilityCard = memo(function AccessibilityCard({ value, onChange }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Accessibility size={16} className="text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Accessibility</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Improve usability for all users</p>
                </div>
            </div>
            <ToggleRow label="High Contrast" sub="Increase color contrast for better visibility" checked={value.highContrast} onChange={(v) => onChange({ highContrast: v })} />
            <ToggleRow label="Reduce Motion" sub="Minimize animations and transitions" checked={value.reduceMotion} onChange={(v) => onChange({ reduceMotion: v })} />
            <ToggleRow label="Large Cursor" sub="Use a larger cursor for easier navigation" checked={value.largeCursor} onChange={(v) => onChange({ largeCursor: v })} />
            <ToggleRow label="Focus Highlight" sub="Highlight focused elements with a visible outline" checked={value.focusHighlight} onChange={(v) => onChange({ focusHighlight: v })} />
            <ToggleRow label="Underline Links" sub="Always show underlines on hyperlinks" checked={value.underlineLinks} onChange={(v) => onChange({ underlineLinks: v })} />
            <ToggleRow label="Screen Reader Support" sub="Optimize markup for screen reader compatibility" checked={value.screenReader} onChange={(v) => onChange({ screenReader: v })} last />
        </div>
    );
});

export default AccessibilityCard;
