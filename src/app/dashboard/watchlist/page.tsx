"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
    Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Activity, BarChart2, TrendingUp, ChevronDown, Eye, Plus
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

// Mock Data for Sparklines
const generateSparkData = (trend: 'up' | 'down') =>
    Array.from({ length: 20 }, (_, i) => ({
        value: 100 + (trend === 'up' ? i * 2 : -i * 2) + Math.random() * 10
    }));

const stocks = [
    { id: 1, symbol: "RELIANCE", name: "Reliance Industries", price: "2,987.50", change: 1.15, vol: "4.2M", mcap: "19.5T", sector: "Energy", trend: "up" },
    { id: 2, symbol: "TCS", name: "Tata Consultancy Svcs", price: "3,890.00", change: -0.32, vol: "1.8M", mcap: "14.2T", sector: "IT", trend: "down" },
    { id: 3, symbol: "HDFCBANK", name: "HDFC Bank", price: "1,450.25", change: -0.87, vol: "12.5M", mcap: "11.1T", sector: "Banking", trend: "down" },
    { id: 4, symbol: "INFY", name: "Infosys Ltd", price: "1,670.00", change: 0.45, vol: "3.1M", mcap: "6.8T", sector: "IT", trend: "up" },
    { id: 5, symbol: "ICICIBANK", name: "ICICI Bank", price: "1,020.40", change: 0.83, vol: "9.2M", mcap: "7.1T", sector: "Banking", trend: "up" },
    { id: 6, symbol: "ITC", name: "ITC Limited", price: "435.00", change: -0.12, vol: "8.5M", mcap: "5.4T", sector: "FMCG", trend: "down" },
    { id: 7, symbol: "SBIN", name: "State Bank of India", price: "640.00", change: 1.25, vol: "15.1M", mcap: "5.7T", sector: "Banking", trend: "up" },
    { id: 8, symbol: "L&T", name: "Larsen & Toubro", price: "3,450.00", change: 2.10, vol: "1.2M", mcap: "4.8T", sector: "Capital Goods", trend: "up" },
];

export default function MarketOverviewPage() {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Market Overview</h1>
                    <p className="text-slate-400 text-sm">Real-time market data across sectors.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 w-64 transition-all"
                        />
                    </div>

                    <GlassButton variant="secondary" className="gap-2">
                        <Filter className="h-4 w-4" /> Filter <ChevronDown className="h-3 w-3 opacity-50" />
                    </GlassButton>

                    <GlassButton className="gap-2 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border-sky-500/30">
                        <Plus className="h-4 w-4" /> Add Assets
                    </GlassButton>
                </div>
            </div>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">+1.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">1,245</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Advances</div>
                    <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[65%]" />
                    </div>
                </GlassCard>

                <GlassCard className="group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                            <ArrowDownRight className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">-0.8%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">856</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Declines</div>
                    <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[35%]" />
                    </div>
                </GlassCard>

                <GlassCard className="group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">High</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">24.5B</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Total Volume</div>
                    <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 w-[80%]" />
                    </div>
                </GlassCard>

                <GlassCard className="group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">All Time High</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">₹348T</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Total M.Cap</div>
                    <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[95%]" />
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Stocks Table */}
                <div className="lg:col-span-9">
                    <GlassCard className="p-0 overflow-hidden min-h-[600px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/5 text-slate-400 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Price</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Change</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Volume</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Sector</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-[150px]">Trend (7D)</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stocks.map((stock) => (
                                        <tr key={stock.id} className="group hover:bg-white/5 transition-all duration-200 cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                        {stock.symbol.slice(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{stock.symbol}</div>
                                                        <div className="text-xs text-slate-500">{stock.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-200">
                                                ₹{stock.price}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${stock.change >= 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                                                    }`}>
                                                    {stock.change > 0 ? "+" : ""}{stock.change}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                                                {stock.vol}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full bg-white/5 text-slate-400 text-xs border border-white/5">
                                                    {stock.sector}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-8 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={generateSparkData(stock.trend as 'up' | 'down')}>
                                                            <defs>
                                                                <linearGradient id={`gradient-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor={stock.trend === 'up' ? '#4ade80' : '#f87171'} stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor={stock.trend === 'up' ? '#4ade80' : '#f87171'} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <Area
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke={stock.trend === 'up' ? '#4ade80' : '#f87171'}
                                                                fill={`url(#gradient-${stock.id})`}
                                                                strokeWidth={2}
                                                            />
                                                            <XAxis hide />
                                                            <YAxis hide domain={['dataMin', 'dataMax']} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-sky-500/20 rounded-lg text-slate-400 hover:text-sky-400 transition-colors">
                                                        <TrendingUp className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    <div className="flex justify-center mt-6">
                        <GlassButton variant="ghost" className="text-slate-400 hover:text-white">
                            Load More Stocks
                        </GlassButton>
                    </div>
                </div>

                {/* Right Sidebar: Market Insights */}
                <div className="lg:col-span-3 space-y-6">
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Top Gainers</h3>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "ADANIENT", change: "+4.5%" },
                                { name: "TATAMOTORS", change: "+3.2%" },
                                { name: "ONGC", change: "+2.8%" },
                            ].map((stock) => (
                                <div key={stock.name} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-slate-200">{stock.name}</span>
                                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{stock.change}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Top Losers</h3>
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "INFY", change: "-2.1%" },
                                { name: "HCLTECH", change: "-1.8%" },
                                { name: "WIPRO", change: "-1.5%" },
                            ].map((stock) => (
                                <div key={stock.name} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-slate-200">{stock.name}</span>
                                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{stock.change}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-1">Pro Analytics</h3>
                            <p className="text-xs text-indigo-100 mb-4">Unlock advanced screeners and AI insights.</p>
                            <button className="text-xs font-bold bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-lg hover:bg-white/90 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 text-white/10">
                            <Activity className="h-24 w-24" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
