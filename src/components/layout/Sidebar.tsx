"use client";

/**
 * Sidebar — Collapsible enterprise sidebar.
 *
 * Desktop: fixed left rail, toggles between 280px (expanded) and 88px (collapsed).
 * Mobile:  slides in as a drawer over the content (overlay mode).
 *
 * Emits `onCollapseChange` so the header / main can adjust their left offset.
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    LogOut,
    ChevronLeft,
    ChevronRight,
    type LucideIcon,
} from "lucide-react";

import Logo from "./Logo";
import MenuItem from "./MenuItem";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItemDef {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface MenuSection {
    title: string;
    items: MenuItemDef[];
}

// ─── Menu Definition ──────────────────────────────────────────────────────────

const MENU: MenuSection[] = [
    {
        title: "Dashboard",
        items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
        title: "IO",
        items: [
            { name: "Inbound", href: "/admin/inbound", icon: ArrowDownCircle },
            { name: "Outbound", href: "/admin/outbound", icon: ArrowUpCircle },
        ],
    },
    {
        title: "Progress",
        items: [
            { name: "Report Daily", href: "/admin/report-daily", icon: ClipboardCheck },
            { name: "Scan Out DC", href: "/admin/scan-out-dc", icon: ScanLine },
            { name: "Claim Vendor", href: "/admin/claim-vendor", icon: Receipt },
            { name: "Gantungan Faktur", href: "/admin/gantungan-faktur", icon: FileStack },
            { name: "Report WO-WT", href: "/admin/report-wo-wt", icon: FileBarChart },
            { name: "Setoran", href: "/admin/setoran", icon: Wallet },
        ],
    },
    {
        title: "Settings",
        items: [
            { name: "User Management", href: "/admin/users", icon: Users },
            { name: "Profile", href: "/admin/profile", icon: UserCircle },
            { name: "Accessibility", href: "/admin/accessibility", icon: Accessibility },
        ],
    },
];

// ─── Constants ────────────────────────────────────────────────────────────────

export const SIDEBAR_EXPANDED = 280;
export const SIDEBAR_COLLAPSED = 88;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({
    collapsed,
    mobileOpen,
    onToggle,
    onMobileClose,
}: SidebarProps) {
    const pathname = usePathname();

    // Close mobile drawer on route change
    useEffect(() => {
        onMobileClose();
    }, [pathname, onMobileClose]);

    // Close mobile drawer on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onMobileClose();
        },
        [onMobileClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    // ── Shared sidebar content ────────────────────────────────────────────────

    const SidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-hidden">
            {/* Logo */}
            <Logo collapsed={collapsed} />

            {/* Toggle collapse button — desktop only */}
            <button
                onClick={onToggle}
                className={[
                    "hidden lg:flex absolute -right-3 top-[72px] z-10",
                    "w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm",
                    "items-center justify-center",
                    "hover:bg-red-50 hover:border-red-300 transition-colors duration-200",
                ].join(" ")}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronRight size={13} className="text-gray-500" />
                ) : (
                    <ChevronLeft size={13} className="text-gray-500" />
                )}
            </button>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4 space-y-5">
                {MENU.map((section) => (
                    <div key={section.title}>
                        {/* Section title — hidden when collapsed */}
                        <AnimatePresence initial={false}>
                            {!collapsed && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400"
                                >
                                    {section.title}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <MenuItem
                                    key={item.href}
                                    name={item.name}
                                    href={item.href}
                                    icon={item.icon}
                                    active={pathname === item.href}
                                    collapsed={collapsed}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100 shrink-0">
                {collapsed ? (
                    /* Icon-only logout when collapsed */
                    <div className="relative group">
                        <button
                            className="w-full flex items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200"
                            aria-label="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                        <div
                            className="
                pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
                whitespace-nowrap shadow-lg
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
              "
                        >
                            Logout
                            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </div>
                    </div>
                ) : (
                    /* Full logout button when expanded */
                    <button
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-2.5 text-sm font-semibold transition-colors duration-200 shadow-sm shadow-red-200"
                    >
                        <LogOut size={17} />
                        <AnimatePresence initial={false}>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                Logout
                            </motion.span>
                        </AnimatePresence>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
            <motion.aside
                animate={{ width: sidebarWidth }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:block fixed left-0 top-0 h-screen z-30 overflow-visible"
                style={{ width: sidebarWidth }}
            >
                <div className="relative h-full">
                    {SidebarContent}
                </div>
            </motion.aside>

            {/* ── Mobile Overlay + Drawer ───────────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                            onClick={onMobileClose}
                        />

                        {/* Drawer */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: -SIDEBAR_EXPANDED }}
                            animate={{ x: 0 }}
                            exit={{ x: -SIDEBAR_EXPANDED }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            style={{ width: SIDEBAR_EXPANDED }}
                            className="lg:hidden fixed left-0 top-0 h-screen z-50"
                        >
                            {SidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
