"use client";

/**
 * DetailDrawer — Right-side slide-in drawer (420px). Light enterprise mode.
 * White background, #E5E7EB borders, #DC2626 primary, clean typography.
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Truck, Package, MapPin, Building2, User,
    CheckCircle2, Clock, Download, Printer, Tag,
} from "lucide-react";
import type { InboundRecord } from "@/types/inbound";
import { fmtDateTimeFull } from "@/utils/formatNumber";
import StatusBadge from "./StatusBadge";
import PlantBadge from "./PlantBadge";

// ─── Timeline step ────────────────────────────────────────────────────────────

interface Step { label: string; time: string; done: boolean }

function TimelineStep({ step, isLast }: { step: Step; isLast: boolean }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${step.done
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-white border-[#E5E7EB]"
                    }`}>
                    {step.done
                        ? <CheckCircle2 size={14} className="text-white" />
                        : <Clock size={12} className="text-[#9CA3AF]" />}
                </div>
                {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[24px] mt-1 ${step.done ? "bg-emerald-200" : "bg-[#E5E7EB]"
                        }`} />
                )}
            </div>
            <div className="pb-4">
                <p className="text-xs font-semibold text-[#111827]">{step.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{step.time}</p>
            </div>
        </div>
    );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function Row({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[#F3F4F6] last:border-none">
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

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
    record: InboundRecord | null;
    onClose: () => void;
}

const DRAWER_W = 420;

export default function DetailDrawer({ record, onClose }: DrawerProps) {
    const handleKey = useCallback(
        (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    const steps: Step[] = record
        ? [
            { label: "Mobil Masuk", time: fmtDateTimeFull(record.mobilMasuk), done: true },
            { label: "Bongkar Dimulai", time: fmtDateTimeFull(record.bongkarDimulai), done: true },
            {
                label: "Bongkar Selesai",
                time: fmtDateTimeFull(record.bongkarSelesai),
                done: record.status === "Completed" || record.status === "Progress",
            },
            {
                label: "GR Dibuat",
                time: fmtDateTimeFull(record.grDibuat),
                done: record.status === "Completed",
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

                    {/* Drawer panel */}
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
                                <p className="text-sm font-bold text-[#111827]">Detail Inbound</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{record.nomorFO}</p>
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
                            {/* Shipment info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">
                                    Informasi Pengiriman
                                </p>
                                <Row label="Nomor FO" value={record.nomorFO} icon={Package} />
                                <Row label="Nomor GR" value={record.nomorGR} icon={Tag} />
                                <Row label="Driver" value={record.driver} icon={User} />
                                <Row label="No. Polisi" value={record.noPolisi} icon={Truck} />
                                <Row label="Plant" value={<PlantBadge plant={record.plant} />} icon={Building2} />
                                <Row label="Supplier" value={record.supplier} icon={MapPin} />
                                <Row label="Jenis Bongkaran" value={record.jenisBongkaran} />
                                <Row
                                    label="Total Box"
                                    value={record.totalBox.toLocaleString("id-ID")}
                                    icon={Package}
                                />
                            </div>

                            {/* Timeline */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
                                    Timeline GR
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
                            <button className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-xs font-semibold transition-colors shadow-sm">
                                <Download size={13} />
                                Download PDF
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors">
                                <Printer size={13} />
                                Print
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
