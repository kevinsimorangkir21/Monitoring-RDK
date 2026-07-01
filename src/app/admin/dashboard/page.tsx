"use client";

/**
 * Dashboard Home — /admin
 * Layout sederhana: Welcome Card + Recent Activity.
 * Semua section lama (KPI, Progress, Chart, Pending, Ops Table) dihapus.
 */

import WelcomeCard from "./WelcomeCard";
import RecentActivityCard from "./RecentActivityCard";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Card — full width */}
            <WelcomeCard />

            {/* Recent Activity — full width di bawah Welcome */}
            <RecentActivityCard />
        </div>
    );
}
