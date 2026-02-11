-- Market Features Enhancement: News, Alerts, Screeners, and Events
-- Created: 2026-02-10

-- =====================================================
-- CLEANUP: Drop existing tables if they exist (for fresh install)
-- =====================================================
DROP TABLE IF EXISTS public.screener_results CASCADE;
DROP TABLE IF EXISTS public.screener_configs CASCADE;
DROP TABLE IF EXISTS public.price_alerts CASCADE;
DROP TABLE IF EXISTS public.market_events CASCADE;
DROP TABLE IF EXISTS public.market_news CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS get_active_alerts();
DROP FUNCTION IF EXISTS trigger_alert(UUID, NUMERIC);
DROP FUNCTION IF EXISTS get_upcoming_events(INT);

-- =====================================================
-- 1. MARKET NEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    source TEXT,
    category TEXT CHECK (category IN ('stock', 'dividend', 'corporate', 'economy', 'special_events')),
    symbols TEXT[], -- Array of stock symbols related to this news
    published_at TIMESTAMPTZ NOT NULL,
    news_url TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON public.market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_category ON public.market_news(category);
CREATE INDEX IF NOT EXISTS idx_market_news_symbols ON public.market_news USING GIN(symbols);

ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market news" ON public.market_news;
CREATE POLICY "Public read market news" ON public.market_news
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can insert market news" ON public.market_news;
CREATE POLICY "Service role can insert market news" ON public.market_news
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. PRICE ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('price_above', 'price_below', 'percent_change_up', 'percent_change_down', 'volume_spike')) NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC,
    condition_details TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON public.price_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = TRUE;

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own alerts" ON public.price_alerts;
CREATE POLICY "Users can view their own alerts" ON public.price_alerts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.price_alerts;
CREATE POLICY "Users can insert their own alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own alerts" ON public.price_alerts;
CREATE POLICY "Users can update their own alerts" ON public.price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.price_alerts;
CREATE POLICY "Users can delete their own alerts" ON public.price_alerts
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can update alerts" ON public.price_alerts;
CREATE POLICY "Service role can update alerts" ON public.price_alerts
    FOR UPDATE WITH CHECK (true);

-- =====================================================
-- 3. SCREENER CONFIGURATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.screener_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source TEXT DEFAULT 'custom' CHECK (source IN ('screener.com', 'custom', 'default')),
    source_url TEXT,
    filters JSONB, -- Custom filter configuration
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screener_configs_default ON public.screener_configs(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_screener_configs_created_by ON public.screener_configs(created_by);

ALTER TABLE public.screener_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view default screeners" ON public.screener_configs;
CREATE POLICY "Public can view default screeners" ON public.screener_configs
    FOR SELECT USING (is_default = TRUE OR is_public = TRUE OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own screeners" ON public.screener_configs;
CREATE POLICY "Users can manage their own screeners" ON public.screener_configs
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Service role can manage screeners" ON public.screener_configs;
CREATE POLICY "Service role can manage screeners" ON public.screener_configs
    FOR ALL WITH CHECK (true);

-- =====================================================
-- 4. SCREENER RESULTS CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.screener_results (
    screener_id UUID REFERENCES public.screener_configs(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    result_rank INTEGER,
    score NUMERIC,
    metadata JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (screener_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_screener_results_screener_id ON public.screener_results(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_results_rank ON public.screener_results(screener_id, result_rank);

ALTER TABLE public.screener_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view screener results" ON public.screener_results;
CREATE POLICY "Public can view screener results" ON public.screener_results
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage screener results" ON public.screener_results;
CREATE POLICY "Service role can manage screener results" ON public.screener_results
    FOR ALL WITH CHECK (true);

-- =====================================================
-- 5. MARKET EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('earnings', 'dividend', 'split', 'bonus', 'rights', 'ipo', 'holiday', 'fno_expiry', 'agm', 'result')) NOT NULL,
    event_date DATE NOT NULL,
    symbols TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_events_date ON public.market_events(event_date);
CREATE INDEX IF NOT EXISTS idx_market_events_type ON public.market_events(event_type);
CREATE INDEX IF NOT EXISTS idx_market_events_symbols ON public.market_events USING GIN(symbols);

ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view market events" ON public.market_events;
CREATE POLICY "Public can view market events" ON public.market_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage market events" ON public.market_events;
CREATE POLICY "Service role can manage market events" ON public.market_events
    FOR ALL WITH CHECK (true);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get active alerts for evaluation
CREATE OR REPLACE FUNCTION get_active_alerts()
RETURNS TABLE (
    alert_id UUID,
    user_id UUID,
    symbol TEXT,
    alert_type TEXT,
    target_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        price_alerts.user_id,
        price_alerts.symbol,
        price_alerts.alert_type,
        price_alerts.target_value
    FROM public.price_alerts
    WHERE is_active = TRUE 
        AND is_triggered = FALSE
        AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger an alert
CREATE OR REPLACE FUNCTION trigger_alert(
    p_alert_id UUID,
    p_current_value NUMERIC
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.price_alerts
    SET 
        is_triggered = TRUE,
        triggered_at = NOW(),
        current_value = p_current_value,
        updated_at = NOW()
    WHERE id = p_alert_id;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
        user_id,
        'alert',
        'Price Alert Triggered: ' || symbol,
        'Your ' || alert_type || ' alert for ' || symbol || ' has been triggered at ' || p_current_value::TEXT,
        jsonb_build_object(
            'alert_id', p_alert_id,
            'symbol', symbol,
            'alert_type', alert_type,
            'target_value', target_value,
            'current_value', p_current_value
        )
    FROM public.price_alerts
    WHERE id = p_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming market events
CREATE OR REPLACE FUNCTION get_upcoming_events(days_ahead INT DEFAULT 7)
RETURNS TABLE (
    id UUID,
    title TEXT,
    event_type TEXT,
    event_date DATE,
    symbols TEXT[],
    days_until INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        market_events.id,
        market_events.title,
        market_events.event_type,
        market_events.event_date,
        market_events.symbols,
        (market_events.event_date - CURRENT_DATE)::INT as days_until
    FROM public.market_events
    WHERE event_date >= CURRENT_DATE 
        AND event_date <= CURRENT_DATE + days_ahead
    ORDER BY event_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
