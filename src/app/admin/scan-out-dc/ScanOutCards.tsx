"use client";

/**
 * ScanOutCards — KPI Cards untuk Scan Out DC.
 * KPI: Rata-rata Jam Scan Out (<10:00) | Rata-rata Jam Scan In DC
 * Saat kosong: "00:00"
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Clock, LogIn } from "lucide-react";

interface ScanOutCardsProps {
    avgScanOut: string;   // "HH:mm"
    avgScanIn: string;    // "HH:mm"
    total: number;
}

const ScanOutCards = memo(function ScanOutCards({
    avgScanOut,
    avgScanIn,
    total,
}: ScanOutCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Rata-rata Jam Scan Out */}
            <motion.article
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0 }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 border-l-[#DC2626] shadow-sm"
                aria-label={`Rata-rata Jam Scan Out: ${avgScanOut}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#64748B] mb-2">
                            Rata-rata Jam Scan Out
                        </p>
                        <p className="text-2xl font-bold text-[#111827] leading-none font-mono">
                            {avgScanOut}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1.5">Target &lt; 10:00</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-50">
                        <Clock size={20} className="text-[#DC2626]" />
                    </div>
                </div>
            </motion.article>

            {/* Rata-rata Jam Scan In DC */}
            <motion.article
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.07 }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 border-l-[#2563EB] shadow-sm"
                aria-label={`Rata-rata Jam Scan In DC: ${avgScanIn}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#64748B] mb-2">
                            Rata-rata Jam Scan In DC
                        </p>
                        <p className="text-2xl font-bold text-[#111827] leading-none font-mono">
                            {avgScanIn}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1.5">Rata-rata kedatangan armada</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                        <LogIn size={20} className="text-[#2563EB]" />
                    </div>
                </div>
            </motion.article>

            {/* Total Transaksi */}
            <motion.article
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.14 }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
                className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 border-l-[#16A34A] shadow-sm"
                aria-label={`Total Transaksi: ${total}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#64748B] mb-2">
                            Total Transaksi Scan Out
                        </p>
                        <p className="text-2xl font-bold text-[#111827] leading-none">
                            {total.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1.5">
                            {total === 0 ? "0 Data Transaksi Scan Out" : `${total} record tercatat`}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-50">
                        <Clock size={20} className="text-[#16A34A]" />
                    </div>
                </div>
            </motion.article>
        </div>
    );
});

export default ScanOutCards;
