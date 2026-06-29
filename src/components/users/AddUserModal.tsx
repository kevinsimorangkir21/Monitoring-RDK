"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import type { AddUserForm, FormErrors, UserRecord } from "@/types/users";
import { ROLE_OPTIONS, STATUS_OPTIONS, DEPARTMENT_OPTIONS } from "@/mock/users";

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (user: UserRecord) => void;
}

const INITIAL: AddUserForm = {
    fullName: "", username: "", email: "",
    password: "", confirmPassword: "",
    role: "Operator", department: "Warehouse", status: "Active",
};

function validate(form: AddUserForm): FormErrors<AddUserForm> {
    const e: FormErrors<AddUserForm> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!/^[a-z0-9._-]+$/.test(form.username)) e.username = "Only lowercase, numbers, dots, dashes";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
}

function initials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

const COLORS = ["bg-[#DC2626]", "bg-[#2563EB]", "bg-emerald-600", "bg-violet-600", "bg-pink-600", "bg-indigo-600", "bg-teal-600"];

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

export default function AddUserModal({ open, onClose, onSave }: Props) {
    const [form, setForm] = useState<AddUserForm>(INITIAL);
    const [errors, setErrors] = useState<FormErrors<AddUserForm>>({});
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const set = useCallback(<K extends keyof AddUserForm>(k: K, v: AddUserForm[K]) => {
        setForm((prev) => ({ ...prev, [k]: v }));
        setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
    }, []);

    const handleSave = useCallback(() => {
        const e = validate(form);
        if (Object.keys(e).length) { setErrors(e); return; }
        const now = new Date().toISOString();
        const newUser: UserRecord = {
            id: `USR-${Date.now()}`,
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            role: form.role,
            department: form.department,
            status: form.status,
            lastLogin: "—",
            createdAt: now,
            updatedAt: now,
            avatarInitials: initials(form.fullName) || "?",
            avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
        onSave(newUser);
        setForm(INITIAL);
        setErrors({});
        onClose();
    }, [form, onSave, onClose]);

    const handleClose = useCallback(() => { setForm(INITIAL); setErrors({}); onClose(); }, [onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />
                    <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
                                <div>
                                    <p className="text-sm font-bold text-[#111827]">Add New User</p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">Fill in the form to create a new account</p>
                                </div>
                                <button onClick={handleClose} className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors" aria-label="Close"><X size={14} className="text-[#64748B]" /></button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                <Field label="Full Name *" error={errors.fullName}>
                                    <input className={inputCls(errors.fullName)} placeholder="e.g. Ahmad Fauzi" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                                </Field>
                                <Field label="Username *" error={errors.username}>
                                    <input className={inputCls(errors.username)} placeholder="e.g. ahmad.fauzi" value={form.username} onChange={(e) => set("username", e.target.value)} />
                                </Field>
                                <Field label="Email *" error={errors.email}>
                                    <input type="email" className={inputCls(errors.email)} placeholder="e.g. ahmad@company.id" value={form.email} onChange={(e) => set("email", e.target.value)} />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Password *" error={errors.password}>
                                        <div className="relative">
                                            <input type={showPw ? "text" : "password"} className={`${inputCls(errors.password)} pr-9`} placeholder="Min 8 chars" value={form.password} onChange={(e) => set("password", e.target.value)} />
                                            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">{showPw ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                                        </div>
                                    </Field>
                                    <Field label="Confirm Password *" error={errors.confirmPassword}>
                                        <div className="relative">
                                            <input type={showCpw ? "text" : "password"} className={`${inputCls(errors.confirmPassword)} pr-9`} placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
                                            <button type="button" onClick={() => setShowCpw((p) => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">{showCpw ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                                        </div>
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Role *">
                                        <select className={inputCls()} value={form.role} onChange={(e) => set("role", e.target.value as AddUserForm["role"])}>
                                            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Status *">
                                        <select className={inputCls()} value={form.status} onChange={(e) => set("status", e.target.value as AddUserForm["status"])}>
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
                                <button onClick={handleClose} className="h-9 px-5 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold hover:bg-[#F9FAFB] transition-colors">Cancel</button>
                                <button onClick={handleSave} className="h-9 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">Save User</button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
