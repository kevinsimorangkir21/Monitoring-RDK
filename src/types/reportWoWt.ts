/**
 * Report WO-WT — Shared Type Definitions
 */

// ─── Status ───────────────────────────────────────────────────────────────────

export type WoWtStatus = "Good" | "Average" | "Below Target";

// ─── Wavepick zones ───────────────────────────────────────────────────────────

export type WavepickZone = "ZWP1" | "ZWP2" | "ZWP4" | "ZWP5";

// ─── Core record ──────────────────────────────────────────────────────────────

export interface WavepickRecord {
    id: string;
    date: string;          // "2025-06-28"
    wavepick: string;      // "WP-001"
    shift: string;         // "Shift 1"
    operator: string;
    zwp1: number;
    zwp2: number;
    zwp4: number;
    zwp5: number;
    wo: number;
    wt: number;
    average: number;
    status: WoWtStatus;
    timeline: {
        start: string;
        end: string;
        breakTime: string;
        totalActive: string;
    };
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface WoWtKPI {
    globalWoWt: number;
    zwp1: number;
    zwp2: number;
    zwp4: number;
    zwp5: number;
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface DailyTrendItem {
    date: string;
    ZWP1: number;
    ZWP2: number;
    ZWP4: number;
    ZWP5: number;
}

export interface ComparisonItem {
    zone: string;
    value: number;
}

export interface RadarItem {
    subject: string;
    value: number;
    fullMark: number;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type WavepickSortKey = keyof Pick<
    WavepickRecord,
    "date" | "wavepick" | "zwp1" | "zwp2" | "zwp4" | "zwp5" | "average" | "status"
>;

export interface WavepickSort {
    key: WavepickSortKey;
    direction: "asc" | "desc";
}
