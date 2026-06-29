"use client";

/**
 * DashboardLayout — Root shell for the admin area.
 *
 * Structure:
 *   ┌─────────────────────────────────────┐
 *   │  Sidebar (fixed, collapsible)       │
 *   ├─────────────────────────────────────┤
 *   │  Header  (fixed, right of sidebar)  │
 *   ├─────────────────────────────────────┤
 *   │  Main    (scrollable, padded)       │
 *   └─────────────────────────────────────┘
 *
 * The sidebar collapses from 280px to 88px on desktop.
 * On mobile (<lg), the sidebar becomes an overlay drawer.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggle = useCallback(() => setCollapsed((v) => !v), []);
    const handleMobileClose = useCallback(() => setMobileOpen(false), []);
    const handleMobileOpen = useCallback(() => setMobileOpen(true), []);

    // Offset for header and main — desktop only (mobile sidebar is overlay)
    const offset = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <div className="h-screen overflow-hidden bg-[#F5F7FB]">
            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <Sidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggle={handleToggle}
                onMobileClose={handleMobileClose}
            />

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <Header
                offsetLeft={offset}
                onMobileMenuOpen={handleMobileOpen}
            />

            {/* ── Main Content ────────────────────────────────────────────────── */}
            <motion.main
                animate={{ marginLeft: offset }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="h-screen overflow-y-auto pt-20 lg:pt-20"
                style={{ marginLeft: offset }}
            >
                {/* Page transition wrapper */}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={typeof window !== "undefined" ? window.location.pathname : "layout"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="min-h-[calc(100vh-80px)] p-6 lg:p-8"
                    >
                        <div className="max-w-7xl mx-auto pb-10">
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.main>

            {/* Mobile offset: no margin on mobile (sidebar is overlay) */}
            <style jsx global>{`
        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
        </div>
    );
}
