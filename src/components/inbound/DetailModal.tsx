"use client";

/**
 * DetailModal — Animated slide-up modal showing full inbound record detail
 * including driver info, shipment details, and a GR timeline.
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Truck, Package, MapPin, Building2, User, CheckCircle2 } from "lucide-react";
import type { InboundRecord } from "@/data/inboundData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<InboundRecord["status"], string> = {
    Completed: "bg-green-100 text-green-700 border-green-200",
    Progress: "bg-blue-100  text-blue-700  border-blue-200",
    Pending: "bg-orange-100 text-orange-700 border-orange-200",
    Delay: "bg-red-100   text-red-700   border-red-200",
};

function StatusBadge({ status }: { status: InboundRecord["status"] }) {
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[status]}`}
        >
            {status}
        </span>
    );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-none">
            {Icon && (
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} className="text-red-600" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">
                    {value}
                </p>
            </div>
        </div>
    );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

interface TimelineStep {
    label: string;
    time: string;
    done: boolean;
}

function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${step.done
                            ? "bg-green-500 border-green-500"
                            : "bg-white border-gray-200"
                        }`}
                >
                    {step.done ? (
                        <CheckCircle2 size={16} className="text-white" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                </div>
                {!isLast && (
                    <div
                        className={`w-0.5 flex-1 min-h-[28px] mt-1 ${step.done ? "bg-green-300" : "bg-gray-200"
                            }`}
                    />
                )}
            </div>
            <div className="pb-4">
                <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>
            </div>
        </div>
    );
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const panelVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        y: 30,
        scale: 0.97,
        transition: { duration: 0.2 },
    },
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface DetailModalProps {
    record: InboundRecord | null;
    onClose: () => void;
}

export default function DetailModal({ record, onClose }: DetailModalProps) {
    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const timelineSteps: TimelineStep[] = record
        ? [
            { label: "Mobil Masuk", time: formatDateTime(record.mobilMasuk), done: true },
            { label: "Bongkar Dimulai", time: formatDateTime(record.bongkarDimulai), done: true },
            {
                label: "Bongkar Selesai",
                time: formatDateTime(record.bongkarSelesai),
                done: record.status === "Completed" || record.status === "Progress",
            },
            {
                label: "GR Dibuat",
                time: formatDateTime(record.grDibuat),
                done: record.status === "Completed",
            },
        ]
        : [];

    return (
        <AnimatePresence>
            {record && (
                <motion.div
                    key="overlay"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative z-10 bg-white rounded-[18px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-[18px] flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    Detail Inbound
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">{record.nomorFO}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={record.status} />
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition"
                                    aria-label="Tutup modal"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            {/* Left: Shipment Details */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Informasi Pengiriman
                                </p>
                                <DetailRow label="Nomor FO" value={record.nomorFO} icon={Package} />
                                <DetailRow label="Nomor GR" value={record.nomorGR} icon={Package} />
                                <DetailRow label="Driver" value={record.driver} icon={User} />
                                <DetailRow label="No. Polisi" value={record.noPolisi} icon={Truck} />
                                <DetailRow label="Plant" value={record.plant} icon={Building2} />
                                <DetailRow label="Supplier" value={record.supplier} icon={MapPin} />
                                <DetailRow label="Jenis Bongkaran" value={record.jenisBongkaran} />
                                <DetailRow
                                    label="Total Box"
                                    value={record.totalBox.toLocaleString("id-ID")}
                                    icon={Package}
                                />
                            </div>

                            {/* Right: Timeline */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Timeline GR
                                </p>
                                {timelineSteps.map((step, i) => (
                                    <TimelineItem
                                        key={step.label}
                                        step={step}
                                        isLast={i === timelineSteps.length - 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
