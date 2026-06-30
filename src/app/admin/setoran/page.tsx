"use client";

/**
 * /admin/setoran — Setoran ke Kasir Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Main dashboard page that coordinates:
 *   1. Centralised filter state management via useFilterCoordination
 *   2. Memoised data processing pipeline
 *   3. Data flow to all child components (cards, charts, table)
 *   4. Responsive grid layout (mobile → tablet → desktop)
 *   5. Error boundary handling and loading states (task 10.1)
 *   6. Data refresh functionality for mock data regeneration (task 10.1)
 *   7. Full CRUD operations: create, edit, delete with optimistic updates (task 8.2)
 *
 * Requirements: 1.1, 1.2, 3.2, 3.4, 3.5, 4.4, 4.5, 5.1, 5.2, 5.3,
 *               6.4, 6.5, 7.1, 7.2, 7.3, 8.2, 8.3, 8.4, 15.2
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { RefreshCw, Plus } from "lucide-react";

import type { SetoranRecord } from "@/types/setoran";

// ── Centralised filter coordination hook ──────────────────────────────────────
import { useFilterCoordination } from "./hooks/useFilterCoordination";

// ── CRUD hook ─────────────────────────────────────────────────────────────────
import { useCrudOperations } from "./hooks/useCrudOperations";

// ── CRUD types ────────────────────────────────────────────────────────────────
import type {
    CrudModalState,
    SetoranFormValues,
    ToastMessage,
} from "./types/crud";

// ── Error Boundary ────────────────────────────────────────────────────────────
import SetoranErrorBoundary from "./components/SetoranErrorBoundary";

// ── Dashboard components ───────────────────────────────────────────────────────
import FilterBar from "./components/FilterBar";
import SetoranCards from "./components/SetoranCards";
import DailyAverageChart from "./components/DailyAverageChart";
import TopLongestSalesmanChart from "./components/TopLongestSalesmanChart";
import TopFastestSalesmanChart from "./components/TopFastestSalesmanChart";
import DurationDistributionChart from "./components/DurationDistributionChart";
import SetoranTable from "./components/SetoranTable";

// ── CRUD UI components ────────────────────────────────────────────────────────
import { SetoranFormModal } from "./components/SetoranFormModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { ToastContainer } from "./components/ToastContainer";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum artificial loading delay (ms) so the loading state is visible */
const LOADING_DELAY_MS = 400;

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SetoranPage() {
    // ── Raw data state — starts empty, populated via CRUD operations ─────────
    const [rawData, setRawData] = useState<SetoranRecord[]>([]);

    // ── Loading state — shown during initial load and data refresh ────────────
    const [loading, setLoading] = useState(false);

    // ── CRUD modal state (Requirements 1.1, 1.2, 3.2) ────────────────────────
    const [modalState, setModalState] = useState<CrudModalState>({
        open: false,
        mode: "create",
    });

    // ── Delete confirmation target (Requirements 4.1, 4.2, 4.3) ─────────────
    const [deleteTarget, setDeleteTarget] = useState<SetoranRecord | null>(null);

    // ── Toast notification queue (Requirements 8.2, 8.3, 8.4) ───────────────
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ── addToast helper ───────────────────────────────────────────────────────
    const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
        setToasts((prev) => [
            ...prev,
            { ...toast, id: crypto.randomUUID() },
        ]);
    }, []);

    // ── Dismiss a toast by id ─────────────────────────────────────────────────
    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── CRUD hook wired to rawData (Requirements 5.1, 5.2, 5.3, 15.1) ────────
    const { creating, updating, deleting, createRecord, updateRecord, deleteRecord } =
        useCrudOperations({
            onOptimisticUpdate: (updater) => setRawData(updater),
            onRollback: (prev) => setRawData(prev),
            onToast: addToast,
        });

    // ── Data refresh handler — clears all data back to empty state ───────────
    const handleRefresh = useCallback(async () => {
        setLoading(true);
        await new Promise<void>((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
        setRawData([]);
        setLoading(false);
    }, []);

    // ── Centralised filter state coordination (Requirements 6.1–6.5) ─────────
    const {
        filters,
        filteredData,
        availableMonths,
        availableSalesman,
        updateFilters,
        resetFilters,
    } = useFilterCoordination(rawData);

    // ── handleEdit — open modal in edit mode (Requirement 3.2) ───────────────
    const handleEdit = useCallback((record: SetoranRecord) => {
        setModalState({ open: true, mode: "edit", record });
    }, []);

    // ── handleDelete — set delete target, opens dialog (Requirement 4.1) ─────
    const handleDelete = useCallback((record: SetoranRecord) => {
        setDeleteTarget(record);
    }, []);

    // ── handleSave — create or update based on modal mode (Requirements 8.2, 8.3) ──
    const handleSave = useCallback(
        async (values: SetoranFormValues) => {
            if (modalState.mode === "create") {
                const result = await createRecord(values);
                if (result !== null) {
                    setModalState({ open: false, mode: "create" });
                }
            } else if (modalState.mode === "edit" && modalState.record) {
                const result = await updateRecord(modalState.record.id, values);
                if (result !== null) {
                    setModalState({ open: false, mode: "create" });
                }
            }
        },
        [modalState, createRecord, updateRecord]
    );

    // ── handleConfirmDelete — executes delete and clears target (Requirement 4.4) ──
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const success = await deleteRecord(deleteTarget.id);
        if (success) {
            setDeleteTarget(null);
        }
    }, [deleteTarget, deleteRecord]);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <SetoranErrorBoundary>
            <div className="space-y-5">

                {/* ── 1. Page Header ──────────────────────────────────────────── */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                >
                    <div>
                        <h1 className="text-xl font-bold text-[#111827] leading-tight">
                            Setoran ke Kasir
                        </h1>
                        <p className="text-xs text-[#64748B] mt-1">
                            Monitoring Durasi Setoran Salesman
                        </p>
                    </div>

                    {/* ── Right-side header actions ────────────────────────────── */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Record count badge */}
                        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#E5E7EB] shadow-sm text-[11px] text-[#64748B]">
                            {filteredData.length.toLocaleString("id-ID")} dari{" "}
                            {rawData.length.toLocaleString("id-ID")} record
                        </span>

                        {/* ── Refresh Data button ────────────────────────────────── */}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            aria-label="Regenerasi data mock"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-medium text-[#374151] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`}
                                aria-hidden="true"
                            />
                            {loading ? "Memuat..." : "Refresh Data"}
                        </button>

                        {/* ── + Tambah Setoran button (Requirement 1.1) ──────────── */}
                        <button
                            type="button"
                            onClick={() =>
                                setModalState({ open: true, mode: "create" })
                            }
                            aria-label="Tambah data setoran baru"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                        >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            Tambah Setoran
                        </button>
                    </div>
                </motion.div>

                {/* ── 2. Filter Bar (Requirements 6.1–6.5) ───────────────────── */}
                <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                    <FilterBar
                        filters={filters}
                        availableMonths={availableMonths}
                        availableSalesman={availableSalesman}
                        onChange={updateFilters}
                        onReset={resetFilters}
                    />
                </motion.div>

                {/* ── 3. KPI Cards — full width (Requirements 1.1–1.5, 8.3) ──── */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                    <SetoranCards data={filteredData} loading={loading} />
                </motion.div>

                {/* ── 4. Daily Trend Chart — full width ──────────────────────── */}
                <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                    <DailyAverageChart data={filteredData} />
                </motion.div>

                {/* ── 5. Ranking Charts — 2-column on desktop ────────────────── */}
                <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                >
                    <TopLongestSalesmanChart data={filteredData} />
                    <TopFastestSalesmanChart data={filteredData} />
                </motion.div>

                {/* ── 6. Duration Distribution Chart — full width ──────────────── */}
                <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                    <DurationDistributionChart data={filteredData} />
                </motion.div>

                {/* ── 7. Data Table — full width (Requirements 5.1–5.5, 8.4, 8.5) */}
                <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
                    <SetoranTable
                        data={filteredData}
                        searchQuery={filters.searchQuery}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </motion.div>

            </div>

            {/* ── CRUD Modals & Notifications ────────────────────────────────────── */}

            {/* Add / Edit form modal (Requirements 1.2, 3.2) */}
            <SetoranFormModal
                open={modalState.open}
                mode={modalState.mode}
                record={modalState.record}
                availableSalesman={availableSalesman}
                saving={creating || updating}
                onSave={handleSave}
                onClose={() => setModalState({ open: false, mode: "create" })}
            />

            {/* Delete confirmation dialog (Requirements 4.2, 4.3) */}
            <DeleteConfirmDialog
                open={deleteTarget !== null}
                record={deleteTarget}
                deleting={deleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteTarget(null)}
            />

            {/* Toast notification stack (Requirements 8.2, 8.3, 8.4) */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        </SetoranErrorBoundary>
    );
}
