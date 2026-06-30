/**
 * Setoran ke Kasir — Mock Data Generation Service
 *
 * Provides realistic sample data for dashboard development and testing.
 * All data is generated client-side with no backend dependency.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import type { SetoranRecord } from "@/types/setoran";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDurasi(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function durasiStatus(seconds: number): SetoranRecord["status"] {
    if (seconds <= 1800) return "Fast";    // ≤ 30 min
    if (seconds <= 3600) return "Normal";  // ≤ 60 min
    return "Slow";                          // > 60 min
}

function formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5); // "HH:mm"
}

function formatDateISO(date: Date): string {
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/**
 * Indonesian month names used for the `bulan` field.
 * Maps JS month index (0-based) to localised label.
 */
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

function bulanLabel(date: Date): string {
    return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── SetoranDataGenerator ─────────────────────────────────────────────────────

/**
 * Generates realistic setoran (deposit) records for mock/testing purposes.
 *
 * Key characteristics:
 * - 26 realistic Indonesian salesman names
 * - pulangKunjungan distributed between 14:00 – 18:00
 * - setoranKasir is 30 – 120 minutes after pulangKunjungan (typical range)
 * - durasi = difference in minutes between the two timestamps
 * - Data spans configurable months (default: last 3 months)
 */
export class SetoranDataGenerator {
    // ── Salesman name pool (≥ 15 names, requirement 7.2) ─────────────────────
    private readonly SALESMAN_NAMES: string[] = [
        "Andi Wijaya",
        "Budi Santoso",
        "Cahyo Pramono",
        "Deni Kurniawan",
        "Eka Fitriani",
        "Fahri Ramadan",
        "Gita Permata",
        "Hendra Gunawan",
        "Indra Prasetya",
        "Joko Susilo",
        "Kevin Andrean",
        "Lina Maharani",
        "Maman Sulaiman",
        "Nina Sari",
        "Oka Pratama",
        "Putri Dewi",
        "Qori Rahman",
        "Rina Wati",
        "Sandi Kusuma",
        "Tari Melati",
        "Udin Setiawan",
        "Vera Lestari",
        "Wawan Gunadi",
        "Xenia Puspita",
        "Yoga Pratama",
        "Zulkifli Hakim",
    ];

    // ── Duration distribution weights ────────────────────────────────────────
    private readonly DURATION_CONFIG = {
        FAST_CHANCE: 0.15,    // 15 % → 15–30 min (very fast)
        NORMAL_CHANCE: 0.70,  // 70 % → 30–90 min (typical)
        // Remaining 15 % → 90–180 min (slow)
        FAST_MIN_MIN: 15,
        FAST_MAX_MIN: 30,
        NORMAL_MIN_MIN: 30,
        NORMAL_MAX_MIN: 90,
        SLOW_MIN_MIN: 90,
        SLOW_MAX_MIN: 180,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate realistic setoran data with configurable record count.
     *
     * Defaults to 200 records spanning the last 3 months so that all
     * chart types (daily trend, monthly filter, distribution) have
     * sufficient variety out of the box.
     *
     * Requirements: 7.1, 7.2, 7.3, 7.5
     *
     * @param count   Number of records to generate (default: 200)
     * @param monthsBack  How many months of history to cover (default: 3)
     */
    public generateSetoranData(
        count: number = 200,
        monthsBack: number = 3
    ): SetoranRecord[] {
        const records: SetoranRecord[] = [];
        const today = new Date();

        // Total day window to spread records across
        const totalDays = monthsBack * 30;

        for (let i = 0; i < count; i++) {
            const daysBack = Math.floor(Math.random() * totalDays);
            const recordDate = new Date(today);
            recordDate.setDate(recordDate.getDate() - daysBack);

            records.push(this.generateSingleRecord(i + 1, recordDate));
        }

        // Return most-recent first
        return records.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }

    /**
     * Generate records for a specific set of salesman names, useful for
     * controlled scenarios where you need predictable data per salesman.
     *
     * @param salesmanNames     Names to use
     * @param recordsPerSalesman  Records per name (default: 10)
     */
    public generateForSalesman(
        salesmanNames: string[],
        recordsPerSalesman: number = 10
    ): SetoranRecord[] {
        const records: SetoranRecord[] = [];
        let idCounter = 1;

        for (const namaSalesman of salesmanNames) {
            for (let i = 0; i < recordsPerSalesman; i++) {
                const daysBack = Math.floor(Math.random() * 90);
                const recordDate = new Date();
                recordDate.setDate(recordDate.getDate() - daysBack);

                const record = this.generateSingleRecord(idCounter++, recordDate);
                record.namaSalesman = namaSalesman;
                records.push(record);
            }
        }

        return records.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }

    /**
     * Generate a fixed number of records for every day in a date range.
     *
     * @param startDate       First day (inclusive)
     * @param endDate         Last day (inclusive)
     * @param recordsPerDay   Records per day (default: 5)
     */
    public generateDateRange(
        startDate: Date,
        endDate: Date,
        recordsPerDay: number = 5
    ): SetoranRecord[] {
        const records: SetoranRecord[] = [];
        const current = new Date(startDate);
        let idCounter = 1;

        while (current <= endDate) {
            for (let i = 0; i < recordsPerDay; i++) {
                records.push(this.generateSingleRecord(idCounter++, new Date(current)));
            }
            current.setDate(current.getDate() + 1);
        }

        return records.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }

    /**
     * Generate edge-case records for boundary testing.
     *
     * Covers Requirements 7.4 and 7.5:
     * - Very short durations (< 15 min) and very long durations (> 3 h)
     * - Exact boundary values for the duration distribution categories
     *   (0, 30, 60, 90 min) that drive the donut chart and filter logic
     * - Single-record scenarios for salesman ranking edge cases
     * - Records spread across multiple months (up to 12 months back) for
     *   comprehensive month-filter and trend-chart testing
     *
     * Requirements: 7.4, 7.5
     */
    public generateEdgeCases(): SetoranRecord[] {
        const records: SetoranRecord[] = [];
        const today = new Date();
        let idCounter = 900;

        // ── 1. Very short durations (< 15 min) ─────────────────────────────
        // Tests the lower extreme of the Fast status bucket and ensures
        // duration calculations do not floor-to-zero.
        const veryShortDurations = [1, 5, 10, 14]; // minutes
        veryShortDurations.forEach((durationMin, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const record = this.generateSingleRecord(idCounter++, date);
            this.overrideDuration(record, date, durationMin);
            records.push(record);
        });

        // ── 2. Very long durations (> 3 h) ─────────────────────────────────
        // Tests the upper extreme of the Slow status bucket and ensures
        // durasi formatting handles hours > 2 correctly.
        const veryLongDurations = [181, 240, 300, 360]; // minutes
        veryLongDurations.forEach((durationMin, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (i + 10));
            const record = this.generateSingleRecord(idCounter++, date);
            this.overrideDuration(record, date, durationMin);
            records.push(record);
        });

        // ── 3. Exact boundary values for duration distribution categories ───
        // These are the exact thresholds used by the donut chart:
        //   0–30 min → Fast, 30–60 → Normal lower, 60–90 → Normal upper, 90+ → Slow
        // Having records at exactly 30, 60, and 90 min validates that the
        // boundaries are handled consistently (inclusive vs exclusive).
        const boundaryDurations = [30, 60, 90]; // minutes
        boundaryDurations.forEach((durationMin, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (i + 20));
            const record = this.generateSingleRecord(idCounter++, date);
            this.overrideDuration(record, date, durationMin);
            // Pin to a fixed salesman to make boundary-ranking tests reproducible
            record.namaSalesman = this.SALESMAN_NAMES[i % this.SALESMAN_NAMES.length];
            records.push(record);
        });

        // ── 4. Single-record salesman scenario ──────────────────────────────
        // Ensures KPI ranking and chart logic works when a salesman has
        // exactly one record (no averaging required, min === max).
        const uniqueSalesmanDate = new Date(today);
        uniqueSalesmanDate.setDate(uniqueSalesmanDate.getDate() - 30);
        const singleRecord = this.generateSingleRecord(idCounter++, uniqueSalesmanDate);
        singleRecord.namaSalesman = "Edge Case Salesman";
        this.overrideDuration(singleRecord, uniqueSalesmanDate, 45);
        records.push(singleRecord);

        // ── 5. Multi-month span (Requirement 7.5) ───────────────────────────
        // Records distributed one per month over the past 12 months so that
        // the month dropdown filter, the daily trend chart, and the
        // multi-month aggregation path are all exercised.
        for (let monthsBack = 1; monthsBack <= 12; monthsBack++) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - monthsBack);
            // Pin to the 15th to avoid month-boundary ambiguity
            date.setDate(15);

            const record = this.generateSingleRecord(idCounter++, date);
            // Alternate durations so the monthly trend is non-flat
            const duration = monthsBack % 2 === 0 ? 45 : 75; // minutes
            this.overrideDuration(record, date, duration);
            records.push(record);
        }

        // ── 6. Same-day multiple records ────────────────────────────────────
        // Validates that daily-average calculations aggregate correctly
        // when several records share the same tanggal value.
        const sameDayDate = new Date(today);
        sameDayDate.setDate(sameDayDate.getDate() - 5);
        const sameDayDurations = [20, 55, 90, 130]; // mix of all status buckets
        sameDayDurations.forEach((durationMin) => {
            const record = this.generateSingleRecord(idCounter++, sameDayDate);
            this.overrideDuration(record, sameDayDate, durationMin);
            records.push(record);
        });

        return records.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }

    /**
     * Return the full list of available salesman names.
     * Useful for populating filter dropdowns.
     */
    public getAvailableSalesman(): string[] {
        return [...this.SALESMAN_NAMES];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build a single SetoranRecord for the given date and sequential id.
     */
    private generateSingleRecord(index: number, date: Date): SetoranRecord {
        const id = `S-${String(index).padStart(3, "0")}`;
        const tanggal = formatDateISO(date);
        const bulan = bulanLabel(date);
        const namaSalesman =
            this.SALESMAN_NAMES[
            Math.floor(Math.random() * this.SALESMAN_NAMES.length)
            ];

        const {
            pulangKunjungan,
            setoranKasir,
            waktuPulang,
            waktuSetoran,
            durasiSeconds,
        } = this.generateRealisticTimes(date);

        return {
            id,
            tanggal,
            bulan,
            namaSalesman,
            pulangKunjungan,
            setoranKasir,
            durasiSeconds,
            durasi: fmtDurasi(durasiSeconds),
            status: durasiStatus(durasiSeconds),
            waktuPulang,
            waktuSetoran,
        };
    }

    /**
     * Generate realistic pulang/setoran timestamps for a given date.
     *
     * Distribution:
     * - pulangKunjungan: 14:00 – 18:00 (requirement: realistic afternoon returns)
     * - setoranKasir:     pulangKunjungan + 30–120 min (typical deposit window)
     *
     * Duration buckets:
     * - 15 % fast   → 15–30 min
     * - 70 % normal → 30–90 min (bell-curve around 55 min)
     * - 15 % slow   → 90–180 min
     */
    private generateRealisticTimes(date: Date) {
        // pulangKunjungan between 14:00 and 17:59
        const pulangHour = 14 + Math.floor(Math.random() * 4); // 14, 15, 16, or 17
        const pulangMinute = Math.floor(Math.random() * 60);

        const pulangDate = new Date(date);
        pulangDate.setHours(pulangHour, pulangMinute, 0, 0);

        // Duration sampling
        const durationMinutes = this.sampleDuration();
        const durasiSeconds = durationMinutes * 60;

        const setoranDate = new Date(
            pulangDate.getTime() + durasiSeconds * 1000
        );

        return {
            pulangKunjungan: formatTime(pulangDate),
            setoranKasir: formatTime(setoranDate),
            waktuPulang: pulangDate.toISOString(),
            waktuSetoran: setoranDate.toISOString(),
            durasiSeconds,
        };
    }

    /**
     * Sample a duration in minutes from a weighted distribution.
     *
     * - Fast  (15 %): 15–30 min
     * - Normal(70 %): 30–90 min with mild bell-curve centred at ~55 min
     * - Slow  (15 %): 90–180 min
     */
    private sampleDuration(): number {
        const { FAST_CHANCE, NORMAL_CHANCE } = this.DURATION_CONFIG;
        const roll = Math.random();

        if (roll < FAST_CHANCE) {
            // Fast
            return (
                this.DURATION_CONFIG.FAST_MIN_MIN +
                Math.floor(
                    Math.random() *
                    (this.DURATION_CONFIG.FAST_MAX_MIN -
                        this.DURATION_CONFIG.FAST_MIN_MIN)
                )
            );
        }

        if (roll < FAST_CHANCE + NORMAL_CHANCE) {
            // Normal — simple average of two uniform samples to create a
            // mild bell shape without importing a stats library
            const minN = this.DURATION_CONFIG.NORMAL_MIN_MIN;
            const maxN = this.DURATION_CONFIG.NORMAL_MAX_MIN;
            const range = maxN - minN;
            const raw =
                minN + ((Math.random() + Math.random()) / 2) * range;
            return Math.round(Math.max(minN, Math.min(maxN, raw)));
        }

        // Slow
        return (
            this.DURATION_CONFIG.SLOW_MIN_MIN +
            Math.floor(
                Math.random() *
                (this.DURATION_CONFIG.SLOW_MAX_MIN -
                    this.DURATION_CONFIG.SLOW_MIN_MIN)
            )
        );
    }

    /**
     * Mutate a record's time fields to reflect a specific duration in minutes.
     * Used when constructing edge-case records.
     */
    private overrideDuration(
        record: SetoranRecord,
        date: Date,
        durationMinutes: number
    ): void {
        const pulangDate = new Date(date);
        pulangDate.setHours(16, 0, 0, 0);

        const setoranDate = new Date(
            pulangDate.getTime() + durationMinutes * 60_000
        );

        record.pulangKunjungan = formatTime(pulangDate);
        record.setoranKasir = formatTime(setoranDate);
        record.durasiSeconds = durationMinutes * 60;
        record.durasi = fmtDurasi(record.durasiSeconds);
        record.status = durasiStatus(record.durasiSeconds);
        record.waktuPulang = pulangDate.toISOString();
        record.waktuSetoran = setoranDate.toISOString();
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

/** Ready-to-use generator instance for direct import. */
export const setoranDataGenerator = new SetoranDataGenerator();
