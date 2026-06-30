/**
 * SetoranFormModal.test.tsx
 *
 * Component tests for SetoranFormModal.
 * Covers: create/edit modes, validation, save button state, onSave callback,
 *         Escape key, datalist salesman options.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { SetoranFormModal } from "./SetoranFormModal";
import type { SetoranRecord } from "@/types/setoran";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SALESMEN = ["Andi Wijaya", "Budi Santoso", "Citra Lestari"];

const SAMPLE_RECORD: SetoranRecord = {
    id: "rec-1",
    tanggal: "2025-07-01",
    bulan: "Juli 2025",
    namaSalesman: "Andi Wijaya",
    pulangKunjungan: "16:00",
    setoranKasir: "17:00",
    durasiSeconds: 3600,
    durasi: "01:00:00",
    status: "Normal",
    waktuPulang: "2025-07-01T16:00:00.000Z",
    waktuSetoran: "2025-07-01T17:00:00.000Z",
};

/** Default props for an open create-mode modal */
function defaultProps(overrides: Partial<Parameters<typeof SetoranFormModal>[0]> = {}) {
    return {
        open: true,
        mode: "create" as const,
        record: undefined,
        availableSalesman: SALESMEN,
        saving: false,
        onSave: vi.fn().mockResolvedValue(undefined),
        onClose: vi.fn(),
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SetoranFormModal", () => {
    // ── 1. Create mode — empty fields ─────────────────────────────────────────
    it("renders in create mode with empty salesman and time fields", () => {
        render(<SetoranFormModal {...defaultProps()} />);

        // Title h2 is present
        expect(screen.getByText(/tambah data setoran/i)).toBeInTheDocument();

        const salesmanInput = screen.getByPlaceholderText(/pilih atau ketik nama salesman/i);
        expect(salesmanInput).toHaveValue("");

        const pulangInput = screen.getByLabelText(/pulang kunjungan/i);
        expect(pulangInput).toHaveValue("");

        const setoranInput = screen.getByLabelText(/setoran ke kasir/i);
        expect(setoranInput).toHaveValue("");
    });

    // ── 2. Edit mode — pre-populated values ───────────────────────────────────
    it("renders in edit mode with pre-populated values from record", () => {
        render(
            <SetoranFormModal
                {...defaultProps({ mode: "edit", record: SAMPLE_RECORD })}
            />
        );

        expect(screen.getByText(/edit data setoran/i)).toBeInTheDocument();

        const salesmanInput = screen.getByPlaceholderText(/pilih atau ketik nama salesman/i);
        expect(salesmanInput).toHaveValue("Andi Wijaya");

        const pulangInput = screen.getByLabelText(/pulang kunjungan/i);
        expect(pulangInput).toHaveValue("16:00");

        const setoranInput = screen.getByLabelText(/setoran ke kasir/i);
        expect(setoranInput).toHaveValue("17:00");
    });

    // ── 3. Save disabled when fields are empty ────────────────────────────────
    it("save button is disabled when fields are empty", () => {
        render(<SetoranFormModal {...defaultProps()} />);

        const saveBtn = screen.getByRole("button", { name: /simpan/i });
        expect(saveBtn).toBeDisabled();
    });

    // ── 4. Save disabled + error when setoranKasir ≤ pulangKunjungan ──────────
    it("save button is disabled and error shown when setoranKasir ≤ pulangKunjungan", async () => {
        render(<SetoranFormModal {...defaultProps()} />);

        // Fill all fields with equal times (triggers the ordering error)
        fireEvent.change(screen.getByLabelText(/tanggal/i), {
            target: { value: "2025-07-01" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pilih atau ketik nama salesman/i), {
            target: { value: "Andi Wijaya" },
        });
        fireEvent.change(screen.getByLabelText(/pulang kunjungan/i), {
            target: { value: "15:00" },
        });
        fireEvent.change(screen.getByLabelText(/setoran ke kasir/i), {
            target: { value: "15:00" }, // equal → invalid → derived is null → button disabled
        });

        // Submit the form directly (button is disabled, so we fire submit on the form element)
        const form = document.getElementById("setoran-form") as HTMLFormElement;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/lebih besar/i)).toBeInTheDocument();
        });

        const saveBtn = screen.getByRole("button", { name: /simpan/i });
        expect(saveBtn).toBeDisabled();
    });

    // ── 5. Save enabled + Durasi preview shown when all fields valid ──────────
    it("save button is enabled and durasi preview shows value when all fields are valid", async () => {
        render(<SetoranFormModal {...defaultProps()} />);

        fireEvent.change(screen.getByLabelText(/tanggal/i), {
            target: { value: "2025-07-01" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pilih atau ketik nama salesman/i), {
            target: { value: "Andi Wijaya" },
        });
        fireEvent.change(screen.getByLabelText(/pulang kunjungan/i), {
            target: { value: "15:00" },
        });
        fireEvent.change(screen.getByLabelText(/setoran ke kasir/i), {
            target: { value: "16:30" }, // 90 min gap → valid
        });

        const saveBtn = screen.getByRole("button", { name: /simpan/i });

        await waitFor(() => {
            expect(saveBtn).not.toBeDisabled();
        });

        // Durasi preview must not be "—"
        const durasiSpan = screen.getByLabelText(/durasi:/i);
        expect(durasiSpan.textContent).not.toBe("—");
        expect(durasiSpan.textContent).toBeTruthy();
    });

    // ── 6. onSave called with correct SetoranFormValues ───────────────────────
    it("calls onSave with correct form values on valid submit", async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<SetoranFormModal {...defaultProps({ onSave })} />);

        fireEvent.change(screen.getByLabelText(/tanggal/i), {
            target: { value: "2025-07-01" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pilih atau ketik nama salesman/i), {
            target: { value: "Budi Santoso" },
        });
        fireEvent.change(screen.getByLabelText(/pulang kunjungan/i), {
            target: { value: "14:00" },
        });
        fireEvent.change(screen.getByLabelText(/setoran ke kasir/i), {
            target: { value: "15:30" },
        });

        // Wait for save button to become enabled, then submit
        const saveBtn = screen.getByRole("button", { name: /simpan/i });
        await waitFor(() => expect(saveBtn).not.toBeDisabled());

        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledOnce();
            expect(onSave).toHaveBeenCalledWith({
                tanggal: "2025-07-01",
                namaSalesman: "Budi Santoso",
                pulangKunjungan: "14:00",
                setoranKasir: "15:30",
            });
        });
    });

    // ── 7. onClose called on Escape key press ─────────────────────────────────
    it("calls onClose when Escape key is pressed", () => {
        const onClose = vi.fn();
        render(<SetoranFormModal {...defaultProps({ onClose })} />);

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).toHaveBeenCalledOnce();
    });

    // ── 8. Datalist contains expected salesman options ────────────────────────
    it("datalist contains the expected salesman options", () => {
        render(<SetoranFormModal {...defaultProps()} />);

        const datalist = document.getElementById("salesman-list");
        expect(datalist).toBeInTheDocument();

        const options = datalist!.querySelectorAll("option");
        const values = Array.from(options).map((o) => o.value);

        expect(values).toContain("Andi Wijaya");
        expect(values).toContain("Budi Santoso");
        expect(values).toContain("Citra Lestari");
        expect(values).toHaveLength(SALESMEN.length);
    });
});
