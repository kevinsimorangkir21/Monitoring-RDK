/**
 * User Management — Shared Type Definitions
 */

export type UserRole = "Administrator" | "Supervisor" | "Operator" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface UserRecord {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
    lastLogin: string;   // ISO datetime or "—"
    createdAt: string;   // ISO datetime
    updatedAt: string;   // ISO datetime
    avatarInitials: string;
    avatarColor: string; // tailwind bg class
}

export interface UserKPI {
    total: number;
    active: number;
    inactive: number;
    administrators: number;
}

export type UserSortKey = keyof Pick<
    UserRecord,
    "fullName" | "username" | "email" | "role" | "department" | "lastLogin" | "status"
>;

export interface UserSort {
    key: UserSortKey;
    direction: "asc" | "desc";
}

export interface UserFilter {
    search: string;
    role: string;
    status: string;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface AddUserForm {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    department: string;
    status: UserStatus;
}

export interface EditUserForm {
    fullName: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
