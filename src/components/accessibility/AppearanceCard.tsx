"use client";

import { memo } from "react";
import { Palette } from "lucide-react";
import type { AccessibilitySettings } from "@/types/accessibility";
import ThemeSelector from "./ThemeSelector";
import AccentColorPicker from "./AccentColorPicker";
import FontSizeSlider from "./FontSizeSlider";
import DensitySelector from "./DensitySelector";

interface Props {
    settings: AccessibilitySettings;
    onTheme: (v: AccessibilitySettings["theme"]) => void;
    onAccent: (v: AccessibilitySettings["accent"]) => void;
    onFontSize: (v: AccessibilitySettings["fontSize"]) => void;
    onDensity: (v: AccessibilitySettings["density"]) => void;
}

const AppearanceCard = memo(function AppearanceCard({ settings, onTheme, onAccent, onFontSize, onDensity }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
                    <Palette size={16} className="text-[#DC2626]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Appearance</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Customize how the interface looks</p>
                </div>
            </div>

            {/* Theme */}
            <Section label="Theme" sub="Choose your preferred color scheme">
                <ThemeSelector value={settings.theme} onChange={onTheme} />
            </Section>

            {/* Accent Color */}
            <Section label="Accent Color" sub="Pick a primary highlight color">
                <AccentColorPicker value={settings.accent} onChange={onAccent} />
            </Section>

            {/* Font Size */}
            <Section label="Font Size" sub="Adjust the base text size">
                <FontSizeSlider value={settings.fontSize} onChange={onFontSize} />
            </Section>

            {/* Density */}
            <Section label="Interface Density" sub="Control the spacing between elements">
                <DensitySelector value={settings.density} onChange={onDensity} />
            </Section>
        </div>
    );
});

export default AppearanceCard;

function Section({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div>
                <p className="text-xs font-semibold text-[#111827]">{label}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>
            </div>
            {children}
        </div>
    );
}
