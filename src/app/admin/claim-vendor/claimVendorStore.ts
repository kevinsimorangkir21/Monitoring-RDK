"use client";

/**
 * claimVendorStore — Local state store untuk Claim Vendor.
 * Single source of truth untuk seluruh komponen di halaman ini.
 * Includes filter state untuk FilterBar.
 */

import { useState, useMemo, useCallback } from "react";
import type {
    ClaimEntry,
    ClaimFormValues,
    ModalState,
    ToastMessage,
    ToastVariant,
    ClaimKPIs,
    TrendPoint,
    VendorRecapRow,
    ClaimStatus,
} from "./types";
import { claimVendorData } from "./mock";
import type { ClaimFilters } from "./FilterBar";
import { INITIAL_CLAIM_FILTERS } from "./FilterBar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
    const n = parseFloat(s.replace(/[^0-9.]/g, ""));
    return isFinite(n) && n >= 0 ? n : 0;
}

/** Format Rupiah */
export function fmtRp(v: number): string {
    if (!isFinite(v) || v < 0) return "Rp 0";
    return `Rp ${v.toLocaleString("id-ID")}`;
}

/** Format Rupiah compact */
export function fmtRpCompact(v: number): string {
    if (!isFinite(v) || v < 0) return "Rp 0";
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}M`;
    return `Rp ${v.toLocaleString("id-ID")}`;
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyClaimFilters(records: ClaimEntry[], filters: ClaimFilters): ClaimEntry[] {
    let r = records;
    const { startDate, endDate } = filters.dateRange;
    if (startDate) r = r.filter((d) => d.tanggal >= startDate);
    if (endDate) r = r.filter((d) => d.tanggal <= endDate);
    if (filters.vendor) r = r.filter((d) => d.vendor === filters.vendor);
    if (filters.status) r = r.filter((d) => d.status === filters.status);
    const q = filters.searchQuery.trim().toLowerCase();
    if (q) r = r.filter((d) =>
        d.vendor.toLowerCase().includes(q) ||
        d.noMobil.toLowerCase().includes(q)
    );
    return r;
}

// ─── Store hook ───────────────────────────────────────────────────────────────

export function useClaimVendorStore() {
    const [records, setRecords] = useState<ClaimEntry[]>(claimVendorData);
    const [filters, setFilters] = useState<ClaimFilters>(INITIAL_CLAIM_FILTERS);
    const [modalState, setModalState] = useState<ModalState>({ open: false, mode: "create" });
    const [deleteTarget, setDeleteTarget] = useState<ClaimEntry | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── Filter handlers ───────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<ClaimFilters>) => {
        setFilters((p) => ({ ...p, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_CLAIM_FILTERS);
    }, []);

    // ── Vendor list ───────────────────────────────────────────────────────────
    const vendors = useMemo(() => {
        const set = new Set(records.map((r) => r.vendor));
        return Array.from(set).sort();
    }, [records]);

    // ── Filtered records ──────────────────────────────────────────────────────
    const filteredRecords = useMemo(
        () => applyClaimFilters(records, filters),
        [records, filters]
    );

    // ── KPI (dari filtered) ───────────────────────────────────────────────────
    const kpi = useMemo((): ClaimKPIs => {
        let totalNominal = 0;
        let belumDibayarNominal = 0;
        let belumDibayarDokumen = 0;
        let sudahLunasNominal = 0;
        let sudahLunasDokumen = 0;

        for (const r of filteredRecords) {
            const total = isFinite(r.totalClaim) ? r.totalClaim : 0;
            const belum = isFinite(r.belumDibayar) ? r.belumDibayar : 0;
            const lunas = isFinite(r.sudahDibayar) ? r.sudahDibayar : 0;
            totalNominal += total;
            if (r.status === "Pending") {
                belumDibayarNominal += belum;
                belumDibayarDokumen += 1;
            } else {
                sudahLunasNominal += lunas;
                sudahLunasDokumen += 1;
            }
        }

        return {
            totalDokumen: filteredRecords.length,
            totalNominal,
            belumDibayarNominal,
            belumDibayarDokumen,
            sudahLunasNominal,
            sudahLunasDokumen,
        };
    }, [filteredRecords]);

    // ── Chart: Trend ──────────────────────────────────────────────────────────
    const trendData = useMemo((): TrendPoint[] => {
        const map: Record<string, { belumDibayar: number; sudahDibayar: number }> = {};
        for (const r of filteredRecords) {
            if (!map[r.tanggal]) map[r.tanggal] = { belumDibayar: 0, sudahDibayar: 0 };
            map[r.tanggal].belumDibayar += isFinite(r.belumDibayar) ? r.belumDibayar : 0;
            map[r.tanggal].sudahDibayar += isFinite(r.sudahDibayar) ? r.sudahDibayar : 0;
        }
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([tanggal, v]) => ({ tanggal, ...v }));
    }, [filteredRecords]);

    // ── Rekap per vendor ──────────────────────────────────────────────────────
    const vendorRecap = useMemo((): VendorRecapRow[] => {
        const map: Record<string, { totalClaiman: number; lunas: number; belumBayar: number; jumlahDokumen: number }> = {};
        for (const r of filteredRecords) {
            if (!map[r.vendor]) map[r.vendor] = { totalClaiman: 0, lunas: 0, belumBayar: 0, jumlahDokumen: 0 };
            map[r.vendor].totalClaiman += isFinite(r.totalClaim) ? r.totalClaim : 0;
            map[r.vendor].lunas += isFinite(r.sudahDibayar) ? r.sudahDibayar : 0;
            map[r.vendor].belumBayar += isFinite(r.belumDibayar) ? r.belumDibayar : 0;
            map[r.vendor].jumlahDokumen += 1;
        }
        return Object.entries(map)
            .map(([vendor, v]) => ({ vendor, ...v }))
            .sort((a, b) => b.totalClaiman - a.totalClaiman);
    }, [filteredRecords]);

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

    const openEdit = useCallback((record: ClaimEntry) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    const closeModal = useCallback(() => {
        if (!saving) setModalState({ open: false, mode: "create" });
    }, [saving]);

    // ── Save ──────────────────────────────────────────────────────────────────
    const saveRecord = useCallback(
        async (values: ClaimFormValues) => {
            setSaving(true);
            await new Promise<void>((res) => setTimeout(res, 350));

            const totalClaim = parseNum(values.totalClaim);
            const sudahDibayar = parseNum(values.sudahDibayar);
            const belumDibayar = Math.max(0, totalClaim - sudahDibayar);
            const status: ClaimStatus = belumDibayar === 0 ? "Lunas" : "Pending";

            if (modalState.mode === "create") {
                const rec: ClaimEntry = {
                    id: `CLM-${Date.now()}`,
                    tanggal: values.tanggal,
                    vendor: values.vendor.trim(),
                    noMobil: values.noMobil.trim(),
                    totalClaim,
                    sudahDibayar,
                    belumDibayar,
                    status,
                    keterangan: values.keterangan.trim(),
                };
                setRecords((p) => [rec, ...p]);
                addToast("success", "Data Claim berhasil ditambahkan.");
            } else if (modalState.record) {
                const updated: ClaimEntry = {
                    ...modalState.record,
                    tanggal: values.tanggal,
                    vendor: values.vendor.trim(),
                    noMobil: values.noMobil.trim(),
                    totalClaim,
                    sudahDibayar,
                    belumDibayar,
                    status,
                    keterangan: values.keterangan.trim(),
                };
                setRecords((p) => p.map((r) => (r.id === updated.id ? updated : r)));
                addToast("success", "Data Claim berhasil diperbarui.");
            }

            setSaving(false);
            setModalState({ open: false, mode: "create" });
        },
        [modalState, addToast]
    );

    // ── Delete ────────────────────────────────────────────────────────────────
    const requestDelete = useCallback((record: ClaimEntry) => {
        setDeleteTarget(record);
    }, []);

    const closeDelete = useCallback(() => {
        if (!deleting) setDeleteTarget(null);
    }, [deleting]);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        await new Promise<void>((res) => setTimeout(res, 350));
        setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
        addToast("success", "Data Claim berhasil dihapus.");
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, addToast]);

    return {
        records,
        filteredRecords,
        kpi,
        trendData,
        vendorRecap,
        vendors,
        // filters
        filters,
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
