"use client";

/**
 * WelcomeCard — Personal greeting card on the Dashboard.
 * Greeting berubah sesuai jam lokal.
 * Nama user dari UserContext.
 */

import { memo, useMemo } from "react";
import { Sun, Sunset, Moon, Sunrise } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// ─── Greeting helpers ─────────────────────────────────────────────────────────

interface GreetingInfo {
    text: string;
    Icon: React.ElementType;
    gradient: string;
    iconColor: string;
}

function getGreeting(hour: number): GreetingInfo {
    if (hour >= 5 && hour < 11) {
        return {
            text: "Selamat Pagi",
            Icon: Sunrise,
            gradient: "from-amber-50 to-orange-50",
            iconColor: "text-amber-500",
        };
    }
    if (hour >= 11 && hour < 15) {
        return {
            text: "Selamat Siang",
            Icon: Sun,
            gradient: "from-yellow-50 to-amber-50",
            iconColor: "text-yellow-500",
        };
    }
    if (hour >= 15 && hour < 18) {
        return {
            text: "Selamat Sore",
            Icon: Sunset,
            gradient: "from-orange-50 to-rose-50",
            iconColor: "text-orange-500",
        };
    }
    return {
        text: "Selamat Malam",
        Icon: Moon,
        gradient: "from-slate-50 to-blue-50",
        iconColor: "text-slate-500",
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

const WelcomeCard = memo(function WelcomeCard() {
    const { user } = useUser();

    const hour = new Date().getHours();
    const { text, Icon, gradient, iconColor } = useMemo(() => getGreeting(hour), [hour]);

    // Extract first name for friendlier greeting
    const firstName = useMemo(() => {
        if (!user?.name) return "";
        return user.name.split(" ")[0];
    }, [user?.name]);

    const today = useMemo(() => {
        return new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }, []);

    return (
        <div
            className={`bg-gradient-to-br ${gradient} border border-gray-200 rounded-2xl shadow-sm px-6 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
        >
            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Icon size={20} className={iconColor} />
                    <h1 className="text-2xl font-bold text-[#111827] leading-tight truncate">
                        {text}{firstName ? `, ${firstName}` : ""}!
                    </h1>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed mt-1">
                    Semoga harimu menyenangkan. Selamat bekerja dan pantau seluruh aktivitas operasional hari ini.
                </p>
                <p className="text-xs text-[#9CA3AF] mt-2">{today}</p>
            </div>

            {/* Role badge */}
            {user?.role && (
                <div className="shrink-0">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#374151] shadow-sm">
                        {user.role}
                    </span>
                </div>
            )}
        </div>
    );
});

export default WelcomeCard;
