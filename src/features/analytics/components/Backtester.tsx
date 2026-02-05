"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Play } from "lucide-react";
import { useState } from "react";

const backtestData = Array.from({ length: 50 }, (_, i) => ({
    trade: i + 1,
    equity: 100000 * (1 + (Math.sin(i / 5) * 0.05) + (i * 0.005)) // Simulated upward curve with volatility
}));

export function Backtester() {
    const [simulationRunning, setRunning] = useState(false);

    const startBacktest = () => {
        setRunning(true);
        setTimeout(() => setRunning(false), 2000);
    };

    return (
        <div className="space-y-6">
            <GlassCard>
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Strategy</label>
                            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none w-48">
                                <option>Momentum Breakout</option>
                                <option>Mean Reversion</option>
                                <option>MACD Crossover</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Instrument</label>
                            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none w-32">
                                <option>NIFTY</option>
                                <option>BANKNIFTY</option>
                                <option>RELIANCE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Timeframe</label>
                            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none w-24">
                                <option>15m</option>
                                <option>1H</option>
                                <option>1D</option>
                            </select>
                        </div>
                    </div>

                    <GlassButton onClick={startBacktest} disabled={simulationRunning} className="w-full md:w-auto">
                        <Play className={`h-4 w-4 mr-2 ${simulationRunning ? 'animate-spin' : ''}`} />
                        {simulationRunning ? "Simulating..." : "Run Backtest"}
                    </GlassButton>
                </div>

                <div className="h-[300px] w-full bg-black/20 rounded-xl overflow-hidden relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={backtestData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="trade" stroke="#64748b" tick={false} />
                            <YAxis stroke="#64748b" domain={['auto', 'auto']} tickFormatter={(val) => `₹${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                formatter={(val: any) => [`₹${val.toFixed(2)}`, 'Equity']}
                            />
                            <Line
                                type="monotone"
                                dataKey="equity"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-1">Net Profit</div>
                        <div className="text-lg font-bold text-green-400">+₹24,500</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-1">Max Drawdown</div>
                        <div className="text-lg font-bold text-red-400">-5.2%</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-1">Win Rate</div>
                        <div className="text-lg font-bold text-sky-400">62%</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-slate-500 mb-1">Sharpe Ratio</div>
                        <div className="text-lg font-bold text-white">1.84</div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
