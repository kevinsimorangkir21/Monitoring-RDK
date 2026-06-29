"use client";

/**
 * Header — Sticky top bar.
 * Shows: hamburger (mobile), breadcrumb page title, date/time card, user dropdown.
 */

import { usePathname } from "next/navigation";
import { CalendarDays, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import UserDropdown from "./UserDropdown";

// ─── Breadcrumb helpers ───────────────────────────────────────────────────────

/** Convert a URL slug to a display label */
function slugToLabel(slug: string): string {
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Extract breadcrumb segments from pathname, stripping /admin prefix */
function getBreadcrumb(pathname: string): { title: string; sub: string } {
    const segments = pathname
        .split("/")
        .filter(Boolean)
        .filter((s) => s !== "admin");

    if (segments.length === 0) return { title: "Dashboard", sub: "Home" };

    const title = slugToLabel(segments[segments.length - 1]);
    const sub =
        segments.length > 1
            ? segments.slice(0, -1).map(slugToLabel).join(" / ")
            : "Admin";

    return { title, sub };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderProps {
    /** Left offset in px to account for the sidebar width */
    offsetLeft: number;
    onMobileMenuOpen: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ offsetLeft, onMobileMenuOpen }: HeaderProps) {
    const pathname = usePathname();
    const { title, sub } = getBreadcrumb(pathname);

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <header
            className="fixed top-0 right-0 z-20 h-20 bg-white border-b border-gray-100 shadow-sm flex items-center px-6 transition-[left] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ left: offsetLeft }}
        >
            {/* Hamburger — mobile only */}
            <button
                    type="button"
                    onClick={onMobileMenuOpen}
                className="lg:hidden w-9 h-9 mr-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Open navigation menu"
                >
                    <Menu size={18} className="text-gray-600" />
                </button>

            <div className="flex items-center justify-between w-full">
                {/* Left */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {sub} · Operational Monitoring
                    </p>
                </div>

                {/* Right */}
                <div className="hidden lg:flex items-center gap-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-2 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                            <CalendarDays
                                size={18}
                                className="text-white"
                            />
            </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {date}
                            </p>

                            <p className="text-xs text-gray-500">
                                {time} WIB
                            </p>
                        </div>
                    </div>
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
}