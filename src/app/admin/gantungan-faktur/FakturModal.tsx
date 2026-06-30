"use client";

/**
 * FakturModal — Create / Edit modal for Gantungan Faktur.
 *
 * Fields (Excel-aligned):
 *   Tanggal | Date | PAY TERMS | CUSTOMER | NAMA TOKO
 *   SD DOCUMENT | SALES DOC | NET VALUE | KETERANGAN DARI TRANSPORT
 *
 * Validation:
 *   - All fields required
 *   - NET VALUE must be numeric ≥ 0
 *   - SALES DOC must be unique (checked via existingSalesDocs prop)
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import type { FakturRecord, FakturFormValues, FakturFormErrors, CrudMode } from "./types";

// ─── Currency helpers ─────────────────────────────────────────────────────────

export function parseCurrency(raw: string): number {
    const cleaned = raw.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
}

function formatCurrencyInput(raw: string): string {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return parseInt(digits, 10).toLocaleString("id-ID");
}

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

// ─── Initial / conversion helpers ────────────────────────────────────────────

const EMPTY: FakturFormValues = {
    tanggal: "", date: "", payTerms: "", customer: "",
    namaToko: "", sdDocument: "", salesDoc: "", netValue: "",
    keteranganTransport: "",
};

function toFormValues(r: FakturRecord): FakturFormValues {
    return {
        tanggal: r.tanggal,
        date: r.date,
        payTerms: r.payTerms,
        customer: r.customer,
        namaToko: r.namaToko,
        sdDocument: r.sdDocument,
        salesDoc: r.salesDoc,
        netValue: r.netValue.toLocaleString("id-ID"),
        keteranganTransport: r.keteranganTransport,
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
    v: FakturFormValues,
    mode: CrudMode,
    existingSalesDocs: string[],
    originalSalesDoc?: string,
): FakturFormErrors {
    const errors: FakturFormErrors = {};
    if (!v.tanggal.trim()) errors.tanggal = "Tanggal harus diisi";
    if (!v.date.trim()) errors.date = "Date harus diisi";
    if (!v.payTerms.trim()) errors.payTerms = "PAY TERMS harus diisi";
    if (!v.customer.trim()) errors.customer = "CUSTOMER harus diisi";
    if (!v.namaToko.trim()) errors.namaToko = "NAMA TOKO harus diisi";
    if (!v.sdDocument.trim()) errors.sdDocument = "SD DOCUMENT harus diisi";
    if (!v.salesDoc.trim()) errors.salesDoc = "SALES DOC harus diisi";
    if (!v.keteranganTransport.trim()) errors.keteranganTransport = "Keterangan harus diisi";

    if (!v.netValue.trim()) {
        errors.netValue = "NET VALUE harus diisi";
    } else {
        const num = parseCurrency(v.netValue);
        if (num < 0) errors.netValue = "NET VALUE tidak boleh negatif";
    }

    // SALES DOC uniqueness
    if (v.salesDoc.trim()) {
        const isDup = mode === "create"
            ? existingSalesDocs.includes(v.salesDoc.trim())
            : existingSalesDocs.includes(v.salesDoc.trim()) && v.salesDoc.trim() !== originalSalesDoc;
        if (isDup) errors.salesDoc = "SALES DOC sudah digunakan";
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

function Field({ label, htmlFor, error, required = true, children }: {
    label: string; htmlFor: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}
                {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
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

export interface FakturModalProps {
    open: boolean;
    mode: CrudMode;
    record?: FakturRecord;
    saving: boolean;
    existingSalesDocs: string[];
    onSave: (values: FakturFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FakturModal({
    open, mode, record, saving, existingSalesDocs, onSave, onClose,
}: FakturModalProps) {
    const [values, setValues] = useState<FakturFormValues>({ ...EMPTY, tanggal: todayIso(), date: todayIso() });
    const [errors, setErrors] = useState<FakturFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset / pre-populate
    useEffect(() => {
        if (!open) return;
        setValues(mode === "edit" && record
            ? toFormValues(record)
            : { ...EMPTY, tanggal: todayIso(), date: todayIso() }
        );
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    // Auto-focus
    useEffect(() => {
        if (open) {
            const id = setTimeout(() => closeRef.current?.focus(), 50);
            return () => clearTimeout(id);
        }
    }, [open]);

    // Escape + focus trap
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0]; const last = focusable[focusable.length - 1];
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const handleChange = useCallback((field: keyof FakturFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }, []);

    const handleNetValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange("netValue", formatCurrencyInput(e.target.value));
    }, [handleChange]);

    const isBusy = submitting || saving;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(values, mode, existingSalesDocs, record?.salesDoc);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try { await onSave(values); } finally { setSubmitting(false); }
    }, [values, mode, existingSalesDocs, record, onSave]);

    const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
    }, [onClose, isBusy]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="faktur-bg"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBackdrop}
                    />
                    <motion.div key="faktur-dlg"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={handleBackdrop}
                    >
                        <div
                            ref={dialogRef}
                            role="dialog" aria-modal="true" aria-labelledby="faktur-modal-title"
                            className="relative w-full max-w-2xl bg-white rounded-[18px] shadow-xl my-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <FileText size={16} className="text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <h2 id="faktur-modal-title" className="text-sm font-bold text-[#111827]">
                                        {mode === "create" ? "Tambah Data Faktur" : "Edit Data Faktur"}
                                    </h2>
                                </div>
                                <button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form id="faktur-form" onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">

                                {/* Row 1: Tanggal + Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Tanggal" htmlFor="fk-tanggal" error={errors.tanggal}>
                                        <input id="fk-tanggal" type="date" value={values.tanggal}
                                            onChange={(e) => handleChange("tanggal", e.target.value)}
                                            disabled={isBusy} required className={errors.tanggal ? IE : IN} />
                                    </Field>
                                    <Field label="Date" htmlFor="fk-date" error={errors.date}>
                                        <input id="fk-date" type="date" value={values.date}
                                            onChange={(e) => handleChange("date", e.target.value)}
                                            disabled={isBusy} required className={errors.date ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 2: PAY TERMS + CUSTOMER */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="PAY TERMS" htmlFor="fk-payterms" error={errors.payTerms}>
                                        <input id="fk-payterms" type="text" value={values.payTerms}
                                            onChange={(e) => handleChange("payTerms", e.target.value)}
                                            placeholder="Contoh: NET 30" disabled={isBusy} required
                                            className={errors.payTerms ? IE : IN} />
                                    </Field>
                                    <Field label="CUSTOMER" htmlFor="fk-customer" error={errors.customer}>
                                        <input id="fk-customer" type="text" value={values.customer}
                                            onChange={(e) => handleChange("customer", e.target.value)}
                                            placeholder="Nama customer" disabled={isBusy} required
                                            className={errors.customer ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 3: NAMA TOKO + SD DOCUMENT */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="NAMA TOKO" htmlFor="fk-namatoko" error={errors.namaToko}>
                                        <input id="fk-namatoko" type="text" value={values.namaToko}
                                            onChange={(e) => handleChange("namaToko", e.target.value)}
                                            placeholder="Nama toko" disabled={isBusy} required
                                            className={errors.namaToko ? IE : IN} />
                                    </Field>
                                    <Field label="SD DOCUMENT" htmlFor="fk-sddoc" error={errors.sdDocument}>
                                        <input id="fk-sddoc" type="text" value={values.sdDocument}
                                            onChange={(e) => handleChange("sdDocument", e.target.value)}
                                            placeholder="SD Document" disabled={isBusy} required
                                            className={errors.sdDocument ? IE : IN} />
                                    </Field>
                                </div>

                                {/* Row 4: SALES DOC + NET VALUE */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="SALES DOC" htmlFor="fk-salesdoc" error={errors.salesDoc}>
                                        <input id="fk-salesdoc" type="text" value={values.salesDoc}
                                            onChange={(e) => handleChange("salesDoc", e.target.value)}
                                            placeholder="Sales Doc (unik)" disabled={isBusy} required
                                            className={errors.salesDoc ? IE : IN} />
                                    </Field>
                                    <Field label="NET VALUE (Rp)" htmlFor="fk-netvalue" error={errors.netValue}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] font-medium">Rp</span>
                                            <input id="fk-netvalue" type="text" inputMode="numeric"
                                                value={values.netValue}
                                                onChange={handleNetValueChange}
                                                placeholder="0" disabled={isBusy} required
                                                className={`${errors.netValue ? IE : IN} pl-8`} />
                                        </div>
                                    </Field>
                                </div>

                                {/* KETERANGAN DARI TRANSPORT — full width */}
                                <Field label="KETERANGAN DARI TRANSPORT" htmlFor="fk-ket" error={errors.keteranganTransport}>
                                    <textarea id="fk-ket" rows={2}
                                        value={values.keteranganTransport}
                                        onChange={(e) => handleChange("keteranganTransport", e.target.value)}
                                        placeholder="Keterangan dari transport..." disabled={isBusy} required
                                        className={`${errors.keteranganTransport ? IE : IN} h-auto py-2.5 resize-none`} />
                                </Field>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={onClose}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
                                    Batal
                                </button>
                                <button type="submit" form="faktur-form" disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
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

export default FakturModal;
