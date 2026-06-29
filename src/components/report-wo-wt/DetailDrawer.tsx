"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Activity, User, Calendar, Layers,
    Clock, CheckCircle2, AlertCircle, Timer,
    ClipboardList, Download, Printer, FileCheck,
} from "lucide-react";
import type { WavepickRecord } from "@/types/reportWoWt";
import StatusBadge from "./StatusBadge";

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

function ZoneRow({ zone, value }: { zone: string; value: number }) {
    const color = value >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
        : value >= 85 ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200";
    return (
        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-none">
            <span className="text-xs font-medium text-[#374151]">{zone}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${color}`}>
                {value.toFixed(1)}%
            </span>
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
    record: WavepickRecord | null;
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

    const fmtTs = (iso: string) => iso.replace("T", " ").slice(0, 16);

    const isGood = record?.status === "Good";
    const isAvg = record?.status === "Average";
    const isBelow = record?.status === "Below Target";

    const bannerStyle = isGood
        ? "bg-emerald-50 border-emerald-200"
        : isAvg
            ? "bg-amber-50 border-amber-200"
            : "bg-red-50 border-red-200";

    const bannerIcon = isGood
        ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        : isAvg
            ? <Clock size={18} className="text-amber-600 shrink-0" />
            : <AlertCircle size={18} className="text-red-600 shrink-0" />;

    const bannerText = isGood ? "text-emerald-700" : isAvg ? "text-amber-700" : "text-red-700";

    const steps: Step[] = record
        ? [
            { label: "Shift Dimulai", time: fmtTs(record.timeline.start), done: true, icon: ClipboardList },
            { label: "Aktivitas Berjalan", time: "—", done: !isBelow, icon: Activity },
            { label: "Shift Selesai", time: fmtTs(record.timeline.end), done: isGood || isAvg, icon: FileCheck },
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
                                <p className="text-sm font-bold text-[#111827]">Detail Wavepick Activity</p>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{record.wavepick} — {record.date}</p>
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

                            {/* Banner */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${bannerStyle}`}>
                                {bannerIcon}
                                <p className={`text-xs font-bold ${bannerText}`}>{record.status}</p>
                            </div>

                            {/* Operator info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Informasi Operator</p>
                                <Row label="Wavepick" value={record.wavepick} icon={Activity} />
                                <Row label="Tanggal" value={record.date} icon={Calendar} />
                                <Row label="Shift" value={record.shift} icon={Clock} />
                                <Row label="Operator" value={record.operator} icon={User} />
                                <Row label="WO" value={record.wo} icon={Layers} />
                                <Row label="WT" value={record.wt} icon={Layers} />
                                <Row
                                    label="Average WO-WT"
                                    value={<span className="text-[#DC2626]">{record.average.toFixed(2)}%</span>}
                                    icon={Activity}
                                />
                            </div>

                            {/* Zone breakdown */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Performa per Zone</p>
                                <div className="bg-[#F9FAFB] rounded-xl p-3">
                                    <ZoneRow zone="ZWP1" value={record.zwp1} />
                                    <ZoneRow zone="ZWP2" value={record.zwp2} />
                                    <ZoneRow zone="ZWP4" value={record.zwp4} />
                                    <ZoneRow zone="ZWP5" value={record.zwp5} />
                                </div>
                            </div>

                            {/* Timeline info */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Detail Waktu</p>
                                <Row label="Jam Mulai" value={fmtTs(record.timeline.start)} icon={Timer} />
                                <Row label="Jam Selesai" value={fmtTs(record.timeline.end)} icon={Timer} />
                                <Row label="Break" value={record.timeline.breakTime} icon={Clock} />
                                <Row label="Total Aktif" value={record.timeline.totalActive} icon={Activity} />
                            </div>

                            {/* Timeline */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Timeline Aktivitas</p>
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
