import { GlassCard } from "@/components/ui/GlassCard";
import { Info, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface MarketSentimentMeterProps {
    score?: number; // 0 to 100
}

export function MarketSentimentMeter({ score: initialScore = 64 }: MarketSentimentMeterProps) {
    const [score, setScore] = useState(initialScore);
    const [isFlash, setIsFlash] = useState(false);

    useEffect(() => {
        const calculateSentiment = async () => {
            const { data } = await supabase
                .from('market_indices')
                .select('change, percent_change');

            if (data && data.length > 0) {
                const positive = data.filter(d => (d.change || 0) >= 0).length;
                const total = data.length;
                const calculatedScore = Math.round((positive / total) * 100);
                setScore(calculatedScore);
            }
        };

        calculateSentiment();

        const channel = supabase
            .channel('sentiment_indices_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'market_indices' },
                () => {
                    calculateSentiment();
                    setIsFlash(true);
                    setTimeout(() => setIsFlash(false), 800);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getSentimentConfig = (val: number) => {
        if (val < 20) return { label: "Panic", color: "rose", glow: "rgba(244, 63, 94, 0.2)" };
        if (val < 40) return { label: "Fear", color: "orange", glow: "rgba(249, 115, 22, 0.2)" };
        if (val < 60) return { label: "Balanced", color: "sky", glow: "rgba(14, 165, 233, 0.2)" };
        if (val < 80) return { label: "Greed", color: "emerald", glow: "rgba(16, 185, 129, 0.2)" };
        return { label: "Euphoria", color: "indigo", glow: "rgba(99, 102, 241, 0.2)" };
    };

    const config = getSentimentConfig(score);
    const needleRotation = (score / 100) * 180 - 90;

    return (
        <GlassCard className={`relative overflow-hidden border-white/5 bg-[#121212]/50 backdrop-blur-3xl p-8 flex flex-col items-center justify-between h-full group transition-all duration-700 ${isFlash ? 'ring-2 ring-white/20' : ''}`}>
            {/* Dynamic Background Glow */}
            <div
                className="absolute inset-x-0 top-0 h-64 blur-[120px] pointer-events-none transition-all duration-1000 opacity-40"
                style={{ backgroundColor: config.glow }}
            />

            <div className="w-full flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_white] ${isFlash ? 'animate-ping' : ''}`} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Pulse Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">v4.0.2</span>
                    <button className="text-white/20 hover:text-white transition-colors">
                        <Info className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="relative w-full aspect-[2/1] flex items-end justify-center overflow-visible mb-10">
                {/* SVG Gauge */}
                <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                            <stop offset="25%" stopColor="#f97316" stopOpacity="0.25" />
                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.35" />
                            <stop offset="75%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Track */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Ticks */}
                    {[0, 25, 50, 75, 100].map(tick => {
                        const deg = (tick / 100) * 180 - 180;
                        const rad = (deg * Math.PI) / 180;
                        const x1 = 100 + 75 * Math.cos(rad);
                        const y1 = 100 + 75 * Math.sin(rad);
                        const x2 = 100 + 85 * Math.cos(rad);
                        const y2 = 100 + 85 * Math.sin(rad);
                        return (
                            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        );
                    })}

                    {/* Active Glow Overlay based on score */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray={`${(score / 100) * 251} 251`}
                        strokeLinecap="round"
                        className="opacity-20"
                    />

                    {/* Needle and Hub */}
                    <motion.g
                        animate={{ rotate: needleRotation }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        style={{ transformOrigin: '100px 100px' }}
                    >
                        {/* Needle Path */}
                        <path d="M 100 100 L 100 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
                        <path d="M 100 100 L 100 25" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />

                        {/* Center Hub Glass Effect */}
                        <circle cx="100" cy="100" r="8" fill="#1a1a1a" stroke="white" strokeWidth="1.5" />
                        <circle cx="100" cy="100" r="3" fill="white" />
                    </motion.g>
                </svg>

                {/* Center Label Display */}
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <motion.div
                        initial={false}
                        animate={{ scale: isFlash ? 1.05 : 1 }}
                        className={`px-6 py-2 rounded-2xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3`}
                    >
                        <Zap className={`h-3 w-3 text-${config.color}-400`} />
                        <span className="text-xl font-black text-white tracking-[0.2em] uppercase tabular-nums">{config.label}</span>
                    </motion.div>
                </div>
            </div>

            <div className="w-full relative z-10 pt-6 border-t border-white/5 mt-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Correlation</div>
                        <div className="text-xs font-bold text-white/70">Aggregate Sentiment</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Live Index</div>
                        <div className={`text-xl font-black text-white tabular-nums tracking-tighter`}>
                            {score}<span className="text-[10px] text-white/20 ml-1">pts</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-medium text-white/40 leading-relaxed text-center italic">
                    "AI-driven sentiment analysis calibrated across {supabase ? 'Nifty & Sensex' : 'Global'} index derivatives."
                </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
                <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
            </div>
        </GlassCard>
    );
}
