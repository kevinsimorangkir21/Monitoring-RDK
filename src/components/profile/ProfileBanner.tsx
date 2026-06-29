"use client";

import { memo } from "react";

interface Props { children?: React.ReactNode; }

const ProfileBanner = memo(function ProfileBanner({ children }: Props) {
    return (
        <div
            className="relative w-full rounded-[18px] overflow-hidden shadow-sm"
            style={{ height: 240, background: "linear-gradient(135deg,#DC2626 0%,#EF4444 50%,#F87171 100%)" }}
        >
            {/* blur circle top-right */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle,#FECACA,transparent 70%)" }} />
            {/* blur circle bottom-left */}
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-20 blur-2xl" style={{ background: "radial-gradient(circle,#FCA5A5,transparent 70%)" }} />
            {/* soft white circle top-left */}
            <div className="absolute top-8 left-10 w-24 h-24 rounded-full opacity-15 blur-xl" style={{ background: "radial-gradient(circle,#ffffff,transparent 70%)" }} />
            {/* dot grid */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
            {/* diagonal stripe */}
            <div className="absolute top-0 right-0 w-72 h-full opacity-[0.07]" style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.5) 10px,rgba(255,255,255,0.5) 12px)" }} />
            {/* bottom gradient shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.22),transparent)" }} />
            {/* ring accents */}
            <div className="absolute bottom-6 right-10 w-36 h-36 rounded-full border-[3px] border-white/15" />
            <div className="absolute bottom-10 right-14 w-20 h-20 rounded-full border-2 border-white/10" />
            {/* small top-right circle */}
            <div className="absolute top-6 right-32 w-10 h-10 rounded-full bg-white/10" />
            {children}
        </div>
    );
});

export default ProfileBanner;
