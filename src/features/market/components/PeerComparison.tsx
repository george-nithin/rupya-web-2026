"use client";

import { GlassCard } from "@/components/ui/GlassCard";

const peerData = [
    { name: "Reliance Ind", price: "2,980.50", pe: 28.45, roe: 9.8, de: 0.42, sales: "15.2%", profit: "11.4%" },
    { name: "TCS", price: "3,890.00", pe: 29.12, roe: 46.9, de: 0.0, sales: "12.8%", profit: "14.2%" },
    { name: "Infosys", price: "1,670.00", pe: 24.80, roe: 31.8, de: 0.08, sales: "9.5%", profit: "8.1%" },
    { name: "HDFC Bank", price: "1,450.25", pe: 18.50, roe: 17.2, de: 2.1, sales: "18.4%", profit: "19.5%" },
];

export function PeerComparison() {
    return (
        <GlassCard className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Peer Comparison</h3>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-slate-400 border-b border-white/10">
                    <tr>
                        <th className="pb-3 pl-2">Company</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">P/E</th>
                        <th className="pb-3 text-right">ROE %</th>
                        <th className="pb-3 text-right">D/E</th>
                        <th className="pb-3 text-right pr-2">Sales Gwth</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {peerData.map((peer, i) => (
                        <tr key={peer.name} className={`hover:bg-white/5 ${i === 0 ? "bg-sky-500/5 border-l-2 border-sky-500" : ""}`}>
                            <td className={`py-3 pl-2 font-medium ${i === 0 ? "text-sky-400" : "text-white"}`}>
                                {peer.name} {i === 0 && "(Current)"}
                            </td>
                            <td className="py-3 text-right text-slate-200">₹{peer.price}</td>
                            <td className="py-3 text-right text-slate-300">{peer.pe}</td>
                            <td className={`py-3 text-right ${peer.roe > 20 ? "text-green-400" : "text-slate-300"}`}>{peer.roe}</td>
                            <td className="py-3 text-right text-slate-300">{peer.de}</td>
                            <td className="py-3 text-right pr-2 text-slate-300">{peer.sales}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </GlassCard>
    );
}
