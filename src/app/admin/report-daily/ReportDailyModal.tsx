"use client";

/**
 * ReportDailyModal — Create / Edit modal untuk Report Daily Transport.
 *
 * Judul: "Tambah Report Daily" (create) | "Edit Report Daily" (edit)
 * Form: delegasi ke ReportDailyForm
 * Accessibility: focus trap, Escape key, scroll lock
 */

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { TransportRecord, TransportFormValues, TransportFormErrors, CrudMode } from "./types";
import ReportDailyForm, { validateReportDailyForm } from "./ReportDailyForm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY: TransportFormValues = {
    tanggal: "",
    division: "",
    jenisReport: "",
    keterangan: "",
    informasiTambahan: "",
};

function toForm(r: TransportRecord): TransportFormValues {
    return {
        tanggal: r.tanggal,
        division: r.division,
        jenisReport: r.jenisReport,
        keterangan: r.keterangan,
        informasiTambahan: r.informasiTambahan,
    };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
    return (
        <svg
            className="animate-spin w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportDailyModalProps {
    open: boolean;
    mode: CrudMode;
    record?: TransportRecord;
    saving: boolean;
    onSave: (values: TransportFormValues) => Promise<void>;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ReportDailyModalInner({
    open,
    mode,
    record,
    saving,
    onSave,
    onClose,
}: ReportDailyModalProps) {
    const [values, setValues] = useState<TransportFormValues>({
        ...EMPTY,
        tanggal: todayIso(),
    });
    const [errors, setErrors] = useState<TransportFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset form saat modal dibuka
    useEffect(() => {
        if (!open) return;
        setValues(
            mode === "edit" && record ? toForm(record) : { ...EMPTY, tanggal: todayIso() }
        );
        setErrors({});
        setSubmitting(false);
    }, [open, mode, record]);

    // Focus ke close button
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => closeRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Keyboard: Escape + Tab trap
    useEffect(() => {
        if (!open) return;
        const busy = submitting || saving;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key === "Tab" && dialogRef.current) {
                const els = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
                );
                const first = els[0];
                const last = els[els.length - 1];
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

    const isBusy = submitting || saving;

    const handleChange = useCallback((field: keyof TransportFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const errs = validateReportDailyForm(values);
            if (Object.keys(errs).length) {
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

    const handleClose = useCallback(() => {
        if (!isBusy) onClose();
    }, [isBusy, onClose]);

    const handleBg = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && !isBusy) onClose();
        },
        [isBusy, onClose]
    );

    const title = mode === "create" ? "Tambah Report Daily" : "Edit Report Daily";

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="rdm-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                        onClick={handleBg}
                    />

                    {/* Dialog */}
                    <motion.div
                        key="rdm-dlg"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={handleBg}
                    >
                        <div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="rdm-title"
                            className="relative w-full max-w-lg bg-white rounded-[18px] shadow-xl my-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2 id="rdm-title" className="text-sm font-bold text-[#111827]">
                                    {title}
                                </h2>
                                <button
                                    ref={closeRef}
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isBusy}
                                    aria-label="Tutup modal"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <ReportDailyForm
                                id="rdm-form"
                                values={values}
                                errors={errors}
                                disabled={isBusy}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                            />

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
                                    form="rdm-form"
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                >
                                    {isBusy ? (
                                        <>
                                            <Spinner />
                                            Menyimpan...
                                        </>
                                    ) : mode === "create" ? (
                                        "Simpan"
                                    ) : (
                                        "Perbarui"
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

export default memo(ReportDailyModalInner);
