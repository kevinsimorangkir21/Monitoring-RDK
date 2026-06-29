"use client";

/**
 * /admin/users — User Management Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Page Header   — title, subtitle, Add User, Refresh
 *   2. KPI Cards     — Total | Active | Inactive | Administrators
 *   3. User Table    — search, filter role/status, sort, pagination, actions
 *   4. Detail Drawer — view user info (420px)
 *   5. Add Modal     — form with validation
 *   6. Edit Modal    — form with validation (username read-only)
 */

import { useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { UserPlus } from "lucide-react";

import { useUsers } from "@/hooks/useUsers";
import type { UserRecord } from "@/types/users";

import SummaryCards from "@/components/users/SummaryCards";
import UserTable from "@/components/users/UserTable";
import RefreshButton from "@/components/users/RefreshButton";
import ExportButton from "@/components/users/ExportButton";

// ── Lazy modals / drawer ───────────────────────────────────────────────────────
const UserDetailDrawer = dynamic(
    () => import("@/components/users/UserDetailDrawer"),
    { ssr: false, loading: () => null }
);
const AddUserModal = dynamic(
    () => import("@/components/users/AddUserModal"),
    { ssr: false, loading: () => null }
);
const EditUserModal = dynamic(
    () => import("@/components/users/EditUserModal"),
    { ssr: false, loading: () => null }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.34, delay: i * 0.07 },
    }),
};

// ─── Confirm delete ───────────────────────────────────────────────────────────

function ConfirmDeleteModal({ user, onConfirm, onCancel }: {
    user: UserRecord | null;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[18px] shadow-2xl p-6 w-full max-w-sm"
            >
                <p className="text-sm font-bold text-[#111827]">Delete User</p>
                <p className="text-xs text-[#64748B] mt-2">
                    Are you sure you want to delete <span className="font-semibold text-[#111827]">{user.fullName}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 mt-5">
                    <button onClick={onCancel} className="h-9 px-5 rounded-xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold hover:bg-[#F9FAFB] transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="h-9 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors shadow-sm">Delete</button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const {
        paginated, totalRecords,
        page, pageSize, totalPages,
        sort, filter,
        setPage, setPageSize,
        handleSort, handleFilterChange,
        addUser, updateUser, deleteUser,
    } = useUsers();

    const [viewUser, setViewUser] = useState<UserRecord | null>(null);
    const [editUser, setEditUser] = useState<UserRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    const handleRefresh = useCallback(async () => {
        await new Promise<void>((r) => setTimeout(r, 700));
    }, []);

    const handleExport = useCallback(() => {
        console.info("Export Users");
    }, []);

    const handleResetPassword = useCallback((user: UserRecord) => {
        alert(`Reset password link sent to ${user.email}`);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (deleteTarget) { deleteUser(deleteTarget.id); setDeleteTarget(null); }
    }, [deleteTarget, deleteUser]);

    return (
        <div className="space-y-5">

            {/* ── 1. Page Header ─────────────────────────────────────────────── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#111827] leading-tight">User Management</h1>
                    <p className="text-xs text-[#64748B] mt-1">Manage User Access &amp; Permissions</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <RefreshButton onRefresh={handleRefresh} />
                    <ExportButton onClick={handleExport} />
                    <button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <UserPlus size={14} />Add User
                    </button>
                </div>
            </motion.div>

            {/* ── 2. KPI Cards ───────────────────────────────────────────────── */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <SummaryCards />
            </motion.div>

            {/* ── 3. User Table ──────────────────────────────────────────────── */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <UserTable
                    paginated={paginated}
                    totalRecords={totalRecords}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    sort={sort}
                    filter={filter}
                    onSort={handleSort}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onFilterChange={handleFilterChange}
                    onView={setViewUser}
                    onEdit={setEditUser}
                    onResetPassword={handleResetPassword}
                    onDelete={setDeleteTarget}
                    onRefresh={handleRefresh}
                />
            </motion.div>

            {/* ── 4. Detail Drawer ───────────────────────────────────────────── */}
            <UserDetailDrawer
                user={viewUser}
                onClose={() => setViewUser(null)}
                onEdit={(u) => { setViewUser(null); setEditUser(u); }}
                onResetPassword={handleResetPassword}
            />

            {/* ── 5. Add Modal ───────────────────────────────────────────────── */}
            <AddUserModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSave={addUser}
            />

            {/* ── 6. Edit Modal ──────────────────────────────────────────────── */}
            <EditUserModal
                user={editUser}
                onClose={() => setEditUser(null)}
                onSave={updateUser}
            />

            {/* ── 7. Delete Confirm ──────────────────────────────────────────── */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    user={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
