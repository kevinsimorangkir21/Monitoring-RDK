"use client";

/**
 * ToastContainer — Fixed-position animated toast notification stack.
 *
 * Features:
 *  - Bottom-right on desktop (sm+), bottom-center on mobile
 *  - framer-motion AnimatePresence for per-toast enter/exit animation
 *  - Auto-dismiss after 4000 ms via useEffect + setTimeout
 *  - Success variant: emerald left border
 *  - Error variant: red left border
 *  - Manual dismiss (X) button per toast
 *  - Multiple toasts stack vertically with gap
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

import type { ToastMessage } from "@/app/admin/setoran/types/crud";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

// ─── Single toast item ────────────────────────────────────────────────────────

interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    // Auto-dismiss timer (Requirement 12.3)
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, AUTO_DISMISS_MS);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const isSuccess = toast.variant === "success";

    return (
        <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={[
                "flex items-start gap-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg px-4 py-3",
                "border-l-4",
                isSuccess ? "border-emerald-500" : "border-red-500",
            ].join(" ")}
        >
            {/* Icon */}
            <span className="shrink-0 mt-0.5">
                {isSuccess ? (
                    <CheckCircle2
                        size={16}
                        className="text-emerald-500"
                        aria-hidden="true"
                    />
                ) : (
                    <AlertCircle
                        size={16}
                        className="text-red-500"
                        aria-hidden="true"
                    />
                )}
            </span>

            {/* Message */}
            <p className="flex-1 text-sm text-[#111827] leading-snug">
                {toast.message}
            </p>

            {/* Dismiss button */}
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
                <X size={12} />
            </button>
        </motion.div>
    );
}

// ─── Container ────────────────────────────────────────────────────────────────

/**
 * ToastContainer
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        /* Fixed position:
         *   mobile  → bottom-center  (bottom-4, left-1/2, -translate-x-1/2)
         *   sm+     → bottom-right   (bottom-4, right-4, auto left)
         */
        <div
            aria-label="Notifikasi"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[60] flex flex-col gap-2 items-center sm:items-end pointer-events-none"
        >
            <AnimatePresence mode="sync">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={onDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
