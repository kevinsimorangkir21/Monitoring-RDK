"use client";

/**
 * ReportDailyForm — Form fields untuk Create / Edit Report Daily.
 *
 * Fields: Tanggal | Division | Jenis Report | Keterangan / Value | Informasi Tambahan
 * Digunakan di dalam ReportDailyModal.
 */

import React, { useCallback } from "react";
import type {
    TransportFormValues,
    TransportFormErrors,
    DivisionType,
} from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DIVISION_OPTIONS: DivisionType[] = [
    "Transport",
    "Warehouse FG",
    "Warehouse BS",
];

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateReportDailyForm(
    values: TransportFormValues
): TransportFormErrors {
    const errors: TransportFormErrors = {};

    if (!values.tanggal.trim()) {
        errors.tanggal = "Tanggal wajib diisi.";
    }
    if (!values.division.trim()) {
        errors.division = "Division wajib dipilih.";
    } else if (!DIVISION_OPTIONS.includes(values.division as DivisionType)) {
        errors.division = "Division tidak valid.";
    }
    if (!values.jenisReport.trim()) {
        errors.jenisReport = "Jenis Report wajib diisi.";
    }
    if (!values.keterangan.trim()) {
        errors.keterangan = "Keterangan / Value wajib diisi.";
    }

    return errors;
}

// ─── Input base styles ────────────────────────────────────────────────────────

const BASE =
    "w-full px-3 rounded-xl border text-sm text-[#111827] bg-white outline-none transition-all" +
    " focus:border-[#DC2626] focus:ring-2 focus:ring-red-100" +
    " disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed";

const inputCls = (hasError: boolean) =>
    `${BASE} h-10 ${hasError ? "border-red-400 focus:border-red-400" : "border-[#E5E7EB]"}`;

const textareaCls = (hasError: boolean) =>
    `${BASE} py-2.5 resize-none ${hasError ? "border-red-400 focus:border-red-400" : "border-[#E5E7EB]"}`;

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
    label,
    htmlFor,
    required = true,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-xs font-medium text-[#64748B]">
                {label}
                {required && (
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                    </span>
                )}
                {!required && (
                    <span className="text-[#9CA3AF] ml-1 font-normal">(opsional)</span>
                )}
            </label>
            {children}
            {error && (
                <p
                    id={`${htmlFor}-err`}
                    role="alert"
                    className="text-xs text-red-500 flex items-start gap-1"
                >
                    <span className="mt-px shrink-0">⚠</span>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReportDailyFormProps {
    id: string;
    values: TransportFormValues;
    errors: TransportFormErrors;
    disabled: boolean;
    onChange: (field: keyof TransportFormValues, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportDailyForm({
    id,
    values,
    errors,
    disabled,
    onChange,
    onSubmit,
}: ReportDailyFormProps) {
    const ch = useCallback(
        (field: keyof TransportFormValues) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                onChange(field, e.target.value),
        [onChange]
    );

    return (
        <form id={id} onSubmit={onSubmit} noValidate className="px-6 py-5 space-y-4">
            {/* Row 1: Tanggal + Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tanggal" htmlFor="rdf-tanggal" error={errors.tanggal}>
                    <input
                        id="rdf-tanggal"
                        type="date"
                        value={values.tanggal}
                        onChange={ch("tanggal")}
                        disabled={disabled}
                        required
                        className={inputCls(!!errors.tanggal)}
                    />
                </Field>

                <Field label="Division" htmlFor="rdf-division" error={errors.division}>
                    <select
                        id="rdf-division"
                        value={values.division}
                        onChange={ch("division")}
                        disabled={disabled}
                        required
                        className={inputCls(!!errors.division)}
                    >
                        <option value="">Pilih Division</option>
                        {DIVISION_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Jenis Report */}
            <Field label="Jenis Report" htmlFor="rdf-jenis" error={errors.jenisReport}>
                <input
                    id="rdf-jenis"
                    type="text"
                    value={values.jenisReport}
                    onChange={ch("jenisReport")}
                    placeholder="Contoh: Jam Pulang, Total Created FO, Qty IN..."
                    disabled={disabled}
                    required
                    className={inputCls(!!errors.jenisReport)}
                />
            </Field>

            {/* Keterangan / Value */}
            <Field
                label="Keterangan / Value"
                htmlFor="rdf-keterangan"
                error={errors.keterangan}
            >
                <textarea
                    id="rdf-keterangan"
                    rows={3}
                    value={values.keterangan}
                    onChange={ch("keterangan")}
                    placeholder="Contoh: 49, 5:00, 300, 25, Shift Pagi..."
                    disabled={disabled}
                    required
                    className={textareaCls(!!errors.keterangan)}
                />
            </Field>

            {/* Informasi Tambahan — optional */}
            <Field
                label="Informasi Tambahan"
                htmlFor="rdf-info"
                required={false}
                error={errors.informasiTambahan}
            >
                <textarea
                    id="rdf-info"
                    rows={2}
                    value={values.informasiTambahan}
                    onChange={ch("informasiTambahan")}
                    placeholder="Contoh: Shift Pagi, 4 Orang Tidak Masuk, Running Jam 6..."
                    disabled={disabled}
                    className={textareaCls(false)}
                />
            </Field>
        </form>
    );
}
