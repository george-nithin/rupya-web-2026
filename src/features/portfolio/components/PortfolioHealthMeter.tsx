"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface PortfolioHealthMeterProps {
    healthScore: number;
    classification: string;
    expectedReturn: number;
    downside5: number;
    upside95: number;
    warnings: string[];
}

export function PortfolioHealthMeter({
    healthScore,
    classification,
    expectedReturn,
    downside5,
    upside95,
    warnings,
}: PortfolioHealthMeterProps) {
    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 70) return "text-blue-500";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getHealthGradient = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-green-600";
        if (score >= 70) return "from-blue-500 to-cyan-600";
        if (score >= 60) return "from-amber-500 to-orange-600";
        return "from-red-500 to-rose-600";
    };

    const circumference = 2 * Math.PI * 70; // radius = 70
    const offset = circumference - (healthScore / 100) * circumference;

    return (
        <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Portfolio Health</h2>

            <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Circular Health Meter */}
                <div className="relative">
                    <svg className="transform -rotate-90" width="180" height="180">
                        {/* Background circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke="url(#healthGradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop
                                    offset="0%"
                                    className={healthScore >= 80 ? "stop-emerald-500" : healthScore >= 70 ? "stop-blue-500" : healthScore >= 60 ? "stop-amber-500" : "stop-red-500"}
                                />
                                <stop
                                    offset="100%"
                                    className={healthScore >= 80 ? "stop-green-600" : healthScore >= 70 ? "stop-cyan-600" : healthScore >= 60 ? "stop-orange-600" : "stop-rose-600"}
                                />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>
                            {healthScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Health Score</div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <div className="text-sm text-muted-foreground">Classification</div>
                        <div className="text-lg font-semibold text-foreground">{classification}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Expected (30d)</div>
                            <div className="flex items-center gap-1 text-foreground font-medium">
                                <Activity className="h-4 w-4" />
                                <span>{expectedReturn.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Upside (95%)</div>
                            <div className="flex items-center gap-1 text-emerald-500 font-medium">
                                <TrendingUp className="h-4 w-4" />
                                <span>+{upside95.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Downside (5%)</div>
                            <div className="flex items-center gap-1 text-red-500 font-medium">
                                <TrendingDown className="h-4 w-4" />
                                <span>{downside5.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {warnings.slice(0, 3).map((warning, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2"
                                >
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <span>{warning}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
