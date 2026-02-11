-- Create tables for Comprehensive Market Data

-- 1. Market Indices (NIFTY 50, BANKNIFTY, VIX, etc.)
CREATE TABLE IF NOT EXISTS market_indices (
    index_name TEXT PRIMARY KEY,
    last_price NUMERIC,
    change NUMERIC,
    percent_change NUMERIC,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    previous_close NUMERIC,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Market Movers (Top Gainers / Losers)
CREATE TABLE IF NOT EXISTS market_movers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    type TEXT NOT NULL, -- 'gainer' or 'loser'
    price NUMERIC,
    change NUMERIC,
    percent_change NUMERIC,
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Market Sentiment (Fear & Greed / VIX)
CREATE TABLE IF NOT EXISTS market_sentiment (
    metric_name TEXT PRIMARY KEY,
    value NUMERIC,
    status TEXT, -- 'Fear', 'Greed', etc.
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Public Read, Service Role Write)
ALTER TABLE market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_movers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sentiment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Indices" ON market_indices FOR SELECT USING (true);
CREATE POLICY "Public Read Movers" ON market_movers FOR SELECT USING (true);
CREATE POLICY "Public Read Sentiment" ON market_sentiment FOR SELECT USING (true);

-- Allow service role full access (implicit, but good to be explicit if needed, though service_role bypasses RLS)
