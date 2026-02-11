-- Add new columns to journal_trades table
ALTER TABLE journal_trades 
ADD COLUMN IF NOT EXISTS trade_type TEXT DEFAULT 'Intraday',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS emotions TEXT[],
ADD COLUMN IF NOT EXISTS fees NUMERIC,
ADD COLUMN IF NOT EXISTS session TEXT;

-- Update RLS policies if needed (usually defaults are fine if strictly added)
