/**
 * Number formatting utilities for the Inbound Monitoring dashboard.
 */

/** Format a number with Indonesian locale separators: 647.863 */
export function fmtNumber(n: number): string {
    return n.toLocaleString("id-ID");
}

/** Abbreviate large numbers: 647.863 → 647,9K */
export function fmtCompact(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

/** Format ISO datetime to "28 Jun, 06:10" */
export function fmtDateTime(iso: string): string {
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Format ISO datetime to full: "28 Jun 2025, 06:10" */
export function fmtDateTimeFull(iso: string): string {
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Format ISO to time only: "06:10" */
export function fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
