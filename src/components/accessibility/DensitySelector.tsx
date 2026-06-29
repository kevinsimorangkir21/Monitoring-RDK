"use client";

import { memo } from "react";
import type { Density } from "@/types/accessibility";
import { DENSITY_OPTIONS } from "@/mock/accessibility";

interface Props { value: Density; onChange: (v: Density) => void; }

const DensitySelector = memo(function DensitySelector({ value, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            {DENSITY_OPTIONS.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`h-8 px-4 rounded-xl text-xs font-semibold border transition-all ${active
                                ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                                : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#D1D5DB]"
                            }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
});

export default DensitySelector;
