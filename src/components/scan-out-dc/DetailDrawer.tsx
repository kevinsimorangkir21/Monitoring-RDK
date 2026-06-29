"use client";

/**
 * DetailDrawer — Right-side slide-in panel (420px).
 * Shows full record details + FO timeline + Print / Download PDF / Close actions.
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Package, Hash, Truck, MapPin, User,
    Monitor, Calendar, Clock, CheckCircle2,
    Loader2, ScanLine, Download, Printer,
} from "lucide-react";
import type { ScanOutRecord } from "@/types/scanOutDC";
import { fmtNumber } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";

// ─── Detail row ───────────────────────────────────────────────────────────────

function Row({ label, value, icon: Icon }: {
    label: string; value: React.ReactNode; icon?: React.ElementType;
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
                <div className="text-xs font-semibold text-[#111827] mt-0.5 break-all">{value}</div>
            </div>
        </div>
    );
}

// ─── Timeline step ────────────────────────────────────────────────────────────

interface Step { label: string; time: string; done: boolean; icon: React.ElementType; }

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
            <div className="pb-3">
                <p className="text-xs font-semibold text-[#111827]">{step.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{step.time}</p>
            </div>
        </div>
    );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props { record: ScanOutRecord | null; onClose: () => void; }

const DRAWER_W = 420;

export default function DetailDrawer({ record, onClose }: Props) {
    const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    const isDone = record?.status === "Completed";
    const isScanning = record?.status === "Processing" || isDone;

    const steps: Step[] = record ? [
        { label: "FO Created", time: record.foCreated.replace("T", " ").slice(0, 16), done: true, icon: Hash },
        { label: "Loading", time: record.loading.replace("T", " ").slice(0, 16), done: isScanning || isDone, icon: Loader2 },
        { label: "Scanning", time: record.scanning.replace("T", " ").slice(0, 16), done: isScanning || isDone, icon: ScanLine },
        { label: "Completed", time: record.completed.replace("T", " ").slice(0, 16), done: isDone, icon: CheckCircle2 },
    ] : [];

    return (
        <AnimatePresence>
            {record && (
                <>
                    {/* Backdrop */}
                    <motion.div key="overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.aside key="drawer"
                        initial={{ x: DRAWER_W }} animate={{ x: 0 }} exit={{ x: DRAWER_W }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ width: DRAWER_W }}
                        className="fixed right-0 top-0 h-screen z-50 bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
                            <div>
                                <p className="text-sm font-bold text-[#111827]">Detail Scan Out</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{record.nomorFO}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={record.status} />
                                <button onClick={onClose}
                                    className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center transition-colors"
                                    aria-label="Tutup">
                                    <X size={14} className="text-[#64748B]" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                            {/* Info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Informasi Scan</p>
                                <Row label="Nomor FO" value={record.nomorFO} icon={Hash} />
                                <Row label="Nomor DO" value={record.nomorDO} icon={Hash} />
                                <Row label="Driver" value={record.driver} icon={User} />
                                <Row label="No. Polisi" value={record.nomorPolisi} icon={Truck} />
                                <Row label="Distribution Center" value={record.distributionCenter} icon={MapPin} />
                                <Row label="Operator" value={record.operator} icon={User} />
                                <Row label="Scanner Device" value={record.scanner} icon={Monitor} />
                                <Row label="Tanggal Scan" value={record.tanggal} icon={Calendar} />
                                <Row label="Jam Scan" value={record.jam} icon={Clock} />
                                <Row label="Total Box" value={fmtNumber(record.totalBox)} icon={Package} />
                            </div>

                            {/* Timeline */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Timeline FO</p>
                                {steps.map((step, i) => (
                                    <TimelineStep key={step.label} step={step} isLast={i === steps.length - 1} />
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
                            <button onClick={onClose}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors">
                                Tutup
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
