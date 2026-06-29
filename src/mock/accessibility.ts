/**
 * Accessibility & Settings — Default / Mock Data
 */

import type {
    AccessibilitySettings,
    KeyboardShortcut,
    AccentColor,
    Language,
    Timezone,
    DateFormat,
    TimeFormat,
    NumberFormat,
    Density,
    FontSize,
    ThemeMode,
} from "@/types/accessibility";

export const DEFAULT_SETTINGS: AccessibilitySettings = {
    theme: "light",
    accent: "red",
    fontSize: "medium",
    density: "comfortable",
    accessibility: {
        highContrast: false,
        reduceMotion: false,
        largeCursor: false,
        focusHighlight: false,
        underlineLinks: false,
        screenReader: false,
    },
    region: {
        language: "id",
        timezone: "Asia/Jakarta",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        numberFormat: "id-ID",
    },
    notifications: {
        browser: true,
        email: true,
        sound: false,
        reportReminder: true,
        dailySummary: false,
    },
};

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    { keys: ["Ctrl", "K"], description: "Search" },
    { keys: ["Ctrl", "/"], description: "Open Command Palette" },
    { keys: ["Ctrl", "Shift", "D"], description: "Dashboard" },
    { keys: ["Ctrl", "Shift", "R"], description: "Report Daily" },
    { keys: ["Ctrl", "Shift", "I"], description: "Inbound" },
    { keys: ["Ctrl", "Shift", "O"], description: "Outbound" },
    { keys: ["Esc"], description: "Close Dialog" },
];

export const ACCENT_OPTIONS: { value: AccentColor; label: string; hex: string }[] = [
    { value: "red", label: "Red", hex: "#DC2626" },
    { value: "blue", label: "Blue", hex: "#2563EB" },
    { value: "green", label: "Green", hex: "#16A34A" },
    { value: "orange", label: "Orange", hex: "#EA580C" },
    { value: "purple", label: "Purple", hex: "#7C3AED" },
];

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string; px: number }[] = [
    { value: "small", label: "Small", px: 12 },
    { value: "medium", label: "Medium", px: 14 },
    { value: "large", label: "Large", px: 16 },
    { value: "xlarge", label: "Extra Large", px: 18 },
];

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
    { value: "comfortable", label: "Comfortable" },
    { value: "compact", label: "Compact" },
    { value: "spacious", label: "Spacious" },
];

export const THEME_OPTIONS: { value: ThemeMode; label: string; sub: string }[] = [
    { value: "light", label: "Light Mode", sub: "Default — bright and clean" },
    { value: "dark", label: "Dark Mode", sub: "Coming soon" },
    { value: "system", label: "System", sub: "Follow OS preference" },
];

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English" },
];

export const TIMEZONE_OPTIONS: { value: Timezone; label: string }[] = [
    { value: "Asia/Jakarta", label: "WIB — Jakarta (UTC+7)" },
    { value: "Asia/Makassar", label: "WITA — Makassar (UTC+8)" },
    { value: "Asia/Jayapura", label: "WIT — Jayapura (UTC+9)" },
    { value: "UTC", label: "UTC (UTC+0)" },
];

export const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
    { value: "DD/MM/YYYY", label: "28/06/2025" },
    { value: "MM/DD/YYYY", label: "06/28/2025" },
    { value: "YYYY-MM-DD", label: "2025-06-28" },
    { value: "DD MMM YYYY", label: "28 Jun 2025" },
];

export const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string }[] = [
    { value: "24h", label: "24-hour  (14:30)" },
    { value: "12h", label: "12-hour  (2:30 PM)" },
];

export const NUMBER_FORMAT_OPTIONS: { value: NumberFormat; label: string }[] = [
    { value: "id-ID", label: "1.000.000,00 (ID)" },
    { value: "en-US", label: "1,000,000.00 (US)" },
];
