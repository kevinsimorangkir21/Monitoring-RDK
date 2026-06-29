"use client";

import { memo } from "react";
import { Globe } from "lucide-react";
import type { RegionSettings } from "@/types/accessibility";
import {
    LANGUAGE_OPTIONS, TIMEZONE_OPTIONS, DATE_FORMAT_OPTIONS,
    TIME_FORMAT_OPTIONS, NUMBER_FORMAT_OPTIONS,
} from "@/mock/accessibility";

const selectCls = "w-full h-9 rounded-xl border border-[#E5E7EB] bg-white text-xs text-[#374151] px-3 outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 cursor-pointer";

interface Props {
    value: RegionSettings;
    onChange: (patch: Partial<RegionSettings>) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 border-b border-[#F3F4F6] last:border-none">
            <p className="text-xs font-semibold text-[#111827] self-center">{label}</p>
            {children}
        </div>
    );
}

const LanguageCard = memo(function LanguageCard({ value, onChange }: Props) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Globe size={16} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Language &amp; Region</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Locale and formatting preferences</p>
                </div>
            </div>

            <Row label="Language">
                <select className={selectCls} value={value.language} onChange={(e) => onChange({ language: e.target.value as RegionSettings["language"] })}>
                    {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Row>

            <Row label="Timezone">
                <select className={selectCls} value={value.timezone} onChange={(e) => onChange({ timezone: e.target.value as RegionSettings["timezone"] })}>
                    {TIMEZONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Row>

            <Row label="Date Format">
                <select className={selectCls} value={value.dateFormat} onChange={(e) => onChange({ dateFormat: e.target.value as RegionSettings["dateFormat"] })}>
                    {DATE_FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Row>

            <Row label="Time Format">
                <select className={selectCls} value={value.timeFormat} onChange={(e) => onChange({ timeFormat: e.target.value as RegionSettings["timeFormat"] })}>
                    {TIME_FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Row>

            <Row label="Number Format">
                <select className={selectCls} value={value.numberFormat} onChange={(e) => onChange({ numberFormat: e.target.value as RegionSettings["numberFormat"] })}>
                    {NUMBER_FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Row>
        </div>
    );
});

export default LanguageCard;
