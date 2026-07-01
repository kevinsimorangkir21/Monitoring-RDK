// Type definitions for the Outbound module
// Single source of truth for all outbound data shapes — zero `any` usage

// STATUS union — only two valid status values
export type STATUS = "Muat Pagi" | "Muat Inap";

// Primary domain entity — matches Excel Outbound sheet (13 non-id fields + id)
export interface OutboundRecord {
    id: string;           // Internal UUID, e.g. "OB-2026-001"
    tanggal: string;      // "YYYY-MM-DD"
    freightOrder: string; // Business-level unique identifier
    mobilMuat: string;    // Vehicle plate / identifier
    sType: string;        // Delivery type — kept for table display, not visualized
    assignJob: string;    // Job assignment label
    jamTerima: string;    // "HH:MM" — time FO received
    status: STATUS;       // Freight order status: "Muat Pagi" | "Muat Inap"
    selesaiMuat: string;  // "HH:MM" — time loading completed
    hari: string;         // Day label, e.g. "Senin"
    putaran: string;      // Delivery round identifier
    st: number;           // Standard time value (>= 0)
    h2: number;           // H+2 delivery value (>= 0)
    jamRunning: string;   // "HH:MM" — running time
}

// Raw form strings — all fields as string (before parsing to typed values)
export interface OutboundFormValues {
    tanggal: string;
    freightOrder: string;
    mobilMuat: string;
    sType: string;
    assignJob: string;
    jamTerima: string;
    status: string;
    selesaiMuat: string;
    hari: string;
    putaran: string;
    st: string;
    h2: string;
    jamRunning: string;
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
    selectedStatus: string[];
    searchQuery: string;
}

export type ToastVariant = "success" | "error";

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
