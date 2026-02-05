"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock Data for Jan 2024
const tradingData = [
    { day: 1, pnl: 2500, trades: 3 },
    { day: 2, pnl: -1200, trades: 2 },
    { day: 3, pnl: 5800, trades: 5 },
    { day: 4, pnl: 0, trades: 0 },
    { day: 5, pnl: 3200, trades: 4 },
    { day: 8, pnl: -4500, trades: 6 },
    { day: 9, pnl: 1200, trades: 2 },
    { day: 10, pnl: 8900, trades: 8 },
    { day: 11, pnl: -200, trades: 1 },
    { day: 12, pnl: 4500, trades: 3 },
    { day: 15, pnl: 2100, trades: 2 },
    { day: 16, pnl: -6700, trades: 5 },
    { day: 17, pnl: 3400, trades: 3 },
    { day: 18, pnl: 1500, trades: 2 },
    { day: 19, pnl: 5600, trades: 4 },
];

export function TradingCalendar() {
    const daysInMonth = 31;
    const startDay = 1; // Monday

    const getDayData = (day: number) => tradingData.find(d => d.day === day);

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Performance Calendar</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-white">January 2024</div>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-slate-500 bg-slate-900/50">
                        {day}
                    </div>
                ))}

                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-slate-900/30 min-h-[80px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const data = getDayData(day);
                    const isWeekend = (startDay + i) % 7 === 5 || (startDay + i) % 7 === 6;

                    return (
                        <div
                            key={day}
                            className={`min-h-[80px] p-2 relative group hover:bg-white/5 transition-colors ${isWeekend ? 'bg-slate-900/30' : 'bg-slate-900/50'
                                }`}
                        >
                            <span className={`text-xs ${data ? 'text-slate-300' : 'text-slate-600'}`}>{day}</span>

                            {data && (
                                <div className="mt-2 text-center">
                                    <div className={`text-xs font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {data.pnl >= 0 ? '+' : ''}{data.pnl > 0 ? (data.pnl / 1000).toFixed(1) + 'k' : data.pnl}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1">
                                        {data.trades} Trades
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Total P&L</div>
                    <div className="text-xl font-bold text-green-400">+₹23.5k</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Win Days</div>
                    <div className="text-xl font-bold text-sky-400">12</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Loss Days</div>
                    <div className="text-xl font-bold text-red-400">4</div>
                </div>
            </div>
        </GlassCard>
    );
}
