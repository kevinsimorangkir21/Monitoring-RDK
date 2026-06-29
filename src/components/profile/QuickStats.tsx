"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Shield, Building2, Clock, CheckCircle2, type LucideIcon } from "lucide-react";
import type { ProfileData } from "@/types/profile";

function fmtLogin(iso: string) {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface StatCardProps {
    label: string; value: string; sub?: string;
    icon: LucideIcon; iconBg: string; iconColor: string; accentBorder: string; delay?: number;
}

const StatCard = memo(function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, accentBorder, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}
            className={`bg-white border border-[#E5E7EB] rounded-[18px] p-4 border-l-4 ${accentBorder} shadow-sm cursor-default`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#64748B] mb-1">{label}</p>
                    <p className="text-sm font-bold text-[#111827] leading-tight break-words">{value}</p>
                    {sub && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>}
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={16} className={iconColor} />
                </div>
            </div>
        </motion.div>
    );
});

interface Props { profile: ProfileData; }

export default function QuickStats({ profile }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Role" value={profile.role} icon={Shield} iconBg="bg-red-50" iconColor="text-[#DC2626]" accentBorder="border-l-[#DC2626]" delay={0} />
            <StatCard label="Department" value={profile.department} sub={profile.position} icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-600" accentBorder="border-l-blue-500" delay={0.06} />
            <StatCard label="Last Login" value={fmtLogin(profile.lastLogin)} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" accentBorder="border-l-amber-500" delay={0.12} />
            <StatCard label="Account Status" value={profile.accountStatus} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" accentBorder="border-l-emerald-500" delay={0.18} />
        </div>
    );
}
