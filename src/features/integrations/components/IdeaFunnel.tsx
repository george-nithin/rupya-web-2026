"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowRight, Filter, ShoppingCart, CheckCircle, Search } from "lucide-react";

const funnelStages = [
    { id: 1, name: "Watchlist Idea", count: 12, icon: Search, color: "text-slate-400", bg: "bg-slate-500/10" },
    { id: 2, name: "Analysis Phase", count: 5, icon: Filter, color: "text-sky-400", bg: "bg-sky-500/10" },
    { id: 3, name: "Ready to Execute", count: 2, icon: ShoppingCart, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { id: 4, name: "Trade Taken", count: 8, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
];

const activeIdeas = [
    { symbol: "TATASTEEL", stage: "Analysis Phase", added: "2 days ago", note: "Waiting for 145 breakout" },
    { symbol: "SBIN", stage: "Ready to Execute", added: "4 hours ago", note: "Strong rejection at support" },
    { symbol: "INFY", stage: "Watchlist Idea", added: "1 week ago", note: "Earnings play" },
];

export function IdeaFunnel() {
    return (
        <div className="space-y-8">
            {/* Funnel Visual */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {funnelStages.map((stage, index) => (
                    <div key={stage.id} className="relative">
                        <GlassCard className={`p-4 flex flex-col items-center justify-center text-center h-full border-t-4 ${stage.name === 'Trade Taken' ? 'border-t-green-500' :
                                stage.name === 'Ready to Execute' ? 'border-t-yellow-500' :
                                    stage.name === 'Analysis Phase' ? 'border-t-sky-500' : 'border-t-slate-500'
                            }`}>
                            <div className={`p-3 rounded-full mb-3 ${stage.bg} ${stage.color}`}>
                                <stage.icon className="h-6 w-6" />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{stage.count}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest">{stage.name}</div>
                        </GlassCard>
                        {index < funnelStages.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-slate-600">
                                <ArrowRight className="h-6 w-6" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Active Ideas List */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-4">Active Ideas in Pipeline</h3>
                <div className="space-y-2">
                    {activeIdeas.map((idea) => (
                        <div key={idea.symbol} className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                    {idea.symbol.slice(0, 2)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{idea.symbol}</div>
                                    <div className="text-xs text-slate-400">{idea.note}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${idea.stage === 'Ready to Execute' ? 'bg-yellow-500/20 text-yellow-400' :
                                            idea.stage === 'Analysis Phase' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-500/20 text-slate-400'
                                        }`}>
                                        {idea.stage}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1">{idea.added}</div>
                                </div>
                                <GlassButton size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    Move Next
                                </GlassButton>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
