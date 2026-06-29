"use client";

import { useState, useCallback } from "react";
import type { AccessibilitySettings } from "@/types/accessibility";
import { DEFAULT_SETTINGS } from "@/mock/accessibility";

export function useAccessibility() {
    const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
    const [isDirty, setIsDirty] = useState(false);

    const update = useCallback(<K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const patchAccessibility = useCallback(
        (patch: Partial<AccessibilitySettings["accessibility"]>) => {
            setSettings((prev) => ({
                ...prev,
                accessibility: { ...prev.accessibility, ...patch },
            }));
            setIsDirty(true);
        },
        []
    );

    const patchRegion = useCallback(
        (patch: Partial<AccessibilitySettings["region"]>) => {
            setSettings((prev) => ({
                ...prev,
                region: { ...prev.region, ...patch },
            }));
            setIsDirty(true);
        },
        []
    );

    const patchNotifications = useCallback(
        (patch: Partial<AccessibilitySettings["notifications"]>) => {
            setSettings((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, ...patch },
            }));
            setIsDirty(true);
        },
        []
    );

    const saveSettings = useCallback(() => {
        // In production: persist to API / localStorage
        setIsDirty(false);
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        setIsDirty(false);
    }, []);

    return {
        settings,
        isDirty,
        update,
        patchAccessibility,
        patchRegion,
        patchNotifications,
        saveSettings,
        resetSettings,
    };
}
