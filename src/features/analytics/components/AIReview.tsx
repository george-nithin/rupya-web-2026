"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Bot, Send, Sparkles, Lightbulb } from "lucide-react";
import { useState } from "react";

const insights = [
    { text: "Your win rate drops by 15% when trading between 11 AM and 1 PM.", type: "warning" },
    { text: "You performed best with 'Momentum Breakout' strategy on Tuesdays.", type: "positive" },
    { text: "Consider reducing position size on NIFTY BankOptions; 55% of losses come from there.", type: "tip" },
];

export function AIReview() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Hello! I've analyzed your last 50 trades. What would you like to know?" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', text: input }]);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm analyzing that pattern... (This is a mock response)" }]);
        }, 1000);
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
            <GlassCard className="lg:col-span-2 flex flex-col h-[500px]">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Rupya AI Assistant</h3>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
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

                <div className="pt-4 border-t border-white/10 flex gap-2">
                    <GlassInput
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your psychology or patterns..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <GlassButton onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
}
