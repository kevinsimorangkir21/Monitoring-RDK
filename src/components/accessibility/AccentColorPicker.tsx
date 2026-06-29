"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import type { AccentColor } from "@/types/accessibility";
import { ACCENT_OPTIONS } from "@/mock/accessibility";

interface Props { value: AccentColor; onChange: (v: AccentColor) => void; }

const AccentColorPicker = memo(function AccentColorPicker({ value, onChange }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {ACCENT_OPTIONS.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        title={opt.label}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${active ? "border-[#111827] scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                        style={{ background: opt.hex }}
                        aria-pressed={active}
                        aria-label={opt.label}
                    >
                        {active && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <Check size={14} className="text-white drop-shadow" />
                            </span>
                        )}
                    </button>
                );
            })}
            <div className="flex items-center gap-2 ml-2">
                {ACCENT_OPTIONS.filter((o) => o.value === value).map((o) => (
                    <span key={o.value} className="text-xs font-semibold text-[#374151]">{o.label}</span>
                ))}
            </div>
        </div>
    );
});

export default AccentColorPicker;
