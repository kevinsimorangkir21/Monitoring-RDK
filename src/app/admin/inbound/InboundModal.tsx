"use client";

/**
 * InboundModal — Create / Edit modal.
 *
 * Fields (9):
 *   Tanggal | Shifting | Nomor_FO | Nopol | Plant Pabrik |
 *   Jenis_Bongkaran | Total Box | Nomor GR | Total Slipsheet
 *
 * Validation:
 *   - All fields required
 *   - Nomor FO: unique (caller passes existingFOs, excludes own on edit)
 *   - Total Box: integer ≥ 0
 *   - Total Slipsheet: integer ≥ 0
 */

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { InboundRecord, InboundFormValues, InboundFormErrors, CrudMode } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIFTING_OPTIONS = ["Shift 1", "Shift 2", "Shift 3"];
const PLANT_OPTIONS = ["PAS", "MIM", "LION", "TAS", "SMU2", "AMG", "KAS", "BAS", "CALBEE", "DAM", "HAS"];
const JENIS_OPTIONS: string[] = ["SLIPSHEET", "CURAH"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string { return new Date().toISOString().slice(0, 10); }
function nowDatetime(): string {
    const n = new Date();
    return `${n.toISOString().slice(0, 10)} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:00`;
}

const EMPTY: InboundFormValues = {
    tanggal: "", tanggalDatetime: "", shifting: "",
    nomorFO: "", nopol: "", plantPabrik: "", jenisBongkaran: "",
    totalBox: "", nomorGR: "", totalSlipsheet: "",
};

function toForm(r: InboundRecord): InboundFormValues {
    return {
        tanggal: r.tanggal, tanggalDatetime: r.tanggalDatetime, shifting: r.shifting,
        nomorFO: r.nomorFO, nopol: r.nopol, plantPabrik: r.plantPabrik,
        jenisBongkaran: r.jenisBongkaran, totalBox: String(r.totalBox),
        nomorGR: r.nomorGR, totalSlipsheet: String(r.totalSlipsheet),
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateInboundForm(values: InboundFormValues, existingFOs: string[]): InboundFormErrors {
    const errors: InboundFormErrors = {};
    const required = Object.keys(EMPTY) as Array<keyof InboundFormValues>;

    for (const f of required) {
        if (!values[f].trim()) errors[f] = "Field ini wajib diisi.";
    }

    if (values.totalBox.trim() && !errors.totalBox) {
        const n = Number(values.totalBox);
        if (!Number.isInteger(n) || n < 0) errors.totalBox = "Total Box harus angka bulat ≥ 0.";
    }

    if (values.totalSlipsheet.trim() && !errors.totalSlipsheet) {
        const n = Number(values.totalSlipsheet);
        if (!Number.isInteger(n) || n < 0) errors.totalSlipsheet = "Total Slipsheet harus angka bulat ≥ 0.";
    }

    if (values.nomorFO.trim() && !errors.nomorFO) {
        if (existingFOs.map((f) => f.trim()).includes(values.nomorFO.trim())) {
            errors.nomorFO = "Nomor FO sudah terdaftar.";
        }
    }

    return errors;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BASE = "w-full h-10 px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";
const IN = `${BASE} border-[#E5E7EB]`;
const IE = `${BASE} border-red-400 focus:border-red-400 focus:ring-red-100`;

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
            {children}
            {error && <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-500 flex items-start gap-1"><span className="mt-px shrink-0">⚠</span>{error}</p>}
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InboundModalProps {
    open: boolean;
    mode: CrudMode;
    record?: InboundRecord;
    saving: boolean;
    existingFOs: string[];
    onSave: (values: InboundFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function InboundModalInner({ open, mode, record, saving, existingFOs, onSave, onClose }: InboundModalProps) {
    const [values, setValues] = useState<InboundFormValues>({ ...EMPTY, tanggal: todayIso(), tanggalDatetime: nowDatetime() });
    const [errors, setErrors] = useState<InboundFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        setValues(mode === "edit" && record ? toForm(record) : { ...EMPTY, tanggal: todayIso(), tanggalDatetime: nowDatetime() });
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    useEffect(() => {
        if (open) { const t = setTimeout(() => closeRef.current?.focus(), 50); return () => clearTimeout(t); }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const busy = submitting || saving;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) { e.preventDefault(); onClose(); return; }
            if (e.key === "Tab" && dialogRef.current) {
                const els = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])');
                const first = els[0], last = els[els.length - 1];
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, saving, submitting, onClose]);

    const ch = useCallback((f: keyof InboundFormValues, v: string) => {
        setValues((prev) => ({ ...prev, [f]: v }));
        setErrors((prev) => { const n = { ...prev }; delete n[f]; return n; });
    }, []);

    const isBusy = submitting || saving;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateInboundForm(values, existingFOs);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try { await onSave(values); } finally { setSubmitting(false); }
    }, [values, existingFOs, onSave]);

    const handleClose = useCallback(() => { if (!isBusy) onClose(); }, [onClose, isBusy]);
    const handleBg = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget && !isBusy) onClose(); }, [onClose, isBusy]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="ib-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" onClick={handleBg} />
                    <motion.div key="ib-dlg" initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleBg}>
                        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ib-modal-title"
                            className="relative w-full max-w-2xl bg-white rounded-[18px] shadow-xl my-4" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2 id="ib-modal-title" className="text-sm font-bold text-[#111827]">
                                    {mode === "create" ? "Tambah Inbound" : "Edit Inbound"}
                                </h2>
                                <button ref={closeRef} type="button" onClick={handleClose} disabled={isBusy} aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form id="ib-form" onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
                                {/* Row 1: Tanggal + Tanggal Datetime */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Tanggal" htmlFor="ib-tanggal" error={errors.tanggal}>
                                        <input id="ib-tanggal" type="date" value={values.tanggal}
                                            onChange={(e) => ch("tanggal", e.target.value)}
                                            disabled={isBusy} required className={errors.tanggal ? IE : IN} />
                                    </Field>
                                    <Field label="Tanggal (DateTime)" htmlFor="ib-dt" error={errors.tanggalDatetime}>
                                        <input id="ib-dt" type="text" value={values.tanggalDatetime}
                                            onChange={(e) => ch("tanggalDatetime", e.target.value)}
                                            placeholder="YYYY-MM-DD HH:mm:ss"
                                            disabled={isBusy} required className={errors.tanggalDatetime ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 2: Shifting + Nomor FO */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Shifting" htmlFor="ib-shifting" error={errors.shifting}>
                                        <select id="ib-shifting" value={values.shifting} onChange={(e) => ch("shifting", e.target.value)}
                                            disabled={isBusy} required className={errors.shifting ? IE : IN}>
                                            <option value="">Pilih Shifting</option>
                                            {SHIFTING_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Nomor FO" htmlFor="ib-nomorfo" error={errors.nomorFO}>
                                        <input id="ib-nomorfo" type="text" value={values.nomorFO}
                                            onChange={(e) => ch("nomorFO", e.target.value)}
                                            placeholder="Contoh: 3100061092"
                                            disabled={isBusy} required className={errors.nomorFO ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 3: Nopol + Plant Pabrik */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Nopol" htmlFor="ib-nopol" error={errors.nopol}>
                                        <input id="ib-nopol" type="text" value={values.nopol}
                                            onChange={(e) => ch("nopol", e.target.value)}
                                            placeholder="Contoh: B9178SEV"
                                            disabled={isBusy} required className={errors.nopol ? IE : IN} />
                                    </Field>
                                    <Field label="Plant Pabrik" htmlFor="ib-plant" error={errors.plantPabrik}>
                                        <select id="ib-plant" value={values.plantPabrik} onChange={(e) => ch("plantPabrik", e.target.value)}
                                            disabled={isBusy} required className={errors.plantPabrik ? IE : IN}>
                                            <option value="">Pilih Plant Pabrik</option>
                                            {PLANT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* Row 4: Jenis Bongkaran + Total Box */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Jenis Bongkaran" htmlFor="ib-jenis" error={errors.jenisBongkaran}>
                                        <select id="ib-jenis" value={values.jenisBongkaran} onChange={(e) => ch("jenisBongkaran", e.target.value)}
                                            disabled={isBusy} required className={errors.jenisBongkaran ? IE : IN}>
                                            <option value="">Pilih Jenis Bongkaran</option>
                                            {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Total Box" htmlFor="ib-totalbox" error={errors.totalBox}>
                                        <input id="ib-totalbox" type="number" min="0" step="1" value={values.totalBox}
                                            onChange={(e) => ch("totalBox", e.target.value)}
                                            placeholder="0" disabled={isBusy} required className={errors.totalBox ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 5: Nomor GR + Total Slipsheet */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Nomor GR" htmlFor="ib-nomorgr" error={errors.nomorGR}>
                                        <input id="ib-nomorgr" type="text" value={values.nomorGR}
                                            onChange={(e) => ch("nomorGR", e.target.value)}
                                            placeholder="Contoh: 1001427558"
                                            disabled={isBusy} required className={errors.nomorGR ? IE : IN} />
                                    </Field>
                                    <Field label="Total Slipsheet" htmlFor="ib-slipsheet" error={errors.totalSlipsheet}>
                                        <input id="ib-slipsheet" type="number" min="0" step="1" value={values.totalSlipsheet}
                                            onChange={(e) => ch("totalSlipsheet", e.target.value)}
                                            placeholder="0" disabled={isBusy} required className={errors.totalSlipsheet ? IE : IN} />
                                    </Field>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-[18px]">
                                <button type="button" onClick={handleClose} disabled={isBusy}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="submit" form="ib-form" disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                                    {isBusy ? (
                                        <><svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>Menyimpan...</>
                                    ) : mode === "create" ? "Simpan" : "Perbarui"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default memo(InboundModalInner);
