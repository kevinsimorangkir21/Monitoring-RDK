"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { UserRecord, EditUserForm, FormErrors } from "@/types/users";
import { ROLE_OPTIONS, STATUS_OPTIONS, DEPARTMENT_OPTIONS } from "@/mock/users";

interface Props {
    user: UserRecord | null;
    onClose: () => void;
    onSave: (id: string, patch: Partial<UserRecord>) => void;
}

function validate(form: EditUserForm): FormErrors<EditUserForm> {
    const e: FormErrors<EditUserForm> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    return e;
}

const Field = memo(function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-[#374151]">{label}</label>
            {children}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
});

const inputCls = (err?: string) =>
    `w-full h-9 rounded-xl border text-xs text-[#111827] px-3 outline-none transition-all placeholder:text-[#9CA3AF] ${err ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[#E5E7EB] focus:border-[#DC2626] focus:ring-2 focus:ring-red-100"}`;

export default function EditUserModal({ user, onClose, onSave }: Props) {
    const [form, setForm] = useState<EditUserForm>({ fullName: "", email: "", role: "Operator", department: "Warehouse", status: "Active" });
    const [errors, setErrors] = useState<FormErrors<EditUserForm>>({});

    useEffect(() => {
        if (user) {
            setForm({ fullName: user.fullName, email: user.email, role: user.role, department: user.department, status: user.status });
            setErrors({});
        }
    }, [user]);

    const set = useCallback(<K extends keyof EditUserForm>(k: K, v: EditUserForm[K]) => {
        setForm((prev) => ({ ...prev, [k]: v }));
        setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
    }, []);

    const handleSave = useCallback(() => {
        const e = validate(form);
        if (Object.keys(e).length) { setErrors(e); return; }
        if (!user) return;
        onSave(user.id, {
            fullName: form.fullName,
            email: form.email,
            role: form.role,
            department: form.department,
            status: form.status,
        });
        onClose();
    }, [form, user, onSave, onClose]);

    const open = !!user;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
                    <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
                                <div>
                                    <p className="text-sm font-bold text-[#111827]">Edit User</p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">@{user?.username}</p>
                                </div>
                                <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors" aria-label="Close"><X size={14} className="text-[#64748B]" /></button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                {/* Username read-only hint */}
                                <div className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                                    <span className="text-xs text-[#64748B]">Username cannot be edited:</span>
                                    <span className="text-xs font-mono font-semibold text-[#111827]">{user?.username}</span>
                                </div>
                                <Field label="Full Name *" error={errors.fullName}>
                                    <input className={inputCls(errors.fullName)} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                                </Field>
                                <Field label="Email *" error={errors.email}>
                                    <input type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Role *">
                                        <select className={inputCls()} value={form.role} onChange={(e) => set("role", e.target.value as EditUserForm["role"])}>
                                            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Status *">
                                        <select className={inputCls()} value={form.status} onChange={(e) => set("status", e.target.value as EditUserForm["status"])}>
                                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                <Field label="Department *">
                                    <select className={inputCls()} value={form.department} onChange={(e) => set("department", e.target.value)}>
                                        {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
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
