"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, TrendingUp, Building2, DollarSign, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface NewsItem {
    id: string;
    source: string;
    title: string;
    summary?: string;
    published_at: string;
    category: string;
    symbols?: string[];
    sentiment?: string;
    news_url?: string;
}

const categoryIcons: Record<string, any> = {
    stock: TrendingUp,
    dividend: DollarSign,
    corporate: Building2,
    economy: TrendingUp,
    special_events: Calendar,
};

const categoryColors: Record<string, string> = {
    stock: 'sky',
    dividend: 'green',
    corporate: 'purple',
    economy: 'orange',
    special_events: 'red',
};

export function RecentNews() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('market_news')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(6);

            if (data) {
                setNewsItems(data as NewsItem[]);
            }
            setLoading(false);
        };

        fetchNews();

        // Realtime subscription for new news
        const channel = supabase
            .channel('news_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'market_news',
                },
                (payload) => {
                    setNewsItems((current) => [payload.new as NewsItem, ...current].slice(0, 6));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Market News</h2>
                <div className="text-muted-foreground text-sm">Loading news...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Market News</h2>
                <Link
                    href="/dashboard/news"
                    className="text-sm text-sky-400 hover:text-sky-300 flex items-center transition-all duration-150"
                >
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </div>

            {newsItems.length === 0 ? (
                <GlassCard>
                    <div className="text-center text-muted-foreground text-sm py-8">
                        No market news available yet. Run the news aggregator script to populate news.
                    </div>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsItems.map((item) => {
                        const Icon = categoryIcons[item.category] || TrendingUp;
                        const color = categoryColors[item.category] || 'sky';

                        const CardContent = (
                            <GlassCard
                                className="hover:bg-card/30 transition-all cursor-pointer group h-full active:scale-95"
                                variant="frosted"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`text-xs font-medium text-${color}-400 bg-${color}-500/10 px-2 py-1 rounded-full border border-${color}-500/20 inline-flex items-center gap-1`}>
                                            <Icon className="h-3 w-3" />
                                            {item.category.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(item.published_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            {item.news_url && (
                                                <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-sky-400 transition-all duration-150" />
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-medium text-white leading-relaxed line-clamp-2 group-hover:text-sky-300 transition-all duration-150">
                                        {item.title}
                                    </h3>

                                    {item.summary && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.summary}
                                        </p>
                                    )}

                                    {item.symbols && item.symbols.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.symbols.slice(0, 3).map((symbol) => (
                                                <span
                                                    key={symbol}
                                                    className="text-[10px] font-medium text-foreground/80 bg-card/20 px-1.5 py-0.5 rounded border border-border"
                                                >
                                                    {symbol}
                                                </span>
                                            ))}
                                            {item.symbols.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    +{item.symbols.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {item.sentiment && (
                                        <div className={`h-1 w-full rounded-full ${item.sentiment === 'positive' ? 'bg-green-500/50' :
                                            item.sentiment === 'negative' ? 'bg-red-500/50' :
                                                'bg-slate-500/50'
                                            }`} />
                                    )}
                                </div>
                            </GlassCard>
                        );

                        // If news_url exists, make it clickable
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

                        // Otherwise, just render the card
                        return <div key={item.id}>{CardContent}</div>;
                    })}
                </div>
            )}
        </div>
    );
}
