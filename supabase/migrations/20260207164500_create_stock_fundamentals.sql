-- Create stock_fundamentals table for Screener.in data
CREATE TABLE IF NOT EXISTS public.stock_fundamentals (
    symbol TEXT PRIMARY KEY,
    market_cap TEXT,
    current_price TEXT,
    high_low TEXT,
    stock_pe TEXT,
    book_value TEXT,
    dividend_yield TEXT,
    roce TEXT,
    roe TEXT,
    face_value TEXT,
    pros TEXT[], -- Array of strings
    cons TEXT[], -- Array of strings
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stock_fundamentals ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or authenticated)
CREATE POLICY "Public can view fundamentals" ON public.stock_fundamentals
    FOR SELECT USING (true);

-- Allow service role to manage
CREATE POLICY "Service role can manage fundamentals" ON public.stock_fundamentals
    FOR ALL USING (true);
