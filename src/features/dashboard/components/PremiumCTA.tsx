"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Sparkles, Users, ArrowRight, Copy, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function PremiumCTA() {
    const [copied, setCopied] = useState(false);
    const inviteLink = "https://rupya.io/premium/invite?ref=trader_premium";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            {/* Outer Glow Decor */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

            <GlassCard className="relative overflow-hidden border-white/5 bg-gradient-to-br from-indigo-950/80 via-slate-950/90 to-indigo-900/80 p-0 rounded-[2.5rem] shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
                    {/* Left/Top Interactive Content */}
                    <div className="lg:col-span-8 p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 w-fit">
                            <Sparkles className="h-3 w-3" /> Exclusive Access
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                            Join our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Premium Group</span>
                        </h2>

                        <p className="text-lg text-white/60 font-medium max-w-xl leading-relaxed mb-10">
                            Get real-time insights, institutional-grade trade setups, and collaborate with
                            elite traders in our exclusive community.
                        </p>

                        <div className="space-y-4">
                            <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Next-Gen Trading Community</div>
                            <div className="flex flex-wrap gap-4">
                                <GlassButton className="bg-white text-slate-950 hover:bg-indigo-50 px-8 py-6 rounded-2xl font-black text-lg transition-all active:scale-95">
                                    Join Global Community <ArrowRight className="ml-2 h-5 w-5" />
                                </GlassButton>
                                <GlassButton variant="secondary" className="px-8 py-6 rounded-2xl font-black text-lg border-white/10 hover:bg-white/5 transition-all">
                                    Explore Perks
                                </GlassButton>
                            </div>
                        </div>
                    </div>

                    {/* Right/Inner Card Visual (Nested Style from Image) */}
                    <div className="lg:col-span-4 p-4 md:p-8 bg-white/5 border-l border-white/5">
                        <div className="h-full flex flex-col justify-between space-y-8">
                            {/* Inner Visual Card */}
                            <div className="relative h-full bg-indigo-500/5 rounded-3xl border border-white/5 p-6 backdrop-blur-sm overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Users className="h-32 w-32 text-indigo-400" />
                                </div>

                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-inner">
                                        <Users className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">Alpha Collective</h3>
                                    <p className="text-xs text-white/40 leading-relaxed font-bold">
                                        Empowering traders with data-driven strategies and live collaborative sessions.
                                    </p>
                                </div>

                                <div className="space-y-4 mt-12">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Your Private Portal</span>
                                        <LinkIcon className="h-3 w-3 text-white/20" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white/50 truncate">
                                            {inviteLink}
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="h-11 w-11 flex items-center justify-center bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg active:scale-90"
                                        >
                                            <Copy className={`h-4 w-4 text-white ${copied ? "animate-bounce" : ""}`} />
                                        </button>
                                    </div>
                                    {copied && <div className="text-[10px] text-green-400 font-bold text-center">Referral ID Copied!</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Sparkle Decoration Sparking */}
            <Sparkles className="absolute -top-4 -left-4 h-12 w-12 text-indigo-400/30 blur-[1px] animate-pulse" />
            <Sparkles className="absolute -bottom-6 right-12 h-8 w-8 text-violet-400/20 blur-[2px] animate-bounce duration-5000" />
        </div>
    );
}
