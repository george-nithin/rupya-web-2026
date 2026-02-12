"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Server, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const trafficData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    requests: 1000 + Math.random() * 500
}));

export function SystemHealth() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <Server className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Server Status</div>
                        <div className="text-xl font-bold text-foreground flex items-center gap-2">
                            Online <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-sky-500/20 rounded-xl text-sky-400">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">API Latency</div>
                        <div className="text-xl font-bold text-foreground">45ms</div>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Active Users</div>
                        <div className="text-xl font-bold text-foreground">1,248</div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-sm font-bold text-foreground mb-4">Traffic (Last 24h)</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#38bdf8" fillOpacity={1} fill="url(#colorRequests)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-sm font-bold text-foreground mb-4">Recent System Logs</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-2 hover:bg-card/20 rounded-xl transition-all duration-150 active:scale-95">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                            <div>
                                <div className="text-sm text-foreground">Database Backup Successful</div>
                                <div className="text-[10px] text-muted-foreground">2 mins ago</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 hover:bg-card/20 rounded-xl transition-all duration-150 active:scale-95">
                            <AlertTriangle className="h-5 w-5 text-orange-400 mt-1" />
                            <div>
                                <div className="text-sm text-foreground">High Memory Usage (Redis)</div>
                                <div className="text-[10px] text-muted-foreground">15 mins ago</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 hover:bg-card/20 rounded-xl transition-all duration-150 active:scale-95">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                            <div>
                                <div className="text-sm text-foreground">Cron Jobs Executed</div>
                                <div className="text-[10px] text-muted-foreground">1 hour ago</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
