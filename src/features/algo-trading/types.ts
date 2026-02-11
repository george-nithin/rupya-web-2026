export interface AlgoStrategy {
    id: string;
    name: string;
    description: string;
    manager_name: string;
    risk_level: 'Low' | 'Medium' | 'High' | 'Very High';
    capital_required: number;
    min_amount: number;
    max_amount: number;
    tags: string[];
    cagr: number;
    win_rate: number;
    max_drawdown: number;
    subscribers?: number;
    rating?: number;
    created_at: string;
    code?: string;
}

export interface BacktestResult {
    id: string;
    strategy_id: string;
    equity_curve: { date: string; equity: number }[];
    drawdown_periods: { start: string; end: string; depth: number; recovery_days: number }[];
    monthly_returns: Record<string, number>; // "2024-01": 5.2
    metrics: {
        total_return: number;
        sharpe_ratio: number;
        sortino_ratio: number;
        alpha: number;
        beta: number;
        volatility: number;
        max_drawdown: number;
        win_rate: number;
        profit_factor: number;
        avg_trade: number;
    };
    trade_log: any[];
}
