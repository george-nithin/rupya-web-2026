-- Add sector column to market_equity_quotes
ALTER TABLE public.market_equity_quotes 
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Create index for faster filtering by sector
CREATE INDEX IF NOT EXISTS idx_equity_sector ON public.market_equity_quotes(sector);
