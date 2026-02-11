"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Bot, Send, Sparkles, Lightbulb, AlertTriangle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Trade {
    id: string;
    symbol: string;
    pnl: number;
    exit_date: string;
    direction: string;
    entry_price: number;
    exit_price: number;
}

export function AIReview() {
    const [insights, setInsights] = useState<{ text: string; type: 'positive' | 'warning' | 'tip' }[]>([]);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Hello! I've analyzed your trading journal. Ask me about your performance, win rate, or risk management." }
    ]);
    const [input, setInput] = useState("");
    const [trades, setTrades] = useState<Trade[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTradesAndAnalyze();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchTradesAndAnalyze = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('journal_trades')
            .select('symbol, pnl, exit_date, direction, entry_price, exit_price')
            .eq('user_id', user.id)
            .eq('status', 'CLOSED')
            .order('exit_date', { ascending: false })
            .limit(50); // Analyze last 50 trades

        if (data && data.length > 0) {
            setTrades(data);
            generateInsights(data);
        } else {
            setInsights([
                { text: "No closed trades found. Log trades in the Journal to get AI insights.", type: "tip" }
            ]);
        }
    };

    const generateInsights = (tradeData: Trade[]) => {
        const newInsights: { text: string; type: 'positive' | 'warning' | 'tip' }[] = [];

        // 1. Win Rate
        const wins = tradeData.filter(t => t.pnl > 0).length;
        const total = tradeData.length;
        const winRate = (wins / total) * 100;

        if (winRate > 60) {
            newInsights.push({ text: `Great job! Your win rate is strong at ${winRate.toFixed(1)}%.`, type: 'positive' });
        } else if (winRate < 40) {
            newInsights.push({ text: `Your win rate is ${winRate.toFixed(1)}%. Consider tightening your entry criteria.`, type: 'warning' });
        }

        // 2. Avg Win vs Avg Loss
        const winningTrades = tradeData.filter(t => t.pnl > 0);
        const losingTrades = tradeData.filter(t => t.pnl <= 0);
        const avgWin = winningTrades.reduce((sum, t) => sum + t.pnl, 0) / (winningTrades.length || 1);
        const avgLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / (losingTrades.length || 1));

        if (avgLoss > avgWin) {
            newInsights.push({ text: `Risk Alert: Your average loss (₹${avgLoss.toFixed(0)}) is larger than your average win (₹${avgWin.toFixed(0)}).`, type: 'warning' });
        } else if (avgWin > avgLoss * 2) {
            newInsights.push({ text: `Excellent Risk/Reward! Your winners are 2x bigger than losers.`, type: 'positive' });
        }

        // 3. Concentration (Top Symbol)
        const symbolCounts: Record<string, number> = {};
        tradeData.forEach(t => { symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1; });
        const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0];

        if (topSymbol) {
            newInsights.push({ text: `Most traded asset: ${topSymbol[0]} (${topSymbol[1]} trades). Ensure you aren't over-trading one stock.`, type: 'tip' });
        }

        setInsights(newInsights);
    };

    const getAIResponse = (question: string): string => {
        const q = question.toLowerCase();

        if (trades.length === 0) return "I don't have enough data yet. Please log some trades.";

        // Win Rate Logic
        if (q.includes('win rate') || q.includes('winning')) {
            const wins = trades.filter(t => t.pnl > 0).length;
            const rate = ((wins / trades.length) * 100).toFixed(1);
            return `Based on your last ${trades.length} trades, your win rate is ${rate}%.`;
        }

        // Best Trade
        if (q.includes('best') || q.includes('profit') || q.includes('highest')) {
            const best = [...trades].sort((a, b) => b.pnl - a.pnl)[0];
            return `Your best trade was ${best.symbol} with a profit of ₹${best.pnl.toFixed(2)}.`;
        }

        // Worst Trade
        if (q.includes('worst') || q.includes('loss') || q.includes('lowest')) {
            const worst = [...trades].sort((a, b) => a.pnl - b.pnl)[0];
            return `Your biggest loss was ${worst.symbol} with a loss of ₹${Math.abs(worst.pnl).toFixed(2)}. Review this trade to learn from it.`;
        }

        // General Advice
        if (q.includes('suggest') || q.includes('advice') || q.includes('improve')) {
            const wins = trades.filter(t => t.pnl > 0).length;
            if (wins < trades.length / 2) return "Focus on cutting losses earlier. Your win rate is below 50%.";
            return "You are doing well. Try scaling up position size on your high-conviction setups.";
        }

        return "I can analyze your Win Rate, Best Trades, and Risk profile. Try asking 'What is my win rate?' or 'What was my best trade?'.";
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);

        const response = getAIResponse(input);

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 600);

        setInput("");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Insights Panel */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-sky-400" />
                    <h3 className="text-sm font-semibold text-white">Automated Insights</h3>
                </div>
                {insights.map((insight, i) => (
                    <GlassCard key={i} className={`p-4 border-l-2 ${insight.type === 'positive' ? 'border-l-green-400' :
                        insight.type === 'warning' ? 'border-l-orange-400' : 'border-l-sky-400'
                        }`}>
                        <div className="flex gap-3">
                            <Lightbulb className="h-5 w-5 text-slate-400 shrink-0" />
                            <p className="text-sm text-slate-200">{insight.text}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Chat Interface */}
            <GlassCard className="lg:col-span-2 flex flex-col h-[500px] p-0 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Rupya AI Assistant</h3>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Analyzes your Journal
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                ? 'bg-sky-500/10 text-white rounded-br-sm border border-sky-500/20'
                                : 'bg-white/5 text-slate-200 rounded-bl-sm border border-white/5'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 flex gap-2 bg-black/20">
                    <GlassInput
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask: 'What is my win rate?', 'Best trade?', 'Advice?'..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                    />
                    <GlassButton onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
}
