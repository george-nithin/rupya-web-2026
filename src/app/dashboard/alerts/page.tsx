"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Bell, Plus, TrendingUp, TrendingDown, AlertTriangle, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GlassInput } from "@/components/ui/GlassInput";

interface PriceAlert {
    id: string;
    symbol: string;
    alert_type: string;
    target_value: number;
    current_value?: number;
    is_active: boolean;
    is_triggered: boolean;
    triggered_at?: string;
    created_at: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'triggered' | 'expired'>('active');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    // Create alert form state
    const [newAlert, setNewAlert] = useState({
        symbol: '',
        alert_type: 'price_above',
        target_value: ''
    });

    useEffect(() => {
        fetchAlerts();

        // Realtime subscription
        const channel = supabase
            .channel('alerts_page_updates')
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
    }, [activeTab]);

    const fetchAlerts = async () => {
        let query = supabase.from('price_alerts').select('*');

        if (activeTab === 'active') {
            query = query.eq('is_active', true).eq('is_triggered', false);
        } else if (activeTab === 'triggered') {
            query = query.eq('is_triggered', true);
        } else if (activeTab === 'expired') {
            query = query.eq('is_active', false);
        }

        const { data } = await query.order('created_at', { ascending: false });

        if (data) {
            setAlerts(data as PriceAlert[]);
        }
        setLoading(false);
    };

    const createAlert = async () => {
        if (!newAlert.symbol || !newAlert.target_value) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('price_alerts').insert({
            user_id: user.id,
            symbol: newAlert.symbol.toUpperCase(),
            alert_type: newAlert.alert_type,
            target_value: parseFloat(newAlert.target_value),
            is_active: true
        });

        if (!error) {
            setShowCreateDialog(false);
            setNewAlert({ symbol: '', alert_type: 'price_above', target_value: '' });
            fetchAlerts();
        }
    };

    const deleteAlert = async (id: string) => {
        await supabase.from('price_alerts').delete().eq('id', id);
        fetchAlerts();
    };

    const getAlertIcon = (type: string) => {
        if (type === 'price_above') return TrendingUp;
        if (type === 'price_below') return TrendingDown;
        return AlertTriangle;
    };

    const getAlertLabel = (type: string) => {
        const labels: Record<string, string> = {
            price_above: 'Price Above',
            price_below: 'Price Below',
            percent_change_up: '% Gain Alert',
            percent_change_down: '% Loss Alert',
            volume_spike: 'Volume Spike'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
                    <p className="text-muted-foreground">Manage your stock and index price alerts</p>
                </div>
                <GlassButton
                    onClick={() => setShowCreateDialog(!showCreateDialog)}
                    variant="primary"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Alert
                </GlassButton>
            </div>

            {/* Create Alert Form */}
            {showCreateDialog && (
                <GlassCard>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Create New Alert</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Symbol</label>
                                <GlassInput
                                    placeholder="e.g. RELIANCE, NIFTY 50"
                                    value={newAlert.symbol}
                                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Alert Type</label>
                                <select
                                    className="w-full px-4 py-2 bg-card/20 border border-border rounded-xl text-foreground"
                                    value={newAlert.alert_type}
                                    onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                                >
                                    <option value="price_above">Price Above</option>
                                    <option value="price_below">Price Below</option>
                                    <option value="percent_change_up">% Gain</option>
                                    <option value="percent_change_down">% Loss</option>
                                    <option value="volume_spike">Volume Spike</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Target Value</label>
                                <GlassInput
                                    type="number"
                                    placeholder="e.g. 2500"
                                    value={newAlert.target_value}
                                    onChange={(e) => setNewAlert({ ...newAlert, target_value: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <GlassButton onClick={createAlert} variant="primary">
                                Create Alert
                            </GlassButton>
                            <GlassButton onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </GlassButton>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'active'
                            ? 'text-sky-400 border-b-2 border-sky-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Clock className="h-5 w-5 inline mr-2" />
                    Active
                </button>
                <button
                    onClick={() => setActiveTab('triggered')}
                    className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'triggered'
                            ? 'text-sky-400 border-b-2 border-sky-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Triggered
                </button>
                <button
                    onClick={() => setActiveTab('expired')}
                    className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'expired'
                            ? 'text-sky-400 border-b-2 border-sky-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <XCircle className="h-5 w-5 inline mr-2" />
                    Expired
                </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {loading ? (
                    <GlassCard>
                        <div className="text-center text-muted-foreground py-8">Loading alerts...</div>
                    </GlassCard>
                ) : alerts.length === 0 ? (
                    <GlassCard>
                        <div className="text-center text-muted-foreground py-12">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium mb-2">No {activeTab} alerts</p>
                            <p className="text-sm">
                                {activeTab === 'active' && 'Create an alert to get started!'}
                                {activeTab === 'triggered' && 'No alerts have been triggered yet.'}
                                {activeTab === 'expired' && 'No expired alerts.'}
                            </p>
                        </div>
                    </GlassCard>
                ) : (
                    alerts.map((alert) => {
                        const Icon = getAlertIcon(alert.alert_type);

                        return (
                            <GlassCard key={alert.id} className="hover:bg-card/30 transition-all active:scale-95">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${alert.is_triggered
                                                ? 'bg-orange-500/10'
                                                : 'bg-sky-500/10'
                                            }`}>
                                            <Icon className={`h-6 w-6 ${alert.is_triggered
                                                    ? 'text-orange-400'
                                                    : 'text-sky-400'
                                                }`} />
                                        </div>

                                        <div>
                                            <div className="text-lg font-semibold text-foreground">
                                                {alert.symbol}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {getAlertLabel(alert.alert_type)} ₹{alert.target_value.toFixed(2)}
                                            </div>
                                            {alert.is_triggered && alert.triggered_at && (
                                                <div className="text-xs text-orange-400 mt-1">
                                                    Triggered at ₹{alert.current_value?.toFixed(2)} on{' '}
                                                    {new Date(alert.triggered_at).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {alert.is_triggered && (
                                            <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                                                Triggered
                                            </span>
                                        )}
                                        {!alert.is_active && !alert.is_triggered && (
                                            <span className="text-xs bg-slate-500/20 text-muted-foreground px-3 py-1 rounded-full">
                                                Expired
                                            </span>
                                        )}
                                        <button
                                            onClick={() => deleteAlert(alert.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-xl transition-all group active:scale-95"
                                        >
                                            <Trash2 className="h-5 w-5 text-slate-400 group-hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })
                )}
            </div>
        </div>
    );
}
