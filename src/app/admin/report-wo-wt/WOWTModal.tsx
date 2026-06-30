"use client";

/**
 * WOWTModal — Controlled modal for Create / Edit WO-WT records.
 *
 * Fields (manual): Tanggal, Wavepick, ZWP1, ZWP2, ZWP4, ZWP5
 * Auto-calculated: WO-WT Global = (ZWP1 + ZWP2 + ZWP4 + ZWP5) / 4
 *
 * Validation:
 *   - All fields required
 *   - ZWP values must be numeric ≥ 0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, BarChart2 } from "lucide-react";
import type { WoWtRecord, WoWtFormValues, WoWtFormErrors, CrudMode } from "./types";

// ─── Auto-calc helper ─────────────────────────────────────────────────────────

export function computeWoWtGlobal(zwp1: string, zwp2: string, zwp4: string, zwp5: string): number | null {
    const vals = [zwp1, zwp2, zwp4, zwp5].map((s) => parseFloat(s));
    if (vals.some((v) => isNaN(v) || v < 0)) return null;
    return vals.reduce((s, v) => s + v, 0) / 4;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(v: WoWtFormValues): WoWtFormErrors {
    const errors: WoWtFormErrors = {};
    if (!v.tanggal.trim()) errors.tanggal = "Tanggal harus diisi";
    if (!v.wavepick.trim()) errors.wavepick = "Wavepick harus diisi";

    const zoneCheck = (key: keyof WoWtFormErrors, label: string, val: string) => {
        if (!val.trim()) { errors[key] = `${label} harus diisi`; return; }
        const n = parseFloat(val);
        if (isNaN(n)) { errors[key] = `${label} harus berupa angka`; return; }
        if (n < 0) { errors[key] = `${label} tidak boleh negatif`; }
    };
    zoneCheck("zwp1", "ZWP1", v.zwp1);
    zoneCheck("zwp2", "ZWP2", v.zwp2);
    zoneCheck("zwp4", "ZWP4", v.zwp4);
    zoneCheck("zwp5", "ZWP5", v.zwp5);
    return errors;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const INPUT_BASE =
    "w-full h-10 px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all " +
    "focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 " +
    "disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";
const INPUT_NORMAL = `${INPUT_BASE} border-[#E5E7EB]`;
const INPUT_ERROR = `${INPUT_BASE} border-red-400 focus:border-red-400 focus:ring-red-100`;

function Field({ label, htmlFor, error, children }: {
    label: string; htmlFor: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
            {children}
            {error && (
                <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-500 flex items-start gap-1">
                    <span className="mt-px shrink-0">⚠</span>{error}
                </p>
            )}
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WOWTModalProps {
    open: boolean;
    mode: CrudMode;
    record?: WoWtRecord;
    saving: boolean;
    onSave: (values: WoWtFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

const EMPTY: WoWtFormValues = { tanggal: "", wavepick: "", zwp1: "", zwp2: "", zwp4: "", zwp5: "" };

function toFormValues(r: WoWtRecord): WoWtFormValues {
    return {
        tanggal: r.tanggal,
        wavepick: r.wavepick,
        zwp1: String(r.zwp1),
        zwp2: String(r.zwp2),
        zwp4: String(r.zwp4),
        zwp5: String(r.zwp5),
    };
}

export function WOWTModal({ open, mode, record, saving, onSave, onClose }: WOWTModalProps) {
    const [values, setValues] = useState<WoWtFormValues>({ ...EMPTY, tanggal: todayIso() });
    const [errors, setErrors] = useState<WoWtFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset / pre-populate on open
    useEffect(() => {
        if (!open) return;
        setValues(mode === "edit" && record ? toFormValues(record) : { ...EMPTY, tanggal: todayIso() });
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    // Auto-focus close button
    useEffect(() => {
        if (open) { const id = setTimeout(() => closeRef.current?.focus(), 50); return () => clearTimeout(id); }
    }, [open]);

    // Escape key + focus trap
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0]; const last = focusable[focusable.length - 1];
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const handleChange = useCallback((field: keyof WoWtFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(values);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try { await onSave(values); } finally { setSubmitting(false); }
    }, [values, onSave]);

    const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const isBusy = submitting || saving;
    const global = computeWoWtGlobal(values.zwp1, values.zwp2, values.zwp4, values.zwp5);
    const saveDisabled = isBusy || Object.keys(errors).length > 0;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="wowt-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBackdrop}
                    />
                    <motion.div
                        key="wowt-dialog"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleBackdrop}
                    >
                        <div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="wowt-modal-title"
                            className="relative w-full max-w-lg bg-white rounded-[18px] shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <BarChart2 size={16} className="text-blue-600" aria-hidden="true" />
                                    </div>
                                    <h2 id="wowt-modal-title" className="text-sm font-bold text-[#111827]">
                                        {mode === "create" ? "Tambah Data WO-WT" : "Edit Data WO-WT"}
                                    </h2>
                                </div>
                                <button
                                    ref={closeRef}
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form body */}
                            <form id="wowt-form" onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
                                {/* Row: Tanggal + Wavepick */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Tanggal" htmlFor="wowt-tanggal" error={errors.tanggal}>
                                        <input
                                            id="wowt-tanggal" type="date"
                                            value={values.tanggal}
                                            onChange={(e) => handleChange("tanggal", e.target.value)}
                                            disabled={isBusy} required
                                            aria-describedby={errors.tanggal ? "wowt-tanggal-error" : undefined}
                                            aria-invalid={!!errors.tanggal}
                                            className={errors.tanggal ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                    <Field label="Wavepick" htmlFor="wowt-wavepick" error={errors.wavepick}>
                                        <input
                                            id="wowt-wavepick" type="text"
                                            value={values.wavepick}
                                            onChange={(e) => handleChange("wavepick", e.target.value)}
                                            placeholder="Contoh: WP-001"
                                            disabled={isBusy} required
                                            aria-describedby={errors.wavepick ? "wowt-wavepick-error" : undefined}
                                            aria-invalid={!!errors.wavepick}
                                            className={errors.wavepick ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                </div>

                                {/* Row: ZWP1 + ZWP2 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="ZWP1 (%)" htmlFor="wowt-zwp1" error={errors.zwp1}>
                                        <input
                                            id="wowt-zwp1" type="number" min="0" max="100" step="0.1"
                                            value={values.zwp1}
                                            onChange={(e) => handleChange("zwp1", e.target.value)}
                                            placeholder="0.0"
                                            disabled={isBusy} required
                                            aria-describedby={errors.zwp1 ? "wowt-zwp1-error" : undefined}
                                            aria-invalid={!!errors.zwp1}
                                            className={errors.zwp1 ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                    <Field label="ZWP2 (%)" htmlFor="wowt-zwp2" error={errors.zwp2}>
                                        <input
                                            id="wowt-zwp2" type="number" min="0" max="100" step="0.1"
                                            value={values.zwp2}
                                            onChange={(e) => handleChange("zwp2", e.target.value)}
                                            placeholder="0.0"
                                            disabled={isBusy} required
                                            aria-describedby={errors.zwp2 ? "wowt-zwp2-error" : undefined}
                                            aria-invalid={!!errors.zwp2}
                                            className={errors.zwp2 ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                </div>

                                {/* Row: ZWP4 + ZWP5 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="ZWP4 (%)" htmlFor="wowt-zwp4" error={errors.zwp4}>
                                        <input
                                            id="wowt-zwp4" type="number" min="0" max="100" step="0.1"
                                            value={values.zwp4}
                                            onChange={(e) => handleChange("zwp4", e.target.value)}
                                            placeholder="0.0"
                                            disabled={isBusy} required
                                            aria-describedby={errors.zwp4 ? "wowt-zwp4-error" : undefined}
                                            aria-invalid={!!errors.zwp4}
                                            className={errors.zwp4 ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                    <Field label="ZWP5 (%)" htmlFor="wowt-zwp5" error={errors.zwp5}>
                                        <input
                                            id="wowt-zwp5" type="number" min="0" max="100" step="0.1"
                                            value={values.zwp5}
                                            onChange={(e) => handleChange("zwp5", e.target.value)}
                                            placeholder="0.0"
                                            disabled={isBusy} required
                                            aria-describedby={errors.zwp5 ? "wowt-zwp5-error" : undefined}
                                            aria-invalid={!!errors.zwp5}
                                            className={errors.zwp5 ? INPUT_ERROR : INPUT_NORMAL}
                                        />
                                    </Field>
                                </div>

                                {/* WO-WT Global preview (read-only, auto-calculated) */}
                                <div className="rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <BarChart2 size={14} className="text-[#64748B] shrink-0" aria-hidden="true" />
                                        <span className="text-xs font-medium text-[#64748B]">WO-WT Global</span>
                                        <span className="text-[10px] text-[#9CA3AF]">(ZWP1+ZWP2+ZWP4+ZWP5)÷4</span>
                                    </div>
                                    <span
                                        aria-live="polite"
                                        aria-label={`WO-WT Global: ${global != null ? `${global.toFixed(1)}%` : "belum tersedia"}`}
                                        className={`text-sm font-bold tabular-nums ${global == null ? "text-[#9CA3AF]"
                                                : global >= 90 ? "text-emerald-600"
                                                    : global >= 80 ? "text-blue-600"
                                                        : "text-red-500"
                                            }`}
                                    >
                                        {global != null ? `${global.toFixed(1)}%` : "—"}
                                    </span>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button
                                    type="button" onClick={onClose} disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit" form="wowt-form" disabled={saveDisabled}
                                    aria-busy={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                                >
                                    {isBusy ? (
                                        <svg className="animate-spin w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : null}
                                    {isBusy ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default WOWTModal;
