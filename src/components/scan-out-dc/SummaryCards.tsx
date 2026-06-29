"use client";

import { PackageCheck, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import SummaryCard from "./SummaryCard";
import { KPI } from "@/mock/scanOutDC";

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Scan Out" numericValue={KPI.totalScanOut} percentChange={+5.2} icon={PackageCheck} iconBg="bg-blue-50" iconColor="text-blue-600" valueColor="text-blue-700" accentBorder="border-l-blue-500" delay={0} />
            <SummaryCard title="Completed Scan" numericValue={KPI.completedScan} percentChange={+3.8} icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-700" accentBorder="border-l-emerald-500" delay={0.06} />
            <SummaryCard title="Pending Scan" numericValue={KPI.pendingScan} percentChange={-1.4} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" valueColor="text-amber-700" accentBorder="border-l-amber-500" delay={0.12} />
            <SummaryCard title="Failed Scan" numericValue={KPI.failedScan} percentChange={-2.1} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" valueColor="text-red-700" accentBorder="border-l-red-500" delay={0.18} />
        </div>
    );
}
