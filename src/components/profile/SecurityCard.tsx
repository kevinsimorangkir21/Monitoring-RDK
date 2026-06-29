"use client";

import { memo } from "react";
import { Shield, KeyRound, Smartphone, Monitor } from "lucide-react";
import type { ProfileData } from "@/types/profile";

interface Props { profile: ProfileData; }

const SecurityCard = memo(function SecurityCard({ profile }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
                    <Shield size={16} className="text-[#DC2626]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Security</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Manage your account security</p>
                </div>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                    <KeyRound size={14} className="text-[#64748B] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-[#111827]">Password</p>
                        <p className="text-[11px] text-[#9CA3AF]">Last changed 30 days ago</p>
                    </div>
                </div>
                <button className="h-7 px-3 rounded-lg bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-[11px] font-semibold transition-colors">Change</button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                    <Smartphone size={14} className="text-[#64748B] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-[#111827]">Two-Factor Auth</p>
                        <p className="text-[11px] text-[#9CA3AF]">{profile.twoFAEnabled ? "Enabled" : "Not enabled"}</p>
                    </div>
                </div>
                <button className={`h-7 px-3 rounded-lg text-[11px] font-semibold transition-colors ${profile.twoFAEnabled ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"}`}>
                    {profile.twoFAEnabled ? "Enabled" : "Enable"}
                </button>
            </div>

            {/* Sessions */}
            <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <Monitor size={14} className="text-[#64748B] shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-[#111827]">Active Sessions</p>
                        <p className="text-[11px] text-[#9CA3AF]">1 device currently active</p>
                    </div>
                </div>
                <button className="h-7 px-3 rounded-lg bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] text-[11px] font-semibold transition-colors">Manage</button>
            </div>
        </div>
    );
});

export default SecurityCard;
