"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, AtSign, Shield, Building2, Clock, Calendar, Pencil, KeyRound } from "lucide-react";
import type { UserRecord } from "@/types/users";
import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";

function Row({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-[#F3F4F6] last:border-none">
            {Icon && (
                <div className="w-7 h-7 rounded-lg bg-[#DC2626]/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className="text-[#DC2626]" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wide">{label}</p>
                <div className="text-xs font-semibold text-[#111827] mt-0.5 break-words">{value}</div>
            </div>
        </div>
    );
}

function fmtDt(iso: string) {
    if (iso === "—") return "—";
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props {
    user: UserRecord | null;
    onClose: () => void;
    onEdit: (user: UserRecord) => void;
    onResetPassword: (user: UserRecord) => void;
}

const DRAWER_W = 420;

export default function UserDetailDrawer({ user, onClose, onEdit, onResetPassword }: Props) {
    const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    return (
        <AnimatePresence>
            {user && (
                <>
                    <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
                    <motion.aside key="drawer" initial={{ x: DRAWER_W }} animate={{ x: 0 }} exit={{ x: DRAWER_W }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} style={{ width: DRAWER_W }} className="fixed right-0 top-0 h-screen z-50 bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
                            <div>
                                <p className="text-sm font-bold text-[#111827]">User Detail</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">@{user.username}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={user.status} />
                                <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors" aria-label="Close">
                                    <X size={14} className="text-[#64748B]" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                            {/* Avatar + Name */}
                            <div className="flex flex-col items-center gap-3 py-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${user.avatarColor}`}>
                                    {user.avatarInitials}
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-[#111827]">{user.fullName}</p>
                                    <p className="text-xs text-[#64748B] mt-0.5">@{user.username}</p>
                                    <div className="mt-2 flex justify-center"><RoleBadge role={user.role} /></div>
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Account Information</p>
                                <Row label="Full Name" value={user.fullName} icon={User} />
                                <Row label="Username" value={<span className="font-mono">{user.username}</span>} icon={AtSign} />
                                <Row label="Email" value={user.email} icon={Mail} />
                                <Row label="Role" value={<RoleBadge role={user.role} />} icon={Shield} />
                                <Row label="Department" value={user.department} icon={Building2} />
                                <Row label="Status" value={<StatusBadge status={user.status} />} />
                                <Row label="Last Login" value={fmtDt(user.lastLogin)} icon={Clock} />
                                <Row label="Created At" value={fmtDt(user.createdAt)} icon={Calendar} />
                                <Row label="Updated At" value={fmtDt(user.updatedAt)} icon={Calendar} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] shrink-0 flex items-center gap-2">
                            <button onClick={() => { onEdit(user); onClose(); }} className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">
                                <Pencil size={13} />Edit User
                            </button>
                            <button onClick={() => onResetPassword(user)} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors">
                                <KeyRound size={13} />Reset Password
                            </button>
                            <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors">
                                Close
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
