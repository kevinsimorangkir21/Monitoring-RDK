"use client";

/**
 * /admin/inbound — Inbound Monitoring Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout:
 *   1. Page Header
 *   2. FilterBar
 *   3. KPI Row 1        — Total Mobil | Total Box | Komposisi Jenis Bongkaran
 *   4. Charts Row 2     — Report Harian (ComposedChart) | Jumlah Bongkaran (Bar)
 *   5. Charts Row 3     — Bongkaran by Plant (Bar) | Produktivitas Bongkar (Donut)
 *   6. Detail Table     — all Excel columns + Action
 *
 * Jenis Bongkaran: SLIPSHEET | CURAH only.
 * Mock data: empty — fill via CRUD.
 * Empty state: semua chart & card tetap dirender, menampilkan 0 / empty label.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, X, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

import type {
    InboundRecord, InboundFormValues, InboundFilters,
    ModalState, ToastMessage, ToastVariant,
} from "./types";

import { initialInboundData } from "./mock";
import InboundCards from "./InboundCards";
import DailyReportChart from "./DailyReportChart";
import JumlahBongkaranChart from "./JumlahBongkaranChart";
import BongkaranPlantChart from "./BongkaranPlantChart";
import JenisBongkaranChart from "./JenisBongkaranChart";
import InboundTable from "./InboundTable";
import InboundModal from "./InboundModal";
import FilterBar from "./FilterBar";

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Jenis Bongkaran options — locked to SLIPSHEET / CURAH ────────────────────

const JENIS_OPTIONS = ["SLIPSHEET", "CURAH"];

// ─── Default filters ──────────────────────────────────────────────────────────

const INITIAL_FILTERS: InboundFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedPlant: [],
    selectedShifting: [],
    selectedJenis: [],
    searchQuery: "",
};

// ─── Filter logic (pure) ──────────────────────────────────────────────────────

function applyFilters(data: InboundRecord[], f: InboundFilters): InboundRecord[] {
    let r = data;
    const { startDate, endDate } = f.dateRange;
    if (startDate) r = r.filter((d) => d.tanggal >= startDate);
    if (endDate) r = r.filter((d) => d.tanggal <= endDate);
    if (f.selectedPlant.length) r = r.filter((d) => f.selectedPlant.includes(d.plantPabrik));
    if (f.selectedShifting.length) r = r.filter((d) => f.selectedShifting.includes(d.shifting));
    if (f.selectedJenis.length) r = r.filter((d) => f.selectedJenis.includes(d.jenisBongkaran));
    const q = f.searchQuery.trim().toLowerCase();
    if (q) r = r.filter((d) =>
        d.nomorFO.toLowerCase().includes(q) ||
        d.nopol.toLowerCase().includes(q) ||
        d.nomorGR.toLowerCase().includes(q)
    );
    return r;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const ok = toast.variant === "success";
    return (
        <motion.div layout initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }} transition={{ duration: 0.22, ease: "easeOut" }}
            role="status" aria-live="polite"
            className={`flex items-start gap-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg px-4 py-3 border-l-4 pointer-events-auto ${ok ? "border-[#16A34A]" : "border-red-500"}`}>
            {ok ? <CheckCircle2 size={16} className="text-[#16A34A] shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
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
                {toasts.map((t) => <div key={t.id} className="pointer-events-auto"><ToastItem toast={t} onDismiss={onDismiss} /></div>)}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Dialog
// ─────────────────────────────────────────────────────────────────────────────

function DeleteDialog({
    open, record, deleting, onConfirm, onClose,
}: { open: boolean; record: InboundRecord | null; deleting: boolean; onConfirm: () => Promise<void>; onClose: () => void }) {
    const handleBg = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !deleting) onClose();
    }, [deleting, onClose]);

    useEffect(() => {
        if (!open) return;
        const fn = (e: KeyboardEvent) => { if (e.key === "Escape" && !deleting) { e.preventDefault(); onClose(); } };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [open, deleting, onClose]);

    return (
        <AnimatePresence>
            {open && record && (
                <>
                    <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" onClick={handleBg} />
                    <motion.div key="del-dlg" initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBg}>
                        <div role="alertdialog" aria-modal="true" aria-labelledby="del-ib-title"
                            className="relative w-full max-w-sm bg-white rounded-[18px] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E5E7EB]">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Trash2 size={18} className="text-red-500" />
                                </div>
                                <h2 id="del-ib-title" className="text-sm font-bold text-[#111827]">Hapus Data Inbound?</h2>
                            </div>
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-sm text-[#374151] leading-relaxed">Tindakan ini tidak dapat dibatalkan.</p>
                                <div className="rounded-xl bg-[#FEF2F2] border border-red-100 px-4 py-3 space-y-1">
                                    <p className="text-sm font-semibold text-[#111827]">Nomor FO: {record.nomorFO}</p>
                                    <p className="text-xs text-[#64748B]">{record.nopol} · {record.tanggal} · {record.plantPabrik}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={onClose} disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="button" onClick={onConfirm} disabled={deleting}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {deleting ? (
                                        <><svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>Menghapus...</>
                                    ) : <><Trash2 size={14} />Hapus</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function InboundPage() {
    const [data, setData] = useState<InboundRecord[]>(initialInboundData);
    const [filters, setFilters] = useState<InboundFilters>(INITIAL_FILTERS);
    const [modalState, setModalState] = useState<ModalState>({ open: false, mode: "create" });
    const [deleteTarget, setDeleteTarget] = useState<InboundRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── Filtered dataset ──────────────────────────────────────────────────────
    const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);

    // ── Filter options — plants dynamic, jenis locked to SLIPSHEET/CURAH ──────
    const availablePlants = useMemo(() => [...new Set(data.map((r) => r.plantPabrik))].sort(), [data]);

    // ── Existing FOs ──────────────────────────────────────────────────────────
    const existingFOs = useMemo(() => data.map((r) => r.nomorFO), [data]);
    const modalExistingFOs = useMemo(() => {
        if (modalState.mode === "edit" && modalState.record) {
            return existingFOs.filter((fo) => fo !== modalState.record!.nomorFO);
        }
        return existingFOs;
    }, [existingFOs, modalState]);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const addToast = useCallback((variant: ToastVariant, message: string) => {
        const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts((p) => [...p, { id, variant, message }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    }, []);
    const dismissToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

    // ── Filters ───────────────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<InboundFilters>) => setFilters((p) => ({ ...p, ...partial })), []);
    const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleOpenCreate = useCallback(() => setModalState({ open: true, mode: "create" }), []);
    const handleEdit = useCallback((r: InboundRecord) => setModalState({ open: true, mode: "edit", record: r }), []);
    const handleDeleteClick = useCallback((r: InboundRecord) => setDeleteTarget(r), []);

    const handleSave = useCallback(async (values: InboundFormValues) => {
        setSaving(true);
        await new Promise<void>((res) => setTimeout(res, 400));

        if (modalState.mode === "create") {
            const rec: InboundRecord = {
                id: `IB-${Date.now()}`,
                tanggal: values.tanggal,
                tanggalDatetime: values.tanggalDatetime.trim(),
                shifting: values.shifting.trim(),
                nomorFO: values.nomorFO.trim(),
                nopol: values.nopol.trim(),
                plantPabrik: values.plantPabrik.trim(),
                jenisBongkaran: values.jenisBongkaran.trim() as InboundRecord["jenisBongkaran"],
                totalBox: parseInt(values.totalBox, 10),
                nomorGR: values.nomorGR.trim(),
                totalSlipsheet: parseInt(values.totalSlipsheet, 10),
            };
            setData((p) => [rec, ...p]);
            addToast("success", "Data inbound berhasil ditambahkan.");
        } else if (modalState.record) {
            const updated: InboundRecord = {
                ...modalState.record,
                tanggal: values.tanggal,
                tanggalDatetime: values.tanggalDatetime.trim(),
                shifting: values.shifting.trim(),
                nomorFO: values.nomorFO.trim(),
                nopol: values.nopol.trim(),
                plantPabrik: values.plantPabrik.trim(),
                jenisBongkaran: values.jenisBongkaran.trim() as InboundRecord["jenisBongkaran"],
                totalBox: parseInt(values.totalBox, 10),
                nomorGR: values.nomorGR.trim(),
                totalSlipsheet: parseInt(values.totalSlipsheet, 10),
            };
            setData((p) => p.map((r) => (r.id === updated.id ? updated : r)));
            addToast("success", "Data inbound berhasil diperbarui.");
        }

        setSaving(false);
        setModalState({ open: false, mode: "create" });
    }, [modalState, addToast]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        await new Promise<void>((res) => setTimeout(res, 400));
        setData((p) => p.filter((r) => r.id !== deleteTarget.id));
        addToast("success", "Data inbound berhasil dihapus.");
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, addToast]);

    const handleCloseModal = useCallback(() => { if (!saving) setModalState({ open: false, mode: "create" }); }, [saving]);
    const handleCloseDelete = useCallback(() => { if (!deleting) setDeleteTarget(null); }, [deleting]);

    // ── Scroll lock ───────────────────────────────────────────────────────────
    useEffect(() => {
        const open = modalState.open || deleteTarget !== null;
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [modalState.open, deleteTarget]);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ── 1. Header ────────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Inbound Monitoring</h1>
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5 flex-wrap">
                        Monitor seluruh aktivitas inbound secara realtime
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-semibold text-red-700">
                            {filteredData.length} dari {data.length} record
                        </span>
                    </p>
                </div>
                <button type="button" onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shrink-0">
                    <Plus size={16} aria-hidden="true" />
                    + Tambah Inbound
                </button>
            </motion.div>

            {/* ── 2. FilterBar ─────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <FilterBar
                    filters={filters}
                    availablePlants={availablePlants}
                    availableJenis={JENIS_OPTIONS}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
            </motion.div>

            {/* ── 3. KPI Cards (Row 1) ─────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <InboundCards data={filteredData} />
            </motion.div>

            {/* ── 4. Charts Row 2: Report Harian | Jumlah Bongkaran ─────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DailyReportChart data={filteredData} />
                <JumlahBongkaranChart data={filteredData} />
            </motion.div>

            {/* ── 5. Charts Row 3: Bongkaran by Plant | Produktivitas ────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <BongkaranPlantChart data={filteredData} />
                <JenisBongkaranChart data={filteredData} />
            </motion.div>

            {/* ── 6. Detail Table ──────────────────────────────────────────── */}
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <InboundTable data={filteredData} onEdit={handleEdit} onDelete={handleDeleteClick} />
            </motion.div>

            {/* ── Portals ──────────────────────────────────────────────────── */}
            <InboundModal
                open={modalState.open} mode={modalState.mode} record={modalState.record}
                saving={saving} existingFOs={modalExistingFOs}
                onSave={handleSave} onClose={handleCloseModal}
            />
            <DeleteDialog
                open={deleteTarget !== null} record={deleteTarget}
                deleting={deleting} onConfirm={handleConfirmDelete} onClose={handleCloseDelete}
            />
            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
