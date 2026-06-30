/**
 * DeleteConfirmDialog.test.tsx
 *
 * Component tests for DeleteConfirmDialog.
 * Covers: name/date display, confirm/cancel callbacks, disabled state during deletion.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { SetoranRecord } from "@/types/setoran";

// ─── Shared mock record ───────────────────────────────────────────────────────

const MOCK_RECORD: SetoranRecord = {
    id: "test-1",
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

function defaultProps(
    overrides: Partial<Parameters<typeof DeleteConfirmDialog>[0]> = {}
) {
    return {
        open: true,
        record: MOCK_RECORD,
        deleting: false,
        onConfirm: vi.fn().mockResolvedValue(undefined),
        onClose: vi.fn(),
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DeleteConfirmDialog", () => {
    // ── 1. Renders salesman name and Indonesian formatted date ────────────────
    it("renders salesman name and formatted Indonesian date from record", () => {
        render(<DeleteConfirmDialog {...defaultProps()} />);

        expect(screen.getByText("Andi Wijaya")).toBeInTheDocument();
        expect(screen.getByText("1 Juli 2025")).toBeInTheDocument();
    });

    // ── 2. Confirm ("Hapus") button calls onConfirm ───────────────────────────
    it('confirm button calls onConfirm when clicked', () => {
        const onConfirm = vi.fn().mockResolvedValue(undefined);
        render(<DeleteConfirmDialog {...defaultProps({ onConfirm })} />);

        const hapusBtn = screen.getByRole("button", { name: /^hapus$/i });
        fireEvent.click(hapusBtn);

        expect(onConfirm).toHaveBeenCalledOnce();
    });

    // ── 3. Cancel ("Batal") button calls onClose ──────────────────────────────
    it('cancel button calls onClose when clicked', () => {
        const onClose = vi.fn();
        render(<DeleteConfirmDialog {...defaultProps({ onClose })} />);

        const batalBtn = screen.getByRole("button", { name: /batal/i });
        fireEvent.click(batalBtn);

        expect(onClose).toHaveBeenCalledOnce();
    });

    // ── 4. Confirm button disabled when deleting === true ─────────────────────
    it("confirm button is disabled when deleting is true", () => {
        render(<DeleteConfirmDialog {...defaultProps({ deleting: true })} />);

        // When deleting, the button text changes to "Menghapus…" and is disabled.
        // We query by aria-label which always says "Hapus" or "Menghapus..."
        const confirmBtn = screen.getByRole("button", { name: /menghapus/i });
        expect(confirmBtn).toBeDisabled();
    });
});
