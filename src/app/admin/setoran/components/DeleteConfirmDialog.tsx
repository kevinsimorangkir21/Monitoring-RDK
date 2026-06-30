"use client";

/**
 * DeleteConfirmDialog — Confirmation modal before permanently deleting a setoran record.
 *
 * Features:
 *  - Displays salesman name and formatted Indonesian date of the target record
 *  - Destructive "Hapus" button (red) disabled while deletion is in flight
 *  - "Batal" button to cancel (also disabled during deletion)
 *  - framer-motion enter/exit animations
 *  - Closes on Escape key press and backdrop click
 *  - Returns null when not open
 *
 * Requirements: 4.1, 4.2, 4.3, 13.1
 */

import React, { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import type { SetoranRecord } from "@/types/setoran";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
 * Format "YYYY-MM-DD" → Indonesian long date, e.g. "28 Juni 2025"
 */
function formatIndonesianDate(tanggal: string): string {
    const date = new Date(`${tanggal}T00:00:00`);
    const day = date.getDate();
    const month = MONTH_LABELS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DeleteConfirmDialogProps {
    open: boolean;
    record: SetoranRecord | null;
    deleting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DeleteConfirmDialog
 *
 * Requirements: 4.1, 4.2, 4.3, 13.1
 */
export function DeleteConfirmDialog({
    open,
    record,
    deleting,
    onConfirm,
    onClose,
}: DeleteConfirmDialogProps) {
    // ── Escape key handler (Requirement 13.1) ─────────────────────────────────
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !deleting) {
                e.preventDefault();
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, deleting, onClose]);

    // ── Backdrop click ────────────────────────────────────────────────────────
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && !deleting) onClose();
        },
        [deleting, onClose]
    );

    // Early return — keeps AnimatePresence clean
    if (!open) return null;

    const formattedDate = record ? formatIndonesianDate(record.tanggal) : "";

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* ── Backdrop ──────────────────────────────────────────── */}
                    <motion.div
                        key="delete-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                        onClick={handleBackdropClick}
                    />

                    {/* ── Dialog panel ──────────────────────────────────────── */}
                    <motion.div
                        key="delete-dialog"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleBackdropClick}
                    >
                        <div
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="delete-dialog-title"
                            aria-describedby="delete-dialog-desc"
                            className="relative w-full max-w-sm bg-white rounded-[18px] shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ── Dialog header ─────────────────────────────── */}
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E5E7EB]">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Trash2
                                        size={18}
                                        className="text-red-500"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h2
                                    id="delete-dialog-title"
                                    className="text-sm font-bold text-[#111827]"
                                >
                                    Hapus Data Setoran
                                </h2>
                            </div>

                            {/* ── Dialog body ───────────────────────────────── */}
                            <div
                                id="delete-dialog-desc"
                                className="px-6 py-5 space-y-3"
                            >
                                <p className="text-sm text-[#374151] leading-relaxed">
                                    Apakah Anda yakin ingin menghapus data setoran berikut?
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>

                                {record && (
                                    <div className="rounded-xl bg-[#FEF2F2] border border-red-100 px-4 py-3 space-y-1">
                                        <p className="text-sm font-semibold text-[#111827]">
                                            {record.namaSalesman}
                                        </p>
                                        <p className="text-xs text-[#64748B]">
                                            {formattedDate}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ── Dialog footer ─────────────────────────────── */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={deleting}
                                    aria-busy={deleting}
                                    aria-label={deleting ? "Menghapus..." : "Hapus"}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                >
                                    {deleting ? (
                                        <>
                                            <svg
                                                className="animate-spin w-4 h-4 text-white shrink-0"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} aria-hidden="true" />
                                            Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
