/**
 * setoranCalculations.ts
 *
 * Pure calculation functions for Setoran Dashboard CRUD.
 * Shared between the client (SetoranFormModal) and the API route handlers
 * to guarantee identical derived-field values on both sides (Req 10.5).
 */

import type { DurasiStatus } from "@/types/setoran";

// ─── Time helpers ─────────────────────────────────────────────────────────────

/**
 * Convert an "HH:mm" string to total minutes from midnight.
 * @example timeToMinutes("16:30") // 990
 */
export function timeToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

/**
 * Convert total seconds to "HH:mm:ss" string.
 * @example secondsToHHmmss(4500) // "01:15:00"
 */
export function secondsToHHmmss(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/**
 * Convert total seconds to "HH:mm" string (for Durasi display in form).
 * @example secondsToHHmm(4500) // "01:15"
 */
export function secondsToHHmm(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Status computation ───────────────────────────────────────────────────────

/**
 * Determine DurasiStatus from durasiSeconds.
 *
 * Thresholds (Req 10.2):
 *   ≤ 1800 s (30 min)  → "Fast"
 *   1801–3600 s         → "Normal"
 *   > 3600 s            → "Slow"
 */
export function computeStatus(durasiSeconds: number): DurasiStatus {
    if (durasiSeconds <= 1800) return "Fast";
    if (durasiSeconds <= 3600) return "Normal";
    return "Slow";
}

// ─── Bulan computation ────────────────────────────────────────────────────────

const MONTH_LABELS: Record<number, string> = {
    0: "Januari",
    1: "Februari",
    2: "Maret",
    3: "April",
    4: "Mei",
    5: "Juni",
    6: "Juli",
    7: "Agustus",
    8: "September",
    9: "Oktober",
    10: "November",
    11: "Desember",
};

/**
 * Return Indonesian month name + year for a given "YYYY-MM-DD" date string.
 * @example computeBulan("2025-06-15") // "Juni 2025"
 */
export function computeBulan(tanggal: string): string {
    const date = new Date(`${tanggal}T00:00:00`);
    return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── Derived fields ───────────────────────────────────────────────────────────

/**
 * All fields that are computed from (tanggal, pulangKunjungan, setoranKasir).
 * Exported so callers can type the return value of computeDerivedFields.
 */
export interface DerivedSetoranFields {
    /** Duration in total seconds */
    durasiSeconds: number;
    /** Duration formatted as "HH:mm:ss" */
    durasi: string;
    /** Duration formatted as "HH:mm" — used for form preview (Req 10.2) */
    durasiDisplay: string;
    /** Fast / Normal / Slow */
    status: DurasiStatus;
    /** Indonesian month + year, e.g. "Juni 2025" */
    bulan: string;
    /** ISO datetime of pulang kunjungan */
    waktuPulang: string;
    /** ISO datetime of setoran ke kasir */
    waktuSetoran: string;
}

/**
 * Compute all derived fields from the three user-supplied raw values.
 *
 * Returns `null` when `setoranKasir` ≤ `pulangKunjungan` — the caller must
 * treat this as an invalid input and show the appropriate validation message
 * ("Jam Setoran harus lebih besar dari Jam Pulang Kunjungan") per Req 2.2.
 *
 * @param tanggal          "YYYY-MM-DD" date string
 * @param pulangKunjungan  "HH:mm" time string
 * @param setoranKasir     "HH:mm" time string
 */
export function computeDerivedFields(
    tanggal: string,
    pulangKunjungan: string,
    setoranKasir: string
): DerivedSetoranFields | null {
    const pulangMinutes = timeToMinutes(pulangKunjungan);
    const setoranMinutes = timeToMinutes(setoranKasir);

    // Guard: setoran must be strictly AFTER pulang (Req 2.2, 10.1)
    if (setoranMinutes <= pulangMinutes) return null;

    const durasiSeconds = (setoranMinutes - pulangMinutes) * 60;

    // Build ISO datetime strings by offsetting from midnight of tanggal
    const baseDate = new Date(`${tanggal}T00:00:00`);
    const waktuPulang = new Date(
        baseDate.getTime() + pulangMinutes * 60_000
    ).toISOString();
    const waktuSetoran = new Date(
        baseDate.getTime() + setoranMinutes * 60_000
    ).toISOString();

    return {
        durasiSeconds,
        durasi: secondsToHHmmss(durasiSeconds),
        durasiDisplay: secondsToHHmm(durasiSeconds),
        status: computeStatus(durasiSeconds),
        bulan: computeBulan(tanggal),
        waktuPulang,
        waktuSetoran,
    };
}
