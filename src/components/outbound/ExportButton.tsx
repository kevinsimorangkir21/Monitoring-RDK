"use client";

import { memo } from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
    onClick?: () => void;
    label?: string;
}

const ExportButton = memo(function ExportButton({
    onClick,
    label = "Export",
}: ExportButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-sm"
        >
            <Download size={13} />
            {label}
        </button>
    );
});

export default ExportButton;
