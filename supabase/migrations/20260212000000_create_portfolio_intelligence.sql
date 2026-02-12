-- Portfolio Intelligence & Forecast System
-- Phase 1: Database Schema

-- 1. Broker Connections Table
CREATE TABLE IF NOT EXISTS broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL CHECK (broker_name IN ('upstox', 'zerodha', 'angelone', 'fyers', 'dhan')),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, broker_name)
);

-- 2. Enhanced Stock Fundamentals (extend existing table)
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS roe DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS roce DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS operating_margin DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS free_cash_flow DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS debt_to_equity DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS revenue_cagr_3y DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS eps_cagr_3y DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS peg_ratio DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS ev_ebitda DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS price_to_book DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS beta DECIMAL DEFAULT 1.0;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS volatility DECIMAL;
ALTER TABLE stock_fundamentals ADD COLUMN IF NOT EXISTS earnings_consistency DECIMAL;

-- 3. Portfolio Analytics Cache Table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Health Scores
  portfolio_health_score DECIMAL,
  diversification_score DECIMAL,
  
  -- Risk Metrics
  portfolio_beta DECIMAL,
  portfolio_volatility DECIMAL,
  sharpe_ratio DECIMAL,
  max_drawdown DECIMAL,
  
  -- Forecast Data
  expected_return_30d DECIMAL,
  var_95 DECIMAL,
  upside_95 DECIMAL,
  downside_5 DECIMAL,
  probability_of_profit DECIMAL,
  
  -- Allocation Metrics
  top_3_concentration DECIMAL,
  largest_position_pct DECIMAL,
  sector_allocation JSONB DEFAULT '{}',
  
  -- Detailed Analytics (JSON)
  stock_scores JSONB DEFAULT '[]',
  risk_metrics JSONB DEFAULT '{}',
  forecast_data JSONB DEFAULT '{}',
  warnings JSONB DEFAULT '[]',
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Stock Correlation Matrix (for diversification analysis)
CREATE TABLE IF NOT EXISTS stock_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_a TEXT NOT NULL,
  symbol_b TEXT NOT NULL,
  correlation DECIMAL NOT NULL,
  period_days INTEGER DEFAULT 90,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol_a, symbol_b, period_days)
);

-- 5. Enable Row Level Security
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_correlations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for broker_connections
CREATE POLICY "Users can view own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broker connections"
  ON broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broker connections"
  ON broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own broker connections"
  ON broker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for portfolio_analytics
CREATE POLICY "Users can view own portfolio analytics"
  ON portfolio_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio analytics"
  ON portfolio_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio analytics"
  ON portfolio_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. RLS Policies for stock_correlations (public read)
CREATE POLICY "Anyone can view stock correlations"
  ON stock_correlations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage correlations"
  ON stock_correlations FOR ALL
  TO service_role
  USING (true);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_connections_active ON broker_connections(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_user_id ON portfolio_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_correlations_symbols ON stock_correlations(symbol_a, symbol_b);
CREATE INDEX IF NOT EXISTS idx_stock_fundamentals_symbol ON stock_fundamentals(symbol);

-- 10. Updated_at trigger for broker_connections
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_broker_connections_updated_at BEFORE UPDATE ON broker_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Function to refresh portfolio analytics
CREATE OR REPLACE FUNCTION refresh_portfolio_analytics(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- This will be called by the API to trigger analytics recalculation
  -- The actual calculation happens in the application layer
  UPDATE portfolio_analytics 
  SET calculated_at = NOW() 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
