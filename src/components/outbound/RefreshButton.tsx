"use client";

import { useState, useCallback, memo } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface RefreshButtonProps {
    onRefresh?: () => void | Promise<void>;
}

const RefreshButton = memo(function RefreshButton({ onRefresh }: RefreshButtonProps) {
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
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:text-[#111827] hover:border-[#D1D5DB] text-xs font-semibold transition-colors disabled:opacity-50"
        >
            <motion.span
                animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                transition={spinning ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}}
                className="flex"
            >
                <RefreshCw size={13} />
            </motion.span>
            Refresh
        </button>
    );
});

export default RefreshButton;
