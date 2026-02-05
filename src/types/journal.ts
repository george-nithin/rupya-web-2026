export type TradeType = 'Intraday' | 'Swing' | 'Positional' | 'Investment';
export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Closed' | 'Cancelled';

export interface TradeTarget {
    price: number;
    hit: boolean;
}

export interface Trade {
    id: string;
    symbol: string;
    type: TradeType;
    direction: TradeDirection;
    entryPrice: number;
    quantity: number;
    stopLoss: number;
    targets: TradeTarget[];
    exitPrice?: number;
    exitReason?: string;
    status: TradeStatus;
    pnl?: number;
    pnlPercent?: number;
    entryDate: string;
    exitDate?: string;
    strategy: string; // e.g., "Breakout", "Reversal"
    reasoning: string;
    tags: string[];
    screenshots: string[]; // URLs

    // Analytics
    mae?: number; // Max Adverse Excursion
    mfe?: number; // Max Favorable Excursion
    riskRewardRatio: number;
}
