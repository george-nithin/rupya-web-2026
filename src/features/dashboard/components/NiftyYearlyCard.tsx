"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronRight, Zap } from "lucide-react";
import { useMemo } from "react";

export function NiftyYearlyCard() {
    // Mock Nifty monthly points for the year
    const points = [
        { month: "JAN", value: 45 },
        { month: "FEB", value: 35 },
        { month: "MAR", value: 32 },
        { month: "APR", value: 42 },
        { month: "MAY", value: 40 },
        { month: "JUN", value: 58 },
        { month: "JUL", value: 52 },
        { month: "AUG", value: 55 },
        { month: "SEP", value: 48 },
        { month: "OCT", value: 50 },
        { month: "NOV", value: 45 },
        { month: "DEC", value: 30 },
    ];

    const maxVal = Math.max(...points.map(p => p.value));
    const viewBoxH = 200;
    const viewBoxW = 800;

    const pathData = useMemo(() => {
        const step = viewBoxW / (points.length - 1);
        return points.map((p, i) => {
            const x = i * step;
            const y = viewBoxH - (p.value / maxVal) * viewBoxH * 0.8; // Use 80% height for padding
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ");
    }, [points]);

    const areaData = `${pathData} L ${viewBoxW} ${viewBoxH} L 0 ${viewBoxH} Z`;

    const highlightPoint = points[5]; // JUN as per image
    const highlightX = 5 * (viewBoxW / (points.length - 1));
    const highlightY = viewBoxH - (highlightPoint.value / maxVal) * viewBoxH * 0.8;

    return (
        <GlassCard className="relative overflow-hidden border-white/5 bg-[#0f0f0f] p-0 rounded-3xl shadow-2xl h-full flex flex-col group">
            {/* Header Content */}
            <div className="p-10 pb-0">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Hours Active</span>
                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white/40" />
                    </div>
                </div>
                <div className="text-7xl font-black text-white tracking-tighter mb-8">
                    567
                </div>
            </div>

            {/* SVG Chart Area */}
            <div className="relative flex-1 mt-4">
                {/* SVG Graph */}
                <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="w-full h-full overflow-visible preserve-3d">
                    {/* Vertical Grid Lines */}
                    {points.map((_, i) => (
                        <line
                            key={i}
                            x1={i * (viewBoxW / (points.length - 1))}
                            y1="0"
                            x2={i * (viewBoxW / (points.length - 1))}
                            y2={viewBoxH}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Fill Area with Gradient */}
                    <path d={areaData} fill="url(#orangeGradient)" opacity="0.4" />

                    {/* Shadow/Glow Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="blur-[12px] opacity-40"
                    />

                    {/* Main Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Highlight Vertical Line */}
                    <line
                        x1={highlightX}
                        y1={highlightY}
                        x2={highlightX}
                        y2={viewBoxH}
                        stroke="#f97316"
                        strokeWidth="2"
                    />

                    {/* Highlight Point */}
                    <circle
                        cx={highlightX}
                        cy={highlightY}
                        r="6"
                        fill="#f97316"
                        className="shadow-2xl"
                    />

                    <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Highlight Label Overlay */}
                <div
                    className="absolute z-20"
                    style={{
                        left: `${(highlightX / viewBoxW) * 100}%`,
                        top: `${(highlightY / viewBoxH) * 100}%`,
                        transform: 'translate(10px, -25px)'
                    }}
                >
                    <div className="text-xl font-black text-white tabular-nums drop-shadow-lg">
                        58 h
                    </div>
                </div>
            </div>

            {/* Bottom Month Labels - Vertical */}
            <div className="flex justify-between px-6 pt-10 pb-8 relative z-10 bg-gradient-to-t from-black/40 to-transparent">
                {points.map((p, i) => (
                    <div
                        key={i}
                        className={`text-[9px] font-black tracking-widest flex items-center transition-colors ${p.month === "JUN" ? "text-white" : "text-white/20"
                            }`}
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        {p.month}
                    </div>
                ))}
            </div>

            {/* Bottom Orange Banner */}
            <div className="bg-[#f97316] py-3 overflow-hidden flex items-center whitespace-nowrap">
                <div className="flex animate-marquee gap-8">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center gap-8">
                            <span className="text-xs font-black text-slate-950 uppercase tracking-tighter">RUPYA YEAR IN TRADING 2025</span>
                            <span className="text-xs font-black text-slate-950 uppercase tracking-tighter">●</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Tag */}
            <div className="flex justify-center py-6">
                <span className="text-sm font-bold text-white/80 lowercase tracking-widest">
                    top <span className="text-white">0.6%</span> on rupya
                </span>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    display: flex;
                }
            `}</style>
        </GlassCard>
    );
}

// Add animation to globals.css or component-specific style block
const marqueeStyles = `
@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
.animate-marquee {
    animation: marquee 20s linear infinite;
    display: flex;
}
`;
