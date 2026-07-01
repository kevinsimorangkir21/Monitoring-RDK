"use client";

/**
 * /admin/report-daily — Report Daily Transport Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * 3 Tab: Transport | Warehouse FG | Warehouse BS
 * CRUD: hanya Super Admin (via ReportDailyActions)
 * State: shared via useReportDailyStore (satu sumber kebenaran)
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

import type { ReportDailyTab, TransportRecord, ToastMessage } from "./types";
import type {
    GantunganItem,
    JamPulangPickingItem,
    BadStockItem,
    StockOnHandItem,
} from "@/types/reportDaily";

import { useReportDailyStore } from "./reportDailyStore";
import ReportDailyActions from "./ReportDailyActions";
import ReportDailyModal from "./ReportDailyModal";
import ReportDailyDeleteDialog from "./ReportDailyDeleteDialog";
import ReportTable from "./ReportTable";
import FilterBar from "./FilterBar";

// ─── Dynamic chart imports ────────────────────────────────────────────────────

const SegmentTabs = dynamic(
    () => import("@/components/report-daily/SegmentTabs"),
    { ssr: false }
);
const TransportChart = dynamic(
    () => import("@/components/report-daily/TransportChart"),
    { ssr: false }
);
const WarehouseFGChart = dynamic(
    () => import("@/components/report-daily/WarehouseFGChart"),
    { ssr: false }
);
const WarehouseBSChart = dynamic(
    () => import("@/components/report-daily/WarehouseBSChart"),
    { ssr: false }
);
const StockOnHandChart = dynamic(
    () => import("@/components/report-daily/StockOnHandChart"),
    { ssr: false }
);

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Chart aggregation helpers ────────────────────────────────────────────────

function buildGantunganData(records: TransportRecord[]): GantunganItem[] {
    const map: Record<string, { volume: number; countDO: number }> = {};
    for (const r of records) {
        if (r.division !== "Transport") continue;
        if (!map[r.tanggal]) map[r.tanggal] = { volume: 0, countDO: 0 };
        const num = parseFloat(r.keterangan.replace(/[^0-9.]/g, "")) || 0;
        map[r.tanggal].volume += isFinite(num) ? num : 0;
        map[r.tanggal].countDO += 1;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => ({ tanggal, ...v }));
}

function buildFGData(records: TransportRecord[]): JamPulangPickingItem[] {
    const map: Record<string, { qtyPickingBox: number; qtyPickingPcs: number; count: number }> = {};
    for (const r of records) {
        if (r.division !== "Warehouse FG") continue;
        if (!map[r.tanggal]) map[r.tanggal] = { qtyPickingBox: 0, qtyPickingPcs: 0, count: 0 };
        const num = parseFloat(r.keterangan.replace(/[^0-9.]/g, "")) || 0;
        map[r.tanggal].qtyPickingBox += isFinite(num) ? num : 0;
        map[r.tanggal].count += 1;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => ({
            tanggal,
            qtyPickingBox: v.qtyPickingBox,
            qtyPickingPcs: v.qtyPickingPcs,
            jamPulang: v.count > 0 ? 17 : 0,
        }));
}

function buildBSData(records: TransportRecord[]): BadStockItem[] {
    const map: Record<string, { masuk: number; keluar: number; repack: number }> = {};
    for (const r of records) {
        if (r.division !== "Warehouse BS") continue;
        if (!map[r.tanggal]) map[r.tanggal] = { masuk: 0, keluar: 0, repack: 0 };
        const num = parseFloat(r.keterangan.replace(/[^0-9.]/g, "")) || 0;
        const safe = isFinite(num) ? num : 0;
        const jenis = r.jenisReport.toLowerCase();
        if (jenis.includes("masuk") || jenis.includes("in")) map[r.tanggal].masuk += safe;
        else if (jenis.includes("keluar") || jenis.includes("out")) map[r.tanggal].keluar += safe;
        else map[r.tanggal].repack += safe;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, v]) => ({ tanggal, ...v }));
}

function buildStockOnHandData(records: TransportRecord[]): StockOnHandItem[] {
    const map: Record<string, number> = {};
    for (const r of records) {
        if (r.division !== "Warehouse BS") continue;
        if (
            !r.jenisReport.toLowerCase().includes("stock on hand") &&
            !r.jenisReport.toLowerCase().includes("soh")
        ) continue;
        const num = parseFloat(r.keterangan.replace(/[^0-9.]/g, "")) || 0;
        map[r.tanggal] = isFinite(num) ? num : 0;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tanggal, stockOnHand]) => ({ tanggal, stockOnHand }));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const ok = toast.variant === "success";
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg px-4 py-3 border-l-4 pointer-events-auto ${ok ? "border-[#16A34A]" : "border-red-500"}`}
        >
            {ok
                ? <CheckCircle2 size={16} className="text-[#16A34A] shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
            <p className="flex-1 text-sm text-[#111827] leading-snug">{toast.message}</p>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]"
            >
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

// ─── Tab Badge ────────────────────────────────────────────────────────────────

function TabBadge({ count, division }: { count: number; division: string }) {
    return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">
            {count.toLocaleString("id-ID")} Data Divisi {division}
        </span>
    );
}

// ─── Aktivitas Harian (preview 5 record) ─────────────────────────────────────

function AktivitasHarian({ data, emptyText }: { data: TransportRecord[]; emptyText: string }) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            <div className="mb-3">
                <p className="text-sm font-semibold text-[#111827]">Report Aktivitas Harian</p>
                <p className="text-xs text-[#64748B]">Ringkasan 5 aktivitas terbaru</p>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-[#9CA3AF] py-8 text-center">{emptyText}</p>
            ) : (
                <div className="space-y-2">
                    {data.slice(0, 5).map((r) => (
                        <div
                            key={r.id}
                            className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#111827] truncate">{r.jenisReport}</p>
                                <p className="text-xs text-[#64748B] truncate">{r.keterangan}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs text-[#64748B]">{r.tanggal}</p>
                                <p className="text-xs text-[#9CA3AF]">{r.informasiTambahan}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Tab Content Components ───────────────────────────────────────────────────

function TransportTabContent({
    data,
    allData,
    onEdit,
    onDelete,
}: {
    data: TransportRecord[];
    allData: TransportRecord[];
    onEdit: (r: TransportRecord) => void;
    onDelete: (r: TransportRecord) => void;
}) {
    const chartData = useMemo(() => buildGantunganData(allData), [allData]);
    const count = useMemo(() => allData.filter((r) => r.division === "Transport").length, [allData]);

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <TabBadge count={count} division="Transport" />
            </div>
            <TransportChart data={chartData} />
            <AktivitasHarian data={data} emptyText="Belum ada data Transport." />
            <ReportTable data={data} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
}

function WarehouseFGTabContent({
    data,
    allData,
    onEdit,
    onDelete,
}: {
    data: TransportRecord[];
    allData: TransportRecord[];
    onEdit: (r: TransportRecord) => void;
    onDelete: (r: TransportRecord) => void;
}) {
    const chartData = useMemo(() => buildFGData(allData), [allData]);
    const count = useMemo(() => allData.filter((r) => r.division === "Warehouse FG").length, [allData]);

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <TabBadge count={count} division="Warehouse FG" />
            </div>
            <WarehouseFGChart data={chartData} />
            <AktivitasHarian data={data} emptyText="Belum ada data Warehouse FG." />
            <ReportTable data={data} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
}

function WarehouseBSTabContent({
    data,
    allData,
    onEdit,
    onDelete,
}: {
    data: TransportRecord[];
    allData: TransportRecord[];
    onEdit: (r: TransportRecord) => void;
    onDelete: (r: TransportRecord) => void;
}) {
    const bsChartData = useMemo(() => buildBSData(allData), [allData]);
    const stockData = useMemo(() => buildStockOnHandData(allData), [allData]);
    const count = useMemo(() => allData.filter((r) => r.division === "Warehouse BS").length, [allData]);

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <TabBadge count={count} division="Warehouse BS" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <WarehouseBSChart data={bsChartData} />
                <StockOnHandChart data={stockData} />
            </div>
            <AktivitasHarian data={data} emptyText="Belum ada data Warehouse BS." />
            <ReportTable data={data} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportDailyPage() {
    const {
        records,
        filteredRecords,
        transportRecords,
        warehouseFGRecords,
        warehouseBSRecords,
        filters,
        jenisReportOptions,
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
    } = useReportDailyStore();

    const [activeTab, setActiveTab] = useState<ReportDailyTab>("transport");

    const handleTabChange = useCallback((tab: ReportDailyTab) => setActiveTab(tab), []);

    // Scroll lock saat modal / dialog terbuka
    useEffect(() => {
        const open = modalState.open || deleteTarget !== null;
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [modalState.open, deleteTarget]);

    return (
        <div className="space-y-5">

            {/* ── 1. Header ──────────────────────────────────────────────── */}
            <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">
                        Report Daily Transport
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Monitoring harian Transport, Warehouse FG, dan Warehouse BS
                    </p>
                </div>
                <ReportDailyActions onAdd={openCreate} />
            </motion.div>

            {/* ── 2. FilterBar ───────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <FilterBar
                    filters={filters}
                    jenisReportOptions={jenisReportOptions}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
            </motion.div>

            {/* ── 3. Segment Tabs ────────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <SegmentTabs active={activeTab} onChange={handleTabChange} />
            </motion.div>

            {/* ── 4. Tab Content ─────────────────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <AnimatePresence mode="wait">
                    {activeTab === "transport" && (
                        <motion.div
                            key="transport"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TransportTabContent
                                data={transportRecords}
                                allData={filteredRecords}
                                onEdit={openEdit}
                                onDelete={requestDelete}
                            />
                        </motion.div>
                    )}
                    {activeTab === "warehouse-fg" && (
                        <motion.div
                            key="warehouse-fg"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <WarehouseFGTabContent
                                data={warehouseFGRecords}
                                allData={filteredRecords}
                                onEdit={openEdit}
                                onDelete={requestDelete}
                            />
                        </motion.div>
                    )}
                    {activeTab === "warehouse-bs" && (
                        <motion.div
                            key="warehouse-bs"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <WarehouseBSTabContent
                                data={warehouseBSRecords}
                                allData={filteredRecords}
                                onEdit={openEdit}
                                onDelete={requestDelete}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── Portals ────────────────────────────────────────────────── */}
            <ReportDailyModal
                open={modalState.open}
                mode={modalState.mode}
                record={modalState.record}
                saving={saving}
                onSave={saveRecord}
                onClose={closeModal}
            />
            <ReportDailyDeleteDialog
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
