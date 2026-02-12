"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Activity, Shield } from "lucide-react";

interface StockScoreCardProps {
    symbol: string;
    qualityScore: number;
    growthScore: number;
    valuationScore: number;
    stabilityScore: number;
    totalScore: number;
    rating: string;
}

export function StockScoreCard({
    symbol,
    qualityScore,
    growthScore,
    valuationScore,
    stabilityScore,
    totalScore,
    rating,
}: StockScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 70) return "text-blue-500";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getRatingColor = (rating: string) => {
        if (rating === "Elite") return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
        if (rating === "Strong") return "bg-blue-500/20 text-blue-500 border-blue-500/30";
        if (rating === "Moderate") return "bg-amber-500/20 text-amber-500 border-amber-500/30";
        return "bg-red-500/20 text-red-500 border-red-500/30";
    };

    return (
        <GlassCard className="p-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">{symbol}</h3>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getRatingColor(rating)}`}
                    >
                        {rating}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
                        {totalScore}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <ScorePillar
                    icon={<Shield className="h-4 w-4" />}
                    label="Quality"
                    score={qualityScore}
                />
                <ScorePillar
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Growth"
                    score={growthScore}
                />
                <ScorePillar
                    icon={<Activity className="h-4 w-4" />}
                    label="Valuation"
                    score={valuationScore}
                />
                <ScorePillar
                    icon={<TrendingDown className="h-4 w-4" />}
                    label="Stability"
                    score={stabilityScore}
                />
            </div>
        </GlassCard>
    );
}

function ScorePillar({
    icon,
    label,
    score,
}: {
    icon: React.ReactNode;
    label: string;
    score: number;
}) {
    const getColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 70) return "bg-blue-500";
        if (score >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getColor(score)} transition-all duration-500`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-foreground w-8">{score}</span>
            </div>
        </div>
    );
}
