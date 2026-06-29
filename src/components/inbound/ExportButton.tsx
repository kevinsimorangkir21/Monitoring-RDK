"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
    onClick?: () => void;
    label?: string;
    size?: "sm" | "md";
    variant?: "solid" | "ghost";
}

export default function ExportButton({
    onClick,
    label = "Export",
    size = "md",
    variant = "solid",
}: ExportButtonProps) {
    const base = "inline-flex items-center font-semibold rounded-xl transition-all duration-200 gap-2";
    const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
    const v =
        variant === "solid"
            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm"
            : "bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#374151] hover:text-[#111827]";

    return (
        <button type="button" onClick={onClick} className={`${base} ${sz} ${v}`}>
            <Download size={size === "sm" ? 13 : 15} />
            {label}
        </button>
    );
}
