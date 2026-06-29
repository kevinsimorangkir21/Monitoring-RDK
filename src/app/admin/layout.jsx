import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * Admin Layout — delegates all shell rendering to DashboardLayout.
 * This file is intentionally minimal so routing stays unchanged.
 */
export default function AdminLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
