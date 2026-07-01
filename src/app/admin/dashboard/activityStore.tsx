"use client";

/**
 * activityStore.tsx
 * Global activity store — shared across all modules via React Context.
 * All CRUD operations and Login/Logout record here via addActivity().
 */

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityAction = "create" | "edit" | "delete" | "login" | "logout";

export interface ActivityEntry {
    id: string;
    action: ActivityAction;
    module: string;       // "Inbound" | "Outbound" | "Claim Vendor" | ...
    description: string;  // "Kevin menambahkan 3 data Inbound."
    user: string;         // nama user
    timestamp: Date;
}

// ─── Visual config per action ─────────────────────────────────────────────────

export const ACTION_COLOR: Record<ActivityAction, string> = {
    create: "#16A34A",  // hijau
    edit: "#2563EB",  // biru
    delete: "#DC2626",  // merah
    login: "#7C3AED",  // ungu
    logout: "#6B7280",  // abu-abu
};

export const ACTION_LABEL: Record<ActivityAction, string> = {
    create: "Menambahkan",
    edit: "Mengedit",
    delete: "Menghapus",
    login: "Login ke Dashboard",
    logout: "Logout dari Dashboard",
};

// ─── Limits ───────────────────────────────────────────────────────────────────

export const MAX_STORED = 50;
export const MAX_DISPLAYED = 10;

// ─── Context ──────────────────────────────────────────────────────────────────

interface ActivityContextValue {
    activities: ActivityEntry[];
    addActivity: (
        action: ActivityAction,
        module: string,
        description: string,
        user: string
    ) => void;
    clearActivities: () => void;
}

export const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ActivityProvider({ children }: { children: ReactNode }) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);

    const addActivity = useCallback(
        (action: ActivityAction, module: string, description: string, user: string) => {
            const entry: ActivityEntry = {
                id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                action,
                module,
                description,
                user,
                timestamp: new Date(),
            };
            setActivities((prev) => [entry, ...prev].slice(0, MAX_STORED));
        },
        []
    );

    const clearActivities = useCallback(() => setActivities([]), []);

    const value = useMemo(
        () => ({ activities, addActivity, clearActivities }),
        [activities, addActivity, clearActivities]
    );

    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useActivity(): ActivityContextValue {
    const ctx = useContext(ActivityContext);
    if (!ctx) {
        throw new Error("useActivity must be used within ActivityProvider");
    }
    return ctx;
}
