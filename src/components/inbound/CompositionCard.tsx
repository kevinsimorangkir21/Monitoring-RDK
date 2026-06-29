"use client";

/**
 * CompositionCard — Komposisi Jenis Bongkaran.
 *
 * ONE card showing SlipSheet % + jumlah mobil AND Curah % + jumlah mobil,
 * side-by-side, exactly as in the original HTML dashboard.
 * Do NOT split into two separate cards.
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { SUMMARY } from "@/mock/inbound";

const CompositionCard = memo(function CompositionCard({ delay = 0 }: { delay?: number }) {
    const { slipSheet, curah } = SUMMARY;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 border-l-4 border-l-violet-500 shadow-sm"
        >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Layers size={17} className="text-violet-600" />
                </div>
                <p className="text-xs font-medium text-[#64748B]">Komposisi Jenis Bongkaran</p>
            </div>

            {/* SlipSheet + Curah side-by-side */}
            <div className="grid grid-cols-2 gap-3">
                {/* SlipSheet */}
                <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">
                        SlipSheet
                    </p>
                    <p className="text-xl font-bold text-violet-700 leading-none">
                        {slipSheet.percent}%
                    </p>
                    <p className="text-[11px] text-violet-500 mt-1 font-medium">
                        {slipSheet.count} Mobil
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-violet-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${slipSheet.percent}%` }}
                        />
                    </div>
                </div>

                {/* Curah */}
                <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                        Curah
                    </p>
                    <p className="text-xl font-bold text-red-700 leading-none">
                        {curah.percent}%
                    </p>
                    <p className="text-[11px] text-red-400 mt-1 font-medium">
                        {curah.count} Mobil
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-red-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${curah.percent}%` }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default CompositionCard;
