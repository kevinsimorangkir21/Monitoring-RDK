/**
 * Profile — Mock Data
 */

import type { ProfileData, ActivityStats, ActivityItem } from "@/types/profile";

export const profileData: ProfileData = {
    id: "USR-001",
    fullName: "Ahmad Fauzi",
    username: "ahmad.fauzi",
    email: "ahmad.fauzi@monitoring-rdk.id",
    phone: "+62 812-3456-7890",
    employeeId: "EMP-2024-001",
    department: "IT & Systems",
    position: "System Administrator",
    role: "Administrator",
    joinDate: "2024-01-15",
    lastLogin: "2025-06-28T08:42:00",
    accountStatus: "Active",
    avatarInitials: "AF",
    avatarColor: "#DC2626",
    twoFAEnabled: false,
};

export const activityStats: ActivityStats = {
    totalLogin: 248,
    lastLogin: "2025-06-28T08:42:00",
    totalActions: 1842,
    reportsGenerated: 134,
};

export const recentActivities: ActivityItem[] = [
    { id: "ACT-001", type: "Login", description: "Signed in from Chrome on Windows 11", timestamp: "2025-06-28T08:42:00", status: "Success" },
    { id: "ACT-002", type: "Export", description: "Exported Gantungan Faktur report to Excel", timestamp: "2025-06-27T15:30:00", status: "Success" },
    { id: "ACT-003", type: "Update", description: "Updated profile information", timestamp: "2025-06-27T10:15:00", status: "Success" },
    { id: "ACT-004", type: "Report", description: "Generated WO-WT daily report", timestamp: "2025-06-26T14:00:00", status: "Success" },
    { id: "ACT-005", type: "Security", description: "Failed login attempt from unknown IP detected", timestamp: "2025-06-26T09:05:00", status: "Warning" },
    { id: "ACT-006", type: "Export", description: "Exported Claim Vendor data to Excel", timestamp: "2025-06-25T16:45:00", status: "Success" },
    { id: "ACT-007", type: "Logout", description: "Signed out from active session", timestamp: "2025-06-25T17:00:00", status: "Success" },
];

export const DEPARTMENT_OPTIONS = [
    "IT & Systems", "Logistik", "Warehouse", "Distribusi",
    "Finance", "HR & Umum", "Operasional",
];

export const POSITION_OPTIONS = [
    "System Administrator", "Supervisor Logistik", "Operator Warehouse",
    "Staff Finance", "HR Specialist", "Manager Operasional", "Data Analyst",
];
