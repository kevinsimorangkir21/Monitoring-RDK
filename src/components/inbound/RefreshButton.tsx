"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface RefreshButtonProps {
    onRefresh?: () => void | Promise<void>;
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
    const [spinning, setSpinning] = useState(false);

    const handle = useCallback(async () => {
        if (spinning) return;
        setSpinning(true);
        try { await onRefresh?.(); } finally {
            setTimeout(() => setSpinning(false), 700);
        }
    }, [spinning, onRefresh]);

    return (
        <button
            type="button"
            onClick={handle}
            disabled={spinning}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#374151] hover:text-[#111827] transition-all duration-200 disabled:opacity-50 shadow-sm"
        >
            <motion.span
                animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                transition={spinning ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}}
                className="flex"
            >
                <RefreshCw size={15} />
            </motion.span>
            Refresh
        </button>
    );
}
