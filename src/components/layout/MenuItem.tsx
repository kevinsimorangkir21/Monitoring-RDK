"use client";

/**
 * MenuItem — A single sidebar navigation link.
 * Handles active state, hover animation, tooltip when collapsed,
 * and smooth text fade on collapse/expand.
 */

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface MenuItemProps {
    name: string;
    href: string;
    icon: LucideIcon;
    active: boolean;
    collapsed: boolean;
}

export default function MenuItem({
    name,
    href,
    icon: Icon,
    active,
    collapsed,
}: MenuItemProps) {
    return (
        <div className="relative group">
            <Link
                href={href}
                className={[
                    "relative flex items-center gap-3 rounded-xl transition-all duration-200",
                    collapsed ? "mx-2 px-3 py-3 justify-center" : "mx-3 px-4 py-2.5",
                    active
                        ? "bg-red-600 text-white shadow-md shadow-red-200"
                        : "text-gray-500 hover:bg-red-50 hover:text-red-600",
                ].join(" ")}
            >
                {/* Active left bar indicator (only expanded) */}
                {active && !collapsed && (
                    <motion.span
                        layoutId="active-bar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/60"
                    />
                )}

                {/* Icon */}
                <Icon
                    size={20}
                    className={[
                        "shrink-0 transition-transform duration-200",
                        active ? "text-white" : "",
                        "group-hover:scale-110",
                    ].join(" ")}
                />

                {/* Label — hidden when collapsed */}
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                            {name}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>

            {/* Tooltip — only when collapsed */}
            {collapsed && (
                <div
                    className="
            pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
            bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
            whitespace-nowrap shadow-lg
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
          "
                >
                    {name}
                    {/* Arrow */}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
            )}
        </div>
    );
}
