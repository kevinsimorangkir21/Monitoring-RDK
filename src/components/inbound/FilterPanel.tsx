"use client";

/**
 * FilterPanel — Light enterprise filter card.
 * Background: white, border: #E5E7EB, inputs: white with gray border.
 */

import { useState } from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { FilterState } from "@/types/inbound";
import { EMPTY_FILTER } from "@/types/inbound";
import {
    PLANT_OPTIONS,
    SUPPLIER_OPTIONS,
    JENIS_OPTIONS,
    STATUS_OPTIONS,
} from "@/mock/inbound";
import ExportButton from "./ExportButton";
import RefreshButton from "./RefreshButton";

// ─── Shared input class ───────────────────────────────────────────────────────

const INPUT =
    "h-9 w-full rounded-xl bg-white border border-[#E5E7EB] text-[#111827] text-xs px-3 outline-none " +
    "focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 placeholder:text-[#9CA3AF] transition-all";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    onSearch: (f: FilterState) => void;
    onReset: () => void;
    onExport?: () => void;
    onRefresh?: () => void | Promise<void>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">
                {label}
            </label>
            {children}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterPanel({ onSearch, onReset, onExport, onRefresh }: Props) {
    const [f, setF] = useState<FilterState>(EMPTY_FILTER);

    const set = (k: keyof FilterState, v: string) => setF((p) => ({ ...p, [k]: v }));

    const handleReset = () => {
        setF(EMPTY_FILTER);
        onReset();
    };

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={15} className="text-[#DC2626]" />
                <span className="text-sm font-semibold text-[#111827]">Filter &amp; Pencarian</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                <Field label="Dari Tanggal">
                    <input type="date" value={f.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Sampai">
                    <input type="date" value={f.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Plant">
                    <select value={f.plant} onChange={(e) => set("plant", e.target.value)} className={INPUT}>
                        <option value="">Semua</option>
                        {PLANT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </Field>
                <Field label="Supplier">
                    <select value={f.supplier} onChange={(e) => set("supplier", e.target.value)} className={INPUT}>
                        <option value="">Semua</option>
                        {SUPPLIER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Jenis Bongkaran">
                    <select value={f.jenisBongkaran} onChange={(e) => set("jenisBongkaran", e.target.value)} className={INPUT}>
                        <option value="">Semua</option>
                        {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                </Field>
                <Field label="No. FO">
                    <input type="text" placeholder="FO-2025-..." value={f.nomorFO} onChange={(e) => set("nomorFO", e.target.value)} className={INPUT} />
                </Field>
                <Field label="No. Polisi">
                    <input type="text" placeholder="B 1234 XX" value={f.noPolisi} onChange={(e) => set("noPolisi", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Status">
                    <select value={f.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
                        <option value="">Semua</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F3F4F6]">
                <button
                    onClick={() => onSearch(f)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white transition-colors shadow-sm"
                >
                    <Search size={14} />
                    Cari Data
                </button>
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] transition-colors"
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
                <div className="ml-auto flex items-center gap-2">
                    <RefreshButton onRefresh={onRefresh} />
                    <ExportButton onClick={onExport} size="sm" />
                </div>
            </div>
        </div>
    );
}
