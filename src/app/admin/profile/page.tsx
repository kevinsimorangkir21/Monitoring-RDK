"use client";

/**
 * /admin/profile — My Profile Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout:
 *   1. Page Header           — title, subtitle, Edit Profile button
 *   2. Profile Banner        — red gradient with decorative shapes
 *   3. Profile Avatar        — overlaps banner, name/position/dept/empId
 *   4. Quick Stats           — 4 hover cards (role, dept, last-login, status)
 *   5. Two-column grid:
 *      Left  — Personal Information + Security Card
 *      Right — Activity Summary + Recent Activity + Account Settings
 *   6. Edit Profile Modal    — lazy-loaded
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import type { EditProfileForm } from "@/types/profile";

import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import QuickStats from "@/components/profile/QuickStats";
import PersonalInformation from "@/components/profile/PersonalInformation";
import SecurityCard from "@/components/profile/SecurityCard";
import ActivitySummary from "@/components/profile/ActivitySummary";
import RecentActivity from "@/components/profile/RecentActivity";
import AccountSettings from "@/components/profile/AccountSettings";

// ── Lazy modal ─────────────────────────────────────────────────────────────────
const EditProfileModal = dynamic(
    () => import("@/components/profile/EditProfileModal"),
    { ssr: false, loading: () => null }
);

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { profile, updateProfile } = useProfile();
    const [editOpen, setEditOpen] = useState(false);

    const handleSave = useCallback((form: EditProfileForm) => {
        updateProfile(form);
    }, [updateProfile]);

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ─────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">My Profile</h1>
                    <p className="text-xs text-[#64748B] mt-1">Manage your account information</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
                >
                    <Pencil size={14} />Edit Profile
                </motion.button>
            </motion.div>

            {/* ── 2. Profile Banner + Avatar ─────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-0">
                <ProfileBanner />
                <ProfileAvatar
                    profile={profile}
                    onEdit={() => setEditOpen(true)}
                    onChangePhoto={() => alert("Change photo — coming soon")}
                />
            </motion.div>

            {/* ── 3. Quick Stats ─────────────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <QuickStats profile={profile} />
            </motion.div>

            {/* ── 4. Two-column grid ─────────────────────────────────────────── */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            >
                {/* Left column */}
                <div className="space-y-5">
                    <PersonalInformation profile={profile} onEdit={() => setEditOpen(true)} />
                    <SecurityCard profile={profile} />
                </div>

                {/* Right column */}
                <div className="space-y-5">
                    <ActivitySummary />
                    <RecentActivity />
                    <AccountSettings />
                </div>
            </motion.div>

            {/* ── 5. Edit Profile Modal ──────────────────────────────────────── */}
            <EditProfileModal
                open={editOpen}
                profile={profile}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
