-- Create table for Algo Strategies
CREATE TABLE IF NOT EXISTS algo_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    code TEXT, -- The custom code
    manager_name TEXT,
    risk_level TEXT, -- 'Low', 'Medium', 'High'
    capital_required NUMERIC,
    min_amount NUMERIC,
    max_amount NUMERIC,
    tags TEXT[], -- ['Nifty', 'Hedged', 'Directional']
    
    -- Performance snapshot (denormalized for list view)
    cagr NUMERIC,
    win_rate NUMERIC,
    max_drawdown NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for Algo Backtest Results
CREATE TABLE IF NOT EXISTS algo_backtest_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES algo_strategies(id) ON DELETE CASCADE,
    
    -- JSONB for complex structures (flexible for various charting libs)
    equity_curve JSONB, -- Array of {date, equity}
    drawdown_periods JSONB, -- Array of {start, end, depth}
    monthly_returns JSONB, -- Array/Object of return values
    metrics JSONB, -- Key-value pairs of metrics
    trade_log JSONB, -- Array of trades
    
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE algo_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE algo_backtest_results ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public Read Strategies" ON algo_strategies;
CREATE POLICY "Public Read Strategies" ON algo_strategies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Results" ON algo_backtest_results;
CREATE POLICY "Public Read Results" ON algo_backtest_results FOR SELECT USING (true);
