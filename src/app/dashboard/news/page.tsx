"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, DollarSign, TrendingUp, Building2, Award, Newspaper, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NewsItem {
    id: string;
    source: string;
    title: string;
    summary?: string;
    content?: string;
    published_at?: string;
    category: string;
    symbols?: string[];
    sentiment?: string;
    news_url?: string;
}

interface MarketEvent {
    id: string;
    title: string;
    description?: string;
    event_type: string;
    event_date: string;
    symbols?: string[];
}

type TabType = 'all' | 'news' | 'dividends' | 'corporate' | 'earnings' | 'events';

export default function MarketNewsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [events, setEvents] = useState<MarketEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Realtime subscriptions
        const newsChannel = supabase
            .channel('news_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_news' }, () => {
                fetchData();
            })
            .subscribe();

        const eventsChannel = supabase
            .channel('events_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_events' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(newsChannel);
            supabase.removeChannel(eventsChannel);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);

        const [newsResult, eventsResult] = await Promise.all([
            supabase.from('market_news').select('*').order('published_at', { ascending: false }).limit(50),
            supabase.from('market_events').select('*').order('event_date', { ascending: true }).limit(50)
        ]);

        if (newsResult.data) setNews(newsResult.data);
        if (eventsResult.data) setEvents(eventsResult.data);

        setLoading(false);
    };

    const filteredNews = () => {
        switch (activeTab) {
            case 'all':
                return news;
            case 'news':
                return news.filter(n => n.category === 'stock' || n.category === 'economy');
            case 'dividends':
                return news.filter(n => n.category === 'dividend');
            case 'corporate':
                return news.filter(n => n.category === 'corporate');
            default:
                return news;
        }
    };

    const filteredEvents = () => {
        if (activeTab === 'all' || activeTab === 'events') return events;
        if (activeTab === 'earnings') return events.filter(e => e.event_type === 'earnings');
        if (activeTab === 'dividends') return events.filter(e => e.event_type === 'dividend');
        return [];
    };

    const tabs = [
        { id: 'all' as TabType, label: 'All Updates', icon: Newspaper },
        { id: 'news' as TabType, label: 'Market News', icon: Newspaper },
        { id: 'dividends' as TabType, label: 'Dividends', icon: DollarSign },
        { id: 'corporate' as TabType, label: 'Corporate Actions', icon: Building2 },
        { id: 'earnings' as TabType, label: 'Earnings', icon: TrendingUp },
        { id: 'events' as TabType, label: 'Market Events', icon: Calendar },
    ];

    const categoryColors: Record<string, string> = {
        stock: 'sky',
        dividend: 'green',
        corporate: 'purple',
        economy: 'orange',
        earnings: 'sky',
        fno_expiry: 'red',
        holiday: 'yellow',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Market News & Events</h1>
                <p className="text-muted-foreground">Latest updates on stocks, dividends, corporate actions, and earnings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="bg-sky-500/10 border-sky-500/20">
                    <div className="flex items-center gap-3">
                        <Newspaper className="h-8 w-8 text-sky-400" />
                        <div>
                            <div className="text-2xl font-bold text-foreground">{news.length}</div>
                            <div className="text-xs text-muted-foreground">News Items</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-green-500/10 border-green-500/20">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-400" />
                        <div>
                            <div className="text-2xl font-bold text-foreground">
                                {news.filter(n => n.category === 'dividend').length}
                            </div>
                            <div className="text-xs text-muted-foreground">Dividends</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-purple-400" />
                        <div>
                            <div className="text-2xl font-bold text-foreground">
                                {news.filter(n => n.category === 'corporate').length}
                            </div>
                            <div className="text-xs text-muted-foreground">Corporate Actions</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-orange-500/10 border-orange-500/20">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-orange-400" />
                        <div>
                            <div className="text-2xl font-bold text-foreground">{events.length}</div>
                            <div className="text-xs text-muted-foreground">Upcoming Events</div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
                            ${activeTab === id
                                ? 'bg-sky-500 text-white shadow-strong shadow-sky-500/50'
                                : 'bg-card/20 text-muted-foreground hover:bg-card/30'
                            }`}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : (
                    <>
                        {/* News Section */}
                        {(activeTab === 'all' || activeTab === 'news' || activeTab === 'dividends' || activeTab === 'corporate') && (
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Newspaper className="h-5 w-5 text-sky-400" />
                                    News Updates
                                </h2>
                                {filteredNews().length === 0 ? (
                                    <GlassCard>
                                        <div className="text-center py-8 text-muted-foreground">
                                            No news items found for this category
                                        </div>
                                    </GlassCard>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredNews().map((item) => {
                                            const color = categoryColors[item.category] || 'sky';

                                            const CardContent = (
                                                <GlassCard className="hover:bg-card/30 transition-all cursor-pointer group h-full active:scale-95">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className={`text-xs font-medium text-${color}-400 bg-${color}-500/10 px-2 py-1 rounded-full border border-${color}-500/20`}>
                                                                {item.category.toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(item.published_at || '').toLocaleDateString('en-IN', {
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-sm font-medium text-white leading-relaxed line-clamp-2 group-hover:text-sky-300 transition-all duration-150">
                                                            {item.title}
                                                        </h3>

                                                        {item.summary && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                                                        )}

                                                        {item.symbols && item.symbols.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.symbols.slice(0, 4).map((symbol) => (
                                                                    <span
                                                                        key={symbol}
                                                                        className="text-[10px] font-medium text-foreground/80 bg-card/20 px-1.5 py-0.5 rounded border border-border"
                                                                    >
                                                                        {symbol}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {item.sentiment && (
                                                            <div className={`h-1 w-full rounded-full ${item.sentiment === 'positive' ? 'bg-green-500/50' :
                                                                    item.sentiment === 'negative' ? 'bg-red-500/50' : 'bg-slate-500/50'
                                                                }`} />
                                                        )}
                                                    </div>
                                                </GlassCard>
                                            );

                                            if (item.news_url) {
                                                return (
                                                    <a
                                                        key={item.id}
                                                        href={item.news_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block h-full"
                                                    >
                                                        {CardContent}
                                                    </a>
                                                );
                                            }

                                            return <div key={item.id}>{CardContent}</div>;
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Events Section */}
                        {(activeTab === 'all' || activeTab === 'earnings' || activeTab === 'events') && filteredEvents().length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-orange-400" />
                                    Upcoming Events
                                </h2>
                                <div className="space-y-3">
                                    {filteredEvents().map((event) => {
                                        const color = categoryColors[event.event_type] || 'orange';

                                        return (
                                            <GlassCard key={event.id} className="hover:bg-card/30 transition-all active:scale-95">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                                                        <Calendar className={`h-5 w-5 text-${color}-400`} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                                                                {event.event_type.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(event.event_date).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-foreground font-medium mb-1">{event.title}</h3>

                                                        {event.description && (
                                                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                                        )}

                                                        {event.symbols && event.symbols.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {event.symbols.map((symbol) => (
                                                                    <span
                                                                        key={symbol}
                                                                        className="text-xs font-medium px-2 py-1 rounded bg-card/20 text-foreground/80 border border-border"
                                                                    >
                                                                        {symbol}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
