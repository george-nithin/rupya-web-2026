-- Create table for storing Option Chain Data (JSON structure)
CREATE TABLE IF NOT EXISTS public.market_option_chains (
    symbol TEXT PRIMARY KEY, -- 'NIFTY', 'BANKNIFTY'
    data JSONB, -- Heavy JSON object with full chain
    last_update_time TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.market_option_chains ENABLE ROW LEVEL SECURITY;

-- Public Read Policy
DROP POLICY IF EXISTS "Public Read Option Chains" ON public.market_option_chains;
CREATE POLICY "Public Read Option Chains" ON public.market_option_chains FOR SELECT USING (true);

-- Service Role Full Access
DROP POLICY IF EXISTS "Service Role Manage Option Chains" ON public.market_option_chains;
CREATE POLICY "Service Role Manage Option Chains" ON public.market_option_chains USING (true) WITH CHECK (true);
