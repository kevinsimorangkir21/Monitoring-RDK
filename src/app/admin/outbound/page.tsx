"use client";

/**
 * /admin/outbound — Outbound Monitoring Page (Refactored)
 * ─────────────────────────────────────────────────────────────────────────────
 * Full CRUD dashboard for outbound delivery data.
 *
 * Design System:
 *   Primary  : #10B981 (emerald)   Cards   : #FFFFFF
 *   Border   : #E5E7EB             Radius  : 18px
 *   Text     : #111827             Muted   : #64748B
 *
 * Page Structure:
 *   1. Page header (title + badge + Tambah button)
 *   2. FilterBar
 *   3. OutboundCards (KPI)
 *   4. StatusFOChart + VendorPerformanceChart (side-by-side)
 *   5. DeliveryTrendChart (full-width)
 *   6. OutboundTable (full-width)
 *   [Portals] OutboundModal | DeleteDialog | ToastStack
 *
 * Requirements: 10.1–10.8, 11.1–11.10, 12.1–12.6, 13.1–13.15
 */

import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useId,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";

// ── Local imports ─────────────────────────────────────────────────────────────
import type {
    OutboundRecord,
    OutboundFilters,
    OutboundFormValues,
    ModalState,
    ToastMessage,
} from "./types";
import { initialOutboundData } from "./mock";
import OutboundCards from "./OutboundCards";
import FilterBar from "./FilterBar";
import OutboundTable from "./OutboundTable";
import { OutboundModal } from "./OutboundModal";
import StatusFOChart from "./StatusFOChart";
import VendorPerformanceChart from "./VendorPerformanceChart";
import DeliveryTrendChart from "./DeliveryTrendChart";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.36, delay: i * 0.08 },
    }),
};

// ─── Default filter state ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: OutboundFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedPlant: [],
    selectedVendor: [],
    selectedStatusFO: [],
    searchQuery: "",
};

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(
    data: OutboundRecord[],
    filters: OutboundFilters
): OutboundRecord[] {
    return data.filter((r) => {
        // Date range
        if (filters.dateRange.startDate && r.tanggal < filters.dateRange.startDate)
            return false;
        if (filters.dateRange.endDate && r.tanggal > filters.dateRange.endDate)
            return false;
        // Plant
        if (
            filters.selectedPlant.length > 0 &&
            !filters.selectedPlant.includes(r.plant)
        )
            return false;
        // Vendor
        if (
            filters.selectedVendor.length > 0 &&
            !filters.selectedVendor.includes(r.vendor)
        )
            return false;
        // Status FO
        if (
            filters.selectedStatusFO.length > 0 &&
            !filters.selectedStatusFO.includes(r.statusFO)
        )
            return false;
        // Search (vendor | noPolisi | driver)
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            if (
                !r.vendor.toLowerCase().includes(q) &&
                !r.noPolisi.toLowerCase().includes(q) &&
                !r.driver.toLowerCase().includes(q)
            )
                return false;
        }
        return true;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE COMPONENT: DeleteDialog
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteDialogProps {
    open: boolean;
    record: OutboundRecord | null;
    deleting: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

function DeleteDialog({
    open,
    record,
    deleting,
    onConfirm,
    onClose,
}: DeleteDialogProps) {
    const titleId = useId();

    // Backdrop click — only close when not deleting
    const handleBackdrop = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget && !deleting) onClose();
        },
        [deleting, onClose]
    );

    // Escape key
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !deleting) {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, deleting, onClose]);

    return (
        <AnimatePresence>
            {open && record && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="delete-dialog-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                        onClick={handleBackdrop}
                    />

                    {/* Dialog */}
                    <motion.div
                        key="delete-dialog-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleBackdrop}
                    >
                        <motion.div
                            key="delete-dialog-panel"
                            initial={{ opacity: 0, scale: 0.94, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 12 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby={titleId}
                            className="relative w-full max-w-md bg-white rounded-[18px] shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon header */}
                            <div className="flex flex-col items-center px-6 pt-7 pb-4 text-center">
                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                    <Trash2 size={26} className="text-red-500" aria-hidden="true" />
                                </div>
                                <h2
                                    id={titleId}
                                    className="text-base font-bold text-[#111827] leading-snug"
                                >
                                    Hapus Data Outbound?
                                </h2>
                                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                                    Anda akan menghapus pengiriman dari{" "}
                                    <span className="font-semibold text-[#374151]">
                                        {record.vendor}
                                    </span>{" "}
                                    pada tanggal{" "}
                                    <span className="font-semibold text-[#374151]">
                                        {record.tanggal}
                                    </span>
                                    . Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-center gap-3 px-6 pb-6 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={deleting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                >
                                    {deleting ? (
                                        <>
                                            <svg
                                                className="animate-spin w-4 h-4 text-white shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>
                                            Menghapus...
                                        </>
                                    ) : (
                                        "Hapus"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE COMPONENT: ToastStack
// ─────────────────────────────────────────────────────────────────────────────

interface ToastStackProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

function ToastStack({ toasts, onDismiss }: ToastStackProps) {
    return (
        // Fixed bottom-4 right-4 on desktop; centered on mobile
        <div
            className="
        fixed bottom-4 z-[60]
        left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm
        sm:left-auto sm:right-4 sm:translate-x-0 sm:w-80
        flex flex-col gap-2 pointer-events-none
      "
            aria-live="polite"
            aria-atomic="false"
            role="region"
            aria-label="Notifikasi"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const isSuccess = toast.variant === "success";
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className={`
                pointer-events-auto
                flex items-start gap-3 px-4 py-3
                bg-white rounded-[14px] shadow-lg
                border border-[#E5E7EB]
                border-l-4
                ${isSuccess ? "border-l-[#10B981]" : "border-l-red-500"}
              `}
                            role="status"
                            aria-live="polite"
                        >
                            {/* Icon */}
                            <span className="shrink-0 mt-0.5">
                                {isSuccess ? (
                                    <CheckCircle2
                                        size={18}
                                        className="text-[#10B981]"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <AlertCircle
                                        size={18}
                                        className="text-red-500"
                                        aria-hidden="true"
                                    />
                                )}
                            </span>

                            {/* Message */}
                            <p className="flex-1 text-sm text-[#111827] leading-snug">
                                {toast.message}
                            </p>

                            {/* Dismiss (X) button */}
                            <button
                                type="button"
                                onClick={() => onDismiss(toast.id)}
                                aria-label="Tutup notifikasi"
                                className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors mt-0.5 focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]"
                            >
                                <X size={12} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function OutboundPage() {
    // ── State ──────────────────────────────────────────────────────────────────
    const [data, setData] = useState<OutboundRecord[]>(initialOutboundData);
    const [filters, setFilters] = useState<OutboundFilters>(DEFAULT_FILTERS);
    const [modalState, setModalState] = useState<ModalState>({
        open: false,
        mode: "create",
    });
    const [deleteTarget, setDeleteTarget] = useState<OutboundRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── Derived data ───────────────────────────────────────────────────────────
    const filteredData = useMemo(
        () => applyFilters(data, filters),
        [data, filters]
    );

    const availablePlants = useMemo(
        () => [...new Set(data.map((r) => r.plant))].sort(),
        [data]
    );

    const availableVendors = useMemo(
        () => [...new Set(data.map((r) => r.vendor))].sort(),
        [data]
    );

    // ── Toast helpers ──────────────────────────────────────────────────────────
    const addToast = useCallback(
        (variant: ToastMessage["variant"], message: string) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => [...prev, { id, variant, message }]);
            // Auto-dismiss after 4000ms
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        },
        []
    );

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Filter handlers ────────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<OutboundFilters>) => {
        setFilters((prev) => ({ ...prev, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    // ── CRUD handlers ──────────────────────────────────────────────────────────
    const handleEdit = useCallback((record: OutboundRecord) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    const handleDeleteClick = useCallback((record: OutboundRecord) => {
        setDeleteTarget(record);
    }, []);

    const handleSave = useCallback(
        async (values: OutboundFormValues) => {
            setSaving(true);
            try {
                // Simulate async save (replace with real API call)
                await new Promise<void>((resolve) => setTimeout(resolve, 600));

                if (modalState.mode === "create") {
                    const newRecord: OutboundRecord = {
                        id: `OB-${Date.now()}`,
                        tanggal: values.tanggal,
                        plant: values.plant,
                        vendor: values.vendor,
                        noPolisi: values.noPolisi,
                        driver: values.driver,
                        statusFO: values.statusFO as OutboundRecord["statusFO"],
                        totalBox: parseInt(values.totalBox, 10),
                        totalQty: parseInt(values.totalQty, 10),
                        jamLoading: values.jamLoading,
                        jamBerangkat: values.jamBerangkat,
                    };
                    setData((prev) => [newRecord, ...prev]);
                    addToast("success", "Data outbound berhasil ditambahkan.");
                } else {
                    // edit mode
                    const existingId = modalState.record?.id;
                    const updated: OutboundRecord = {
                        id: existingId ?? `OB-${Date.now()}`,
                        tanggal: values.tanggal,
                        plant: values.plant,
                        vendor: values.vendor,
                        noPolisi: values.noPolisi,
                        driver: values.driver,
                        statusFO: values.statusFO as OutboundRecord["statusFO"],
                        totalBox: parseInt(values.totalBox, 10),
                        totalQty: parseInt(values.totalQty, 10),
                        jamLoading: values.jamLoading,
                        jamBerangkat: values.jamBerangkat,
                    };
                    setData((prev) =>
                        prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                    addToast("success", "Data outbound berhasil diperbarui.");
                }
                setModalState({ open: false, mode: "create" });
            } finally {
                setSaving(false);
            }
        },
        [modalState, addToast]
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            // Simulate async delete (replace with real API call)
            await new Promise<void>((resolve) => setTimeout(resolve, 600));
            setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            addToast("success", "Data outbound berhasil dihapus.");
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }, [deleteTarget, addToast]);

    const handleCloseModal = useCallback(() => {
        if (!saving) setModalState({ open: false, mode: "create" });
    }, [saving]);

    const handleCloseDelete = useCallback(() => {
        if (!deleting) setDeleteTarget(null);
    }, [deleting]);

    const handleOpenCreate = useCallback(() => {
        setModalState({ open: true, mode: "create" });
    }, []);

    // Prevent body scroll when a dialog is open
    useEffect(() => {
        const isOpen = modalState.open || deleteTarget !== null;
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalState.open, deleteTarget]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ─────────────────────────────────────────────────────────────────────
          1. Page Header
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">
                        Outbound Monitoring
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5 flex-wrap">
                        Monitor seluruh aktivitas pengiriman outbound
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700"
                            aria-label={`${filteredData.length} dari ${data.length} record`}
                        >
                            {filteredData.length} dari {data.length} record
                        </span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 shrink-0"
                >
                    <Plus size={16} aria-hidden="true" />
                    Tambah Data Outbound
                </button>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          2. Filter Bar
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <FilterBar
                    filters={filters}
                    availablePlants={availablePlants}
                    availableVendors={availableVendors}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          3. KPI Cards
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <OutboundCards data={filteredData} />
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          4. StatusFO Chart + Vendor Performance Chart (side-by-side)
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <StatusFOChart data={filteredData} />
                <VendorPerformanceChart data={filteredData} />
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          5. Delivery Trend Chart (full-width)
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <DeliveryTrendChart data={filteredData} />
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          6. Outbound Table (full-width)
      ───────────────────────────────────────────────────────────────────── */}
            <motion.div
                custom={5}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <OutboundTable
                    data={filteredData}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────────────
          Portals: Modal | DeleteDialog | ToastStack
      ───────────────────────────────────────────────────────────────────── */}

            {/* Outbound CRUD Modal */}
            <OutboundModal
                open={modalState.open}
                mode={modalState.mode}
                record={modalState.record}
                saving={saving}
                onSave={handleSave}
                onClose={handleCloseModal}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteTarget !== null}
                record={deleteTarget}
                deleting={deleting}
                onConfirm={handleConfirmDelete}
                onClose={handleCloseDelete}
            />

            {/* Toast Notification Stack */}
            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
