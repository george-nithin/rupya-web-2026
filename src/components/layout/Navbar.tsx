"use client";

import { GlassInput } from "@/components/ui/GlassInput";
import { Search, Bell, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="fixed top-0 right-0 left-64 h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-30 flex items-center justify-between px-6">
            <div className="w-96">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search stocks, indices, strategies..."
                        className="w-full rounded-full bg-slate-800/50 border border-white/10 pl-10 pr-4 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-slate-900" />
                </button>

                <div className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">Nithin Kamath</div>
                        <div className="text-xs text-slate-400">Pro Trader</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400 font-medium">
                        NK
                    </div>
                </div>
            </div>
        </header>
    );
}
