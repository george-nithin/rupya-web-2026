"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
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
    Target
} from "lucide-react";
import { useState, useEffect } from "react";

const navigationGroups = [
    {
        title: "MAIN MENU",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Watchlist", href: "/dashboard/watchlist", icon: Search },
            { name: "Journal", href: "/dashboard/journal", icon: BookOpen },
            { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
        ]
    },
    {
        title: "ANALYSIS",
        items: [
            { name: "Research", href: "/dashboard/research", icon: BarChart3 },
            { name: "Sectors", href: "/dashboard/research/sectors", icon: PieChart },
            { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
            { name: "Benchmarks", href: "/dashboard/analytics/benchmarks", icon: TrendingUp },
        ]
    },
    {
        title: "STRATEGY",
        items: [
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

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0b1221] text-slate-400 font-sans">
            {/* Logo Section */}
            <div className="flex h-20 items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                        <span className="text-lg font-bold text-white">R</span>
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Rupya</span>
                </div>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
                {navigationGroups.map((group, groupIndex) => (
                    <div key={group.title} className="space-y-2">
                        <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                                            isActive
                                                ? "text-white"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        )}
                                    >
                                        {/* Active State Background & Glow */}
                                        {isActive && (
                                            <>
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent" />
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                            </>
                                        )}

                                        <div className="relative flex items-center gap-3 z-10">
                                            <item.icon
                                                className={cn(
                                                    "h-5 w-5 transition-colors duration-200",
                                                    isActive ? "text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]" : "text-slate-500 group-hover:text-slate-300"
                                                )}
                                            />
                                            <span className={cn(
                                                "transition-colors duration-200",
                                                isActive && "drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]"
                                            )}>
                                                {item.name}
                                            </span>
                                        </div>

                                        {/* Hover arrow or Active glow dot */}
                                        {!isActive && (
                                            <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto border-t border-white/5 p-4 space-y-1">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all",
                        pathname === '/dashboard/settings' && "text-white bg-white/5"
                    )}
                >
                    <Settings className="h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                    Settings
                </Link>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
