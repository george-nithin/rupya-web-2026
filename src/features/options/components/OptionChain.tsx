"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState } from "react";

// Mock Option Chain Data for NIFTY
const strikePrices = [
    { strike: 21500, call: { ltp: 154, oi: 150000, iv: 12.5 }, put: { ltp: 45, oi: 250000, iv: 14.2 } },
    { strike: 21550, call: { ltp: 120, oi: 120000, iv: 12.8 }, put: { ltp: 68, oi: 210000, iv: 14.1 } },
    { strike: 21600, call: { ltp: 85, oi: 280000, iv: 13.1 }, put: { ltp: 95, oi: 180000, iv: 13.9 } }, // ATM
    { strike: 21650, call: { ltp: 56, oi: 300000, iv: 13.5 }, put: { ltp: 125, oi: 110000, iv: 13.7 } },
    { strike: 21700, call: { ltp: 32, oi: 450000, iv: 13.8 }, put: { ltp: 160, oi: 80000, iv: 13.6 } },
];

export function OptionChain() {
    const [expiry, setExpiry] = useState("25 JAN");

    return (
        <GlassCard className="h-full overflow-hidden flex flex-col p-0">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-white">Option Chain</h2>
                    <select
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none"
                    >
                        <option>18 JAN</option>
                        <option>25 JAN</option>
                        <option>01 FEB</option>
                    </select>
                </div>
                <div className="text-xs text-slate-400">
                    Spot: <span className="text-white font-bold">21,612.45</span> (-0.45%)
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-center border-collapse">
                    <thead className="text-slate-500 bg-white/5 sticky top-0 z-10 font-medium">
                        <tr>
                            <th colSpan={3} className="py-2 border-r border-white/10 text-green-400/80">CALLS</th>
                            <th className="py-2 px-4 bg-slate-800 text-white">STRIKE</th>
                            <th colSpan={3} className="py-2 border-l border-white/10 text-red-400/80">PUTS</th>
                        </tr>
                        <tr className="text-[10px] uppercase">
                            <th className="pb-2 font-normal">OI</th>
                            <th className="pb-2 font-normal">IV</th>
                            <th className="pb-2 font-normal border-r border-white/10">LTP</th>
                            <th className="pb-2 bg-slate-800 w-16"></th>
                            <th className="pb-2 font-normal border-l border-white/10">LTP</th>
                            <th className="pb-2 font-normal">IV</th>
                            <th className="pb-2 font-normal">OI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {strikePrices.map((row, i) => {
                            const isATM = i === 2; // Mock logic for visual
                            return (
                                <tr key={row.strike} className={`hover:bg-white/5 transition-colors ${isATM ? 'bg-sky-500/10' : ''}`}>
                                    {/* Calls */}
                                    <td className="py-2 relative">
                                        {row.call.oi.toLocaleString()}
                                        <div className="absolute inset-y-1 right-0 bg-green-500/10" style={{ width: `${(row.call.oi / 450000) * 100}%` }} />
                                    </td>
                                    <td className="py-2 text-slate-500">{row.call.iv}</td>
                                    <td className="py-2 font-medium text-white border-r border-white/10 hover:bg-green-500/20 cursor-pointer transition-colors">
                                        {row.call.ltp}
                                    </td>

                                    {/* Strike */}
                                    <td className={`py-2 font-bold bg-slate-800 ${isATM ? 'text-sky-400' : 'text-white'}`}>
                                        {row.strike}
                                    </td>

                                    {/* Puts */}
                                    <td className="py-2 font-medium text-white border-l border-white/10 hover:bg-red-500/20 cursor-pointer transition-colors">
                                        {row.put.ltp}
                                    </td>
                                    <td className="py-2 text-slate-500">{row.put.iv}</td>
                                    <td className="py-2 relative">
                                        {row.put.oi.toLocaleString()}
                                        <div className="absolute inset-y-1 left-0 bg-red-500/10" style={{ width: `${(row.put.oi / 300000) * 100}%` }} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
