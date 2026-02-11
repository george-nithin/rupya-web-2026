-- Add missing columns to market_equity_quotes
ALTER TABLE public.market_equity_quotes 
ADD COLUMN IF NOT EXISTS pchange_1y numeric,
ADD COLUMN IF NOT EXISTS pchange_30d numeric,
ADD COLUMN IF NOT EXISTS sector text,
ADD COLUMN IF NOT EXISTS industry text;

-- Create user_portfolio table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_portfolio (
    user_id uuid NOT NULL,
    symbol text NOT NULL,
    quantity numeric DEFAULT 0,
    avg_price numeric DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, symbol)
);

-- Enable RLS on user_portfolio
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

-- Policy for user_portfolio (users can see their own)
CREATE POLICY "Users can view own portfolio" ON public.user_portfolio
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON public.user_portfolio
    FOR ALL
    USING (auth.uid() = user_id);

-- Also ensure market_equity_quotes has RLS enabled
ALTER TABLE public.market_equity_quotes ENABLE ROW LEVEL SECURITY;

-- Policy for market_quotes (public read)
CREATE POLICY "Public read access for market quotes" ON public.market_equity_quotes
    FOR SELECT
    USING (true);
