"use client";

/**
 * scanOutStore — Local state store untuk Scan Out DC.
 * Single source of truth untuk seluruh komponen di halaman ini.
 * Includes filter state untuk FilterBar.
 */

import { useState, useMemo, useCallback } from "react";
import type {
    ScanOutEntry,
    ScanOutFormValues,
    ModalState,
    ToastMessage,
    ToastVariant,
    TrendPoint,
    VendorAvgPoint,
    ArmadaPoint,
} from "./types";
import { scanOutData } from "./mock";
import type { ScanOutFilters } from "./FilterBar";
import { INITIAL_SCAN_OUT_FILTERS } from "./FilterBar";

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** "HH:mm" → decimal hours (e.g. "07:30" → 7.5) */
export function timeToDecimal(t: string): number {
    if (!t || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    if (!isFinite(h) || !isFinite(m)) return 0;
    return h + m / 60;
}

/** decimal hours → "HH:mm" (e.g. 7.5 → "07:30") */
export function decimalToTime(v: number): string {
    if (!isFinite(v) || v < 0) return "00:00";
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Calculate lead time "HH:mm" from jamScanOut and jamScanIn */
export function calcLeadTime(jamOut: string, jamIn: string): string {
    const out = timeToDecimal(jamOut);
    const inp = timeToDecimal(jamIn);
    const diff = inp - out;
    if (!isFinite(diff) || diff < 0) return "00:00";
    return decimalToTime(diff);
}

/** Average of an array of decimal hours → "HH:mm", "00:00" if empty */
function avgTime(values: number[]): string {
    if (!values.length) return "00:00";
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return decimalToTime(avg);
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyScanOutFilters(records: ScanOutEntry[], filters: ScanOutFilters): ScanOutEntry[] {
    let r = records;
    const { startDate, endDate } = filters.dateRange;
    if (startDate) r = r.filter((d) => d.tanggal >= startDate);
    if (endDate) r = r.filter((d) => d.tanggal <= endDate);
    if (filters.vendor) r = r.filter((d) => d.vendor === filters.vendor);
    if (filters.nopol) r = r.filter((d) => d.nopol === filters.nopol);
    const q = filters.searchQuery.trim().toLowerCase();
    if (q) r = r.filter((d) => d.nopol.toLowerCase().includes(q));
    return r;
}

// ─── Store hook ───────────────────────────────────────────────────────────────

export function useScanOutStore() {
    const [records, setRecords] = useState<ScanOutEntry[]>(scanOutData);
    const [filters, setFilters] = useState<ScanOutFilters>(INITIAL_SCAN_OUT_FILTERS);
    const [modalState, setModalState] = useState<ModalState>({ open: false, mode: "create" });
    const [deleteTarget, setDeleteTarget] = useState<ScanOutEntry | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── Filter handlers ───────────────────────────────────────────────────────
    const updateFilters = useCallback((partial: Partial<ScanOutFilters>) => {
        setFilters((p) => ({ ...p, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_SCAN_OUT_FILTERS);
    }, []);

    // ── Vendor list ───────────────────────────────────────────────────────────
    const vendors = useMemo(() => {
        const set = new Set(records.map((r) => r.vendor));
        return Array.from(set).sort();
    }, [records]);

    // ── Nopol list (cascading dari vendor filter) ─────────────────────────────
    const nopolOptions = useMemo(() => {
        const base = filters.vendor
            ? records.filter((r) => r.vendor === filters.vendor)
            : records;
        const set = new Set(base.map((r) => r.nopol));
        return Array.from(set).sort();
    }, [records, filters.vendor]);

    // ── Filtered records ──────────────────────────────────────────────────────
    const filteredRecords = useMemo(
        () => applyScanOutFilters(records, filters),
        [records, filters]
    );

    // ── KPI (dari filtered) ───────────────────────────────────────────────────
    const kpi = useMemo(() => {
        const scanOutTimes = filteredRecords.map((r) => timeToDecimal(r.jamScanOut)).filter(isFinite);
        const scanInTimes = filteredRecords.map((r) => timeToDecimal(r.jamScanIn)).filter(isFinite);
        return {
            avgScanOut: avgTime(scanOutTimes),
            avgScanIn: avgTime(scanInTimes),
            total: filteredRecords.length,
        };
    }, [filteredRecords]);

    // ── Chart: Trend ──────────────────────────────────────────────────────────
    const trendData = useMemo((): TrendPoint[] => {
        const map: Record<string, { out: number[]; inp: number[] }> = {};
        for (const r of filteredRecords) {
            if (!map[r.tanggal]) map[r.tanggal] = { out: [], inp: [] };
            const outD = timeToDecimal(r.jamScanOut);
            const inD = timeToDecimal(r.jamScanIn);
            if (isFinite(outD) && outD > 0) map[r.tanggal].out.push(outD);
            if (isFinite(inD) && inD > 0) map[r.tanggal].inp.push(inD);
        }
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([tanggal, v]) => ({
                tanggal,
                avgScanOut: v.out.length ? v.out.reduce((a, b) => a + b, 0) / v.out.length : 0,
                avgScanIn: v.inp.length ? v.inp.reduce((a, b) => a + b, 0) / v.inp.length : 0,
            }));
    }, [filteredRecords]);

    // ── Chart: Vendor avg ─────────────────────────────────────────────────────
    const vendorData = useMemo((): VendorAvgPoint[] => {
        const map: Record<string, number[]> = {};
        for (const r of filteredRecords) {
            if (!map[r.vendor]) map[r.vendor] = [];
            const d = timeToDecimal(r.jamScanOut);
            if (isFinite(d) && d > 0) map[r.vendor].push(d);
        }
        return Object.entries(map)
            .map(([vendor, vals]) => ({
                vendor,
                avgScanOut: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
            }))
            .sort((a, b) => a.avgScanOut - b.avgScanOut);
    }, [filteredRecords]);

    // ── Chart: Armada avg ─────────────────────────────────────────────────────
    const armadaData = useMemo((): ArmadaPoint[] => {
        const map: Record<string, number[]> = {};
        for (const r of filteredRecords) {
            if (!map[r.nopol]) map[r.nopol] = [];
            const d = timeToDecimal(r.jamScanOut);
            if (isFinite(d) && d > 0) map[r.nopol].push(d);
        }
        return Object.entries(map)
            .map(([nopol, vals]) => ({
                nopol,
                avgScanOut: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
            }))
            .sort((a, b) => a.avgScanOut - b.avgScanOut);
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

    const openEdit = useCallback((record: ScanOutEntry) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    const closeModal = useCallback(() => {
        if (!saving) setModalState({ open: false, mode: "create" });
    }, [saving]);

    // ── Save ──────────────────────────────────────────────────────────────────
    const saveRecord = useCallback(
        async (values: ScanOutFormValues) => {
            setSaving(true);
            await new Promise<void>((res) => setTimeout(res, 350));

            const leadTime = calcLeadTime(values.jamScanOut, values.jamScanIn);

            if (modalState.mode === "create") {
                const rec: ScanOutEntry = {
                    id: `SC-${Date.now()}`,
                    tanggal: values.tanggal,
                    nopol: values.nopol.trim(),
                    vendor: values.vendor,
                    jamScanOut: values.jamScanOut,
                    jamScanIn: values.jamScanIn,
                    leadTime,
                };
                setRecords((p) => [rec, ...p]);
                addToast("success", "Data Scan Out berhasil ditambahkan.");
            } else if (modalState.record) {
                const updated: ScanOutEntry = {
                    ...modalState.record,
                    tanggal: values.tanggal,
                    nopol: values.nopol.trim(),
                    vendor: values.vendor,
                    jamScanOut: values.jamScanOut,
                    jamScanIn: values.jamScanIn,
                    leadTime,
                };
                setRecords((p) => p.map((r) => (r.id === updated.id ? updated : r)));
                addToast("success", "Data Scan Out berhasil diperbarui.");
            }

            setSaving(false);
            setModalState({ open: false, mode: "create" });
        },
        [modalState, addToast]
    );

    // ── Delete ────────────────────────────────────────────────────────────────
    const requestDelete = useCallback((record: ScanOutEntry) => {
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
        addToast("success", "Data Scan Out berhasil dihapus.");
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, addToast]);

    return {
        records,
        filteredRecords,
        kpi,
        vendors,
        nopolOptions,
        trendData,
        vendorData,
        armadaData,
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
