"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, ShieldCheck, Target, Award } from "lucide-react";

export function TraderScorecard() {
    const scores = [
        { label: "Consistency", value: 85, icon: Target, color: "text-sky-400", bg: "bg-sky-500/20" },
        { label: "Risk Mgmt", value: 92, icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/20" },
        { label: "Discipline", value: 78, icon: Award, color: "text-purple-400", bg: "bg-purple-500/20" },
        { label: "Growth", value: 64, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/20" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {scores.map((s) => (
                <GlassCard key={s.label} className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                        <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                        <div className="text-2xl font-bold text-foreground">{s.value}/100</div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
