/**
 * Setoran ke Kasir — TypeScript Type Definitions
 *
 * Re-exports the shared types from the canonical location and adds
 * any dashboard-specific interfaces used only within this feature module.
 */

export type {
    SetoranRecord,
    SetoranKPI,
    SetoranFilter,
    SetoranSort,
    SetoranSortKey,
    DurasiStatus,
    DurasiChartItem,
    DailyAverageItem,
    SalesmanAvgItem,
    DistribusiItem,
} from "@/types/setoran";

// ─── Dashboard-specific interfaces ────────────────────────────────────────────

/** Options accepted by SetoranDataGenerator.generateSetoranData */
export interface GenerationOptions {
    count?: number;
    monthsBack?: number;
}

/** Shape returned by the mock data service */
export interface MockDataService {
    generateSetoranData(count?: number): import("@/types/setoran").SetoranRecord[];
    generateDateRange(
        startDate: Date,
        endDate: Date,
        recordsPerDay?: number
    ): import("@/types/setoran").SetoranRecord[];
    generateForSalesman(
        salesmanNames: string[],
        recordsPerSalesman?: number
    ): import("@/types/setoran").SetoranRecord[];
    generateEdgeCases(): import("@/types/setoran").SetoranRecord[];
}
