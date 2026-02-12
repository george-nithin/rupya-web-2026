"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Bell } from "lucide-react";

export function StatusBanner() {
    return (
        <GlassCard className="p-2 pl-6 overflow-hidden border-white/5 bg-card/20 rounded-[1.5rem] flex items-center justify-between group">
            <p className="text-sm font-medium text-white/70">
                We'll send finance reports when it get ready
            </p>
            <GlassButton
                variant="secondary"
                className="bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl py-2 px-6 flex items-center gap-2 group-hover:scale-[1.02] transition-all"
            >
                <Bell className="h-4 w-4 text-white/60" />
                <span className="text-sm font-black text-white/90">Notify</span>
            </GlassButton>
        </GlassCard>
    );
}
