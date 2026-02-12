"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, BarChart2, Briefcase } from "lucide-react";

interface ExperienceStepProps {
    value: string;
    onChange: (value: string) => void;
}

const levels = [
    {
        id: "beginner",
        title: "Beginner",
        description: "I'm new to trading and want to learn the basics.",
        icon: TrendingUp,
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        id: "trader",
        title: "Active Trader",
        description: "I trade frequently (Intraday/F&O) and know technicals.",
        icon: BarChart2,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
    },
    {
        id: "investor",
        title: "Long-term Investor",
        description: "I focus on fundamentals and building a portfolio.",
        icon: Briefcase,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
];

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground text-center">What's your trading experience?</h2>
            <p className="text-muted-foreground text-center text-sm mb-6">We'll customize your dashboard based on this.</p>

            <div className="grid grid-cols-1 gap-4">
                {levels.map((level) => (
                    <GlassCard
                        key={level.id}
                        className={`cursor-pointer transition-all border-2 flex items-center gap-4 ${value === level.id
                                ? "border-sky-500 bg-sky-500/5"
                                : "border-transparent hover:border-border"
                            }`}
                        onClick={() => onChange(level.id)}
                    >
                        <div className={`p-3 rounded-xl ${level.bg} ${level.color}`}>
                            <level.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">{level.title}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
