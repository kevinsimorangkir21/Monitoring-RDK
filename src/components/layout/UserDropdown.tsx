"use client";

/**
 * UserDropdown — Avatar + name + role button with animated dropdown menu.
 * Shows a small action menu when clicked (Profile, Settings, Logout).
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserCircle, Settings, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRole(role: string): string {
    return role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0].toUpperCase())
        .join("");
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DropdownItem {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    danger?: boolean;
}

export default function UserDropdown() {
    const { user, logout } = useUser();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Do not render if user data is unavailable
    if (!user) return null;

    const DROPDOWN_ITEMS: DropdownItem[] = [
        { label: "Profile", icon: UserCircle },
        { label: "Settings", icon: Settings },
        {
            label: "Logout",
            icon: LogOut,
            danger: true,
            onClick: () => { logout(); },
        },
    ];

    const initials = getInitials(user.name);
    const formattedRole = formatRole(user.role);

    return (
        <DropdownInner
            user={user}
            initials={initials}
            formattedRole={formattedRole}
            dropdownItems={DROPDOWN_ITEMS}
            open={open}
            setOpen={setOpen}
            containerRef={ref}
        />
    );
}

// ── Inner component (separated so hooks are always called unconditionally) ─────

interface DropdownInnerProps {
    user: { name: string; email: string; role: string };
    initials: string;
    formattedRole: string;
    dropdownItems: DropdownItem[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    containerRef: React.RefObject<HTMLDivElement>;
}

function DropdownInner({
    user,
    initials,
    formattedRole,
    dropdownItems,
    open,
    setOpen,
    containerRef,
}: DropdownInnerProps) {
    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [containerRef, setOpen]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [setOpen]);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 shadow-sm"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {/* Avatar — initials-based */}
                <div
                    className="w-8 h-8 rounded-full ring-2 ring-white bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none"
                    aria-label={`Avatar for ${user.name}`}
                >
                    {initials}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-gray-400 leading-tight">{formattedRole}</p>
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
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>

                        {/* Actions */}
                        <div className="py-1">
                            {dropdownItems.map((item) => (
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
