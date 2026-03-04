"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    Calendar,
    DollarSign,
    TrendingUp,
    Building2,
    Newspaper,
    Clock,
    ArrowRight,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

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
    image_url?: string;
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
            supabase.from('market_news').select('*').order('published_at', { ascending: false }).limit(20),
            supabase.from('market_events').select('*').order('event_date', { ascending: true }).limit(10)
        ]);

        if (newsResult.data) {
            // Assign some local assets to the top news items for the "Wow" factor
            const enrichedNews = newsResult.data.map((item, index) => ({
                ...item,
                image_url: index === 0 ? "/assets/news_renewable.png" :
                    index === 1 ? "/assets/news_tech.png" :
                        index === 2 ? "/assets/news_health.png" :
                            `https://images.unsplash.com/photo-1611974717482-4521360bb073?q=80&w=800&auto=format&fit=crop&v=${index}`
            }));
            setNews(enrichedNews);
        }
        if (eventsResult.data) setEvents(eventsResult.data);

        setLoading(false);
    };

    const filteredNews = news.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'news') return n.category === 'stock' || n.category === 'economy';
        if (activeTab === 'dividends') return n.category === 'dividend';
        if (activeTab === 'corporate') return n.category === 'corporate';
        return true;
    });

    const categories = [
        { id: 'all', label: 'All Updates' },
        { id: 'news', label: 'Market News' },
        { id: 'dividends', label: 'Dividends' },
        { id: 'corporate', label: 'Corporate Actions' },
        { id: 'earnings', label: 'Earnings' },
        { id: 'events', label: 'Events' },
    ];

    const featuredNews = filteredNews[0];
    const sideNews = filteredNews.slice(1, 4);
    const regularNews = filteredNews.slice(4);

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Header */}
            <header className="mb-12 text-center pt-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                    Our Insightful <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent border-b-4 border-sky-500/30">Blog</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    Stay ahead of the curve with our expert analysis, market insights, and real-time updates on the global economy and corporate landscapes.
                </motion.p>
            </header>

            {/* Featured Section */}
            {activeTab === 'all' && featuredNews && (
                <section className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Large Featured Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-2 group"
                        >
                            <a href={featuredNews.news_url} target="_blank" rel="noopener noreferrer">
                                <GlassCard className="p-0 overflow-hidden border-border/50 hover:border-sky-500/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-sky-500/10 h-full">
                                    <div className="relative h-96 w-full overflow-hidden">
                                        <img
                                            src={featuredNews.image_url}
                                            alt={featuredNews.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                                        <div className="absolute bottom-0 left-0 p-8 w-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold uppercase tracking-wider">
                                                    Featured
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-white/80">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(featuredNews.published_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-sky-400 transition-colors">
                                                {featuredNews.title}
                                            </h2>
                                            <p className="text-white/70 line-clamp-2 mb-6 text-sm">
                                                {featuredNews.summary || featuredNews.content}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </a>
                        </motion.div>

                        {/* Side List */}
                        <div className="flex flex-col gap-6">
                            {sideNews.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * (idx + 1) }}
                                >
                                    <a href={item.news_url} target="_blank" rel="noopener noreferrer" className="block group">
                                        <div className="flex gap-4">
                                            <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-border/50">
                                                <img
                                                    src={item.image_url}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-sky-500 transition-colors leading-snug">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.published_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Read More <ArrowRight className="h-3 w-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Explore Section */}
            <section className="mb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                            Explore Our Latest <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent border-b-2 border-sky-500/20">Articles</span>
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-lg">
                            Dive deep into specific sectors and themes with our curated selection of market intelligence.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id as TabType)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                    ${activeTab === cat.id
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                        : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="h-56 bg-card/50 rounded-2xl" />
                                <div className="h-4 bg-card/50 rounded w-3/4" />
                                <div className="h-3 bg-card/50 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(activeTab === 'all' ? regularNews : filteredNews).map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                className="group"
                            >
                                <a href={item.news_url} target="_blank" rel="noopener noreferrer">
                                    <GlassCard className="p-0 overflow-hidden border-border/50 hover:border-sky-500/30 transition-all duration-300 h-full flex flex-col">
                                        <div className="relative h-56 w-full overflow-hidden">
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-sky-500 text-[10px] font-bold uppercase tracking-wider border border-sky-500/20">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.published_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 leading-snug group-hover:text-sky-500 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                                                {item.summary || item.content}
                                            </p>
                                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center gap-2 transition-colors">
                                                    Read More <ArrowRight className="h-3 w-3" />
                                                </span>
                                                {item.sentiment && (
                                                    <div className={`h-1.5 w-8 rounded-full ${item.sentiment === 'positive' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' :
                                                        item.sentiment === 'negative' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-slate-500/20'
                                                        }`} />
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </a>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <button className="px-8 py-3 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-all active:scale-95 shadow-xl shadow-foreground/10">
                        View all articles
                    </button>
                </div>
            </section>

            {/* Premium Footer */}
            <footer className="mt-24 pt-20 pb-12 border-t border-border/40 bg-card/10">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-foreground">Contact Information</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 group">
                                    <MapPin className="h-5 w-5 text-sky-500 shrink-0" />
                                    <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                        JL. Raya Kuta No. 121, Badung - Bali,<br />Indonesia
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <Phone className="h-5 w-5 text-sky-500 shrink-0" />
                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">(+62)-822-4545-2882</span>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                        <div key={i} className="p-2 rounded-lg bg-card border border-border group cursor-pointer hover:bg-sky-500 transition-all duration-300">
                                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-foreground">Quick Links</h4>
                            <ul className="space-y-3">
                                {['About', 'Services', 'Contact', 'Team'].map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-muted-foreground hover:text-sky-500 transition-colors flex items-center gap-2 group">
                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-foreground">Our Services</h4>
                            <ul className="space-y-3">
                                {['UI/UX Design', 'Mobile App Dev', 'Web Dev', 'Cloud Services'].map(service => (
                                    <li key={service}>
                                        <a href="#" className="text-sm text-muted-foreground hover:text-sky-500 transition-colors flex items-center gap-2 group">
                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                                            {service}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-foreground">Get Latest Update</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Lorem ipsum dolor sit amet elit tel, lusinol lucusa nec u lamcorper mattis pulvin lan.
                            </p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Enter Your Email"
                                    className="w-full bg-card border border-border rounded-lg py-3 pl-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all"
                                />
                                <button className="absolute right-1 top-1 bottom-1 px-4 bg-sky-500 text-white text-xs font-bold rounded-md hover:bg-sky-600 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                            © 2026 Rupya Fintech. All rights reserved. Professional Trading Intelligence.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
