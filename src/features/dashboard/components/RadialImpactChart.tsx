"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

interface ImpactMetric {
    value: string;
    label: string;
    description: string;
    source: string;
}

export function RadialImpactChart() {
    const metrics: ImpactMetric[] = [
        {
            value: "14.2",
            label: "Liquidity Surge",
            description: "Percentage points by which institutional order flow increased during the last fiscal quarter.",
            source: "Source: NSE Institutional Data & RBI Reports"
        },
        {
            value: "22-35%",
            label: "Retail Migration",
            description: "Percentage of active traders who shifted from traditional equity to F&O hedging strategies.",
            source: "Source: Rupya Internal Analytics (India/UK)"
        },
        {
            value: "8-12%",
            label: "Risk Aversion",
            description: "Percentage of portfolio managers who declared intent to avoid high-beta sectors in H2 2026.",
            source: "Source: Statista Global Financial Survey"
        },
        {
            value: "62%",
            label: "Settlement Efficiency",
            description: "Percentage of institutional clients who reported zero latency in T+1 settlement cycles.",
            source: "Source: SEBI Transaction Audit"
        }
    ];

    return (
        <GlassCard className="p-16 border-white/5 bg-[#0047ff] overflow-hidden relative group min-h-[600px] flex flex-col justify-end">
            {/* Background Glows to match the Royal Blue aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0038cc] to-[#0047ff] z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 w-full items-end">
                {/* Left Side: Text and Metrics Grid */}
                <div className="space-y-16">
                    <div className="space-y-4">
                        <h3 className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">Market Environment</h3>
                        <h2 className="text-5xl font-black text-white tracking-tighter leading-tight max-w-md">
                            The impact of dynamic <br /> liquidity shifts
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                        {metrics.map((metric, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="space-y-4 border-l border-white/20 pl-6 border-b border-white/5 pb-8 lg:border-b-0 lg:pb-0"
                            >
                                <div className="text-4xl font-black text-white tracking-tighter">
                                    {metric.value}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{metric.label}</div>
                                    <p className="text-[10px] font-bold text-white/40 leading-relaxed">
                                        {metric.description}
                                    </p>
                                </div>
                                <div className="text-[8px] font-bold text-white/20 uppercase">
                                    {metric.source}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Concentric Arcs (Conveying Impact) */}
                <div className="relative flex items-center justify-center h-full">
                    <svg viewBox="0 0 400 400" className="w-full max-w-[500px] transform translate-x-12 translate-y-12 overflow-visible">
                        {/* Outermost Arc */}
                        <motion.circle
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="2"
                            strokeDasharray="400 800"
                            strokeLinecap="round"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 270, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        />
                        <motion.circle
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="rgba(0,255,255,0.4)"
                            strokeWidth="3"
                            strokeDasharray="100 1000"
                            strokeLinecap="round"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Middle Arc */}
                        <motion.circle
                            cx="200"
                            cy="200"
                            r="140"
                            fill="none"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="3"
                            strokeDasharray="300 900"
                            strokeLinecap="round"
                            initial={{ rotate: -120, opacity: 0 }}
                            animate={{ rotate: 240, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        />

                        {/* Innermost Arc */}
                        <motion.circle
                            cx="200"
                            cy="200"
                            r="100"
                            fill="none"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="4"
                            strokeDasharray="200 800"
                            strokeLinecap="round"
                            initial={{ rotate: -60, opacity: 0 }}
                            animate={{ rotate: 300, opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                        />

                        {/* Pulse Dot */}
                        <motion.circle
                            cx="200"
                            cy="200"
                            r="6"
                            fill="white"
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <circle cx="200" cy="200" r="12" fill="none" stroke="white" strokeWidth="1" className="opacity-20" />
                    </svg>
                </div>
            </div>

            {/* Corner Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </GlassCard>
    );
}
