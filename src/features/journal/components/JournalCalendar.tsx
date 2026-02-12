"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface JournalCalendarProps {
    trades: any[];
}

export function JournalCalendar({ trades }: JournalCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Process trades into a date map
    const dailyPnl: Record<string, { pnl: number, trades: number }> = {};

    trades.forEach(trade => {
        const date = new Date(trade.entry_date);
        // Normalize date key to YYYY-MM-DD
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!dailyPnl[key]) dailyPnl[key] = { pnl: 0, trades: 0 };
        dailyPnl[key].pnl += (trade.pnl || 0);
        dailyPnl[key].trades += 1;
    });

    const renderCalendarCells = () => {
        const cells = [];

        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-24 bg-transparent" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
            const data = dailyPnl[key];

            cells.push(
                <div
                    key={day}
                    className={`h-24 border border-white/5 p-2 relative group hover:bg-white/5 transition-all duration-150 ${data ? (data.pnl >= 0 ? 'bg-green-500/5' : 'bg-red-500/5') : ''
                        }`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${data ? 'text-foreground' : 'text-slate-600'}`}>{day}</span>
                        {data && (
                            <span className="text-[10px] bg-secondary text-muted-foreground px-1 rounded">
                                {data.trades}
                            </span>
                        )}
                    </div>

                    {data && (
                        <div className="absolute bottom-2 right-2 text-right">
                            <div className={`text-sm font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {data.pnl >= 0 ? '+' : '-'}₹{Math.abs(data.pnl).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return cells;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    return (
        <GlassCard className="p-8 border-white/5 bg-card/30">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Calendar View</h3>
                <div className="flex items-center gap-6">
                    <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all duration-300 active:scale-90 border border-white/5">
                        <ChevronLeft className="h-5 w-5 text-white/40 group-hover:text-white" />
                    </button>
                    <span className="text-sm font-black text-white w-40 text-center uppercase tracking-widest">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all duration-300 active:scale-90 border border-white/5">
                        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-4 text-center text-[10px] font-black text-white/30 bg-slate-950 uppercase tracking-[0.2em] border-b border-white/5">
                        {day}
                    </div>
                ))}
                {renderCalendarCells()}
            </div>
        </GlassCard>
    );
}
