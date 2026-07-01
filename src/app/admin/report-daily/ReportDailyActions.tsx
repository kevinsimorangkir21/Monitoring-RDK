"use client";

/**
 * ReportDailyActions — Tombol "+ Tambah Report" di header kanan atas.
 *
 * Hanya tampil untuk role SUPER_ADMIN.
 * Style mengikuti button dashboard yang sudah ada (bg-[#DC2626]).
 */

import { memo } from "react";
import { Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReportDailyActionsProps {
    onAdd: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ReportDailyActionsInner({ onAdd }: ReportDailyActionsProps) {
    const { user } = useUser();

    // Hanya Super Admin yang bisa melihat tombol CRUD
    const isSuperAdmin =
        user?.role?.toLowerCase() === "super admin" ||
        user?.role?.toUpperCase() === "SUPER_ADMIN";

    if (!isSuperAdmin) return null;

    return (
        <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shrink-0"
        >
            <Plus size={16} aria-hidden="true" />
            + Tambah Report
        </button>
    );
}

export default memo(ReportDailyActionsInner);
