"use client";

/**
 * DashboardLayout — Root shell for the admin area with auth guard.
 *
 * Auth guard logic:
 * - Waits for UserContext.loading to become false (hydration from cookie is done).
 * - If loading is still true → renders a spinner (do NOT redirect yet).
 * - If loading is false AND user is null → redirect to /login.
 * - If loading is false AND user is populated → render the dashboard shell.
 *
 * This pattern prevents the false-redirect race condition where DashboardLayout
 * reads user===null before UserContext has finished decoding the cookie.
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from "./Sidebar";
import Header from "./Header";
import { useUser } from "@/contexts/UserContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { user, loading } = useUser();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggle = useCallback(() => setCollapsed((v) => !v), []);
    const handleMobileClose = useCallback(() => setMobileOpen(false), []);
    const handleMobileOpen = useCallback(() => setMobileOpen(true), []);

    // ── Auth guard ────────────────────────────────────────────────────────────
    // Only redirect after hydration is complete. Redirecting while loading=true
    // would kick out authenticated users whose context hasn't hydrated yet.
    useEffect(() => {
        if (loading) return;                     // still hydrating — wait
        if (!user) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[DashboardLayout] No user after hydration — redirecting to /login');
            }
            router.replace('/login');
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.log('[DashboardLayout] Authenticated as:', user.email);
            }
        }
    }, [loading, user, router]);

    // ── Loading / unauthenticated state ───────────────────────────────────────
    // Show spinner while hydrating OR while the redirect is in flight.
    if (loading || !user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F5F7FB]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-500">Memuat...</p>
                </div>
            </div>
        );
    }

    // ── Authenticated shell ───────────────────────────────────────────────────
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

            {/* Mobile: no left margin (sidebar is overlay) */}
            <style jsx global>{`
        @media (max-width: 1023px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
        </div>
    );
}
