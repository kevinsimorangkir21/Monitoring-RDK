"use client";

/**
 * SegmentTabs — Three-tab navigator for Report Daily.
 * Tabs: Transport | Warehouse FG | Warehouse BS
 * Active tab uses red (#DC2626) pill; inactive is gray.
 * Animated slide indicator via Framer Motion layoutId.
 */

import { memo } from "react";
import { motion } from "framer-motion";
import type { ReportDailyTab } from "@/types/reportDaily";

interface Tab {
    id: ReportDailyTab;
    label: string;
}

const TABS: Tab[] = [
    { id: "transport", label: "Transport" },
    { id: "warehouse-fg", label: "Warehouse FG" },
    { id: "warehouse-bs", label: "Warehouse BS" },
];

interface SegmentTabsProps {
    active: ReportDailyTab;
    onChange: (tab: ReportDailyTab) => void;
}

const SegmentTabs = memo(function SegmentTabs({ active, onChange }: SegmentTabsProps) {
    return (
        <div className="inline-flex items-center gap-1 bg-[#F3F4F6] rounded-[14px] p-1">
            {TABS.map((tab) => {
                const isActive = tab.id === active;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className="relative px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors duration-200 focus:outline-none"
                        style={{ color: isActive ? "#ffffff" : "#64748B" }}
                    >
                        {/* Animated active pill */}
                        {isActive && (
                            <motion.span
                                layoutId="segment-active"
                                className="absolute inset-0 rounded-[10px] bg-[#DC2626] shadow-sm"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
});

export default SegmentTabs;
