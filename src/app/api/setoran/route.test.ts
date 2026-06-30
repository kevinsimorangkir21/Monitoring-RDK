/**
 * Integration tests for GET /api/setoran and POST /api/setoran
 * Task 3.3 — setoran-dashboard-crud spec
 */

import { describe, test, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/setoran/route";
import { __resetStore } from "@/lib/setoranStore";

beforeEach(() => __resetStore());

// ─── Helper ───────────────────────────────────────────────────────────────────

function makePostRequest(body: unknown) {
    return new Request("http://localhost/api/setoran", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    });
}

// ─── GET /api/setoran ─────────────────────────────────────────────────────────

describe("GET /api/setoran", () => {
    test("returns 200 with { data: SetoranRecord[] }", async () => {
        const response = await GET();

        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json).toHaveProperty("data");
        expect(Array.isArray(json.data)).toBe(true);
    });
});

// ─── POST /api/setoran ────────────────────────────────────────────────────────

describe("POST /api/setoran", () => {
    const validPayload = {
        tanggal: "2025-06-28",
        namaSalesman: "Budi Santoso",
        pulangKunjungan: "16:00",
        setoranKasir: "17:30",
    };

    test("valid payload returns 201 with all derived fields", async () => {
        const request = makePostRequest(validPayload);
        const response = await POST(request as any);

        expect(response.status).toBe(201);

        const json = await response.json();
        expect(json).toHaveProperty("data");

        const record = json.data;
        // Supplied fields
        expect(record.tanggal).toBe("2025-06-28");
        expect(record.namaSalesman).toBe("Budi Santoso");
        expect(record.pulangKunjungan).toBe("16:00");
        expect(record.setoranKasir).toBe("17:30");
        // Derived fields
        expect(typeof record.durasiSeconds).toBe("number");
        expect(record.durasiSeconds).toBeGreaterThan(0);
        expect(typeof record.durasi).toBe("string");
        expect(record.durasi).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        expect(["Fast", "Normal", "Slow"]).toContain(record.status);
        expect(typeof record.bulan).toBe("string");
        expect(record.bulan.length).toBeGreaterThan(0);
    });

    test("setoranKasir ≤ pulangKunjungan returns 400 with error containing 'lebih besar'", async () => {
        const payload = {
            ...validPayload,
            pulangKunjungan: "17:30",
            setoranKasir: "16:00", // earlier than pulangKunjungan
        };
        const request = makePostRequest(payload);
        const response = await POST(request as any);

        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("lebih besar");
    });

    test("equal times (setoranKasir === pulangKunjungan) returns 400 with error containing 'lebih besar'", async () => {
        const payload = {
            ...validPayload,
            pulangKunjungan: "17:00",
            setoranKasir: "17:00",
        };
        const request = makePostRequest(payload);
        const response = await POST(request as any);

        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("lebih besar");
    });

    test("empty body (missing fields) returns 400", async () => {
        const request = makePostRequest({});
        const response = await POST(request as any);

        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json).toHaveProperty("error");
    });
});
