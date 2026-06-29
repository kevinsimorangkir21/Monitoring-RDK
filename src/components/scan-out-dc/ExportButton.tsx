"use client";

import { memo } from "react";
import { Download } from "lucide-react";

interface Props { onClick?: () => void; label?: string; }

const ExportButton = memo(function ExportButton({ onClick, label = "Export" }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-colors shadow-sm"
        >
            <Download size={14} />
            {label}
        </button>
    );
});

export default ExportButton;
