"use client";
import { useState, useCallback, memo } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
interface Props { onRefresh?: () => void | Promise<void>; }
const RefreshButton = memo(function RefreshButton({ onRefresh }: Props) {
    const [spinning, setSpinning] = useState(false);
    const handle = useCallback(async () => {
        if (spinning) return;
        setSpinning(true);
        try { await onRefresh?.(); } finally { setTimeout(() => setSpinning(false), 700); }
    }, [spinning, onRefresh]);
    return (
        <button type="button" onClick={handle} disabled={spinning} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm">
            <motion.span animate={spinning ? { rotate: 360 } : { rotate: 0 }} transition={spinning ? { duration: 0.7, ease: "linear", repeat: Infinity } : {}} className="flex"><RefreshCw size={14} /></motion.span>
            Refresh
        </button>
    );
});
export default RefreshButton;
