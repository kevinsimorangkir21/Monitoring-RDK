'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActivityProvider } from "./dashboard/activityStore";

/**
 * Admin Layout — delegates all shell rendering to DashboardLayout.
 * Wraps with ActivityProvider so all modules can record activities.
 */
export default function AdminLayout({ children }) {
  return (
    <ActivityProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ActivityProvider>
  );
}
