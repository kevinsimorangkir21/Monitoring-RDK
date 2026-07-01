"use client";

/**
 * OutboundModal — Create / Edit modal for Outbound data.
 *
 * Fields (13):
 *   Tanggal | FREIGHT ORDER | Mobil Muat | S-TYPE | Assign Job |
 *   JAM TERIMA | STATUS | Selesai Muat | HARI | PUTARAN |
 *   ST | H2 | JAM RUNNING
 *
 * Validation (exported pure function `validateOutboundForm`):
 *   - All 13 fields required (trimmed value empty → "Field ini wajib diisi.")
 *   - st as number < 0 → "ST harus bernilai 0 atau lebih."
 *   - h2 as number < 0 → "H2 harus bernilai 0 atau lebih."
 *   - status not in ["Muat Pagi","Muat Inap"] → "Pilih status yang valid."
 *   - freightOrder duplicate (not own record) → "FREIGHT ORDER sudah terdaftar."
 */

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type {
    OutboundRecord,
    OutboundFormValues,
    OutboundFormErrors,
    CrudMode,
} from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ["Muat Pagi", "Muat Inap"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: OutboundFormValues = {
    tanggal: "",
    freightOrder: "",
    mobilMuat: "",
    sType: "",
    assignJob: "",
    jamTerima: "",
    status: "",
    selesaiMuat: "",
    hari: "",
    putaran: "",
    st: "",
    h2: "",
    jamRunning: "",
};

function toFormValues(r: OutboundRecord): OutboundFormValues {
    return {
        tanggal: r.tanggal,
        freightOrder: r.freightOrder,
        mobilMuat: r.mobilMuat,
        sType: r.sType,
        assignJob: r.assignJob,
        jamTerima: r.jamTerima,
        status: r.status,
        selesaiMuat: r.selesaiMuat,
        hari: r.hari,
        putaran: r.putaran,
        st: String(r.st),
        h2: String(r.h2),
        jamRunning: r.jamRunning,
    };
}

// ─── Validation (pure, exported for testing) ─────────────────────────────────

/**
 * Validates all 13 outbound form fields.
 *
 * @param values              - Raw form string values
 * @param existingFreightOrders - List of already-registered FO numbers (caller
 *                               should exclude the current record's own FO when editing)
 * @param currentId           - The id of the record being edited (unused here —
 *                               caller controls existingFreightOrders exclusion)
 */
export function validateOutboundForm(
    values: OutboundFormValues,
    existingFreightOrders: string[],
    _currentId?: string
): OutboundFormErrors {
    const errors: OutboundFormErrors = {};

    // Required field check for every field
    const requiredFields: Array<keyof OutboundFormValues> = [
        "tanggal",
        "freightOrder",
        "mobilMuat",
        "sType",
        "assignJob",
        "jamTerima",
        "status",
        "selesaiMuat",
        "hari",
        "putaran",
        "st",
        "h2",
        "jamRunning",
    ];

    for (const field of requiredFields) {
        if (!values[field].trim()) {
            errors[field] = "Field ini wajib diisi.";
        }
    }

    // ST must be a non-negative number (only if non-empty)
    if (values.st.trim() && !errors.st) {
        const stNum = Number(values.st);
        if (isNaN(stNum) || stNum < 0) {
            errors.st = "ST harus bernilai 0 atau lebih.";
        }
    }

    // H2 must be a non-negative number (only if non-empty)
    if (values.h2.trim() && !errors.h2) {
        const h2Num = Number(values.h2);
        if (isNaN(h2Num) || h2Num < 0) {
            errors.h2 = "H2 harus bernilai 0 atau lebih.";
        }
    }

    // STATUS must be one of the valid enum values (only if non-empty)
    if (values.status.trim() && !errors.status) {
        if (!(VALID_STATUSES as readonly string[]).includes(values.status)) {
            errors.status = "Pilih status yang valid.";
        }
    }

    // FREIGHT ORDER uniqueness check (only if non-empty)
    if (values.freightOrder.trim() && !errors.freightOrder) {
        const normalizedFO = values.freightOrder.trim();
        const normalizedExisting = existingFreightOrders.map((fo) => fo.trim());
        if (normalizedExisting.includes(normalizedFO)) {
            errors.freightOrder = "FREIGHT ORDER sudah terdaftar.";
        }
    }

    return errors;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const INPUT_BASE =
    "w-full h-10 px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all " +
    "focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 " +
    "disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";
const IN = `${INPUT_BASE} border-[#E5E7EB]`;
const IE = `${INPUT_BASE} border-red-400 focus:border-red-400 focus:ring-red-100`;

function Field({
    label,
    htmlFor,
    error,
    required = true,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}
                {required && (
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                    </span>
                )}
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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OutboundModalProps {
    open: boolean;
    mode: CrudMode;
    record?: OutboundRecord;
    saving: boolean;
    existingFreightOrders: string[];
    currentId?: string;
    onSave: (values: OutboundFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function OutboundModalInner({
    open,
    mode,
    record,
    saving,
    existingFreightOrders,
    currentId,
    onSave,
    onClose,
}: OutboundModalProps) {
    const [values, setValues] = useState<OutboundFormValues>({
        ...EMPTY_FORM,
        tanggal: todayIso(),
    });
    const [errors, setErrors] = useState<OutboundFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset / pre-populate on open
    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && record) {
            setValues(toFormValues(record));
        } else {
            setValues({ ...EMPTY_FORM, tanggal: todayIso() });
        }
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    // Auto-focus close button on open
    useEffect(() => {
        if (open) {
            const id = setTimeout(() => closeRef.current?.focus(), 50);
            return () => clearTimeout(id);
        }
    }, [open]);

    // Escape key + focus trap
    useEffect(() => {
        if (!open) return;
        const isBusy = submitting || saving;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (!isBusy) {
                    e.preventDefault();
                    onClose();
                }
                return;
            }
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
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
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, saving, submitting, onClose]);

    const handleChange = useCallback(
        (field: keyof OutboundFormValues, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        []
    );

    const isBusy = submitting || saving;

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const errs = validateOutboundForm(values, existingFreightOrders, currentId);
            if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
            }
            setSubmitting(true);
            try {
                await onSave(values);
            } finally {
                setSubmitting(false);
            }
        },
        [values, existingFreightOrders, currentId, onSave]
    );

    const handleBackdrop = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && !isBusy) onClose();
        },
        [onClose, isBusy]
    );

    const handleClose = useCallback(() => {
        if (!isBusy) onClose();
    }, [onClose, isBusy]);

    const title = mode === "create" ? "Tambah Outbound" : "Edit Outbound";

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="outbound-modal-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                        onClick={handleBackdrop}
                    />

                    {/* Dialog wrapper — scroll container */}
                    <motion.div
                        key="outbound-modal-dlg"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={handleBackdrop}
                    >
                        <div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="outbound-modal-title"
                            className="relative w-full max-w-2xl bg-white rounded-[18px] shadow-xl my-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2
                                    id="outbound-modal-title"
                                    className="text-sm font-bold text-[#111827]"
                                >
                                    {title}
                                </h2>
                                <button
                                    ref={closeRef}
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isBusy}
                                    aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form
                                id="outbound-form"
                                onSubmit={handleSubmit}
                                noValidate
                                className="px-6 py-5 space-y-4"
                            >
                                {/* Row 1: Tanggal + FREIGHT ORDER */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="Tanggal"
                                        htmlFor="ob-tanggal"
                                        error={errors.tanggal}
                                    >
                                        <input
                                            id="ob-tanggal"
                                            type="date"
                                            value={values.tanggal}
                                            onChange={(e) => handleChange("tanggal", e.target.value)}
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.tanggal ? "ob-tanggal-error" : undefined}
                                            className={errors.tanggal ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="FREIGHT ORDER"
                                        htmlFor="ob-freightorder"
                                        error={errors.freightOrder}
                                    >
                                        <input
                                            id="ob-freightorder"
                                            type="text"
                                            value={values.freightOrder}
                                            onChange={(e) => handleChange("freightOrder", e.target.value)}
                                            placeholder="No. Freight Order"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.freightOrder ? "ob-freightorder-error" : undefined}
                                            className={errors.freightOrder ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 2: Mobil Muat + S-TYPE */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="Mobil Muat"
                                        htmlFor="ob-mobilmuat"
                                        error={errors.mobilMuat}
                                    >
                                        <input
                                            id="ob-mobilmuat"
                                            type="text"
                                            value={values.mobilMuat}
                                            onChange={(e) => handleChange("mobilMuat", e.target.value)}
                                            placeholder="Plat kendaraan / identifikasi"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.mobilMuat ? "ob-mobilmuat-error" : undefined}
                                            className={errors.mobilMuat ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="S-TYPE"
                                        htmlFor="ob-stype"
                                        error={errors.sType}
                                    >
                                        <input
                                            id="ob-stype"
                                            type="text"
                                            value={values.sType}
                                            onChange={(e) => handleChange("sType", e.target.value)}
                                            placeholder="Contoh: Regular, Express"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.sType ? "ob-stype-error" : undefined}
                                            className={errors.sType ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 3: Assign Job + JAM TERIMA */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="Assign Job"
                                        htmlFor="ob-assignjob"
                                        error={errors.assignJob}
                                    >
                                        <input
                                            id="ob-assignjob"
                                            type="text"
                                            value={values.assignJob}
                                            onChange={(e) => handleChange("assignJob", e.target.value)}
                                            placeholder="Label penugasan"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.assignJob ? "ob-assignjob-error" : undefined}
                                            className={errors.assignJob ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="JAM TERIMA"
                                        htmlFor="ob-jamterima"
                                        error={errors.jamTerima}
                                    >
                                        <input
                                            id="ob-jamterima"
                                            type="time"
                                            value={values.jamTerima}
                                            onChange={(e) => handleChange("jamTerima", e.target.value)}
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.jamTerima ? "ob-jamterima-error" : undefined}
                                            className={errors.jamTerima ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 4: STATUS + Selesai Muat */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="STATUS"
                                        htmlFor="ob-status"
                                        error={errors.status}
                                    >
                                        <select
                                            id="ob-status"
                                            value={values.status}
                                            onChange={(e) => handleChange("status", e.target.value)}
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.status ? "ob-status-error" : undefined}
                                            className={errors.status ? IE : IN}
                                        >
                                            <option value="">Pilih Status</option>
                                            {VALID_STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field
                                        label="Selesai Muat"
                                        htmlFor="ob-selesaimuat"
                                        error={errors.selesaiMuat}
                                    >
                                        <input
                                            id="ob-selesaimuat"
                                            type="time"
                                            value={values.selesaiMuat}
                                            onChange={(e) => handleChange("selesaiMuat", e.target.value)}
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.selesaiMuat ? "ob-selesaimuat-error" : undefined}
                                            className={errors.selesaiMuat ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 5: HARI + PUTARAN */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="HARI"
                                        htmlFor="ob-hari"
                                        error={errors.hari}
                                    >
                                        <input
                                            id="ob-hari"
                                            type="text"
                                            value={values.hari}
                                            onChange={(e) => handleChange("hari", e.target.value)}
                                            placeholder="Contoh: Senin"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.hari ? "ob-hari-error" : undefined}
                                            className={errors.hari ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="PUTARAN"
                                        htmlFor="ob-putaran"
                                        error={errors.putaran}
                                    >
                                        <input
                                            id="ob-putaran"
                                            type="text"
                                            value={values.putaran}
                                            onChange={(e) => handleChange("putaran", e.target.value)}
                                            placeholder="Identifikasi ronde"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.putaran ? "ob-putaran-error" : undefined}
                                            className={errors.putaran ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 6: ST + H2 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="ST"
                                        htmlFor="ob-st"
                                        error={errors.st}
                                    >
                                        <input
                                            id="ob-st"
                                            type="number"
                                            min="0"
                                            value={values.st}
                                            onChange={(e) => handleChange("st", e.target.value)}
                                            placeholder="0"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.st ? "ob-st-error" : undefined}
                                            className={errors.st ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="H2"
                                        htmlFor="ob-h2"
                                        error={errors.h2}
                                    >
                                        <input
                                            id="ob-h2"
                                            type="number"
                                            min="0"
                                            value={values.h2}
                                            onChange={(e) => handleChange("h2", e.target.value)}
                                            placeholder="0"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.h2 ? "ob-h2-error" : undefined}
                                            className={errors.h2 ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 7: JAM RUNNING (single column, full-width on mobile, half on sm+) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label="JAM RUNNING"
                                        htmlFor="ob-jamrunning"
                                        error={errors.jamRunning}
                                    >
                                        <input
                                            id="ob-jamrunning"
                                            type="time"
                                            value={values.jamRunning}
                                            onChange={(e) => handleChange("jamRunning", e.target.value)}
                                            disabled={isBusy}
                                            required
                                            aria-describedby={errors.jamRunning ? "ob-jamrunning-error" : undefined}
                                            className={errors.jamRunning ? IE : IN}
                                        />
                                    </Field>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-[18px]">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    form="outbound-form"
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                                >
                                    {isBusy ? (
                                        <svg
                                            className="animate-spin w-4 h-4 text-white shrink-0"
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
                                    ) : null}
                                    {isBusy
                                        ? "Menyimpan..."
                                        : mode === "create"
                                            ? "Simpan"
                                            : "Perbarui"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export const OutboundModal = memo(OutboundModalInner);
export default OutboundModal;
