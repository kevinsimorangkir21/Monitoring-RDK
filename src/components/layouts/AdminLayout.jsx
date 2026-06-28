"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout
      menuSections={[
        {
          section: "Manajemen",
          items: [
            { href: "/admin", label: "Dashboard", icon: FileText },
            { href: "/admin/peserta", label: "Peserta", icon: Users },
            { href: "/admin/perusahaan", label: "Perusahaan", icon: Briefcase },
            { href: "/admin/lowongan", label: "Lowongan", icon: Star },
          ],
        },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
