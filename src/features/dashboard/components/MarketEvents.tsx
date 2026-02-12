"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, DollarSign, TrendingUp, Building2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MarketEvent {
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    symbols: string[];
    days_until: number;
}

const eventIcons: Record<string, any> = {
    earnings: TrendingUp,
    dividend: DollarSign,
    split: Trophy,
    bonus: Trophy,
    rights: Building2,
    ipo: Building2,
    holiday: Calendar,
    fno_expiry: Calendar,
};

const eventColors: Record<string, string> = {
    earnings: 'purple',
    dividend: 'green',
    split: 'orange',
    bonus: 'orange',
    rights: 'blue',
    ipo: 'sky',
    holiday: 'red',
    fno_expiry: 'yellow',
};

export function MarketEvents() {
    const [events, setEvents] = useState<MarketEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase
                .rpc('get_upcoming_events', { days_ahead: 7 })
                .limit(5);

            if (data) {
                setEvents(data as MarketEvent[]);
            }
            setLoading(false);
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <GlassCard className="lg:col-span-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-400" />
                        <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                    </div>
                    <div className="text-muted-foreground text-sm">Loading events...</div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="lg:col-span-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-400" />
                    <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                    <span className="text-xs text-muted-foreground">(Next 7 Days)</span>
                </div>

                {events.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-6">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No upcoming events in the next 7 days.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {events.map((event) => {
                            const Icon = eventIcons[event.event_type] || Calendar;
                            const color = eventColors[event.event_type] || 'sky';

                            return (
                                <div
                                    key={event.id}
                                    className="p-3 rounded-xl bg-card/20 border border-border hover:bg-card/30 transition-all active:scale-95"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-xl bg-${color}-500/10`}>
                                            <Icon className={`h-4 w-4 text-${color}-400`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground line-clamp-1">
                                                {event.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {event.event_type.replace('_', ' ').toUpperCase()}
                                            </div>
                                            {event.symbols && event.symbols.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {event.symbols.slice(0, 2).map((symbol) => (
                                                        <span
                                                            key={symbol}
                                                            className="text-[10px] font-medium text-foreground/80 bg-card/20 px-1.5 py-0.5 rounded border border-border"
                                                        >
                                                            {symbol}
                                                        </span>
                                                    ))}
                                                    {event.symbols.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            +{event.symbols.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {event.days_until === 0 ? (
                                                    <span className="text-orange-400 font-medium">Today</span>
                                                ) : event.days_until === 1 ? (
                                                    <span className="text-sky-400 font-medium">Tomorrow</span>
                                                ) : (
                                                    `In ${event.days_until} days`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
