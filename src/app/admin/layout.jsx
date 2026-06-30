'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * Admin Layout — delegates all shell rendering to DashboardLayout.
 *
 * Must be 'use client' because DashboardLayout uses React hooks (useUser,
 * useRouter, useState, useEffect). Next.js App Router does not allow a Server
 * Component to directly render a Client Component that uses context.
 */
export default function AdminLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
