/**
 * src/app/api/setoran/route.ts
 *
 * Next.js 15 App Router Route Handlers for the Setoran resource.
 *
 * GET  /api/setoran  — return all records sorted by tanggal descending
 * POST /api/setoran  — validate, compute derived fields, persist a new record
 */

import { NextRequest, NextResponse } from "next/server";
import { setoranStore } from "@/lib/setoranStore";
import { computeDerivedFields } from "@/lib/setoranCalculations";
import type { SetoranRecord } from "@/types/setoran";
import type { SetoranWritePayload } from "@/app/admin/setoran/types/crud";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

/**
 * Validate the four user-supplied fields in a SetoranWritePayload.
 * Returns an error response if validation fails, or null if the payload is valid.
 */
function validatePayload(
    payload: Partial<SetoranWritePayload>
): NextResponse | null {
    const { tanggal, namaSalesman, pulangKunjungan, setoranKasir } = payload;

    if (
        typeof tanggal !== "string" ||
        typeof namaSalesman !== "string" ||
        typeof pulangKunjungan !== "string" ||
        typeof setoranKasir !== "string"
    ) {
        return NextResponse.json(
            { error: "Semua field wajib diisi" },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    if (!DATE_REGEX.test(tanggal)) {
        return NextResponse.json(
            { error: "Format tanggal tidak valid (YYYY-MM-DD)", field: "tanggal" },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    if (!namaSalesman.trim()) {
        return NextResponse.json(
            { error: "Nama Salesman tidak boleh kosong", field: "namaSalesman" },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    if (!TIME_REGEX.test(pulangKunjungan)) {
        return NextResponse.json(
            {
                error: "Format Pulang Kunjungan tidak valid (HH:mm)",
                field: "pulangKunjungan",
            },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    if (!TIME_REGEX.test(setoranKasir)) {
        return NextResponse.json(
            {
                error: "Format Setoran Kasir tidak valid (HH:mm)",
                field: "setoranKasir",
            },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    return null; // valid
}

// ─── GET /api/setoran ─────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
    const records: SetoranRecord[] = setoranStore
        .getAll()
        .sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0));

    return NextResponse.json(
        { data: records },
        {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        }
    );
}

// ─── POST /api/setoran ────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
    let body: Partial<SetoranWritePayload>;

    try {
        body = (await request.json()) as Partial<SetoranWritePayload>;
    } catch {
        return NextResponse.json(
            { error: "Request body tidak valid" },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    // Validate raw fields
    const validationError = validatePayload(body);
    if (validationError) return validationError;

    // At this point TypeScript doesn't narrow, so assert
    const { tanggal, namaSalesman, pulangKunjungan, setoranKasir } =
        body as SetoranWritePayload;

    // Compute derived fields (returns null when setoran <= pulang)
    const derived = computeDerivedFields(tanggal, pulangKunjungan, setoranKasir);
    if (derived === null) {
        return NextResponse.json(
            {
                error: "Jam Setoran harus lebih besar dari Jam Pulang Kunjungan",
                field: "setoranKasir",
            },
            {
                status: 400,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    const record: SetoranRecord = {
        id: crypto.randomUUID(),
        tanggal,
        namaSalesman: namaSalesman.trim(),
        pulangKunjungan,
        setoranKasir,
        durasiSeconds: derived.durasiSeconds,
        durasi: derived.durasi,
        status: derived.status,
        bulan: derived.bulan,
        waktuPulang: derived.waktuPulang,
        waktuSetoran: derived.waktuSetoran,
    };

    setoranStore.create(record);

    return NextResponse.json(
        { data: record },
        {
            status: 201,
            headers: { "Cache-Control": "no-store" },
        }
    );
}
