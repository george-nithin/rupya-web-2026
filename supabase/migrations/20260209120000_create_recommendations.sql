-- Create table for F&O Research Recommendations
CREATE TABLE IF NOT EXISTS research_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    recommendation_type TEXT NOT NULL, -- 'BUY', 'SELL', 'HOLD'
    timeframe TEXT, -- 'Short Term', 'Intraday', 'Long Term'
    entry_price NUMERIC,
    target_price NUMERIC,
    stop_loss NUMERIC,
    expiry_date TEXT, -- Optional, for F&O
    conviction TEXT, -- 'High', 'Medium', 'Low'
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE research_recommendations ENABLE ROW LEVEL SECURITY;

-- Public Read Policy
DROP POLICY IF EXISTS "Public Read Recommendations" ON research_recommendations;
CREATE POLICY "Public Read Recommendations" ON research_recommendations FOR SELECT USING (true);
