"use client";

/**
 * /admin/accessibility — Accessibility & Settings Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header
 *   2. Appearance    — Theme, Accent, Font Size, Density
 *   3. Accessibility — 6 toggles
 *   4. Language      — Language, Timezone, Date/Time/Number format
 *   5. Notifications — 5 toggles
 *   6. Shortcuts     — keyboard shortcut table + copy buttons
 *   7. Preview       — live preview card
 *   8. Footer        — Reset / Cancel / Save + confirm dialog
 */

import { useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";

import AppearanceCard from "@/components/accessibility/AppearanceCard";
import AccessibilityCard from "@/components/accessibility/AccessibilityCard";
import LanguageCard from "@/components/accessibility/LanguageCard";
import NotificationCard from "@/components/accessibility/NotificationCard";
import ShortcutCard from "@/components/accessibility/ShortcutCard";
import PreviewCard from "@/components/accessibility/PreviewCard";
import SettingsFooter from "@/components/accessibility/SettingsFooter";

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.06 },
    }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccessibilityPage() {
    const {
        settings, isDirty,
        update,
        patchAccessibility,
        patchRegion,
        patchNotifications,
        saveSettings,
        resetSettings,
    } = useAccessibility();

    const handleCancel = useCallback(() => {
        resetSettings();
    }, [resetSettings]);

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ─────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Accessibility</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Personalize your workspace and accessibility preferences
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold shadow-sm">
                    <SlidersHorizontal size={14} className="text-[#DC2626]" />
                    Settings
                </div>
            </motion.div>

            {/* Two-column grid for all sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
                <div className="space-y-5">

                    {/* ── 2. Appearance ──────────────────────────────────────── */}
                    <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                        <AppearanceCard
                            settings={settings}
                            onTheme={(v) => update("theme", v)}
                            onAccent={(v) => update("accent", v)}
                            onFontSize={(v) => update("fontSize", v)}
                            onDensity={(v) => update("density", v)}
                        />
                    </motion.div>

                    {/* ── 3. Accessibility ───────────────────────────────────── */}
                    <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                        <AccessibilityCard
                            value={settings.accessibility}
                            onChange={patchAccessibility}
                        />
                    </motion.div>

                    {/* ── 5. Keyboard Shortcuts ──────────────────────────────── */}
                    <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                        <ShortcutCard />
                    </motion.div>
                </div>

                {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
                <div className="space-y-5">

                    {/* ── 4. Language & Region ───────────────────────────────── */}
                    <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                        <LanguageCard
                            value={settings.region}
                            onChange={patchRegion}
                        />
                    </motion.div>

                    {/* ── 4b. Notifications ──────────────────────────────────── */}
                    <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                        <NotificationCard
                            value={settings.notifications}
                            onChange={patchNotifications}
                        />
                    </motion.div>

                    {/* ── 6. Preview ─────────────────────────────────────────── */}
                    <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                        <PreviewCard settings={settings} />
                    </motion.div>
                </div>
            </div>

            {/* ── 7. Footer ──────────────────────────────────────────────────── */}
            <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
                <SettingsFooter
                    isDirty={isDirty}
                    onSave={saveSettings}
                    onReset={resetSettings}
                    onCancel={handleCancel}
                />
            </motion.div>
        </div>
    );
}
