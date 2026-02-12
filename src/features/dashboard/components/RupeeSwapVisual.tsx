"use client";

import { Repeat } from "lucide-react";

export function RupeeSwapVisual() {
    const coinSrc = "/assets/rupee_coin.png";

    return (
        <div className="relative flex items-center justify-center gap-4 py-8">
            {/* Left Coin */}
            <div className="relative group animate-float-slow">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl group-hover:opacity-100 opacity-60 transition-opacity" />
                <img
                    src={coinSrc}
                    alt="Rupee Coin"
                    className="h-64 w-64 md:h-[28rem] md:w-[28rem] object-contain relative z-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700"
                />
            </div>

            {/* Right Coin - Overlapping slightly */}
            <div className="relative group animate-float-fast -ml-16 md:-ml-32">
                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl group-hover:opacity-100 opacity-60 transition-opacity" />
                <img
                    src={coinSrc}
                    alt="Rupee Coin"
                    className="h-64 w-64 md:h-[28rem] md:w-[28rem] object-contain relative z-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-2xl"
                />
            </div>

            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(-12deg); }
                    50% { transform: translateY(-10px) rotate(-8deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0) rotate(12deg); }
                    50% { transform: translateY(-15px) rotate(15deg); }
                }
                .animate-float-slow {
                    animation: float-slow 4s ease-in-out infinite;
                }
                .animate-float-fast {
                    animation: float-fast 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
