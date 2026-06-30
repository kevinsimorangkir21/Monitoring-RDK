"use client";

/**
 * SetoranFormModal — Controlled modal form for adding/editing setoran records.
 *
 * Features:
 *  - Create and Edit modes (pre-populates from record prop in edit mode)
 *  - Live Durasi preview via computeDerivedFields
 *  - Client-side field validation (non-empty + time ordering rule)
 *  - Salesman autocomplete via <datalist>
 *  - Focus trap, Escape key, backdrop click to close
 *  - framer-motion enter/exit animation
 *
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 10.2, 10.4, 11.1, 11.2, 11.3, 13.1
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, CalendarDays, User, Timer } from "lucide-react";

import {
    computeDerivedFields,
    type DerivedSetoranFields,
} from "@/lib/setoranCalculations";
import type {
    SetoranFormValues,
    SetoranFormErrors,
    CrudModalMode,
} from "@/app/admin/setoran/types/crud";
import type { SetoranRecord } from "@/types/setoran";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SetoranFormModalProps {
    open: boolean;
    mode: CrudModalMode;
    /** Populated for edit mode */
    record?: SetoranRecord;
    /** Source list for salesman autocomplete (Requirement 11.1) */
    availableSalesman: string[];
    /** Controlled by parent: true while the API call is in-flight */
    saving: boolean;
    /** Called with raw form values on a successful submit */
    onSave: (values: SetoranFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Initial values ───────────────────────────────────────────────────────────

const EMPTY_VALUES: SetoranFormValues = {
    tanggal: "",
    namaSalesman: "",
    pulangKunjungan: "",
    setoranKasir: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return today's date as "YYYY-MM-DD" */
function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Build initial form values for create mode (today's date prefilled) */
function createInitialValues(): SetoranFormValues {
    return { ...EMPTY_VALUES, tanggal: todayIso() };
}

/** Build initial form values for edit mode from an existing record */
function editInitialValues(record: SetoranRecord): SetoranFormValues {
    return {
        tanggal: record.tanggal,
        namaSalesman: record.namaSalesman,
        pulangKunjungan: record.pulangKunjungan,
        setoranKasir: record.setoranKasir,
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate form values and return an errors object.
 * Empty object means the form is valid.
 */
function validate(values: SetoranFormValues): SetoranFormErrors {
    const errors: SetoranFormErrors = {};

    if (!values.tanggal.trim()) {
        errors.tanggal = "Tanggal harus diisi";
    }
    if (!values.namaSalesman.trim()) {
        errors.namaSalesman = "Nama Salesman harus diisi";
    }
    if (!values.pulangKunjungan.trim()) {
        errors.pulangKunjungan = "Jam Pulang Kunjungan harus diisi";
    }
    if (!values.setoranKasir.trim()) {
        errors.setoranKasir = "Jam Setoran ke Kasir harus diisi";
    }

    // Time ordering validation (Requirement 2.2)
    if (
        values.pulangKunjungan.trim() &&
        values.setoranKasir.trim() &&
        values.setoranKasir <= values.pulangKunjungan
    ) {
        errors.setoranKasir =
            "Jam Setoran harus lebih besar dari Jam Pulang Kunjungan";
    }

    return errors;
}

// ─── Label + Input wrappers ───────────────────────────────────────────────────

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
}

function Field({ label, htmlFor, error, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={htmlFor}
                className="text-xs font-medium text-[#64748B]"
            >
                {label}
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                    *
                </span>
            </label>
            {children}
            {error && (
                <p
                    id={`${htmlFor}-error`}
                    role="alert"
                    className="text-xs text-red-500 flex items-start gap-1"
                >
                    <span className="mt-px shrink-0">⚠</span>
                    {error}
                </p>
            )}
        </div>
    );
}

const INPUT_BASE =
    "w-full h-10 px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all " +
    "focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 " +
    "disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";

const INPUT_NORMAL = `${INPUT_BASE} border-[#E5E7EB]`;
const INPUT_ERROR = `${INPUT_BASE} border-red-400 focus:border-red-400 focus:ring-red-100`;

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SetoranFormModal
 *
 * Controlled modal for creating or editing a SetoranRecord.
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 10.2, 10.4, 11.1, 11.2, 11.3, 13.1
 */
export function SetoranFormModal({
    open,
    mode,
    record,
    availableSalesman,
    saving,
    onSave,
    onClose,
}: SetoranFormModalProps) {
    // ── Local state ───────────────────────────────────────────────────────────
    const [values, setValues] = useState<SetoranFormValues>(createInitialValues);
    const [errors, setErrors] = useState<SetoranFormErrors>({});
    const [derived, setDerived] = useState<DerivedSetoranFields | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Refs for focus trap ───────────────────────────────────────────────────
    const dialogRef = useRef<HTMLDivElement>(null);
    const firstFocusableRef = useRef<HTMLButtonElement>(null); // close button

    // ── Populate / reset form when modal opens or mode/record changes ─────────
    // (Requirement 2.3 — edit mode pre-populates fields; Requirement 9.1 — create starts empty)
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && record) {
            setValues(editInitialValues(record));
        } else {
            setValues(createInitialValues());
        }
        setErrors({});
        setDerived(null);
        setSubmitting(false);
    }, [open, mode, record]);

    // ── Live Durasi calculation (Requirement 10.4) ────────────────────────────
    useEffect(() => {
        const tanggal = values.tanggal;
        const pulangKunjungan = values.pulangKunjungan;
        const setoranKasir = values.setoranKasir;
        if (tanggal && pulangKunjungan && setoranKasir) {
            setDerived(computeDerivedFields(tanggal, pulangKunjungan, setoranKasir));
        } else {
            setDerived(null);
        }
    }, [values.tanggal, values.pulangKunjungan, values.setoranKasir]);

    // ── Keyboard handler — Escape closes modal (Requirement 13.1) ────────────
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
            // Focus trap (Requirement 13.1)
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // ── Auto-focus close button when modal opens ──────────────────────────────
    useEffect(() => {
        if (open) {
            // Small timeout to let AnimatePresence mount the element
            const id = setTimeout(() => firstFocusableRef.current?.focus(), 50);
            return () => clearTimeout(id);
        }
    }, [open]);

    // ── Field change handler ──────────────────────────────────────────────────
    const handleChange = useCallback(
        (field: keyof SetoranFormValues, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            // Clear the error for the field that just changed
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        []
    );

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            const newErrors = validate(values);
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            setSubmitting(true);
            try {
                await onSave(values);
            } finally {
                setSubmitting(false);
            }
        },
        [values, onSave]
    );

    // ── Derived save-button disabled state ────────────────────────────────────
    // (Requirement 2.5)
    const isBusy = submitting || saving;
    const saveDisabled =
        isBusy || Object.keys(errors).length > 0 || !derived;

    // ── Backdrop click ────────────────────────────────────────────────────────
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) onClose();
        },
        [onClose]
    );

    // ── Labels ────────────────────────────────────────────────────────────────
    const title = mode === "create" ? "Tambah Data Setoran" : "Edit Data Setoran";
    const saveLabel = mode === "create" ? "Simpan" : "Perbarui";

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* ── Backdrop ──────────────────────────────────────────── */}
                    <motion.div
                        key="backdrop"
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
                        key="dialog"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleBackdropClick}
                    >
                        <div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="setoran-modal-title"
                            className="relative w-full max-w-md bg-white rounded-[18px] shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ── Modal header ──────────────────────────────── */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Timer
                                            size={16}
                                            className="text-emerald-600"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <h2
                                        id="setoran-modal-title"
                                        className="text-sm font-bold text-[#111827]"
                                    >
                                        {title}
                                    </h2>
                                </div>

                                <button
                                    ref={firstFocusableRef}
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* ── Form body ─────────────────────────────────── */}
                            <form
                                id="setoran-form"
                                onSubmit={handleSubmit}
                                noValidate
                                className="px-6 py-5 space-y-4"
                            >
                                {/* ── Tanggal (Requirement 1.2) ─────────────── */}
                                <Field
                                    label="Tanggal"
                                    htmlFor="sf-tanggal"
                                    error={errors.tanggal}
                                >
                                    <div className="relative">
                                        <CalendarDays
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="sf-tanggal"
                                            type="date"
                                            value={values.tanggal}
                                            onChange={(e) =>
                                                handleChange("tanggal", e.target.value)
                                            }
                                            aria-describedby={
                                                errors.tanggal ? "sf-tanggal-error" : undefined
                                            }
                                            aria-invalid={!!errors.tanggal}
                                            disabled={isBusy}
                                            required
                                            className={`${errors.tanggal ? INPUT_ERROR : INPUT_NORMAL} pl-9`}
                                        />
                                    </div>
                                </Field>

                                {/* ── Nama Salesman (Requirement 11.1–11.3) ─── */}
                                <Field
                                    label="Nama Salesman"
                                    htmlFor="sf-salesman"
                                    error={errors.namaSalesman}
                                >
                                    <div className="relative">
                                        <User
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="sf-salesman"
                                            type="text"
                                            list="salesman-list"
                                            value={values.namaSalesman}
                                            onChange={(e) =>
                                                handleChange("namaSalesman", e.target.value)
                                            }
                                            placeholder="Pilih atau ketik nama salesman..."
                                            aria-describedby={
                                                errors.namaSalesman
                                                    ? "sf-salesman-error"
                                                    : undefined
                                            }
                                            aria-invalid={!!errors.namaSalesman}
                                            aria-autocomplete="list"
                                            disabled={isBusy}
                                            required
                                            className={`${errors.namaSalesman ? INPUT_ERROR : INPUT_NORMAL} pl-9`}
                                        />
                                        {/* Datalist provides native browser autocomplete (Req 11.1) */}
                                        <datalist id="salesman-list">
                                            {availableSalesman.map((name) => (
                                                <option key={name} value={name} />
                                            ))}
                                        </datalist>
                                    </div>
                                </Field>

                                {/* ── Time fields row ───────────────────────── */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Pulang Kunjungan (Requirement 1.3) */}
                                    <Field
                                        label="Pulang Kunjungan"
                                        htmlFor="sf-pulang"
                                        error={errors.pulangKunjungan}
                                    >
                                        <div className="relative">
                                            <Clock
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                                                aria-hidden="true"
                                            />
                                            <input
                                                id="sf-pulang"
                                                type="time"
                                                value={values.pulangKunjungan}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "pulangKunjungan",
                                                        e.target.value
                                                    )
                                                }
                                                aria-describedby={
                                                    errors.pulangKunjungan
                                                        ? "sf-pulang-error"
                                                        : undefined
                                                }
                                                aria-invalid={!!errors.pulangKunjungan}
                                                disabled={isBusy}
                                                required
                                                className={`${errors.pulangKunjungan ? INPUT_ERROR : INPUT_NORMAL} pl-9`}
                                            />
                                        </div>
                                    </Field>

                                    {/* Setoran ke Kasir (Requirement 1.4) */}
                                    <Field
                                        label="Setoran ke Kasir"
                                        htmlFor="sf-setoran"
                                        error={errors.setoranKasir}
                                    >
                                        <div className="relative">
                                            <Clock
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                                                aria-hidden="true"
                                            />
                                            <input
                                                id="sf-setoran"
                                                type="time"
                                                value={values.setoranKasir}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "setoranKasir",
                                                        e.target.value
                                                    )
                                                }
                                                aria-describedby={
                                                    errors.setoranKasir
                                                        ? "sf-setoran-error"
                                                        : undefined
                                                }
                                                aria-invalid={!!errors.setoranKasir}
                                                disabled={isBusy}
                                                required
                                                className={`${errors.setoranKasir ? INPUT_ERROR : INPUT_NORMAL} pl-9`}
                                            />
                                        </div>
                                    </Field>
                                </div>

                                {/* ── Durasi preview (Requirement 10.2, 10.4) ── */}
                                <div className="rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Timer
                                            size={14}
                                            className="text-[#64748B] shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span className="text-xs font-medium text-[#64748B]">
                                            Durasi Setoran
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            aria-live="polite"
                                            aria-label={`Durasi: ${derived?.durasiDisplay ?? "belum tersedia"}`}
                                            className={`text-sm font-bold tabular-nums ${derived
                                                ? derived.durasiSeconds <= 1800
                                                    ? "text-emerald-600"
                                                    : derived.durasiSeconds <= 3600
                                                        ? "text-blue-600"
                                                        : "text-red-500"
                                                : "text-[#9CA3AF]"
                                                }`}
                                        >
                                            {derived?.durasiDisplay ?? "—"}
                                        </span>
                                        {derived && (
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${derived.status === "Fast"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : derived.status === "Normal"
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {derived.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* ── Modal footer ──────────────────────────────── */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    form="setoran-form"
                                    disabled={saveDisabled}
                                    aria-busy={isBusy}
                                    aria-label={
                                        isBusy
                                            ? "Menyimpan..."
                                            : saveLabel
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                                >
                                    {isBusy && (
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
                                    )}
                                    {isBusy ? "Menyimpan..." : saveLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default SetoranFormModal;
