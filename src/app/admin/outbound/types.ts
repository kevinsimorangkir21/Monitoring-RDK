// Type definitions for the Outbound module
// Single source of truth for all outbound data shapes

export type StatusFO = "OPEN" | "CLOSE" | "CANCEL" | "PARTIAL";

export interface OutboundRecord {
    id: string;
    tanggal: string; // "YYYY-MM-DD"
    plant: string;
    vendor: string;
    noPolisi: string;
    driver: string;
    statusFO: StatusFO;
    totalBox: number; // >= 0
    totalQty: number; // >= 0
    jamLoading: string; // "HH:MM"
    jamBerangkat: string; // "HH:MM"
}

export interface OutboundFormValues {
    tanggal: string;
    plant: string;
    vendor: string;
    noPolisi: string;
    driver: string;
    statusFO: string;
    totalBox: string;
    totalQty: string;
    jamLoading: string;
    jamBerangkat: string;
}

export type OutboundFormErrors = Partial<Record<keyof OutboundFormValues, string>>;

export type CrudMode = "create" | "edit";

export interface ModalState {
    open: boolean;
    mode: CrudMode;
    record?: OutboundRecord;
}

export interface OutboundFilters {
    dateRange: {
        startDate: string | null;
        endDate: string | null;
    };
    selectedPlant: string[];
    selectedVendor: string[];
    selectedStatusFO: string[];
    searchQuery: string;
}

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
