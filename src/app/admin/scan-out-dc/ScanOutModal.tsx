"use client";

/**
 * ScanOutModal — Create / Edit modal untuk Scan Out DC.
 *
 * Judul: "Tambah Scan Out" | "Edit Scan Out"
 * Fields: Tanggal | Vendor | Nopol | Jam Scan Out | Jam Scan In | Lead Time (readonly)
 * Lead Time dihitung otomatis dari Jam Scan In - Jam Scan Out.
 */

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type {
    ScanOutEntry,
    ScanOutFormValues,
    ScanOutFormErrors,
    CrudMode,
} from "./types";
import { calcLeadTime } from "./scanOutStore";
import { VENDOR_OPTIONS } from "./mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY: ScanOutFormValues = {
    tanggal: "",
    nopol: "",
    vendor: "",
    jamScanOut: "",
    jamScanIn: "",
};

function toForm(r: ScanOutEntry): ScanOutFormValues {
    return {
        tanggal: r.tanggal,
        nopol: r.nopol,
        vendor: r.vendor,
        jamScanOut: r.jamScanOut,
        jamScanIn: r.jamScanIn,
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateScanOutForm(values: ScanOutFormValues): ScanOutFormErrors {
    const errors: ScanOutFormErrors = {};

    if (!values.tanggal.trim()) errors.tanggal = "Tanggal wajib diisi.";
    if (!values.vendor.trim()) errors.vendor = "Vendor wajib dipilih.";
    if (!values.nopol.trim()) errors.nopol = "Nopol wajib diisi.";
    if (!values.jamScanOut.trim()) {
        errors.jamScanOut = "Jam Scan Out wajib diisi.";
    }
    if (!values.jamScanIn.trim()) {
        errors.jamScanIn = "Jam Scan In wajib diisi.";
    } else if (values.jamScanOut && values.jamScanIn < values.jamScanOut) {
        errors.jamScanIn = "Jam Scan In tidak boleh lebih kecil dari Jam Scan Out.";
    }

    return errors;
}

// ─── Input styles ─────────────────────────────────────────────────────────────

const BASE =
    "w-full px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all" +
    " focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" +
    " disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";

const inputCls = (err: boolean) =>
    `${BASE} h-10 ${err ? "border-red-400 focus:border-red-400" : "border-[#E5E7EB]"}`;

function Field({
    label, htmlFor, required = true, error, children,
}: {
    label: string; htmlFor: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}
                {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
                {!required && <span className="text-[#9CA3AF] ml-1 font-normal">(readonly)</span>}
            </label>
            {children}
            {error && (
                <p id={`${htmlFor}-err`} role="alert" className="text-xs text-red-500 flex items-start gap-1">
                    <span className="mt-px shrink-0">⚠</span>{error}
                </p>
            )}
        </div>
    );
}

function Spinner() {
    return (
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ScanOutModalProps {
    open: boolean;
    mode: CrudMode;
    record?: ScanOutEntry;
    saving: boolean;
    onSave: (values: ScanOutFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ScanOutModalInner({ open, mode, record, saving, onSave, onClose }: ScanOutModalProps) {
    const [values, setValues] = useState<ScanOutFormValues>({ ...EMPTY, tanggal: todayIso() });
    const [errors, setErrors] = useState<ScanOutFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Computed lead time
    const leadTime = calcLeadTime(values.jamScanOut, values.jamScanIn);

    useEffect(() => {
        if (!open) return;
        setValues(mode === "edit" && record ? toForm(record) : { ...EMPTY, tanggal: todayIso() });
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => closeRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const busy = submitting || saving;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) { e.preventDefault(); onClose(); return; }
            if (e.key === "Tab" && dialogRef.current) {
                const els = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
                );
                const first = els[0]; const last = els[els.length - 1];
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, saving, submitting, onClose]);

    const isBusy = submitting || saving;

    const ch = useCallback((f: keyof ScanOutFormValues, v: string) => {
        setValues((prev) => ({ ...prev, [f]: v }));
        setErrors((prev) => { const n = { ...prev }; delete n[f]; return n; });
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateScanOutForm(values);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try { await onSave(values); } finally { setSubmitting(false); }
    }, [values, onSave]);

    const handleClose = useCallback(() => { if (!isBusy) onClose(); }, [isBusy, onClose]);
    const handleBg = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
    }, [isBusy, onClose]);

    const title = mode === "create" ? "Tambah Scan Out" : "Edit Scan Out";

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="som-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBg} />
                    <motion.div key="som-dlg" initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleBg}>
                        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="som-title"
                            className="relative w-full max-w-lg bg-white rounded-[18px] shadow-xl my-4"
                            onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2 id="som-title" className="text-sm font-bold text-[#111827]">{title}</h2>
                                <button ref={closeRef} type="button" onClick={handleClose} disabled={isBusy}
                                    aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form id="som-form" onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
                                {/* Row 1: Tanggal + Vendor */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Tanggal" htmlFor="som-tanggal" error={errors.tanggal}>
                                        <input id="som-tanggal" type="date" value={values.tanggal}
                                            onChange={(e) => ch("tanggal", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.tanggal)} />
                                    </Field>
                                    <Field label="Vendor" htmlFor="som-vendor" error={errors.vendor}>
                                        <select id="som-vendor" value={values.vendor}
                                            onChange={(e) => ch("vendor", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.vendor)}>
                                            <option value="">Pilih Vendor</option>
                                            {VENDOR_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* Nopol */}
                                <Field label="Nopol" htmlFor="som-nopol" error={errors.nopol}>
                                    <input id="som-nopol" type="text" value={values.nopol}
                                        onChange={(e) => ch("nopol", e.target.value)}
                                        placeholder="Contoh: B 9077 UXX" disabled={isBusy} required
                                        className={inputCls(!!errors.nopol)} />
                                </Field>

                                {/* Row 2: Jam Scan Out + Jam Scan In */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Jam Scan Out" htmlFor="som-out" error={errors.jamScanOut}>
                                        <input id="som-out" type="time" value={values.jamScanOut}
                                            onChange={(e) => ch("jamScanOut", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.jamScanOut)} />
                                    </Field>
                                    <Field label="Jam Scan In DC" htmlFor="som-in" error={errors.jamScanIn}>
                                        <input id="som-in" type="time" value={values.jamScanIn}
                                            onChange={(e) => ch("jamScanIn", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.jamScanIn)} />
                                    </Field>
                                </div>

                                {/* Lead Time — readonly */}
                                <Field label="Lead Time" htmlFor="som-lead" required={false}>
                                    <input id="som-lead" type="text" value={leadTime} readOnly disabled
                                        className={`${inputCls(false)} bg-[#F9FAFB] text-[#64748B] font-mono cursor-not-allowed`}
                                        aria-describedby="som-lead-hint" />
                                    <p id="som-lead-hint" className="text-[10px] text-[#9CA3AF] -mt-0.5">
                                        Dihitung otomatis: Jam Scan In − Jam Scan Out
                                    </p>
                                </Field>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-[18px]">
                                <button type="button" onClick={handleClose} disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="submit" form="som-form" disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                                    {isBusy ? <><Spinner />Menyimpan...</> : mode === "create" ? "Simpan" : "Perbarui"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default memo(ScanOutModalInner);
