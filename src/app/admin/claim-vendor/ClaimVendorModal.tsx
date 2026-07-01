"use client";

/**
 * ClaimVendorModal — Create / Edit modal untuk Claim Vendor.
 *
 * Judul: "Tambah Claim Vendor" | "Edit Claim Vendor"
 * Fields: Tanggal | Vendor | No Mobil | Total Claim | Sudah Dibayar |
 *         Belum Dibayar (readonly) | Status (auto) | Keterangan (optional)
 */

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type {
    ClaimEntry, ClaimFormValues, ClaimFormErrors, CrudMode,
} from "./types";
import { VENDOR_OPTIONS } from "./mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

function parseNum(s: string): number {
    const n = parseFloat(s.replace(/[^0-9.]/g, ""));
    return isFinite(n) && n >= 0 ? n : 0;
}

function fmtInput(s: string): string {
    // Strip non-numeric, allow decimals
    return s.replace(/[^0-9]/g, "");
}

function fmtRpDisplay(v: number): string {
    if (!isFinite(v) || v < 0) return "Rp 0";
    return `Rp ${v.toLocaleString("id-ID")}`;
}

const EMPTY: ClaimFormValues = {
    tanggal: "", vendor: "", noMobil: "",
    totalClaim: "", sudahDibayar: "",
    status: "Pending", keterangan: "",
};

function toForm(r: ClaimEntry): ClaimFormValues {
    return {
        tanggal: r.tanggal,
        vendor: r.vendor,
        noMobil: r.noMobil,
        totalClaim: String(r.totalClaim),
        sudahDibayar: String(r.sudahDibayar),
        status: r.status,
        keterangan: r.keterangan,
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateClaimForm(values: ClaimFormValues): ClaimFormErrors {
    const errors: ClaimFormErrors = {};
    if (!values.tanggal.trim()) errors.tanggal = "Tanggal wajib diisi.";
    if (!values.vendor.trim()) errors.vendor = "Vendor wajib diisi.";
    if (!values.noMobil.trim()) errors.noMobil = "No Mobil wajib diisi.";
    if (!values.totalClaim.trim()) {
        errors.totalClaim = "Total Claim wajib diisi.";
    } else if (parseNum(values.totalClaim) < 0) {
        errors.totalClaim = "Total Claim tidak boleh negatif.";
    }
    if (values.sudahDibayar.trim()) {
        const total = parseNum(values.totalClaim);
        const dibayar = parseNum(values.sudahDibayar);
        if (dibayar > total) {
            errors.sudahDibayar = "Sudah Dibayar tidak boleh lebih besar dari Total Claim.";
        }
    }
    return errors;
}

// ─── Input styles ─────────────────────────────────────────────────────────────

const BASE = "w-full px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all" +
    " focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" +
    " disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";

const inputCls = (err: boolean) =>
    `${BASE} h-10 ${err ? "border-red-400 focus:border-red-400" : "border-[#E5E7EB]"}`;

function Field({ label, htmlFor, required = true, hint, error, children }: {
    label: string; htmlFor: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}
                {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
                {!required && <span className="text-[#9CA3AF] ml-1 font-normal">(opsional)</span>}
            </label>
            {children}
            {hint && <p className="text-[10px] text-[#9CA3AF] -mt-0.5">{hint}</p>}
            {error && (
                <p role="alert" className="text-xs text-red-500 flex items-start gap-1">
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

export interface ClaimVendorModalProps {
    open: boolean;
    mode: CrudMode;
    record?: ClaimEntry;
    saving: boolean;
    onSave: (values: ClaimFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ClaimVendorModalInner({ open, mode, record, saving, onSave, onClose }: ClaimVendorModalProps) {
    const [values, setValues] = useState<ClaimFormValues>({ ...EMPTY, tanggal: todayIso() });
    const [errors, setErrors] = useState<ClaimFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Computed
    const totalNum = parseNum(values.totalClaim);
    const dibayarNum = parseNum(values.sudahDibayar);
    const belumNum = Math.max(0, totalNum - dibayarNum);
    const autoStatus = belumNum === 0 && totalNum > 0 ? "Lunas" : "Pending";

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

    const ch = useCallback((f: keyof ClaimFormValues, v: string) => {
        setValues((prev) => {
            const next = { ...prev, [f]: v };
            // Auto-compute belumDibayar/status
            const t = parseNum(f === "totalClaim" ? v : prev.totalClaim);
            const d = parseNum(f === "sudahDibayar" ? v : prev.sudahDibayar);
            next.status = (t > 0 && Math.max(0, t - d) === 0) ? "Lunas" : "Pending";
            return next;
        });
        setErrors((prev) => { const n = { ...prev }; delete n[f]; return n; });
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateClaimForm(values);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        // Inject auto status
        const finalValues = { ...values, status: autoStatus };
        setSubmitting(true);
        try { await onSave(finalValues); } finally { setSubmitting(false); }
    }, [values, autoStatus, onSave]);

    const handleClose = useCallback(() => { if (!isBusy) onClose(); }, [isBusy, onClose]);
    const handleBg = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
    }, [isBusy, onClose]);

    const title = mode === "create" ? "Tambah Claim Vendor" : "Edit Claim Vendor";

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="cvm-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBg} />
                    <motion.div key="cvm-dlg" initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleBg}>
                        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cvm-title"
                            className="relative w-full max-w-lg bg-white rounded-[18px] shadow-xl my-4"
                            onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2 id="cvm-title" className="text-sm font-bold text-[#111827]">{title}</h2>
                                <button ref={closeRef} type="button" onClick={handleClose} disabled={isBusy} aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form id="cvm-form" onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
                                {/* Row 1: Tanggal + Vendor */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Tanggal" htmlFor="cvm-tanggal" error={errors.tanggal}>
                                        <input id="cvm-tanggal" type="date" value={values.tanggal}
                                            onChange={(e) => ch("tanggal", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.tanggal)} />
                                    </Field>
                                    <Field label="Vendor" htmlFor="cvm-vendor" error={errors.vendor}>
                                        <select id="cvm-vendor" value={values.vendor}
                                            onChange={(e) => ch("vendor", e.target.value)}
                                            disabled={isBusy} required className={inputCls(!!errors.vendor)}>
                                            <option value="">Pilih Vendor</option>
                                            {VENDOR_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* No Mobil */}
                                <Field label="No Mobil" htmlFor="cvm-nopol" error={errors.noMobil}>
                                    <input id="cvm-nopol" type="text" value={values.noMobil}
                                        onChange={(e) => ch("noMobil", e.target.value)}
                                        placeholder="Contoh: B 9011 UXG"
                                        disabled={isBusy} required className={inputCls(!!errors.noMobil)} />
                                </Field>

                                {/* Row 2: Total Claim + Sudah Dibayar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Total Claim" htmlFor="cvm-total" error={errors.totalClaim}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-medium pointer-events-none">Rp</span>
                                            <input id="cvm-total" type="text" value={values.totalClaim}
                                                onChange={(e) => ch("totalClaim", fmtInput(e.target.value))}
                                                placeholder="0" disabled={isBusy} required
                                                className={`${inputCls(!!errors.totalClaim)} pl-8`} />
                                        </div>
                                        {values.totalClaim && (
                                            <p className="text-[10px] text-[#64748B]">{fmtRpDisplay(totalNum)}</p>
                                        )}
                                    </Field>
                                    <Field label="Sudah Dibayar" htmlFor="cvm-dibayar" error={errors.sudahDibayar}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-medium pointer-events-none">Rp</span>
                                            <input id="cvm-dibayar" type="text" value={values.sudahDibayar}
                                                onChange={(e) => ch("sudahDibayar", fmtInput(e.target.value))}
                                                placeholder="0" disabled={isBusy}
                                                className={`${inputCls(!!errors.sudahDibayar)} pl-8`} />
                                        </div>
                                        {values.sudahDibayar && (
                                            <p className="text-[10px] text-[#64748B]">{fmtRpDisplay(dibayarNum)}</p>
                                        )}
                                    </Field>
                                </div>

                                {/* Belum Dibayar (readonly) + Status (auto) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Belum Dibayar" htmlFor="cvm-belum" required={false}
                                        hint="Dihitung otomatis: Total Claim − Sudah Dibayar">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-medium pointer-events-none">Rp</span>
                                            <input id="cvm-belum" type="text" value={belumNum.toLocaleString("id-ID")}
                                                readOnly disabled className={`${inputCls(false)} pl-8 bg-[#F9FAFB] cursor-not-allowed font-mono`} />
                                        </div>
                                    </Field>
                                    <Field label="Status" htmlFor="cvm-status" required={false}
                                        hint={`Otomatis: ${autoStatus}`}>
                                        <input id="cvm-status" type="text" value={autoStatus} readOnly disabled
                                            className={`${inputCls(false)} bg-[#F9FAFB] cursor-not-allowed ${autoStatus === "Lunas" ? "text-[#16A34A]" : "text-amber-600"} font-semibold`} />
                                    </Field>
                                </div>

                                {/* Keterangan (optional) */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="cvm-ket" className="text-xs font-medium text-[#64748B]">
                                        Keterangan <span className="text-[#9CA3AF] font-normal">(opsional)</span>
                                    </label>
                                    <textarea id="cvm-ket" rows={2} value={values.keterangan}
                                        onChange={(e) => ch("keterangan", e.target.value)}
                                        placeholder="Keterangan tambahan..."
                                        disabled={isBusy}
                                        className={`${BASE} py-2.5 border-[#E5E7EB] resize-none`} />
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-[18px]">
                                <button type="button" onClick={handleClose} disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="submit" form="cvm-form" disabled={isBusy}
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

export default memo(ClaimVendorModalInner);
