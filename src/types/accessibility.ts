/**
 * Accessibility & Settings — Shared Type Definitions
 */

// ─── Appearance ───────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "red" | "blue" | "green" | "orange" | "purple";
export type FontSize = "small" | "medium" | "large" | "xlarge";
export type Density = "comfortable" | "compact" | "spacious";

// ─── Accessibility toggles ────────────────────────────────────────────────────

export interface AccessibilityToggles {
    highContrast: boolean;
    reduceMotion: boolean;
    largeCursor: boolean;
    focusHighlight: boolean;
    underlineLinks: boolean;
    screenReader: boolean;
}

// ─── Language & Region ────────────────────────────────────────────────────────

export type Language = "id" | "en";
export type Timezone = "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura" | "UTC";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "DD MMM YYYY";
export type TimeFormat = "24h" | "12h";
export type NumberFormat = "id-ID" | "en-US";

export interface RegionSettings {
    language: Language;
    timezone: Timezone;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    numberFormat: NumberFormat;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationPrefs {
    browser: boolean;
    email: boolean;
    sound: boolean;
    reportReminder: boolean;
    dailySummary: boolean;
}

// ─── Full settings state ──────────────────────────────────────────────────────

export interface AccessibilitySettings {
    theme: ThemeMode;
    accent: AccentColor;
    fontSize: FontSize;
    density: Density;
    accessibility: AccessibilityToggles;
    region: RegionSettings;
    notifications: NotificationPrefs;
}

// ─── Keyboard shortcut ────────────────────────────────────────────────────────

export interface KeyboardShortcut {
    keys: string[];
    description: string;
}
