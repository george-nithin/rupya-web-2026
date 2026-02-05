-- ============================================
-- RUPYA WEBAPP - EXTRA FEATURES SCHEMA
-- ============================================

-- 1. TRADING JOURNAL
CREATE TABLE IF NOT EXISTS public.journal_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  entry_price NUMERIC(12, 2) NOT NULL,
  stop_loss NUMERIC(12, 2) NOT NULL,
  target_price NUMERIC(12, 2) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  strategy_name TEXT,
  reasoning TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
  pnl NUMERIC(12, 2),
  exit_price NUMERIC(12, 2),
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  exit_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for Journal
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_symbol ON public.journal_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_journal_date ON public.journal_trades(entry_date DESC);

-- 2. STRATEGY PLAYBOOK
CREATE TABLE IF NOT EXISTS public.user_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Intraday', 'Swing', 'Scalping', etc.
  description TEXT,
  win_rate NUMERIC(5, 2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_pnl NUMERIC(12, 2) DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indices for Strategies
CREATE INDEX IF NOT EXISTS idx_strategies_user ON public.user_strategies(user_id);

-- 3. GAMIFICATION (ACHIEVEMENTS)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL, -- e.g., 'early_bird', 'survivorship'
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Indices for Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.journal_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Journal Policies
CREATE POLICY "Users can view own trades" ON public.journal_trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON public.journal_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.journal_trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.journal_trades
  FOR DELETE USING (auth.uid() = user_id);

-- Strategy Policies
CREATE POLICY "Users can view own strategies" ON public.user_strategies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies" ON public.user_strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies" ON public.user_strategies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies" ON public.user_strategies
  FOR DELETE USING (auth.uid() = user_id);

-- Achievement Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- (Achievements are typically system-granted, but for now we allow user insert for testing/self-reporting or edge functions)
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUTOMATIONS (Triggers)
-- ============================================

-- Trigger for journal updated_at
CREATE TRIGGER update_journal_updated_at BEFORE UPDATE ON public.journal_trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for strategies updated_at
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON public.user_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. WATCHLIST
CREATE TABLE IF NOT EXISTS public.user_watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.user_watchlist(user_id);
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.user_watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON public.user_watchlist
  FOR ALL USING (auth.uid() = user_id);

-- 5. PORTFOLIO
CREATE TABLE IF NOT EXISTS public.user_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  avg_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.user_portfolio(user_id);
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON public.user_portfolio
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolio" ON public.user_portfolio
  FOR ALL USING (auth.uid() = user_id);

