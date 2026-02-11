-- Add missing columns to market_equity_quotes for real market data
ALTER TABLE market_equity_quotes 
ADD COLUMN IF NOT EXISTS volume bigint,
ADD COLUMN IF NOT EXISTS open numeric,
ADD COLUMN IF NOT EXISTS high numeric,
ADD COLUMN IF NOT EXISTS low numeric,
ADD COLUMN IF NOT EXISTS description text;
