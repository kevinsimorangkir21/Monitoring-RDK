"use client";

import { memo } from "react";
import { RotateCcw, Save, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Props {
    isDirty: boolean;
    onSave: () => void;
    onReset: () => void;
    onCancel: () => void;
}

const SettingsFooter = memo(function SettingsFooter({ isDirty, onSave, onReset, onCancel }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleReset = () => setConfirmOpen(true);
    const handleConfirmReset = () => { setConfirmOpen(false); onReset(); };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm px-5 py-4">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    {isDirty && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved changes
                        </span>
                    )}
                    {!isDirty && <span className="text-emerald-600 font-medium">All changes saved</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold hover:bg-[#F9FAFB] transition-colors"
                    >
                        <RotateCcw size={14} />Reset to Default
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold hover:bg-[#F9FAFB] transition-colors"
                    >
                        <X size={14} />Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Save size={14} />Save Changes
                    </button>
                </div>
            </div>

            {/* Confirm Reset Dialog */}
            <AnimatePresence>
                {confirmOpen && (
                    <>
                        <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={() => setConfirmOpen(false)} />
                        <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-sm pointer-events-auto p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#111827]">Reset to Default</p>
                                        <p className="text-xs text-[#64748B] mt-0.5">This action cannot be undone.</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[#64748B] mb-5">All settings will be reset to their default values. Are you sure you want to continue?</p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setConfirmOpen(false)} className="h-9 px-5 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold hover:bg-[#F9FAFB] transition-colors">Cancel</button>
                                    <button onClick={handleConfirmReset} className="h-9 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">Reset</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});

export default SettingsFooter;
