/**
 * Integration tests for PUT /api/setoran/[id] and DELETE /api/setoran/[id]
 * Task 3.4 — setoran-dashboard-crud spec
 */

import { describe, test, expect, beforeEach } from "vitest";
import { PUT, DELETE } from "@/app/api/setoran/[id]/route";
import { setoranStore, __resetStore } from "@/lib/setoranStore";

beforeEach(() => __resetStore());

// ─── Helper ───────────────────────────────────────────────────────────────────

function makePutRequest(body: unknown) {
    return new Request("http://localhost/api/setoran/test-id", {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    });
}

const validPayload = {
    tanggal: "2025-06-28",
    namaSalesman: "Siti Rahayu",
    pulangKunjungan: "15:00",
    setoranKasir: "16:45",
};

// ─── PUT /api/setoran/[id] ────────────────────────────────────────────────────

describe("PUT /api/setoran/[id]", () => {
    test("valid id and payload returns 200 with updated SetoranRecord", async () => {
        // Seed store and grab a real id
        const existingId = setoranStore.getAll()[0].id;

        const request = makePutRequest(validPayload);
        const response = await PUT(request as any, {
            params: Promise.resolve({ id: existingId }),
        });

        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json).toHaveProperty("data");

        const record = json.data;
        expect(record.id).toBe(existingId);
        expect(record.namaSalesman).toBe("Siti Rahayu");
        expect(record.pulangKunjungan).toBe("15:00");
        expect(record.setoranKasir).toBe("16:45");
        // Derived fields should be present
        expect(typeof record.durasiSeconds).toBe("number");
        expect(record.durasiSeconds).toBeGreaterThan(0);
        expect(typeof record.durasi).toBe("string");
        expect(["Fast", "Normal", "Slow"]).toContain(record.status);
        expect(typeof record.bulan).toBe("string");
    });

    test("unknown id returns 404", async () => {
        const request = makePutRequest(validPayload);
        const response = await PUT(request as any, {
            params: Promise.resolve({ id: "non-existent-id-xyz-999" }),
        });

        expect(response.status).toBe(404);

        const json = await response.json();
        expect(json).toHaveProperty("error");
    });
});

// ─── DELETE /api/setoran/[id] ─────────────────────────────────────────────────

describe("DELETE /api/setoran/[id]", () => {
    test("valid id returns 200 { success: true }", async () => {
        const existingId = setoranStore.getAll()[0].id;

        const request = new Request(
            `http://localhost/api/setoran/${existingId}`,
            { method: "DELETE" }
        );
        const response = await DELETE(request as any, {
            params: Promise.resolve({ id: existingId }),
        });

        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json).toEqual({ success: true });
    });

    test("unknown id returns 404", async () => {
        const request = new Request(
            "http://localhost/api/setoran/non-existent-id-xyz-999",
            { method: "DELETE" }
        );
        const response = await DELETE(request as any, {
            params: Promise.resolve({ id: "non-existent-id-xyz-999" }),
        });

        expect(response.status).toBe(404);

        const json = await response.json();
        expect(json).toHaveProperty("error");
    });
});
