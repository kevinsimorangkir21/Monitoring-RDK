"use client";

/**
 * ClaimCards — 4 KPI cards untuk Claim Vendor.
 * Total Dokumen Claim | Total Nominal Claim | Belum Dibayarkan | Sudah Lunas
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { FileText, Receipt, Clock, CheckCircle2 } from "lucide-react";
import type { ClaimKPIs } from "./types";
import { fmtRp, fmtRpCompact } from "./claimVendorStore";

const ClaimCards = memo(function ClaimCards({ kpi }: { kpi: ClaimKPIs }) {
    const cards = [
        {
            title: "Total Dokumen Claim",
            value: `${kpi.totalDokumen.toLocaleString("id-ID")} Doc`,
            sub: kpi.totalDokumen === 0 ? "0 Dokumen" : `${kpi.totalDokumen} record`,
            icon: FileText,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            border: "border-l-blue-500",
            delay: 0,
        },
        {
            title: "Total Nominal Claim",
            value: fmtRpCompact(kpi.totalNominal),
            sub: fmtRp(kpi.totalNominal),
            icon: Receipt,
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            border: "border-l-violet-500",
            delay: 0.07,
        },
        {
            title: "Belum Dibayarkan",
            value: fmtRpCompact(kpi.belumDibayarNominal),
            sub: `${kpi.belumDibayarDokumen} Dokumen Pending`,
            icon: Clock,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            border: "border-l-amber-500",
            delay: 0.14,
        },
        {
            title: "Sudah Lunas",
            value: fmtRpCompact(kpi.sudahLunasNominal),
            sub: `${kpi.sudahLunasDokumen} Dokumen Selesai`,
            icon: CheckCircle2,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            border: "border-l-emerald-500",
            delay: 0.21,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
                <motion.article
                    key={c.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, delay: c.delay }}
                    whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
                    className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-5 border-l-4 ${c.border} shadow-sm`}
                    aria-label={`${c.title}: ${c.value}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#64748B] mb-2">{c.title}</p>
                            <p className="text-xl font-bold text-[#111827] leading-none">{c.value}</p>
                            <p className="text-xs text-[#64748B] mt-1.5">{c.sub}</p>
                        </div>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
                            <c.icon size={20} className={c.iconColor} />
                        </div>
                    </div>
                </motion.article>
            ))}
        </div>
    );
});

export default ClaimCards;
