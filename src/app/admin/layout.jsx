"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardCheck,
  ScanLine,
  Receipt,
  FileStack,
  FileBarChart,
  Wallet,
  Users,
  UserCircle,
  Accessibility,
  Bell,
  Search,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const menu = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "IO",
      items: [
        {
          name: "Inbound",
          href: "/admin/inbound",
          icon: ArrowDownCircle,
        },
        {
          name: "Outbound",
          href: "/admin/outbound",
          icon: ArrowUpCircle,
        },
      ],
    },
    {
      title: "Progress",
      items: [
        {
          name: "Report Daily",
          href: "/admin/report-daily",
          icon: ClipboardCheck,
        },
        {
          name: "Scan Out DC",
          href: "/admin/scan-out-dc",
          icon: ScanLine,
        },
        {
          name: "Claim Vendor",
          href: "/admin/claim-vendor",
          icon: Receipt,
        },
        {
          name: "Gantungan Faktur",
          href: "/admin/gantungan-faktur",
          icon: FileStack,
        },
        {
          name: "Report WO-WT",
          href: "/admin/report-wo-wt",
          icon: FileBarChart,
        },
        {
          name: "Setoran",
          href: "/admin/setoran",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "User Management",
          href: "/admin/users",
          icon: Users,
        },
        {
          name: "Profile",
          href: "/admin/profile",
          icon: UserCircle,
        },
        {
          name: "Accessibility",
          href: "/admin/accessibility",
          icon: Accessibility,
        },
      ],
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* Sidebar */}

      <aside className="w-72 h-screen shrink-0 bg-white border-r border-gray-200 shadow-sm flex flex-col">

        {/* Logo */}

        <div className="h-20 flex items-center gap-4 px-6 border-b border-gray-200">

          <img
            src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
            alt="logo"
            className="w-11 h-11"
          />

          <div>

            <h1 className="font-bold text-gray-900">
              Monitoring OP
            </h1>

            <p className="text-xs text-gray-500">
              Operational Monitoring
            </p>

          </div>

        </div>

        {/* Menu */}

        <div className="flex-1 overflow-y-auto py-6">

          {menu.map((section) => (

            <div
              key={section.title}
              className="mb-8"
            >

              <p className="px-6 mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">

                {section.title}

              </p>

              <div className="space-y-1">

                {section.items.map((item) => {

                  const active = pathname === item.href;

                  return (

                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-3 flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                        active
                          ? "bg-red-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >

                      <item.icon size={20} />

                      <span className="font-medium text-sm">
                        {item.name}
                      </span>

                    </Link>

                  );

                })}

              </div>

            </div>

          ))}

        </div>

        {/* Logout */}

        <div className="p-5 border-t border-gray-200">

          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 font-semibold transition">

            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>

      {/* Main */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}

        <header className="h-20 shrink-0 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">

          <div>

            <h2 className="text-2xl font-bold text-gray-900 capitalize">

              {pathname
                .split("/")
                .pop()
                ?.replace(/-/g, " ") || "Dashboard"}

            </h2>

            <p className="text-sm text-gray-500">
              Operational Monitoring Dashboard
            </p>

          </div>
                    <div className="flex items-center gap-5">

            {/* Search */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-3.5 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-72 h-11 rounded-xl border border-gray-300 bg-gray-50 pl-11 pr-4 text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

            {/* Notification */}

            <button className="relative w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center">

              <Bell
                size={20}
                className="text-gray-700"
              />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600"></span>

            </button>

            {/* User */}

            <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 hover:bg-gray-50 transition">

              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="User"
                className="w-10 h-10 rounded-full"
              />

              <div className="text-left">

                <p className="text-sm font-semibold text-gray-900">
                  Kevin
                </p>

                <p className="text-xs text-gray-500">
                  Administrator
                </p>

              </div>

              <ChevronDown
                size={18}
                className="text-gray-400"
              />

            </button>

          </div>

        </header>

        {/* Content */}

        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">

          <div className="max-w-7xl mx-auto pb-10">

            {children}

          </div>

        </main>

      </div>

    </div>

  );

}