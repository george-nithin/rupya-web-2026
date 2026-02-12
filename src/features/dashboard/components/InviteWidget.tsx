"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Plus } from "lucide-react";

export function InviteWidget() {
    const avatars = [
        "https://i.pravatar.cc/150?u=1",
        "https://i.pravatar.cc/150?u=2",
        "https://i.pravatar.cc/150?u=3",
        "https://i.pravatar.cc/150?u=4",
        "https://i.pravatar.cc/150?u=5",
    ];

    return (
        <GlassCard className="p-6 border-white/5 bg-card/30 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-white/80 tracking-tight">Invite team</h3>
                <button className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Plus className="h-4 w-4 text-white/60" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {avatars.map((url, i) => (
                    <div
                        key={i}
                        className={`relative h-12 w-12 rounded-2xl border-2 border-slate-900 overflow-hidden shadow-xl transition-transform hover:scale-110 cursor-pointer ${i === 2 ? "ring-2 ring-indigo-500 p-0.5" : ""
                            }`}
                    >
                        <img src={url} alt={`Team ${i}`} className="w-full h-full object-cover rounded-xl" />
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
