"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Star, Trophy, Rocket, CheckCircle2 } from "lucide-react";

export function FeaturePromoGrid() {
    const promos = [
        {
            title: "December Competition",
            subtitle: "Starts On December 8th",
            description: "To enhance your trading environment, compete and win exciting rewards! December Competition will commence December 8, 2024.",
            points: ["Competition begins December 8th", "Exciting rewards for top participants"],
            buttonText: "Start New Challenge",
            icon: <Star className="h-5 w-5 text-orange-400" />,
            iconBg: "bg-orange-500/20",
            primaryColor: "text-orange-400",
            glowColor: "from-orange-500/20",
        },
        {
            title: "Win Exciting Rewards!",
            subtitle: "Join, Compete, and Win",
            description: "Get ready to join, compete, and win exciting rewards! Pack's December Competition is your chance to show off your creativity.",
            points: ["Limited-time event with exclusive prizes", "Win exciting rewards for top submissions"],
            buttonText: "Submit Entry",
            icon: <Rocket className="h-5 w-5 text-indigo-400" />,
            iconBg: "bg-indigo-500/20",
            primaryColor: "text-indigo-400",
            glowColor: "from-indigo-500/20",
        },
        {
            title: "December Winners",
            subtitle: "Celebration Time",
            description: "To enhance your trading environment, we are performing server migrations. As a result, December Competition will commence.",
            points: ["Competition begins December 8th", "Exciting rewards for top participants"],
            buttonText: "View Winner",
            icon: <Trophy className="h-5 w-5 text-yellow-400" />,
            iconBg: "bg-yellow-500/20",
            primaryColor: "text-yellow-400",
            glowColor: "from-yellow-500/20",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo, i) => (
                <GlassCard key={i} className="relative overflow-hidden border-white/5 bg-card/30 p-8 flex flex-col group h-full">
                    <div className={`absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br ${promo.glowColor} to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className={`h-12 w-12 rounded-2xl ${promo.iconBg} flex items-center justify-center border border-white/5 shadow-inner`}>
                            {promo.icon}
                        </div>
                    </div>

                    <div className="relative z-10 flex-1">
                        <h3 className="text-xl font-black text-white mb-2 leading-tight">{promo.title}</h3>
                        <p className={`text-xs font-black uppercase tracking-widest ${promo.primaryColor} mb-6`}>{promo.subtitle}</p>

                        <p className="text-sm text-white/40 font-medium mb-8 leading-relaxed">
                            {promo.description}
                        </p>

                        <div className="space-y-3 mb-10">
                            {promo.points.map((pt, idx) => (
                                <div key={idx} className="flex gap-2 items-start text-[11px] font-bold text-white/60">
                                    <CheckCircle2 className={`h-3.5 w-3.5 ${promo.primaryColor} flex-shrink-0 mt-0.5`} /> {pt}
                                </div>
                            ))}
                        </div>
                    </div>

                    <GlassButton className="w-full bg-white/5 border-white/10 hover:bg-white text-white hover:text-slate-950 py-6 rounded-2xl font-black text-sm transition-all active:scale-95 relative z-10">
                        {promo.buttonText}
                    </GlassButton>
                </GlassCard>
            ))}
        </div>
    );
}
