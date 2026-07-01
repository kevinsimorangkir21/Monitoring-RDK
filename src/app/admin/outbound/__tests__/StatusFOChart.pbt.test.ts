// Feature: outbound-refactor, Property 2: StatusFO Distribution Sum
// Status values updated: "Muat Pagi" | "Muat Inap" only

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { buildStatusFOData } from "../StatusFOChart";
import type { OutboundRecord, STATUS } from "../types";

/**
 * Arbitrary generator for a minimal OutboundRecord with a random status
 * from the 2-value STATUS union ("Muat Pagi" | "Muat Inap").
 */
const statusArb = fc.constantFrom<STATUS>("Muat Pagi", "Muat Inap");

const outboundRecordArb = fc
    .tuple(fc.uuid(), statusArb)
    .map(([id, status]): OutboundRecord => ({
        id,
        tanggal: "2026-01-01",
        freightOrder: `FO-${id}`,
        mobilMuat: "B-1234-ABC",
        sType: "Regular",
        assignJob: "Job A",
        jamTerima: "08:00",
        status,
        selesaiMuat: "09:00",
        hari: "Senin",
        putaran: "1",
        st: 0,
        h2: 0,
        jamRunning: "01:00",
    }));

const outboundRecordArrayArb = fc.array(outboundRecordArb);

/**
 * Property 2: StatusFO Distribution Sum
 * For any OutboundRecord[], the sum of all `count` values returned by
 * buildStatusFOData(records) must equal records.length.
 */
describe("StatusFOChart — Property 2: StatusFO Distribution Sum", () => {
    it("sum of all count values equals records.length for any input array", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, (records) => {
                const chartData = buildStatusFOData(records);
                const totalCount = chartData.reduce((acc, point) => acc + point.count, 0);
                expect(totalCount).toBe(records.length);
            }),
            { numRuns: 100 }
        );
    });

    it("empty array produces empty chart data", () => {
        const result = buildStatusFOData([]);
        expect(result).toHaveLength(0);
    });

    it("only Muat Pagi and Muat Inap can appear as status values", () => {
        fc.assert(
            fc.property(outboundRecordArrayArb, (records) => {
                const chartData = buildStatusFOData(records);
                for (const point of chartData) {
                    expect(["Muat Pagi", "Muat Inap"]).toContain(point.status);
                }
            }),
            { numRuns: 100 }
        );
    });
});
