"use client";

/**
 * /admin/gantungan-faktur — Nominal Gantungan Faktur Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Data structure (Excel-aligned):
 *   Tanggal | Date | PAY TERMS | CUSTOMER | NAMA TOKO |
 *   SD DOCUMENT | SALES DOC | NET VALUE | KETERANGAN DARI TRANSPORT
 *
 * Sections:
 *   1. Page Header     — title, + Tambah Faktur button, record count badge
 *   2. Filter Bar      — date range, CUSTOMER, PAY TERMS, search
 *   3. KPI Cards       — Total NET VALUE | Total Dokumen | Average NET VALUE | Customer Terbanyak
 *   4. Daily Trend     — ComposedChart Bar (Jumlah Dokumen) + Line (NET VALUE)
 *   5. Detail Table    — all Excel columns + Action
 *
 * CRUD: create, edit, delete with optimistic local state.
 * SALES DOC must be unique across all records.
 */

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, X, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

import type {
    FakturRecord, FakturFormValues, FakturFilters,
    ModalState, ToastMessage,
} from "./types";
import { initialFakturData } from "./mock";
import { parseCurrency } from "./FakturModal";
import FakturCards from "./FakturCards";
import DailyFakturChart from "./DailyFakturChart";
import FakturTable from "./FakturTable";
import FakturModal from "./FakturModal";
import FilterBar from "./FilterBar";

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
        <motion.div layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="status" aria-live="polite"
            className={`flex items-start gap-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg px-4 py-3 border-l-4 pointer-events-auto ${ok ? "border-emerald-500" : "border-red-500"}`}
        >
            {ok
                ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
            <p className="flex-1 text-sm text-[#111827] leading-snug">{toast.message}</p>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Tutup"
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

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
    open: boolean; record: FakturRecord | null; deleting: boolean;
    onConfirm: () => Promise<void>; onClose: () => void;
}

function DeleteDialog({ open, record, deleting, onConfirm, onClose }: DeleteDialogProps) {
    const handleBg = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !deleting) onClose();
    };
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="del-bg"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true" onClick={handleBg}
                    />
                    <motion.div key="del-dlg"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleBg}
                    >
                        <div role="alertdialog" aria-modal="true" aria-labelledby="del-title"
                            className="relative w-full max-w-sm bg-white rounded-[18px] shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E5E7EB]">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Trash2 size={18} className="text-red-500" />
                                </div>
                                <h2 id="del-title" className="text-sm font-bold text-[#111827]">Hapus Data Faktur</h2>
                            </div>
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-sm text-[#374151] leading-relaxed">
                                    Apakah Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                {record && (
                                    <div className="rounded-xl bg-[#FEF2F2] border border-red-100 px-4 py-3 space-y-1">
                                        <p className="text-sm font-semibold text-[#111827]">{record.customer}</p>
                                        <p className="text-xs text-[#64748B]">{record.salesDoc} · {record.tanggal}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <button type="button" onClick={onClose} disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed">
                                    Batal
                                </button>
                                <button type="button" onClick={onConfirm} disabled={deleting}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {deleting ? "Menghapus..." : <><Trash2 size={14} />Hapus</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Initial filter state ─────────────────────────────────────────────────────

const INITIAL_FILTERS: FakturFilters = {
    dateRange: { startDate: null, endDate: null },
    selectedCustomer: [],
    selectedPayTerms: [],
    searchQuery: "",
};

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(data: FakturRecord[], f: FakturFilters): FakturRecord[] {
    let result = data;

    const { startDate, endDate } = f.dateRange;
    if (startDate) result = result.filter((r) => r.tanggal >= startDate);
    if (endDate) result = result.filter((r) => r.tanggal <= endDate);

    if (f.selectedCustomer.length > 0)
        result = result.filter((r) => f.selectedCustomer.includes(r.customer));

    if (f.selectedPayTerms.length > 0)
        result = result.filter((r) => f.selectedPayTerms.includes(r.payTerms));

    const q = f.searchQuery.trim().toLowerCase();
    if (q) result = result.filter((r) =>
        r.customer.toLowerCase().includes(q) ||
        r.namaToko.toLowerCase().includes(q) ||
        r.salesDoc.toLowerCase().includes(q)
    );

    return result;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function GantunganFakturPage() {
    // ── Data state ─────────────────────────────────────────────────────────────
    const [data, setData] = useState<FakturRecord[]>(initialFakturData);

    // ── Filter state ───────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<FakturFilters>(INITIAL_FILTERS);

    // ── Modal / delete state ───────────────────────────────────────────────────
    const [modalState, setModalState] = useState<ModalState>({ open: false, mode: "create" });
    const [deleteTarget, setDeleteTarget] = useState<FakturRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Toast state ────────────────────────────────────────────────────────────
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((variant: ToastMessage["variant"], message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, variant, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Filters ────────────────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<FakturFilters>) => {
        setFilters((prev) => ({ ...prev, ...partial }));
    }, []);
    const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

    // ── Derived data ───────────────────────────────────────────────────────────
    const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);

    const availableCustomers = useMemo(() => {
        const s = new Set<string>();
        for (const r of data) s.add(r.customer);
        return [...s].sort();
    }, [data]);

    const availablePayTerms = useMemo(() => {
        const s = new Set<string>();
        for (const r of data) s.add(r.payTerms);
        return [...s].sort();
    }, [data]);

    const existingSalesDocs = useMemo(() => data.map((r) => r.salesDoc), [data]);

    // ── CRUD handlers ──────────────────────────────────────────────────────────

    const handleSave = useCallback(async (values: FakturFormValues) => {
        setSaving(true);
        await new Promise<void>((r) => setTimeout(r, 300));

        const netValue = parseCurrency(values.netValue);

        if (modalState.mode === "create") {
            const record: FakturRecord = {
                id: crypto.randomUUID(),
                tanggal: values.tanggal,
                date: values.date,
                payTerms: values.payTerms.trim(),
                customer: values.customer.trim(),
                namaToko: values.namaToko.trim(),
                sdDocument: values.sdDocument.trim(),
                salesDoc: values.salesDoc.trim(),
                netValue,
                keteranganTransport: values.keteranganTransport.trim(),
            };
            setData((prev) => [record, ...prev]);
            addToast("success", "Data faktur berhasil ditambahkan.");
        } else if (modalState.mode === "edit" && modalState.record) {
            const updated: FakturRecord = {
                ...modalState.record,
                tanggal: values.tanggal,
                date: values.date,
                payTerms: values.payTerms.trim(),
                customer: values.customer.trim(),
                namaToko: values.namaToko.trim(),
                sdDocument: values.sdDocument.trim(),
                salesDoc: values.salesDoc.trim(),
                netValue,
                keteranganTransport: values.keteranganTransport.trim(),
            };
            setData((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            addToast("success", "Data faktur berhasil diperbarui.");
        }

        setSaving(false);
        setModalState({ open: false, mode: "create" });
    }, [modalState, addToast]);

    const handleEdit = useCallback((record: FakturRecord) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    const handleDeleteClick = useCallback((record: FakturRecord) => {
        setDeleteTarget(record);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        await new Promise<void>((r) => setTimeout(r, 300));
        setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        addToast("success", "Data faktur berhasil dihapus.");
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, addToast]);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ──────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">Nominal Gantungan Faktur</h1>
                    <p className="text-xs text-[#64748B] mt-1">Monitoring Nominal Gantungan Faktur Vendor</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#E5E7EB] shadow-sm text-[11px] text-[#64748B]">
                        {filteredData.length.toLocaleString("id-ID")} dari {data.length.toLocaleString("id-ID")} record
                    </span>
                    <button
                        type="button"
                        onClick={() => setModalState({ open: true, mode: "create" })}
                        aria-label="Tambah data faktur baru"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                    >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        Tambah Faktur
                    </button>
                </div>
            </motion.div>

            {/* ── 2. Filter Bar ─────────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <FilterBar
                    filters={filters}
                    availableCustomers={availableCustomers}
                    availablePayTerms={availablePayTerms}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
            </motion.div>

            {/* ── 3. KPI Cards ──────────────────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <FakturCards data={filteredData} />
            </motion.div>

            {/* ── 4. Daily Faktur Trend ─────────────────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <DailyFakturChart data={filteredData} />
            </motion.div>

            {/* ── 5. Detail Table ───────────────────────────────────────────────── */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <FakturTable
                    data={filteredData}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </motion.div>

            {/* ── CRUD Modal ────────────────────────────────────────────────────── */}
            <FakturModal
                open={modalState.open}
                mode={modalState.mode}
                record={modalState.record}
                saving={saving}
                existingSalesDocs={existingSalesDocs}
                onSave={handleSave}
                onClose={() => setModalState({ open: false, mode: "create" })}
            />

            {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
            <DeleteDialog
                open={deleteTarget !== null}
                record={deleteTarget}
                deleting={deleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteTarget(null)}
            />

            {/* ── Toast Notifications ─────────────────────────────────────────────── */}
            <ToastStack toasts={toasts} onDismiss={dismissToast} />

        </div>
    );
}
