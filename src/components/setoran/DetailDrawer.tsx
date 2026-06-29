"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, User, Calendar, Clock, ArrowRight,
    CheckCircle2, AlertCircle, Timer,
    ClipboardList, Download, Printer, FileCheck,
    MapPin,
} from "lucide-react";
import type { SetoranRecord } from "@/types/setoran";
import DurationBadge from "./DurationBadge";

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

interface Step {
    label: string;
    time: string;
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
                <p className="text-[11px] text-[#64748B] mt-0.5">{step.time}</p>
            </div>
        </div>
    );
}

interface Props {
    record: SetoranRecord | null;
    onClose: () => void;
}

const DRAWER_W = 440;

function fmtTs(iso: string) {
    return iso.replace("T", " ").slice(0, 16);
}

export default function DetailDrawer({ record, onClose }: Props) {
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    const isFast = record?.status === "Fast";
    const isNormal = record?.status === "Normal";
    const isSlow = record?.status === "Slow";

    const bannerStyle = isFast
        ? "bg-emerald-50 border-emerald-200"
        : isNormal
            ? "bg-orange-50 border-orange-200"
            : "bg-red-50 border-red-200";

    const bannerIcon = isFast
        ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        : isNormal
            ? <Clock size={18} className="text-orange-600 shrink-0" />
            : <AlertCircle size={18} className="text-red-600 shrink-0" />;

    const bannerText = isFast
        ? "Durasi sangat baik (≤ 30 menit)"
        : isNormal
            ? "Durasi normal (30–60 menit)"
            : "Durasi terlambat (> 60 menit)";

    const bannerTextColor = isFast ? "text-emerald-700" : isNormal ? "text-orange-700" : "text-red-700";

    const steps: Step[] = record
        ? [
            { label: "Pulang Kunjungan", time: fmtTs(record.waktuPulang), done: true, icon: ClipboardList },
            { label: "Dalam Perjalanan", time: "—", done: true, icon: ArrowRight },
            { label: "Setoran ke Kasir", time: fmtTs(record.waktuSetoran), done: true, icon: FileCheck },
        ]
        : [];

    return (
        <AnimatePresence>
            {record && (
                <>
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />
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
                                <p className="text-sm font-bold text-[#111827]">Detail Setoran Salesman</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{record.namaSalesman} — {record.tanggal}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <DurationBadge durasi={record.durasi} status={record.status} />
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
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${bannerStyle}`}>
                                {bannerIcon}
                                <p className={`text-xs font-bold ${bannerTextColor}`}>{bannerText}</p>
                            </div>

                            {/* Duration highlight */}
                            <div className="flex items-center justify-center gap-4 py-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                                <div className="text-center">
                                    <p className="text-[10px] text-[#64748B] uppercase tracking-wide font-medium">Total Durasi</p>
                                    <p className="text-3xl font-bold font-mono text-[#DC2626] mt-1">{record.durasi}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Informasi Setoran</p>
                                <Row label="Nama Salesman" value={record.namaSalesman} icon={User} />
                                <Row label="Tanggal" value={record.tanggal} icon={Calendar} />
                                <Row label="Bulan" value={record.bulan} icon={Calendar} />
                                <Row label="Pulang Kunjungan" value={<span className="font-mono">{record.pulangKunjungan}</span>} icon={MapPin} />
                                <Row label="Setoran ke Kasir" value={<span className="font-mono">{record.setoranKasir}</span>} icon={Timer} />
                                <Row
                                    label="Total Durasi"
                                    value={<span className="font-mono text-[#DC2626]">{record.durasi}</span>}
                                    icon={Clock}
                                />
                            </div>

                            {/* Timeline */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Timeline Setoran</p>
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
