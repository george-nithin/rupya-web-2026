"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Bell, Plus, Trash2 } from "lucide-react";

export default function AlertsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Alerts</h1>
                    <p className="text-slate-400">Manage your price notifications</p>
                </div>
                <GlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${i % 2 === 0 ? 'bg-green-500/10 text-green-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">
                                    {i % 2 === 0 ? "RELIANCE" : "BANKNIFTY"}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Alert when price crosses <span className="text-white font-medium">Above {i % 2 === 0 ? "3000" : "47000"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs text-slate-500">Current Price</div>
                                <div className="text-sm font-medium text-white">{i % 2 === 0 ? "2,980.50" : "46,892.10"}</div>
                            </div>
                            <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
