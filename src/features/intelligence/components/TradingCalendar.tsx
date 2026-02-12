"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function TradingCalendar() {
    const [tradingData, setTradingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchMonthlyData();

        const channel = supabase
            .channel('calendar_trades')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'journal_trades'
                },
                () => {
                    fetchMonthlyData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentMonth]);

    const fetchMonthlyData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

            const { data } = await supabase
                .from('journal_trades')
                .select('entry_date, pnl')
                .eq('user_id', user.id)
                .gte('entry_date', startOfMonth)
                .lte('entry_date', endOfMonth);

            if (data) {
                // Group by day
                const grouped: { [key: number]: { pnl: number, trades: number } } = {};
                data.forEach(t => {
                    const day = new Date(t.entry_date).getDate();
                    if (!grouped[day]) grouped[day] = { pnl: 0, trades: 0 };
                    grouped[day].pnl += t.pnl || 0;
                    grouped[day].trades += 1;
                });

                const mapped = Object.keys(grouped).map(day => ({
                    day: parseInt(day),
                    pnl: grouped[parseInt(day)].pnl,
                    trades: grouped[parseInt(day)].trades
                }));
                setTradingData(mapped);
            }
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0-6 (Sun-Sat)
    const adjustedStartDay = (startDay + 6) % 7; // Adjust to Mon starting

    const getDayData = (day: number) => tradingData.find(d => d.day === day);

    const totalPnl = tradingData.reduce((acc, curr) => acc + curr.pnl, 0);
    const winDays = tradingData.filter(d => d.pnl > 0).length;
    const lossDays = tradingData.filter(d => d.pnl < 0).length;

    if (loading && tradingData.length === 0) return <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Performance Calendar</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-foreground">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                            className="p-1 hover:bg-card/30 rounded text-muted-foreground hover:text-foreground active:scale-95"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                            className="p-1 hover:bg-card/30 rounded text-muted-foreground hover:text-foreground active:scale-95"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-card/20 border border-border/50 rounded-xl overflow-hidden">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground bg-card/50">
                        {day}
                    </div>
                ))}

                {Array.from({ length: adjustedStartDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-card/30 min-h-[80px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const data = getDayData(day);
                    const isWeekend = (adjustedStartDay + i) % 7 === 5 || (adjustedStartDay + i) % 7 === 6;

                    return (
                        <div
                            key={day}
                            className={`min-h-[80px] p-2 relative group hover:bg-card/20 transition-all duration-150 ${isWeekend ? 'bg-card/30' : 'bg-card/50'
                                }`}
                        >
                            <span className={`text-xs ${data ? 'text-foreground/80' : 'text-slate-600'}`}>{day}</span>

                            {data && (
                                <div className="mt-2 text-center">
                                    <div className={`text-xs font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {data.pnl >= 0 ? '+' : ''}{Math.abs(data.pnl) >= 1000 ? (data.pnl / 1000).toFixed(1) + 'k' : data.pnl}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        {data.trades} Trades
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-6 p-4 bg-card/20 rounded-xl border border-border/50">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
                    <div className={`text-xl font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {totalPnl >= 0 ? '+' : ''}₹{(totalPnl / 1000).toFixed(1)}k
                    </div>
                </div>
                <div className="h-8 w-px bg-card/30" />
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Win Days</div>
                    <div className="text-xl font-bold text-sky-400">{winDays}</div>
                </div>
                <div className="h-8 w-px bg-card/30" />
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Loss Days</div>
                    <div className="text-xl font-bold text-red-400">{lossDays}</div>
                </div>
            </div>
        </GlassCard>
    );
}
