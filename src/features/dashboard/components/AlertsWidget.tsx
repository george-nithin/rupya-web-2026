"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Bell, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface PriceAlert {
    id: string;
    symbol: string;
    alert_type: string;
    target_value: number;
    is_triggered: boolean;
    created_at: string;
}

export function AlertsWidget() {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            const { data } = await supabase
                .from('price_alerts')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                setAlerts(data as PriceAlert[]);
            }
            setLoading(false);
        };

        fetchAlerts();

        // Realtime subscription
        const channel = supabase
            .channel('alerts_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'price_alerts',
                },
                () => {
                    fetchAlerts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getAlertIcon = (type: string) => {
        if (type === 'price_above') return TrendingUp;
        if (type === 'price_below') return TrendingDown;
        return AlertTriangle;
    };

    const getAlertLabel = (type: string) => {
        const labels: Record<string, string> = {
            price_above: 'Above',
            price_below: 'Below',
            percent_change_up: '% Gain',
            percent_change_down: '% Loss',
            volume_spike: 'Volume Spike'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <GlassCard className="lg:col-span-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-sky-400" />
                        <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                    </div>
                    <div className="text-slate-500 text-sm">Loading alerts...</div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="lg:col-span-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-sky-400" />
                        <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                        <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
                            {alerts.length}
                        </span>
                    </div>
                    <Link
                        href="/dashboard/alerts"
                        className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        Manage
                    </Link>
                </div>

                {alerts.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-6">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No active alerts. Create one to get started!</p>
                        <Link
                            href="/dashboard/alerts"
                            className="text-sky-400 hover:text-sky-300 text-xs mt-2 inline-block"
                        >
                            Create Alert →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map((alert) => {
                            const Icon = getAlertIcon(alert.alert_type);
                            const isTriggered = alert.is_triggered;

                            return (
                                <div
                                    key={alert.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isTriggered
                                            ? 'bg-orange-500/10 border-orange-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-4 w-4 ${isTriggered ? 'text-orange-400' : 'text-sky-400'}`} />
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                {alert.symbol}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {getAlertLabel(alert.alert_type)} ₹{alert.target_value.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    {isTriggered && (
                                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                                            Triggered
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
