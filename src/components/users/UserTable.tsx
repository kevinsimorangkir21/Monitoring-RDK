"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, KeyRound, Trash2 } from "lucide-react";
import type { UserRecord, UserSort, UserSortKey, UserFilter } from "@/types/users";
import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";
import UserToolbar from "./UserToolbar";
import Pagination from "./Pagination";

function SortIcon({ colKey, sort }: { colKey: UserSortKey; sort: UserSort | null }) {
    if (sort?.key !== colKey) return <ChevronsUpDown size={12} className="text-[#9CA3AF]" />;
    return sort.direction === "asc" ? <ChevronUp size={12} className="text-[#DC2626]" /> : <ChevronDown size={12} className="text-[#DC2626]" />;
}

function Avatar({ initials, color }: { initials: string; color: string }) {
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${color}`}>
            {initials}
        </div>
    );
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg bg-[#111827] text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {label}
            </div>
        </div>
    );
}

const COLUMNS: { key: UserSortKey; label: string }[] = [
    { key: "fullName", label: "Full Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "lastLogin", label: "Last Login" },
    { key: "status", label: "Status" },
];

interface Props {
    paginated: UserRecord[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sort: UserSort | null;
    filter: UserFilter;
    onSort: (key: UserSortKey) => void;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    onFilterChange: (patch: Partial<UserFilter>) => void;
    onView: (user: UserRecord) => void;
    onEdit: (user: UserRecord) => void;
    onResetPassword: (user: UserRecord) => void;
    onDelete: (user: UserRecord) => void;
    onRefresh?: () => void | Promise<void>;
}

function fmtLogin(iso: string) {
    if (iso === "—") return "—";
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const UserTable = memo(function UserTable({
    paginated, totalRecords, page, pageSize, totalPages,
    sort, filter,
    onSort, onPageChange, onPageSizeChange, onFilterChange,
    onView, onEdit, onResetPassword, onDelete, onRefresh,
}: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm overflow-hidden">
            <UserToolbar totalRecords={totalRecords} filter={filter} onFilterChange={onFilterChange} onRefresh={onRefresh} />
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E5E7EB] [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[1000px] border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#DC2626] text-white">
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Avatar</th>
                            {COLUMNS.map((col) => (
                                <th key={col.key} onClick={() => onSort(col.key)} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-[#B91C1C] transition-colors">
                                    <div className="flex items-center gap-1">{col.label}<SortIcon colKey={col.key} sort={sort} /></div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={COLUMNS.length + 3} className="text-center py-14 text-sm text-[#9CA3AF]">No users found</td></tr>
                        ) : paginated.map((user, idx) => (
                            <tr key={user.id} className="border-b border-[#F3F4F6] hover:bg-red-50/40 transition-colors">
                                <td className="px-4 py-3 text-xs text-[#9CA3AF] font-medium">{(page - 1) * pageSize + idx + 1}</td>
                                <td className="px-4 py-3"><Avatar initials={user.avatarInitials} color={user.avatarColor} /></td>
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827] whitespace-nowrap">{user.fullName}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap font-mono">{user.username}</td>
                                <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap max-w-[180px] truncate">{user.email}</td>
                                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                                <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">{user.department}</td>
                                <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">{fmtLogin(user.lastLogin)}</td>
                                <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <Tooltip label="View">
                                            <button onClick={() => onView(user)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" aria-label="View">
                                                <Eye size={13} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip label="Edit">
                                            <button onClick={() => onEdit(user)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors" aria-label="Edit">
                                                <Pencil size={13} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip label="Reset Password">
                                            <button onClick={() => onResetPassword(user)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors" aria-label="Reset Password">
                                                <KeyRound size={13} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip label="Delete">
                                            <button onClick={() => onDelete(user)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 transition-colors" aria-label="Delete">
                                                <Trash2 size={13} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalRecords={totalRecords} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
    );
});

export default UserTable;
