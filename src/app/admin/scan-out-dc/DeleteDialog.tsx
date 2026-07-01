"use client";

/**
 * DeleteDialog — Konfirmasi hapus Scan Out DC.
 * Dialog: "Hapus data Scan Out?" / "Data yang dihapus tidak dapat dikembalikan."
 * Buttons: Batal | Hapus
 */

import { useEffect, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { ScanOutEntry } from "./types";

function Spinner() {
    return (
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

export interface DeleteDialogProps {
    open: boolean;
    record: ScanOutEntry | null;
    deleting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

function DeleteDialogInner({ open, record, deleting, onConfirm, onClose }: DeleteDialogProps) {
    const handleBg = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && !deleting) onClose();
        },
        [deleting, onClose]
    );

    useEffect(() => {
        if (!open) return;
        const fn = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !deleting) { e.preventDefault(); onClose(); }
        };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [open, deleting, onClose]);

    return (
        <AnimatePresence>
            {open && record && (
                <>
                    <motion.div key="sod-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBg} />
                    <motion.div key="sod-dlg" initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBg}>
                        <div role="alertdialog" aria-modal="true" aria-labelledby="sod-title"
                            className="relative w-full max-w-sm bg-white rounded-[18px] shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E5E7EB]">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Trash2 size={18} className="text-red-500" />
                                </div>
                                <h2 id="sod-title" className="text-sm font-bold text-[#111827]">
                                    Hapus data Scan Out?
                                </h2>
                            </div>
                            {/* Body */}
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-sm text-[#374151] leading-relaxed">
                                    Data yang dihapus tidak dapat dikembalikan.
                                </p>
                                <div className="rounded-xl bg-[#FEF2F2] border border-red-100 px-4 py-3 space-y-1">
                                    <p className="text-sm font-semibold text-[#111827]">
                                        {record.nopol} · {record.tanggal}
                                    </p>
                                    <p className="text-xs text-[#64748B]">Vendor: {record.vendor}</p>
                                    <p className="text-xs text-[#64748B]">
                                        Scan Out: {record.jamScanOut} — Scan In: {record.jamScanIn}
                                    </p>
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={onClose} disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="button" onClick={onConfirm} disabled={deleting}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                                    {deleting ? <><Spinner />Menghapus...</> : <><Trash2 size={14} />Hapus</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default memo(DeleteDialogInner);
