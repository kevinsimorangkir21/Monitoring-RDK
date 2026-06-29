"use client";

/**
 * UserDropdown — Avatar + name + role button with animated dropdown menu.
 * Shows a small action menu when clicked (Profile, Settings, Logout).
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserCircle, Settings, LogOut } from "lucide-react";

interface DropdownItem {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    danger?: boolean;
}

const DROPDOWN_ITEMS: DropdownItem[] = [
    { label: "Profile", icon: UserCircle },
    { label: "Settings", icon: Settings },
    { label: "Logout", icon: LogOut, danger: true },
];

export default function UserDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 shadow-sm"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt="User avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-white object-cover"
                />
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">Kevin</p>
                    <p className="text-[11px] text-gray-400 leading-tight">Administrator</p>
                </div>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={15} className="text-gray-400" />
                </motion.span>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[14px] border border-gray-100 shadow-xl z-50 overflow-hidden"
                    >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-semibold text-gray-900">Kevin</p>
                            <p className="text-xs text-gray-400">kevin@monitoring.op</p>
                        </div>

                        {/* Actions */}
                        <div className="py-1">
                            {DROPDOWN_ITEMS.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        item.onClick?.();
                                        setOpen(false);
                                    }}
                                    className={[
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150",
                                        item.danger
                                            ? "text-red-600 hover:bg-red-50"
                                            : "text-gray-700 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    <item.icon size={15} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
