"use client";

import { AlgoStrategyList } from "@/features/algo-trading/components/AlgoStrategyList";
import { Bot } from "lucide-react";

export default function AlgoTradingPage() {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Algo Trading Marketplace</h1>
                        <p className="text-sm text-muted-foreground">Discover, backtest, and deploy automated trading strategies.</p>
                    </div>
                </div>
            </div>

            <AlgoStrategyList />
        </div>
    );
}
