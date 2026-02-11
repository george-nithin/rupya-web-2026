"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Bot,
    Search,
    BookOpen,
    Briefcase,
    BarChart3,
    Zap,
    PieChart,
    Settings,
    LogOut,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    LineChart,
    Layers,
    Target,
    Calendar
} from "lucide-react";
import { useState, useEffect } from "react";

const navigationGroups = [
    {
        title: "MAIN MENU",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Watchlist", href: "/dashboard/watchlist", icon: Search },
            { name: "Journal", href: "/dashboard/journal", icon: BookOpen },
            { name: "Planning", href: "/planning", icon: Target },
            { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
            { name: "Market News", href: "/dashboard/news", icon: Calendar },
        ]
    },
    {
        title: "ANALYSIS",
        items: [
            { name: "Research", href: "/dashboard/research", icon: BarChart3 },
            { name: "Screener", href: "/dashboard/screener", icon: Search },
            { name: "F&O Dashboard", href: "/dashboard/fno", icon: Zap },
            { name: "Sectors", href: "/dashboard/sectors", icon: PieChart },
            { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
            { name: "Benchmarks", href: "/dashboard/analytics/benchmarks", icon: TrendingUp },
        ]
    },
    {
        title: "STRATEGY",
        items: [
            { name: "Algo Trading", href: "/dashboard/algo-trading", icon: Bot },
            { name: "Backtesting", href: "/dashboard/backtesting", icon: BarChart3 },
            { name: "Strategies", href: "/dashboard/strategies", icon: Layers },
            { name: "Rules & Risk", href: "/dashboard/rules", icon: ShieldCheck },
            { name: "Options Chain", href: "/dashboard/options", icon: Target },
            { name: "Funnel", href: "/dashboard/workflow/funnel", icon: Zap },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "hidden md:flex fixed left-0 top-0 z-50 h-screen flex-col border-r border-border/40 bg-card text-muted-foreground font-sans transition-all duration-300",
                isHovered ? "w-64" : "w-20"
            )}>
            {/* Logo Section */}
            <div className="flex h-20 items-center justify-center px-4 border-b border-border/40">
                <Link href="/dashboard" className={cn(
                    "flex items-center gap-3 group hover:opacity-90 transition-opacity",
                    !isHovered && "w-full justify-center"
                )}>
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20 hover-glow-orange">
                        <img
                            src="/rupya-logo-circle.png"
                            alt="Rupya"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {isHovered && (
                        <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent whitespace-nowrap">Rupya</span>
                    )}
                </Link>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
                {navigationGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        {isHovered && (
                            <h3 className="mb-2 px-6 text-xs font-semibold tracking-wider text-muted-foreground/60 whitespace-nowrap">
                                {group.title}
                            </h3>
                        )}
                        <nav className="flex flex-col gap-1 px-3">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                // Special case for dashboard: only match exact path
                                const isActive = item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname === item.href || pathname?.startsWith(item.href + "/");

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                                            isActive
                                                ? "text-white bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-l-2 border-orange-500"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                                            !isHovered && "justify-center px-2"
                                        )}
                                        title={!isHovered ? item.name : undefined}
                                    >
                                        <Icon className={cn(
                                            "h-5 w-5 transition-colors flex-shrink-0",
                                            isActive ? "text-orange-400" : "text-muted-foreground group-hover:text-foreground"
                                        )} />
                                        {isHovered && <span className="whitespace-nowrap">{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col gap-1 border-t border-border/40 p-3">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-all",
                        pathname === '/dashboard/settings' && "text-foreground bg-secondary",
                        !isHovered && "justify-center px-2"
                    )}
                    title={!isHovered ? "Settings" : undefined}
                >
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    {isHovered && <span className="whitespace-nowrap">Settings</span>}
                </Link>
                <button
                    onClick={async () => {
                        const { supabase } = await import('@/lib/supabase');
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all",
                        !isHovered && "justify-center px-2"
                    )}
                    title={!isHovered ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    {isHovered && <span className="whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
