"use client";

/**
 * DetailDrawer — Right-side slide-in panel (440px).
 * Shows full claim information, status timeline, Print / Download PDF / Close.
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Receipt, Hash, Building2, FileText,
    Tag, DollarSign, User, Calendar,
    CheckCircle2, Clock, XCircle,
    ClipboardList, Download, Printer,
    FileCheck, FileClock, FileX,
} from "lucide-react";
import type { ClaimRecord } from "@/types/claimVendor";
import { fmtNumber } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";

// ─── Detail row ───────────────────────────────────────────────────────────────

function Row({ label, value, icon: Icon }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
}) {
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

// ─── Timeline step ────────────────────────────────────────────────────────────

interface Step {
    label: string;
    time: string | null;
    done: boolean;
    icon: React.ElementType;
}

function TimelineStep({ step, isLast }: { step: Step; isLast: boolean }) {
    const Icon = step.icon;
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${step.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-[#E5E7EB]"}`}>
                    <Icon size={13} className={step.done ? "text-white" : "text-[#9CA3AF]"} />
                </div>
                {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[20px] mt-1 ${step.done ? "bg-emerald-200" : "bg-[#E5E7EB]"}`} />
                )}
            </div>
            <div className="pb-3 min-w-0">
                <p className="text-xs font-semibold text-[#111827]">{step.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                    {step.time ?? "—"}
                </p>
            </div>
        </div>
    );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props {
    record: ClaimRecord | null;
    onClose: () => void;
}

const DRAWER_W = 440;

export default function DetailDrawer({ record, onClose }: Props) {
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    const fmtTs = (iso: string | null) =>
        iso ? iso.replace("T", " ").slice(0, 16) : null;

    const isApproved = record?.status === "Approved";
    const isRejected = record?.status === "Rejected";
    const isWaiting = record?.status === "Waiting Approval";

    const steps: Step[] = record
        ? [
            {
                label: "Claim Dibuat",
                time: fmtTs(record.claimDibuat),
                done: true,
                icon: ClipboardList,
            },
            {
                label: "Diajukan ke Review",
                time: fmtTs(record.diajukan),
                done: !isWaiting || !!record.diajukan,
                icon: FileClock,
            },
            {
                label: "Di-Review",
                time: fmtTs(record.diReview),
                done: isApproved || isRejected,
                icon: FileText,
            },
            {
                label: isRejected ? "Ditolak" : "Disetujui",
                time: fmtTs(record.selesai),
                done: isApproved || isRejected,
                icon: isRejected ? FileX : FileCheck,
            },
        ]
        : [];

    return (
        <AnimatePresence>
            {record && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: DRAWER_W }}
                        animate={{ x: 0 }}
                        exit={{ x: DRAWER_W }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ width: DRAWER_W }}
                        className="fixed right-0 top-0 h-screen z-50 bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
                            <div>
                                <p className="text-sm font-bold text-[#111827]">Detail Claim Vendor</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{record.nomorClaim}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={record.status} />
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors"
                                    aria-label="Tutup"
                                >
                                    <X size={14} className="text-[#64748B]" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                            {/* Status banner */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${isApproved ? "bg-emerald-50 border-emerald-200" : isRejected ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                                {isApproved && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                                {isRejected && <XCircle size={18} className="text-red-600 shrink-0" />}
                                {isWaiting && <Clock size={18} className="text-amber-600 shrink-0" />}
                                <div>
                                    <p className={`text-xs font-bold ${isApproved ? "text-emerald-700" : isRejected ? "text-red-700" : "text-amber-700"}`}>
                                        {record.status}
                                    </p>
                                    <p className="text-[11px] text-[#64748B] mt-0.5 break-words">{record.keterangan}</p>
                                </div>
                            </div>

                            {/* Claim info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">
                                    Informasi Claim
                                </p>
                                <Row label="Nomor Claim" value={record.nomorClaim} icon={Receipt} />
                                <Row label="Invoice" value={record.invoice} icon={Hash} />
                                <Row label="Vendor" value={record.vendor} icon={Building2} />
                                <Row label="Kategori" value={record.kategori} icon={Tag} />
                                <Row
                                    label="Jumlah Claim"
                                    value={
                                        <span className="text-[#DC2626]">
                                            Rp {fmtNumber(record.jumlahClaim)}
                                        </span>
                                    }
                                    icon={DollarSign}
                                />
                                <Row label="PIC" value={record.pic} icon={User} />
                                <Row label="Tanggal" value={record.tanggal} icon={Calendar} />
                            </div>

                            {/* Timeline */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
                                    Timeline Claim
                                </p>
                                {steps.map((step, i) => (
                                    <TimelineStep
                                        key={step.label}
                                        step={step}
                                        isLast={i === steps.length - 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] shrink-0 flex items-center gap-2">
                            <button className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">
                                <Download size={13} />Download PDF
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors">
                                <Printer size={13} />Print
                            </button>
                            <button
                                onClick={onClose}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
