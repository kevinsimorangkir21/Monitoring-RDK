// src/app/admin/setoran/types/crud.ts

import type { SetoranRecord } from "@/types/setoran";

// ─── Form ──────────────────────────────────────────────────────────────────────

/**
 * Raw values from the SetoranFormModal controlled inputs.
 * All strings — parsing/calculation happens in the hook.
 */
export interface SetoranFormValues {
    tanggal: string;            // "YYYY-MM-DD"
    namaSalesman: string;
    pulangKunjungan: string;    // "HH:mm"
    setoranKasir: string;       // "HH:mm"
}

/** Field-level validation errors keyed by SetoranFormValues key */
export type SetoranFormErrors = Partial<Record<keyof SetoranFormValues, string>>;

// ─── Modal state ────────────────────────────────────────────────────────────────

export type CrudModalMode = "create" | "edit";

export interface CrudModalState {
    open: boolean;
    mode: CrudModalMode;
    /** Populated when mode === "edit" */
    record?: SetoranRecord;
}

// ─── API shapes ─────────────────────────────────────────────────────────────────

/** Body sent to POST /api/setoran and PUT /api/setoran/:id */
export interface SetoranWritePayload {
    tanggal: string;
    namaSalesman: string;
    pulangKunjungan: string;
    setoranKasir: string;
}

/** Successful response wrapping a single record */
export interface SetoranDataResponse {
    data: SetoranRecord;
}

/** Successful response for DELETE or other void operations */
export interface SetoranSuccessResponse {
    success: true;
}

/** Error response from any API route */
export interface SetoranErrorResponse {
    error: string;
    field?: keyof SetoranFormValues;
}

export type SetoranApiResponse =
    | SetoranDataResponse
    | SetoranSuccessResponse
    | SetoranErrorResponse;

// ─── Toast ───────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}

// ─── Hook return ─────────────────────────────────────────────────────────────────

export interface UseCrudOperationsReturn {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    createRecord: (values: SetoranFormValues) => Promise<SetoranRecord | null>;
    updateRecord: (id: string, values: SetoranFormValues) => Promise<SetoranRecord | null>;
    deleteRecord: (id: string) => Promise<boolean>;
}
