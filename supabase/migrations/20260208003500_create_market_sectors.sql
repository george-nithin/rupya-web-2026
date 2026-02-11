
-- Create market_sectors table to store sectoral index data
CREATE TABLE IF NOT EXISTS public.market_sectors (
    symbol TEXT PRIMARY KEY, -- e.g., 'NIFTY BANK', 'NIFTY IT'
    last_price NUMERIC,
    change NUMERIC,
    p_change NUMERIC,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    previous_close NUMERIC,
    volume BIGINT,
    turnover NUMERIC,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    trend TEXT -- 'bullish', 'bearish', 'neutral'
);

-- Enable RLS
ALTER TABLE public.market_sectors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Enable read access for all users" ON public.market_sectors
    FOR SELECT USING (true);

-- Create policy to allow service role to upsert
CREATE POLICY "Enable insert/update for service role" ON public.market_sectors
    FOR ALL USING (true) WITH CHECK (true);

-- Create index on updated_at
CREATE INDEX IF NOT EXISTS idx_market_sectors_updated_at ON public.market_sectors(updated_at);
