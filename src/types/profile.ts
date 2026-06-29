/**
 * Profile — Shared Type Definitions
 */

export type AccountStatus = "Active" | "Inactive" | "Suspended";
export type UserRole = "Administrator" | "Supervisor" | "Operator" | "Viewer";
export type ActivityStatus = "Success" | "Failed" | "Warning";
export type ActivityType = "Login" | "Export" | "Update" | "Report" | "Logout" | "Security";

export interface ProfileData {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    role: UserRole;
    joinDate: string;
    lastLogin: string;
    accountStatus: AccountStatus;
    avatarInitials: string;
    avatarColor: string;
    twoFAEnabled: boolean;
}

export interface ActivityStats {
    totalLogin: number;
    lastLogin: string;
    totalActions: number;
    reportsGenerated: number;
}

export interface ActivityItem {
    id: string;
    type: ActivityType;
    description: string;
    timestamp: string;
    status: ActivityStatus;
}

export interface EditProfileForm {
    fullName: string;
    phone: string;
    email: string;
    department: string;
    position: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
