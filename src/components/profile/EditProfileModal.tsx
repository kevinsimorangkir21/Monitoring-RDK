"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ProfileData, EditProfileForm, FormErrors } from "@/types/profile";
import { DEPARTMENT_OPTIONS, POSITION_OPTIONS } from "@/mock/profile";

interface Props {
    open: boolean;
    profile: ProfileData;
    onClose: () => void;
    onSave: (form: EditProfileForm) => void;
}

function validate(f: EditProfileForm): FormErrors<EditProfileForm> {
    const e: FormErrors<EditProfileForm> = {};
    if (!f.fullName.trim()) e.fullName = "Full name is required";
    if (!f.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email format";
    if (!f.phone.trim()) e.phone = "Phone number is required";
    if (!f.department) e.department = "Department is required";
    if (!f.position) e.position = "Position is required";
    return e;
}

const inputCls = (err?: string) =>
    `w-full h-9 rounded-xl border text-xs text-[#111827] px-3 outline-none transition-all placeholder:text-[#9CA3AF] ${err ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-[#E5E7EB] focus:border-[#DC2626] focus:ring-2 focus:ring-red-100"}`;

const Field = memo(function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-[#374151]">{label}</label>
            {children}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
});

export default function EditProfileModal({ open, profile, onClose, onSave }: Props) {
    const [form, setForm] = useState<EditProfileForm>({ fullName: "", phone: "", email: "", department: "", position: "" });
    const [errors, setErrors] = useState<FormErrors<EditProfileForm>>({});

    useEffect(() => {
        if (open) {
            setForm({ fullName: profile.fullName, phone: profile.phone, email: profile.email, department: profile.department, position: profile.position });
            setErrors({});
        }
    }, [open, profile]);

    const set = useCallback(<K extends keyof EditProfileForm>(k: K, v: EditProfileForm[K]) => {
        setForm((prev) => ({ ...prev, [k]: v }));
        setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
    }, []);

    const handleSave = useCallback(() => {
        const e = validate(form);
        if (Object.keys(e).length) { setErrors(e); return; }
        onSave(form);
        onClose();
    }, [form, onSave, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
                    <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
                                <div>
                                    <p className="text-sm font-bold text-[#111827]">Edit Profile</p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">Update your personal information</p>
                                </div>
                                <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors" aria-label="Close">
                                    <X size={14} className="text-[#64748B]" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                <Field label="Full Name *" error={errors.fullName}>
                                    <input className={inputCls(errors.fullName)} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your full name" />
                                </Field>
                                <Field label="Phone Number *" error={errors.phone}>
                                    <input className={inputCls(errors.phone)} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 8xx-xxxx-xxxx" />
                                </Field>
                                <Field label="Email *" error={errors.email}>
                                    <input type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" />
                                </Field>
                                <Field label="Department *" error={errors.department}>
                                    <select className={inputCls(errors.department)} value={form.department} onChange={(e) => set("department", e.target.value)}>
                                        <option value="">Select department</option>
                                        {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Position *" error={errors.position}>
                                    <select className={inputCls(errors.position)} value={form.position} onChange={(e) => set("position", e.target.value)}>
                                        <option value="">Select position</option>
                                        {POSITION_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E5E7EB] shrink-0">
                                <button onClick={onClose} className="h-9 px-5 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold hover:bg-[#F9FAFB] transition-colors">Cancel</button>
                                <button onClick={handleSave} className="h-9 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">Save Changes</button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
