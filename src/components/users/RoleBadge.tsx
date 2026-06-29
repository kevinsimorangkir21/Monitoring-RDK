"use client";

import { memo } from "react";
import type { UserRole } from "@/types/users";

const STYLES: Record<UserRole, string> = {
    "Administrator": "bg-[#DC2626]/10 text-[#DC2626]   border-[#DC2626]/20",
    "Supervisor": "bg-blue-50      text-blue-700    border-blue-200",
    "Operator": "bg-emerald-50   text-emerald-700 border-emerald-200",
    "Viewer": "bg-gray-50      text-gray-600    border-gray-200",
};

interface Props { role: UserRole; }

const RoleBadge = memo(function RoleBadge({ role }: Props) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${STYLES[role]}`}>
            {role}
        </span>
    );
});

export default RoleBadge;
