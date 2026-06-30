"use client";

/**
 * OutboundModal — Create / Edit modal for Outbound data.
 *
 * Fields:
 *   Tanggal | Plant | Vendor | No Polisi | Driver
 *   Status FO | Total Box | Total Qty | Jam Loading | Jam Berangkat
 *
 * Validation:
 *   - All fields required
 *   - Plant must be one of: PASM, IMSM, U2, LION, TASE
 *   - Status FO must be one of: OPEN, CLOSE, CANCEL, PARTIAL
 *   - totalBox >= 0, totalQty >= 0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Truck } from "lucide-react";
import type {
    OutboundRecord,
    OutboundFormValues,
    OutboundFormErrors,
    CrudMode,
} from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANT_OPTIONS = ["PASM", "IMSM", "U2", "LION", "TASE"] as const;
const STATUS_FO_OPTIONS = ["OPEN", "CLOSE", "CANCEL", "PARTIAL"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY: OutboundFormValues = {
    tanggal: "",
    plant: "",
    vendor: "",
    noPolisi: "",
    driver: "",
    statusFO: "",
    totalBox: "",
    totalQty: "",
    jamLoading: "",
    jamBerangkat: "",
};

function toFormValues(r: OutboundRecord): OutboundFormValues {
    return {
        tanggal: r.tanggal,
        plant: r.plant,
        vendor: r.vendor,
        noPolisi: r.noPolisi,
        driver: r.driver,
        statusFO: r.statusFO,
        totalBox: String(r.totalBox),
        totalQty: String(r.totalQty),
        jamLoading: r.jamLoading,
        jamBerangkat: r.jamBerangkat,
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(v: OutboundFormValues): OutboundFormErrors {
    const errors: OutboundFormErrors = {};

    if (!v.tanggal.trim()) errors.tanggal = "Tanggal harus diisi";
    if (!v.plant.trim()) {
        errors.plant = "Plant harus diisi";
    } else if (!(PLANT_OPTIONS as readonly string[]).includes(v.plant)) {
        errors.plant = "Plant tidak valid";
    }
    if (!v.vendor.trim()) errors.vendor = "Vendor harus diisi";
    if (!v.noPolisi.trim()) errors.noPolisi = "No Polisi harus diisi";
    if (!v.driver.trim()) errors.driver = "Driver harus diisi";
    if (!v.statusFO.trim()) {
        errors.statusFO = "Status FO harus diisi";
    } else if (!(STATUS_FO_OPTIONS as readonly string[]).includes(v.statusFO)) {
        errors.statusFO = "Status FO tidak valid";
    }

    if (!v.totalBox.trim()) {
        errors.totalBox = "Total Box harus diisi";
    } else {
        const num = parseInt(v.totalBox, 10);
        if (isNaN(num) || num < 0) errors.totalBox = "Total Box harus ≥ 0";
    }

    if (!v.totalQty.trim()) {
        errors.totalQty = "Total Qty harus diisi";
    } else {
        const num = parseInt(v.totalQty, 10);
        if (isNaN(num) || num < 0) errors.totalQty = "Total Qty harus ≥ 0";
    }

    if (!v.jamLoading.trim()) errors.jamLoading = "Jam Loading harus diisi";
    if (!v.jamBerangkat.trim()) errors.jamBerangkat = "Jam Berangkat harus diisi";

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
    onSave: (values: OutboundFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OutboundModal({
    open,
    mode,
    record,
    saving,
    onSave,
    onClose,
}: OutboundModalProps) {
    const [values, setValues] = useState<OutboundFormValues>({
        ...EMPTY,
        tanggal: todayIso(),
    });
    const [errors, setErrors] = useState<OutboundFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset / pre-populate on open
    useEffect(() => {
        if (!open) return;
        setValues(
            mode === "edit" && record
                ? toFormValues(record)
                : { ...EMPTY, tanggal: todayIso() }
        );
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
                if (!isBusy) { e.preventDefault(); onClose(); }
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
            const errs = validate(values);
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
        [values, onSave]
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

                    {/* Dialog wrapper */}
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
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Truck
                                            size={16}
                                            className="text-emerald-600"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <h2
                                        id="outbound-modal-title"
                                        className="text-sm font-bold text-[#111827]"
                                    >
                                        {mode === "create"
                                            ? "Tambah Data Outbound"
                                            : "Edit Data Outbound"}
                                    </h2>
                                </div>
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
                                {/* Row 1: Tanggal + Plant */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Tanggal"
                                        htmlFor="ob-tanggal"
                                        error={errors.tanggal}
                                    >
                                        <input
                                            id="ob-tanggal"
                                            type="date"
                                            value={values.tanggal}
                                            onChange={(e) =>
                                                handleChange("tanggal", e.target.value)
                                            }
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.tanggal ? "ob-tanggal-error" : undefined
                                            }
                                            className={errors.tanggal ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="Plant"
                                        htmlFor="ob-plant"
                                        error={errors.plant}
                                    >
                                        <select
                                            id="ob-plant"
                                            value={values.plant}
                                            onChange={(e) =>
                                                handleChange("plant", e.target.value)
                                            }
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.plant ? "ob-plant-error" : undefined
                                            }
                                            className={errors.plant ? IE : IN}
                                        >
                                            <option value="">Pilih Plant</option>
                                            {PLANT_OPTIONS.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Row 2: Vendor + No Polisi */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Vendor"
                                        htmlFor="ob-vendor"
                                        error={errors.vendor}
                                    >
                                        <input
                                            id="ob-vendor"
                                            type="text"
                                            value={values.vendor}
                                            onChange={(e) =>
                                                handleChange("vendor", e.target.value)
                                            }
                                            placeholder="Nama vendor / ekspedisi"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.vendor ? "ob-vendor-error" : undefined
                                            }
                                            className={errors.vendor ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="No Polisi"
                                        htmlFor="ob-nopolisi"
                                        error={errors.noPolisi}
                                    >
                                        <input
                                            id="ob-nopolisi"
                                            type="text"
                                            value={values.noPolisi}
                                            onChange={(e) =>
                                                handleChange("noPolisi", e.target.value)
                                            }
                                            placeholder="Contoh: B 1234 XY"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.noPolisi ? "ob-nopolisi-error" : undefined
                                            }
                                            className={errors.noPolisi ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 3: Driver + Status FO */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Driver"
                                        htmlFor="ob-driver"
                                        error={errors.driver}
                                    >
                                        <input
                                            id="ob-driver"
                                            type="text"
                                            value={values.driver}
                                            onChange={(e) =>
                                                handleChange("driver", e.target.value)
                                            }
                                            placeholder="Nama pengemudi"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.driver ? "ob-driver-error" : undefined
                                            }
                                            className={errors.driver ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="Status FO"
                                        htmlFor="ob-statusfo"
                                        error={errors.statusFO}
                                    >
                                        <select
                                            id="ob-statusfo"
                                            value={values.statusFO}
                                            onChange={(e) =>
                                                handleChange("statusFO", e.target.value)
                                            }
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.statusFO ? "ob-statusfo-error" : undefined
                                            }
                                            className={errors.statusFO ? IE : IN}
                                        >
                                            <option value="">Pilih Status FO</option>
                                            {STATUS_FO_OPTIONS.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Row 4: Total Box + Total Qty */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Total Box"
                                        htmlFor="ob-totalbox"
                                        error={errors.totalBox}
                                    >
                                        <input
                                            id="ob-totalbox"
                                            type="number"
                                            min="0"
                                            value={values.totalBox}
                                            onChange={(e) =>
                                                handleChange("totalBox", e.target.value)
                                            }
                                            placeholder="0"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.totalBox ? "ob-totalbox-error" : undefined
                                            }
                                            className={errors.totalBox ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="Total Qty"
                                        htmlFor="ob-totalqty"
                                        error={errors.totalQty}
                                    >
                                        <input
                                            id="ob-totalqty"
                                            type="number"
                                            min="0"
                                            value={values.totalQty}
                                            onChange={(e) =>
                                                handleChange("totalQty", e.target.value)
                                            }
                                            placeholder="0"
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.totalQty ? "ob-totalqty-error" : undefined
                                            }
                                            className={errors.totalQty ? IE : IN}
                                        />
                                    </Field>
                                </div>

                                {/* Row 5: Jam Loading + Jam Berangkat */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Jam Loading"
                                        htmlFor="ob-jamloading"
                                        error={errors.jamLoading}
                                    >
                                        <input
                                            id="ob-jamloading"
                                            type="time"
                                            value={values.jamLoading}
                                            onChange={(e) =>
                                                handleChange("jamLoading", e.target.value)
                                            }
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.jamLoading ? "ob-jamloading-error" : undefined
                                            }
                                            className={errors.jamLoading ? IE : IN}
                                        />
                                    </Field>
                                    <Field
                                        label="Jam Berangkat"
                                        htmlFor="ob-jamberangkat"
                                        error={errors.jamBerangkat}
                                    >
                                        <input
                                            id="ob-jamberangkat"
                                            type="time"
                                            value={values.jamBerangkat}
                                            onChange={(e) =>
                                                handleChange("jamBerangkat", e.target.value)
                                            }
                                            disabled={isBusy}
                                            required
                                            aria-describedby={
                                                errors.jamBerangkat
                                                    ? "ob-jamberangkat-error"
                                                    : undefined
                                            }
                                            className={errors.jamBerangkat ? IE : IN}
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

export default OutboundModal;
