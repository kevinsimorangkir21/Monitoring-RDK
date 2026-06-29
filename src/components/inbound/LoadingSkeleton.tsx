"use client";

/**
 * LoadingSkeleton — Light-mode animated placeholder.
 * Matches the exact page structure:
 *   - 3 KPI cards (not 4)
 *   - 4 charts in 2×2 grid
 *   - Table
 * No filter panel (filters live in sidebar).
 */

import { motion } from "framer-motion";

function Bone({ className }: { className: string }) {
    return (
        <motion.div
            className={`bg-[#E5E7EB] rounded-[18px] ${className}`}
            animate={{ opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

export default function LoadingSkeleton() {
    return (
        <div className="space-y-5">
            {/* 3 KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                    <Bone key={i} className="h-[92px]" />
                ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Bone className="h-[320px]" />
                <Bone className="h-[320px]" />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Bone className="h-[320px]" />
                <Bone className="h-[320px]" />
            </div>

            {/* Detail table */}
            <div className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <Bone className="h-5 w-64" />
                    <Bone className="h-8 w-40" />
                </div>
                <div className="p-4 space-y-2.5">
                    {[...Array(7)].map((_, i) => (
                        <Bone key={i} className="h-10" />
                    ))}
                </div>
                <div className="px-5 py-3 border-t border-[#E5E7EB]">
                    <Bone className="h-7 w-72" />
                </div>
            </div>
        </div>
    );
}
