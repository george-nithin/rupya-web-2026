"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { Save, Play, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";


interface CodeEditorProps {
    initialCode?: string;
    readOnly?: boolean;
    onRunComplete?: () => void;
}

const DEFAULT_CODE = `
def strategy(data):
    # Momentum Simple Strategy
    # Buy when close is above 20 SMA
    
    # Calculate SMA using pandas_ta
    sma_20 = ta.sma(data['close'], length=20)
    
    # Check current candle
    if len(data) < 20:
        return "HOLD"
        
    current_close = data['close'].iloc[-1]
    current_sma = sma_20.iloc[-1]
    
    if current_close > current_sma:
        return "BUY"
    elif current_close < current_sma:
        return "SELL"
    else:
        return "HOLD"
`.trim();

export function CodeEditor({ initialCode = DEFAULT_CODE, readOnly = false, onRunComplete }: CodeEditorProps) {
    const params = useParams();
    const strategyId = params?.id as string;
    const [code, setCode] = useState(initialCode || DEFAULT_CODE);
    const [running, setRunning] = useState(false);

    const handleRunBacktest = async () => {
        if (!strategyId) return;
        setRunning(true);
        try {
            // 1. Save Code
            const { error: saveError } = await supabase
                .from('algo_strategies')
                .update({ code })
                .eq('id', strategyId);

            if (saveError) throw saveError;

            // 2. Create Backtest Job
            // First delete old results? Or keep history?
            // For now, let's update the existing result if any, or create new.
            // Actually, we probably want one result per strategy for the dashboard overview.

            // Check if result exists
            const { data: existing } = await supabase
                .from('algo_backtest_results')
                .select('id')
                .eq('strategy_id', strategyId)
                .single();

            if (existing) {
                await supabase
                    .from('algo_backtest_results')
                    .update({ status: 'Pending', metrics: {}, equity_curve: [] })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('algo_backtest_results')
                    .insert({ strategy_id: strategyId, status: 'Pending' });
            }

            // 3. User Feedback
            // toast.success("Backtest started...");

            // Poll for completion (Simple implementation)
            const interval = setInterval(async () => {
                const { data } = await supabase
                    .from('algo_backtest_results')
                    .select('status')
                    .eq('strategy_id', strategyId)
                    .single();

                if (data?.status === 'Completed' || data?.status === 'Failed') {
                    clearInterval(interval);
                    setRunning(false);
                    if (onRunComplete) onRunComplete();
                }
            }, 1000);

        } catch (e) {
            console.error(e);
            setRunning(false);
        }
    };

    return (
        <GlassCard className="h-[500px] flex flex-col p-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-card/20">
                <div className="text-sm font-mono text-foreground/80">strategy.py</div>
                <div className="flex gap-2">
                    <GlassButton
                        size="sm"
                        className="h-8 bg-green-500/20 text-green-400 hover:bg-green-500/30 active:scale-95"
                        onClick={handleRunBacktest}
                        disabled={running || readOnly}
                    >
                        {running ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Play className="h-3 w-3 mr-2" />}
                        {running ? "Running..." : "Run Backtest"}
                    </GlassButton>
                    {!readOnly && (
                        <GlassButton size="sm" className="h-8 bg-primary/20 text-primary hover:bg-primary/30 active:scale-95">
                            <Save className="h-3 w-3 mr-2" /> Save
                        </GlassButton>
                    )}
                </div>
            </div>

            <div className="flex-1 relative">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    readOnly={readOnly}
                    className="w-full h-full bg-[hsl(var(--card))] text-foreground/80 font-mono text-sm p-4 outline-none resize-none"
                    spellCheck={false}
                />
            </div>
        </GlassCard>
    );
}
