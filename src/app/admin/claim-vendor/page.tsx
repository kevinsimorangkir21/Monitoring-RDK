"use client";

/**
 * /admin/claim-vendor — Claim Vendor Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * KPI: Total Dokumen | Total Nominal | Belum Dibayarkan | Sudah Lunas
 * Chart: Pendingan Tagihan Claiman (Line Chart)
 * Tabel: Rekapitulasi Vendor + Detail Claim Vendor
 * CRUD: hanya SUPER_ADMIN
 */

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, X, CheckCircle2, AlertCircle } from "lucide-react";

import { useClaimVendorStore } from "./claimVendorStore";
import { useUser } from "@/contexts/UserContext";
import type { ToastMessage } from "./types";

import ClaimCards from "./ClaimCards";
import VendorRecapTable from "./VendorRecapTable";
import ClaimDetailTable from "./ClaimDetailTable";
import ClaimVendorModal from "./ClaimVendorModal";
import DeleteDialog from "./DeleteDialog";
import FilterBar from "./FilterBar";

// ─── Dynamic chart ────────────────────────────────────────────────────────────

const ClaimTrendChart = dynamic(() => import("./ClaimTrendChart"), { ssr: false });

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const ok = toast.variant === "success";
    return (
        <motion.div layout initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }} transition={{ duration: 0.22, ease: "easeOut" }}
            role="status" aria-live="polite"
            className={`flex items-start gap-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg px-4 py-3 border-l-4 pointer-events-auto ${ok ? "border-[#16A34A]" : "border-red-500"}`}>
            {ok ? <CheckCircle2 size={16} className="text-[#16A34A] shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
            <p className="flex-1 text-sm text-[#111827] leading-snug">{toast.message}</p>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Tutup notifikasi"
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]">
                <X size={12} />
            </button>
        </motion.div>
    );
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[60] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
            <AnimatePresence mode="sync">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={onDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ─── Add Button (SUPER_ADMIN only) ────────────────────────────────────────────

function AddButton({ onClick }: { onClick: () => void }) {
    const { user } = useUser();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const isSuperAdmin =
        user?.role?.toLowerCase() === "super admin" ||
        user?.role?.toUpperCase() === "SUPER_ADMIN";

    if (!mounted || !isSuperAdmin) return null;

    return (
        <button type="button" onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shrink-0">
            <Plus size={16} aria-hidden="true" />
            + Tambah Claim
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimVendorPage() {
    const {
        records,
        filteredRecords,
        kpi,
        trendData,
        vendorRecap,
        vendors,
        filters,
        updateFilters,
        resetFilters,
        modalState,
        openCreate,
        openEdit,
        closeModal,
        saving,
        saveRecord,
        deleteTarget,
        requestDelete,
        closeDelete,
        deleting,
        confirmDelete,
        toasts,
        dismissToast,
    } = useClaimVendorStore();

    const handleExport = useCallback(() => {
        console.info("Export Claim Vendor:", records.length, "records");
    }, [records.length]);

    // Scroll lock
    useEffect(() => {
        const open = modalState.open || deleteTarget !== null;
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [modalState.open, deleteTarget]);

    return (
        <div className="space-y-5">

            {/* ── 1. Header ──────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Claim Vendor</h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Vendor Claim Monitoring Dashboard
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <AddButton onClick={openCreate} />
                    <button type="button" onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors">
                        Export Excel
                    </button>
                </div>
            </motion.div>

            {/* ── 2. FilterBar ──────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <FilterBar
                    filters={filters}
                    vendors={vendors}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
            </motion.div>

            {/* ── 3. KPI Cards ──────────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <ClaimCards kpi={kpi} />
            </motion.div>

            {/* ── 4. Chart: Pendingan Tagihan ────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <ClaimTrendChart data={trendData} />
            </motion.div>

            {/* ── 5. Rekapitulasi Vendor ─────────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <VendorRecapTable data={vendorRecap} />
            </motion.div>

            {/* ── 6. Detail Claim Vendor ─────────────────────────────────── */}
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <ClaimDetailTable
                    data={filteredRecords}
                    vendors={vendors}
                    onEdit={openEdit}
                    onDelete={requestDelete}
                />
            </motion.div>

            {/* ── Portals ───────────────────────────────────────────────── */}
            <ClaimVendorModal
                open={modalState.open}
                mode={modalState.mode}
                record={modalState.record}
                saving={saving}
                onSave={saveRecord}
                onClose={closeModal}
            />
            <DeleteDialog
                open={deleteTarget !== null}
                record={deleteTarget}
                deleting={deleting}
                onConfirm={confirmDelete}
                onClose={closeDelete}
            />
            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
