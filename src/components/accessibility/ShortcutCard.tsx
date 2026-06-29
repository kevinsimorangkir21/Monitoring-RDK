"use client";

import { memo, useCallback } from "react";
import { Keyboard, Copy, Check } from "lucide-react";
import { useState } from "react";
import { KEYBOARD_SHORTCUTS } from "@/mock/accessibility";
import type { KeyboardShortcut } from "@/types/accessibility";

function KbdKey({ k }: { k: string }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-mono font-semibold text-[#374151] shadow-sm">
            {k}
        </kbd>
    );
}

function ShortcutRow({ shortcut, last = false }: { shortcut: KeyboardShortcut; last?: boolean }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(() => {
        const text = shortcut.keys.join(" + ");
        navigator.clipboard.writeText(text).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [shortcut.keys]);

    return (
        <div className={`flex items-center justify-between py-2.5 ${last ? "" : "border-b border-[#F3F4F6]"}`}>
            <p className="text-xs text-[#374151] font-medium">{shortcut.description}</p>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    {shortcut.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-[10px] text-[#9CA3AF]">+</span>}
                            <KbdKey k={k} />
                        </span>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={copy}
                    className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
                    title="Copy shortcut"
                >
                    {copied
                        ? <Check size={11} className="text-emerald-600" />
                        : <Copy size={11} className="text-[#9CA3AF]" />
                    }
                </button>
            </div>
        </div>
    );
}

const ShortcutCard = memo(function ShortcutCard() {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Keyboard size={16} className="text-violet-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#111827]">Keyboard Shortcuts</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Speed up your workflow</p>
                </div>
            </div>
            {KEYBOARD_SHORTCUTS.map((s, i) => (
                <ShortcutRow
                    key={s.description}
                    shortcut={s}
                    last={i === KEYBOARD_SHORTCUTS.length - 1}
                />
            ))}
        </div>
    );
});

export default ShortcutCard;
