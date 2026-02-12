"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Calculator, Copy, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export function RiskCalculator() {
    const [capital, setCapital] = useState<number>(100000);
    const [riskPercent, setRiskPercent] = useState<number>(1);
    const [entry, setEntry] = useState<number | "">("");
    const [stopLoss, setStopLoss] = useState<number | "">("");

    // Outputs
    const [quantity, setQuantity] = useState<number>(0);
    const [riskAmount, setRiskAmount] = useState<number>(0);
    const [deployment, setDeployment] = useState<number>(0);

    useEffect(() => {
        if (entry && stopLoss && Number(entry) > 0 && Number(stopLoss) > 0) {
            const riskPerShare = Math.abs(Number(entry) - Number(stopLoss));
            const totalRisk = (capital * riskPercent) / 100;
            const qty = Math.floor(totalRisk / riskPerShare);

            setQuantity(qty);
            setRiskAmount(Number((qty * riskPerShare).toFixed(2)));
            setDeployment(Number((qty * Number(entry)).toFixed(2)));
        } else {
            setQuantity(0);
            setRiskAmount(0);
            setDeployment(0);
        }
    }, [capital, riskPercent, entry, stopLoss]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(quantity.toString());
    };

    return (
        <GlassCard className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6 text-sky-400">
                <Calculator className="h-5 w-5" />
                <h2 className="text-lg font-bold text-foreground">Position Size Calculator</h2>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Capital (₹)</label>
                        <GlassInput
                            type="number"
                            value={capital}
                            onChange={(e) => setCapital(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Risk (%)</label>
                        <GlassInput
                            type="number"
                            step="0.1"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Entry Price</label>
                        <GlassInput
                            type="number"
                            step="0.05"
                            value={entry}
                            onChange={(e) => setEntry(Number(e.target.value))}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Stop Loss</label>
                        <GlassInput
                            type="number"
                            step="0.05"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(Number(e.target.value))}
                            placeholder="0.00"
                            className="border-red-500/30 focus:border-red-500"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="bg-card/20 rounded-xl p-4 mt-6 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quantity to Buy</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-foreground">{quantity}</span>
                            <button onClick={copyToClipboard} className="p-1.5 hover:bg-card/30 rounded text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95">
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-card/30 my-2" />

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Risk Amount</span>
                        <span className="text-red-400 font-medium">₹{riskAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Capital Required</span>
                        <span className="text-emerald-400 font-medium">₹{deployment.toLocaleString()}</span>
                    </div>
                </div>

                <GlassButton className="w-full mt-4" variant="secondary" onClick={() => { setEntry(""); setStopLoss(""); }}>
                    <RefreshCw className="h-5 w-5 mr-2" /> Reset
                </GlassButton>
            </div>
        </GlassCard>
    );
}
