"use client";

import { memo, useState } from "react";
import { Settings, KeyRound, Mail, Bell, Globe, Palette, Moon } from "lucide-react";

const AccountSettings = memo(function AccountSettings() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState("id");

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
                    <Settings size={16} className="text-[#DC2626]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Account Settings</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Preferences &amp; configuration</p>
                </div>
            </div>

            {/* Change Password */}
            <SettingRow icon={KeyRound} label="Change Password" sub="Update your login password">
                <button className="h-7 px-3 rounded-lg bg-[#DC2626]/8 hover:bg-[#DC2626]/14 text-[#DC2626] text-[11px] font-semibold transition-colors">Change</button>
            </SettingRow>

            {/* Change Email */}
            <SettingRow icon={Mail} label="Change Email" sub={`Current: ahmad.fauzi@monitoring-rdk.id`}>
                <button className="h-7 px-3 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-[11px] font-semibold transition-colors">Change</button>
            </SettingRow>

            {/* Notifications */}
            <SettingRow icon={Bell} label="Notifications" sub={notifications ? "Enabled" : "Disabled"}>
                <Toggle value={notifications} onChange={setNotifications} />
            </SettingRow>

            {/* Language */}
            <SettingRow icon={Globe} label="Language" sub="Display language">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-7 px-2 rounded-lg bg-white border border-[#E5E7EB] text-[11px] text-[#374151] outline-none focus:border-[#DC2626]"
                >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                </select>
            </SettingRow>

            {/* Dark Mode — OFF, non-functional */}
            <SettingRow icon={Moon} label="Dark Mode" sub="Dark mode (coming soon)">
                <Toggle value={darkMode} onChange={() => { }} disabled />
            </SettingRow>

            {/* Theme */}
            <SettingRow icon={Palette} label="Theme" sub="Default theme" last>
                <span className="text-[11px] text-[#9CA3AF] font-medium">Default</span>
            </SettingRow>
        </div>
    );
});

export default AccountSettings;

// ─── helpers ──────────────────────────────────────────────────────────────────

function SettingRow({ icon: Icon, label, sub, children, last = false }: {
    icon: React.ElementType;
    label: string;
    sub?: string;
    children: React.ReactNode;
    last?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-[#F3F4F6]"}`}>
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-[#64748B] shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-[#111827]">{label}</p>
                    {sub && <p className="text-[11px] text-[#9CA3AF]">{sub}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

function Toggle({ value, onChange, disabled = false }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!value)}
            aria-pressed={value}
            className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${value ? "bg-[#DC2626]" : "bg-[#D1D5DB]"}`}
            style={{ height: 22, minWidth: 40 }}
        >
            <span
                className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: value ? "translateX(18px)" : "translateX(0)" }}
            />
        </button>
    );
}
