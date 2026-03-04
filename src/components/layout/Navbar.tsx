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
        <div className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 right-0 left-0 md:left-20 z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
            {/* Mobile Menu Button - Left Aligned */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-3 -ml-3 text-muted-foreground hover:text-foreground transition-all flex-shrink-0 relative z-50 touch-manipulation active:scale-90"
                aria-label="Open Menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6 bg-secondary/50 rounded-xl px-4 py-2 border border-border/50 transition-all focus-within:ring-1 focus-within:ring-orange-500/50">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                />
            </div>

            {/* Mobile Logo - Centered */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none z-10">
                <Link href="/dashboard" className="flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
                        <img
                            src="/rupya-logo-circle.png"
                            alt="Rupya"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span className="font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent text-sm">Rupya</span>
                </Link>
            </div>

            {/* Right Actions - Right Aligned */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <div className="scale-90 md:scale-100">
                    <ThemeToggle />
                </div>
                <Link href="/notifications" className="hidden xs:block">
                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all duration-150">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-slate-900" />
                    </button>
                </Link>

                <div className="h-8 w-px bg-card/30 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <div className="text-sm font-medium text-foreground">Nithin Kamath</div>
                        <div className="text-xs text-muted-foreground">Pro Trader</div>
                    </div>
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400 font-medium text-xs md:text-sm">
                        NK
                    </div>
                </div>
            </div>
        </div>
    );
}
