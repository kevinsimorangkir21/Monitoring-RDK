"use client";

import { memo } from "react";
import { Pencil, User, AtSign, Mail, Phone, Hash, Building2, Briefcase, Calendar } from "lucide-react";
import type { ProfileData } from "@/types/profile";

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[#F3F4F6] last:border-none">
            <div className="w-7 h-7 rounded-lg bg-[#DC2626]/8 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-[#DC2626]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xs font-semibold text-[#111827] mt-0.5 break-words">{value}</p>
            </div>
        </div>
    );
}

interface Props { profile: ProfileData; onEdit: () => void; }

const PersonalInformation = memo(function PersonalInformation({ profile, onEdit }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-bold text-[#111827]">Personal Information</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Your account details</p>
                </div>
                <button onClick={onEdit} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-xs font-semibold transition-colors">
                    <Pencil size={12} />Edit
                </button>
            </div>
            <InfoRow label="Full Name" value={profile.fullName} icon={User} />
            <InfoRow label="Username" value={profile.username} icon={AtSign} />
            <InfoRow label="Email" value={profile.email} icon={Mail} />
            <InfoRow label="Phone Number" value={profile.phone} icon={Phone} />
            <InfoRow label="Employee ID" value={profile.employeeId} icon={Hash} />
            <InfoRow label="Department" value={profile.department} icon={Building2} />
            <InfoRow label="Position" value={profile.position} icon={Briefcase} />
            <InfoRow label="Join Date" value={new Date(profile.joinDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} icon={Calendar} />
        </div>
    );
});

export default PersonalInformation;
