"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Coins, Hourglass, ArrowRight } from "lucide-react";

export default function PlanningSetupPage() {
    const router = useRouter();
    const [target, setTarget] = useState<string>("500000"); // Default 5L
    const [duration, setDuration] = useState<number>(30); // Default 30 days
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Should show auth error or redirect
                return;
            }

            // Create new plan
            const { data, error } = await supabase
                .from('financial_plans')
                .insert({
                    user_id: user.id,
                    target_amount: parseFloat(target),
                    duration_days: duration,
                    current_amount: 0,
                    bricks_layout: [],
                    status: 'ACTIVE'
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating plan:", error);
                alert("Failed to start plan. Please try again.");
                return;
            }

            if (data) {
                router.push(`/planning/arena/${data.id}`);
            }

        } catch (e) {
            console.error("Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <GlassCard className="max-w-2xl w-full p-8 md:p-12 space-y-8 bg-card/80 backdrop-blur-xl border-border/50 relative overflow-hidden">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-32 bg-sky-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                <div className="text-center space-y-4 relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4 animate-float">
                        <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Launch Your Portfolio</h1>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Build your wealth tower brick by brick. Set your target and start the journey.
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Target Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">
                            Target Portfolio Value
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground group-focus-within:text-foreground transition-colors">₹</span>
                            <input
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-4 pl-10 text-3xl font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                placeholder="5,00,000"
                            />
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <Hourglass className="h-4 w-4 text-sky-400" />
                                Time Horizon
                            </span>
                            <span className="text-sky-400">{duration} Days</span>
                        </div>
                        <input
                            type="range"
                            min="7"
                            max="365"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Swing Trade</span>
                            <span>Quarterly</span>
                            <span>Half-Year</span>
                            <span>Long Term</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <GlassButton
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-none shadow-xl shadow-purple-500/20"
                        >
                            {loading ? "Initiating IPO..." : "Enter Trading Floor"}
                            {!loading && <ArrowRight className="h-5 w-5 ml-2" />}
                        </GlassButton>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
