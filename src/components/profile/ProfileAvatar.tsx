"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Pencil, Camera } from "lucide-react";
import type { ProfileData } from "@/types/profile";

interface Props {
    profile: ProfileData;
    onEdit: () => void;
    onChangePhoto?: () => void;
}

const ProfileAvatar = memo(function ProfileAvatar({ profile, onEdit, onChangePhoto }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div
                        className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-bold select-none"
                        style={{ background: profile.avatarColor }}
                    >
                        {profile.avatarInitials}
                    </div>
                    <button
                        onClick={onChangePhoto}
                        className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] shadow flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                        aria-label="Change photo"
                    >
                        <Camera size={13} className="text-[#64748B]" />
                    </button>
                </div>

                {/* Name / role */}
                <div className="flex-1 pb-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#111827] leading-tight">{profile.fullName}</h2>
                    <p className="text-sm text-[#64748B] mt-0.5">{profile.position}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{profile.department}&nbsp;·&nbsp;{profile.employeeId}</p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 shrink-0 pb-1">
                    <button
                        onClick={onChangePhoto}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold hover:bg-[#F9FAFB] transition-colors shadow-sm"
                    >
                        <Camera size={14} />Change Photo
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Pencil size={14} />Edit Profile
                    </motion.button>
                </div>
            </div>
        </div>
    );
});

export default ProfileAvatar;
