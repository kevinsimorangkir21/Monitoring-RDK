"use client";

/**
 * SetoranErrorBoundary — React Error Boundary for the Setoran Dashboard
 *
 * Catches any uncaught errors in the component subtree and displays a
 * user-friendly fallback UI instead of a blank / broken page.
 *
 * Usage:
 *   <SetoranErrorBoundary>
 *     <SetoranDashboardContent />
 *   </SetoranErrorBoundary>
 *
 * Requirements: 6.5, 7.1, 7.2, 7.3
 */

import React, { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SetoranErrorBoundaryProps {
    /** Content to render when no error is present */
    children: React.ReactNode;
    /** Optional custom fallback to override the default error UI */
    fallback?: React.ReactNode;
}

interface SetoranErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SetoranErrorBoundary
 *
 * Class component required by React's error boundary API.
 * Wraps the dashboard content so any runtime error in a chart, card, or table
 * is caught and surfaced gracefully instead of crashing the whole page.
 */
export class SetoranErrorBoundary extends Component<
    SetoranErrorBoundaryProps,
    SetoranErrorBoundaryState
> {
    constructor(props: SetoranErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
        this.handleReset = this.handleReset.bind(this);
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    static getDerivedStateFromError(error: Error): SetoranErrorBoundaryState {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to console in development; swap for a real error-reporting service
        // (e.g. Sentry) in production without changing the boundary interface.
        if (process.env.NODE_ENV === "development") {
            console.error("[SetoranErrorBoundary] Uncaught error:", error, errorInfo);
        }
        this.setState({ errorInfo });
    }

    // ── Reset handler — lets the user retry without a full page reload ─────────

    handleReset(): void {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    render(): React.ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (!hasError) return children;

        // Use custom fallback if provided
        if (fallback) return fallback;

        // Default fallback UI
        return (
            <div
                role="alert"
                aria-live="assertive"
                className="flex flex-col items-center justify-center min-h-[320px] bg-white border border-red-100 rounded-[18px] p-8 shadow-sm text-center gap-4"
            >
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-[#DC2626]" aria-hidden="true" />
                </div>

                {/* Heading */}
                <div>
                    <h2 className="text-base font-bold text-[#111827]">
                        Terjadi Kesalahan
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm">
                        Dashboard tidak dapat ditampilkan karena terjadi kesalahan yang tidak terduga.
                        Silakan coba muat ulang halaman atau hubungi administrator jika masalah berlanjut.
                    </p>
                </div>

                {/* Error detail (dev-only) */}
                {process.env.NODE_ENV === "development" && error && (
                    <pre className="w-full max-w-lg text-left text-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 overflow-auto text-[#DC2626] font-mono">
                        {error.message}
                    </pre>
                )}

                {/* Retry button */}
                <button
                    type="button"
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                    aria-label="Coba lagi memuat dashboard"
                >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    Coba Lagi
                </button>
            </div>
        );
    }
}

export default SetoranErrorBoundary;
