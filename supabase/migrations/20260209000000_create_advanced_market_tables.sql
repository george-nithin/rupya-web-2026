-- Create tables for Advanced Market Features (Technical Analysis, F&O, Performance)

-- 1. Technical Signals (RSI, MACD, Patterns)
CREATE TABLE IF NOT EXISTS market_technical_signals (
    symbol TEXT PRIMARY KEY, -- Linked loosely to market_equity_quotes
    rsi_14 NUMERIC,
    macd_line NUMERIC,
    macd_signal NUMERIC,
    macd_hist NUMERIC,
    ema_20 NUMERIC,
    sma_50 NUMERIC,
    sma_200 NUMERIC,
    candlestick_pattern TEXT, -- e.g., 'Doji', 'Bullish Engulfing'
    signal_type TEXT, -- 'Bullish', 'Bearish', 'Neutral'
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 2. F&O Movers (OI Data, Buildups)
CREATE TABLE IF NOT EXISTS market_fno_movers (
    symbol TEXT PRIMARY KEY,
    ltp NUMERIC,
    change NUMERIC,
    percent_change NUMERIC,
    open_interest NUMERIC,
    oi_change NUMERIC,
    oi_percent_change NUMERIC,
    buildup TEXT, -- 'Long Buildup', 'Short Covering', 'Short Buildup', 'Long Unwinding'
    sector TEXT,
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Stock Performance (Multi-timeframe Returns)
CREATE TABLE IF NOT EXISTS market_stock_performance (
    symbol TEXT PRIMARY KEY,
    return_1w NUMERIC,
    return_1m NUMERIC,
    return_3m NUMERIC,
    return_6m NUMERIC,
    return_1y NUMERIC,
    return_5y NUMERIC,
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE market_technical_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_fno_movers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_stock_performance ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public Read Tech Signals" ON market_technical_signals;
CREATE POLICY "Public Read Tech Signals" ON market_technical_signals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read FNO Movers" ON market_fno_movers;
CREATE POLICY "Public Read FNO Movers" ON market_fno_movers FOR SELECT USING (true);


-- 4. Trading Strategies (Definitions for Strategy Builder)
CREATE TABLE IF NOT EXISTS trading_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Iron Condor', 'Bull Call Spread'
    description TEXT,
    sentiment TEXT NOT NULL, -- 'Bullish', 'Bearish', 'Neutral', 'Directional'
    risk_profile TEXT, -- 'Limited Profit / Limited Loss'
    legs_count INTEGER,
    legs_config JSONB, -- Structure: [{action: 'Buy', type: 'CE', strike_offset: 0}, ...]
    payoff_diagram_url TEXT, -- Optional: link to static asset or SVG config
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Favourite Strategies
CREATE TABLE IF NOT EXISTS user_strategy_favourites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, strategy_id)
);

-- Enable RLS
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategy_favourites ENABLE ROW LEVEL SECURITY;

-- Policies for Strategies
DROP POLICY IF EXISTS "Public Read Strategies" ON trading_strategies;
CREATE POLICY "Public Read Strategies" ON trading_strategies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users Manage Faves" ON user_strategy_favourites;
CREATE POLICY "Users Manage Faves" ON user_strategy_favourites
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
