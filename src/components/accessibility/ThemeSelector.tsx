"use client";

import { memo } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import type { ThemeMode } from "@/types/accessibility";
import { THEME_OPTIONS } from "@/mock/accessibility";

const ICONS: Record<ThemeMode, React.ElementType> = {
    light: Sun,
    dark: Moon,
    system: Monitor,
};

interface Props { value: ThemeMode; onChange: (v: ThemeMode) => void; }

const ThemeSelector = memo(function ThemeSelector({ value, onChange }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
                const Icon = ICONS[opt.value];
                const active = value === opt.value;
                const disabled = opt.value === "dark";
                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && onChange(opt.value)}
                        className={`relative flex flex-col items-start gap-2 p-4 rounded-[14px] border-2 text-left transition-all ${active
                                ? "border-[#DC2626] bg-[#DC2626]/5"
                                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? "bg-[#DC2626] text-white" : "bg-[#F3F4F6] text-[#64748B]"}`}>
                            <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#111827]">{opt.label}</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{opt.sub}</p>
                        </div>
                        {active && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center">
                                <Check size={11} className="text-white" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
});

export default ThemeSelector;
