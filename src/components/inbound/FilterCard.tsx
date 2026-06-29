"use client";

/**
 * FilterCard — Full filter panel for Inbound Monitoring.
 * Handles date range, plant, supplier, jenis bongkaran, FO number,
 * police number, and status filters. Emits typed filter state on Search/Reset.
 */

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import ExportButton from "./ExportButton";
import {
    PLANT_OPTIONS,
    SUPPLIER_OPTIONS,
    JENIS_BONGKARAN_OPTIONS,
    STATUS_OPTIONS,
    type JenisBongkaran,
    type InboundStatus,
} from "@/data/inboundData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
    dateFrom: string;
    dateTo: string;
    plant: string;
    supplier: string;
    jenisBongkaran: string;
    nomorFO: string;
    noPolisi: string;
    status: string;
}

const INITIAL_FILTER: FilterState = {
    dateFrom: "",
    dateTo: "",
    plant: "",
    supplier: "",
    jenisBongkaran: "",
    nomorFO: "",
    noPolisi: "",
    status: "",
};

interface FilterCardProps {
    onSearch: (filters: FilterState) => void;
    onExport?: (filters: FilterState) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LabeledFieldProps {
    label: string;
    children: React.ReactNode;
}

function LabeledField({ label, children }: LabeledFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label}
            </label>
            {children}
        </div>
    );
}

// Shared input class
const inputCls =
    "h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition";

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterCard({ onSearch, onExport }: FilterCardProps) {
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);

    const set = (key: keyof FilterState, value: string) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const handleReset = () => {
        setFilters(INITIAL_FILTER);
        onSearch(INITIAL_FILTER);
    };

    return (
        <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">Filter Data</h3>

            {/* Grid of filter fields — responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Date Range */}
                <LabeledField label="Tanggal Dari">
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => set("dateFrom", e.target.value)}
                        className={inputCls}
                    />
                </LabeledField>

                <LabeledField label="Tanggal Sampai">
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => set("dateTo", e.target.value)}
                        className={inputCls}
                    />
                </LabeledField>

                {/* Plant */}
                <LabeledField label="Plant">
                    <select
                        value={filters.plant}
                        onChange={(e) => set("plant", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Semua Plant</option>
                        {PLANT_OPTIONS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </LabeledField>

                {/* Supplier */}
                <LabeledField label="Supplier">
                    <select
                        value={filters.supplier}
                        onChange={(e) => set("supplier", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Semua Supplier</option>
                        {SUPPLIER_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </LabeledField>

                {/* Jenis Bongkaran */}
                <LabeledField label="Jenis Bongkaran">
                    <select
                        value={filters.jenisBongkaran}
                        onChange={(e) => set("jenisBongkaran", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Semua Jenis</option>
                        {JENIS_BONGKARAN_OPTIONS.map((j) => (
                            <option key={j} value={j}>{j}</option>
                        ))}
                    </select>
                </LabeledField>

                {/* Nomor FO */}
                <LabeledField label="Nomor FO">
                    <input
                        type="text"
                        placeholder="Cari No. FO..."
                        value={filters.nomorFO}
                        onChange={(e) => set("nomorFO", e.target.value)}
                        className={inputCls}
                    />
                </LabeledField>

                {/* Nomor Polisi */}
                <LabeledField label="Nomor Polisi">
                    <input
                        type="text"
                        placeholder="Cari No. Polisi..."
                        value={filters.noPolisi}
                        onChange={(e) => set("noPolisi", e.target.value)}
                        className={inputCls}
                    />
                </LabeledField>

                {/* Status */}
                <LabeledField label="Status">
                    <select
                        value={filters.status}
                        onChange={(e) => set("status", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Semua Status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </LabeledField>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                    type="button"
                    onClick={() => onSearch(filters)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-colors shadow-sm"
                >
                    <Search size={15} />
                    Cari Data
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                >
                    <RotateCcw size={15} />
                    Reset
                </button>

                <div className="ml-auto">
                    <ExportButton onClick={() => onExport?.(filters)} size="sm" />
                </div>
            </div>
        </div>
    );
}
