"use client";

import { memo } from "react";
import type { FontSize } from "@/types/accessibility";
import { FONT_SIZE_OPTIONS } from "@/mock/accessibility";

interface Props { value: FontSize; onChange: (v: FontSize) => void; }

const FontSizeSlider = memo(function FontSizeSlider({ value, onChange }: Props) {
    const idx = FONT_SIZE_OPTIONS.findIndex((o) => o.value === value);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9CA3AF]">A</span>
                <span className="text-sm font-semibold text-[#111827]">
                    {FONT_SIZE_OPTIONS[idx]?.label}
                </span>
                <span className="text-base font-bold text-[#9CA3AF]">A</span>
            </div>
            <input
                type="range"
                min={0}
                max={FONT_SIZE_OPTIONS.length - 1}
                step={1}
                value={idx}
                onChange={(e) => onChange(FONT_SIZE_OPTIONS[Number(e.target.value)].value)}
                className="w-full h-2 rounded-full accent-[#DC2626] cursor-pointer"
                style={{ accentColor: "#DC2626" }}
            />
            <div className="flex justify-between">
                {FONT_SIZE_OPTIONS.map((o, i) => (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => onChange(o.value)}
                        className={`text-[10px] font-medium transition-colors ${i === idx ? "text-[#DC2626] font-bold" : "text-[#9CA3AF] hover:text-[#374151]"}`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    );
});

export default FontSizeSlider;
