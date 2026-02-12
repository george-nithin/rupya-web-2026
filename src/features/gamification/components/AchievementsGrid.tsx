"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Award, Zap, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const initialAchievements = [
    { id: "early_bird", name: "Early Bird", desc: "Place a trade before 9:30 AM", icon: Zap },
    { id: "survivorship", name: "Survivorship", desc: "No capital blowout for 30 days", icon: Shield },
    { id: "trend_rider", name: "Trend Rider", desc: "Hold a winning trade > 4 hours", icon: TrendingUp },
    { id: "consistency_king", name: "Consistency King", desc: "Green P&L for 5 days in a row", icon: Award },
];

export function AchievementsGrid() {
    const [achievements, setAchievements] = useState(initialAchievements.map(a => ({ ...a, status: "locked", date: null as string | null })));
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        async function fetchAchievements() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_achievements')
                .select('achievement_id, unlocked_at')
                .eq('user_id', user.id);

            if (data) {
                setAchievements(prev => prev.map(ach => {
                    const unlocked = data.find(d => d.achievement_id === ach.id);
                    if (unlocked) {
                        return {
                            ...ach,
                            status: "unlocked",
                            date: new Date(unlocked.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        };
                    }
                    return ach;
                }));
            }
        }

        fetchAchievements();
    }, []);

    return (
        <div className="space-y-6">
            {/* Streak Header */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-purple-500/20">
                <GlassCard className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🔥</div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{streak} Day Streak!</h2>
                            <p className="text-sm text-muted-foreground">You're on fire. Keep journaling to maintain it.</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < streak % 7 ? 'bg-orange-500' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((badge) => (
                    <GlassCard key={badge.id} className={`p-6 flex flex-col items-center text-center relative overflow-hidden group ${badge.status === 'locked' ? 'opacity-60 grayscale' : ''
                        }`}>
                        {badge.status === 'locked' && (
                            <div className="absolute top-3 right-3 text-muted-foreground">
                                <Lock className="h-5 w-5" />
                            </div>
                        )}

                        <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${badge.name === 'Early Bird' ? 'bg-yellow-500/20 text-yellow-400' :
                            badge.name === 'Survivorship' ? 'bg-green-500/20 text-green-400' :
                                badge.name === 'Trend Rider' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                            <badge.icon className="h-8 w-8" />
                        </div>

                        <h3 className="text-foreground font-bold mb-1">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{badge.desc}</p>

                        {badge.status === 'unlocked' && (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                Unlocked on {badge.date}
                            </span>
                        )}
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
