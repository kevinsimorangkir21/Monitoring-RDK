// Feature: outbound-refactor, Property 4: STW Bucket Invariant
// Updated: status values = "Muat Pagi" | "Muat Inap" only

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
    parseTimeToMinutes,
    computeSTWMinutes,
    bucketSTW,
    buildSTWData,
    type STWBucket,
} from "../STGroupingChart";
import type { OutboundRecord, STATUS } from "../types";

const validTimeArb = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]): string => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

const maybeTimeArb = fc.oneof(
    { weight: 3, arbitrary: validTimeArb },
    { weight: 1, arbitrary: fc.constant("") },
    { weight: 1, arbitrary: fc.string({ minLength: 0, maxLength: 10 }) },
    { weight: 1, arbitrary: fc.constant("99:99") },
    { weight: 1, arbitrary: fc.constant("not-a-time") },
    { weight: 1, arbitrary: fc.constant("25:00") },
    { weight: 1, arbitrary: fc.constant("12:60") }
);

const statusArb = fc.constantFrom<STATUS>("Muat Pagi", "Muat Inap");

const outboundRecordArb = fc
    .tuple(fc.uuid(), maybeTimeArb, maybeTimeArb, statusArb)
    .map(([id, jamTerima, selesaiMuat, status]): OutboundRecord => ({
        id,
        tanggal: "2026-01-01",
        freightOrder: `FO-${id}`,
        mobilMuat: "B-1234-ABC",
        sType: "Regular",
        assignJob: "Job A",
        jamTerima,
        status,
        selesaiMuat,
        hari: "Senin",
        putaran: "1",
        st: 0,
        h2: 0,
        jamRunning: "01:00",
    }));

const outboundRecordArrayArb = fc.array(outboundRecordArb);

const ALL_BUCKETS: STWBucket[] = [
    "< 30 Menit",
    "30–60 Menit",
    "60–90 Menit",
    "> 90 Menit",
];

describe("STGroupingChart — Property 4: STW Bucket Invariant", () => {
    it("sum of all bucket counts equals count of records with non-null computeSTWMinutes", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, (records) => {
                const validCount = records.filter(
                    (r) => computeSTWMinutes(r.jamTerima, r.selesaiMuat) !== null
                ).length;

                const chartData = buildSTWData(records);
                const totalBucketCount = chartData.reduce((acc, point) => acc + point.count, 0);
                expect(totalBucketCount).toBe(validCount);
            }),
            { numRuns: 100 }
        );
    });

    it("each valid record lands in exactly one bucket matching its minute boundary", () => {
        const validRecordArb = fc
            .tuple(fc.uuid(), validTimeArb, validTimeArb, statusArb)
            .map(([id, jamTerima, selesaiMuat, status]): OutboundRecord => ({
                id,
                tanggal: "2026-01-01",
                freightOrder: `FO-${id}`,
                mobilMuat: "B-1234-ABC",
                sType: "Regular",
                assignJob: "Job A",
                jamTerima,
                status,
                selesaiMuat,
                hari: "Senin",
                putaran: "1",
                st: 0,
                h2: 0,
                jamRunning: "01:00",
            }));

        fc.assert(
            fc.property(validRecordArb, (record) => {
                const minutes = computeSTWMinutes(record.jamTerima, record.selesaiMuat);
                expect(minutes).not.toBeNull();
                if (minutes === null) return;

                const bucket = bucketSTW(minutes);

                if (minutes < 30) {
                    expect(bucket).toBe("< 30 Menit");
                } else if (minutes < 60) {
                    expect(bucket).toBe("30–60 Menit");
                } else if (minutes < 90) {
                    expect(bucket).toBe("60–90 Menit");
                } else {
                    expect(bucket).toBe("> 90 Menit");
                }

                expect(ALL_BUCKETS).toContain(bucket);

                const chartData = buildSTWData([record]);
                const bucketPoint = chartData.find((p) => p.bucket === bucket);
                expect(bucketPoint?.count).toBe(1);

                const otherBucketsTotal = chartData
                    .filter((p) => p.bucket !== bucket)
                    .reduce((acc, p) => acc + p.count, 0);
                expect(otherBucketsTotal).toBe(0);
            }),
            { numRuns: 100 }
        );
    });

    it("records with invalid time strings are excluded from all buckets", () => {
        const invalidTimeArb = fc.oneof(
            fc.constant(""),
            fc.constant("not-a-time"),
            fc.constant("12:600"),
            fc.constant("1:2:3"),
            fc.constant("abc"),
            fc.constant("12-00"),
            fc.constant(":30"),
            fc.string({ minLength: 0, maxLength: 8 }).filter(
                (s) => !/^\d{1,2}:\d{2}$/.test(s)
            )
        );

        const invalidRecordArb = fc
            .tuple(fc.uuid(), validTimeArb, invalidTimeArb, statusArb)
            .chain(([id, validTime, invalidTime, status]) =>
                fc.boolean().map((invalidFirst): OutboundRecord => ({
                    id,
                    tanggal: "2026-01-01",
                    freightOrder: `FO-${id}`,
                    mobilMuat: "B-1234-ABC",
                    sType: "Regular",
                    assignJob: "Job A",
                    jamTerima: invalidFirst ? invalidTime : validTime,
                    status,
                    selesaiMuat: invalidFirst ? validTime : invalidTime,
                    hari: "Senin",
                    putaran: "1",
                    st: 0,
                    h2: 0,
                    jamRunning: "01:00",
                }))
            );

        fc.assert(
            fc.property(invalidRecordArb, (record) => {
                const minutes = computeSTWMinutes(record.jamTerima, record.selesaiMuat);
                expect(minutes).toBeNull();

                const chartData = buildSTWData([record]);
                const totalCount = chartData.reduce((acc, p) => acc + p.count, 0);
                expect(totalCount).toBe(0);

                expect(chartData).toHaveLength(4);
                expect(chartData.map((p) => p.bucket)).toEqual(ALL_BUCKETS);
            }),
            { numRuns: 100 }
        );
    });
});

// Re-export parseTimeToMinutes to suppress unused import warning
export { parseTimeToMinutes };
