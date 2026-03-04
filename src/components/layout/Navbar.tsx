"use client";
import Link from "next/link";
import { GlassInput } from "@/components/ui/GlassInput";
import { Search, Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
    onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    return (
        <div className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 right-0 md:left-64 left-0 z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-3 w-96 bg-secondary/50 rounded-xl px-4 py-2 border border-border/50">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search stocks, news, or commands..."
                    className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                />
                <div className="flex gap-1">
                    <span className="text-[10px] font-mono bg-background/50 border border-border px-1.5 py-0.5 rounded text-muted-foreground">⌘</span>
                    <span className="text-[10px] font-mono bg-background/50 border border-border px-1.5 py-0.5 rounded text-muted-foreground">K</span>
                </div>
            </div>

            {/* Mobile Logo (Visible only on mobile) */}
            <Link href="/dashboard" className="md:hidden flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
                    <img
                        src="/rupya-logo-circle.png"
                        alt="Rupya"
                        className="h-full w-full object-cover"
                    />
                </div>
                <span className="font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Rupya</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link href="/notifications">
                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all duration-150">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-slate-900" />
                    </button>
                </Link>

                <div className="h-8 w-px bg-card/30" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-foreground">Nithin Kamath</div>
                        <div className="text-xs text-muted-foreground">Pro Trader</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400 font-medium">
                        NK
                    </div>
                </div>
            </div>
        </div>
    );
}
