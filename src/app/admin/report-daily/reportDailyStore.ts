/**
 * reportDailyStore.ts
 * Local state store untuk Report Daily Transport.
 * Shared across all 3 tabs via hook — tidak ada duplicated state.
 * Includes filter state untuk FilterBar.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import type {
    TransportRecord,
    TransportFormValues,
    ModalState,
    ToastMessage,
    ToastVariant,
} from "./types";
import type { ReportDailyFilters } from "./FilterBar";
import { INITIAL_REPORT_DAILY_FILTERS } from "./FilterBar";

// ─── Initial data (kosong — diisi via CRUD) ───────────────────────────────────

const INITIAL_DATA: TransportRecord[] = [];

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyReportDailyFilters(
    records: TransportRecord[],
    filters: ReportDailyFilters
): TransportRecord[] {
    let r = records;
    const { startDate, endDate } = filters.dateRange;
    if (startDate) r = r.filter((d) => d.tanggal >= startDate);
    if (endDate) r = r.filter((d) => d.tanggal <= endDate);
    if (filters.division) r = r.filter((d) => d.division === filters.division);
    if (filters.jenisReport) r = r.filter((d) => d.jenisReport === filters.jenisReport);
    const q = filters.searchQuery.trim().toLowerCase();
    if (q) r = r.filter((d) =>
        d.jenisReport.toLowerCase().includes(q) ||
        d.informasiTambahan.toLowerCase().includes(q)
    );
    return r;
}

// ─── Store hook ───────────────────────────────────────────────────────────────

export function useReportDailyStore() {
    const [records, setRecords] = useState<TransportRecord[]>(INITIAL_DATA);
    const [filters, setFilters] = useState<ReportDailyFilters>(INITIAL_REPORT_DAILY_FILTERS);
    const [modalState, setModalState] = useState<ModalState>({ open: false, mode: "create" });
    const [deleteTarget, setDeleteTarget] = useState<TransportRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── Filter handlers ───────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<ReportDailyFilters>) => {
        setFilters((p) => ({ ...p, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_REPORT_DAILY_FILTERS);
    }, []);

    // ── Jenis Report options (from existing records) ──────────────────────────
    const jenisReportOptions = useMemo(() => {
        const set = new Set(records.map((r) => r.jenisReport));
        return Array.from(set).sort();
    }, [records]);

    // ── Filtered records ──────────────────────────────────────────────────────
    const filteredRecords = useMemo(
        () => applyReportDailyFilters(records, filters),
        [records, filters]
    );

    // ── Per-division slices (dari filtered) ───────────────────────────────────
    const transportRecords = useMemo(
        () => filteredRecords.filter((r) => r.division === "Transport"),
        [filteredRecords]
    );
    const warehouseFGRecords = useMemo(
        () => filteredRecords.filter((r) => r.division === "Warehouse FG"),
        [filteredRecords]
    );
    const warehouseBSRecords = useMemo(
        () => filteredRecords.filter((r) => r.division === "Warehouse BS"),
        [filteredRecords]
    );

    // ── Toast ─────────────────────────────────────────────────────────────────
    const addToast = useCallback((variant: ToastVariant, message: string) => {
        const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts((p) => [...p, { id, variant, message }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    }, []);

    const dismissToast = useCallback(
        (id: string) => setToasts((p) => p.filter((t) => t.id !== id)),
        []
    );

    // ── Modal ─────────────────────────────────────────────────────────────────
    const openCreate = useCallback(() => {
        setModalState({ open: true, mode: "create" });
    }, []);

    const openEdit = useCallback((record: TransportRecord) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    const closeModal = useCallback(() => {
        if (!saving) setModalState({ open: false, mode: "create" });
    }, [saving]);

    // ── Delete ────────────────────────────────────────────────────────────────
    const requestDelete = useCallback((record: TransportRecord) => {
        setDeleteTarget(record);
    }, []);

    const closeDelete = useCallback(() => {
        if (!deleting) setDeleteTarget(null);
    }, [deleting]);

    // ── Save (Create / Edit) ──────────────────────────────────────────────────
    const saveRecord = useCallback(
        async (values: TransportFormValues) => {
            setSaving(true);
            await new Promise<void>((res) => setTimeout(res, 350));

            if (modalState.mode === "create") {
                const rec: TransportRecord = {
                    id: `RD-${Date.now()}`,
                    tanggal: values.tanggal,
                    division: values.division as TransportRecord["division"],
                    jenisReport: values.jenisReport.trim(),
                    keterangan: values.keterangan.trim(),
                    informasiTambahan: values.informasiTambahan.trim(),
                };
                setRecords((p) => [rec, ...p]);
                addToast("success", "Report berhasil ditambahkan.");
            } else if (modalState.record) {
                const updated: TransportRecord = {
                    ...modalState.record,
                    tanggal: values.tanggal,
                    division: values.division as TransportRecord["division"],
                    jenisReport: values.jenisReport.trim(),
                    keterangan: values.keterangan.trim(),
                    informasiTambahan: values.informasiTambahan.trim(),
                };
                setRecords((p) => p.map((r) => (r.id === updated.id ? updated : r)));
                addToast("success", "Report berhasil diperbarui.");
            }

            setSaving(false);
            setModalState({ open: false, mode: "create" });
        },
        [modalState, addToast]
    );

    // ── Confirm delete ────────────────────────────────────────────────────────
    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        await new Promise<void>((res) => setTimeout(res, 350));
        setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
        addToast("success", "Report berhasil dihapus.");
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, addToast]);

    return {
        // data
        records,
        filteredRecords,
        transportRecords,
        warehouseFGRecords,
        warehouseBSRecords,
        // filters
        filters,
        jenisReportOptions,
        updateFilters,
        resetFilters,
        // modal
        modalState,
        openCreate,
        openEdit,
        closeModal,
        saving,
        saveRecord,
        // delete
        deleteTarget,
        requestDelete,
        closeDelete,
        deleting,
        confirmDelete,
        // toast
        toasts,
        dismissToast,
    };
}
