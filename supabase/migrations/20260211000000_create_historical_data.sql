-- Historical OHLC Data and Backtesting Infrastructure
-- Created: 2026-02-11

-- =====================================================
-- 1. MARKET HISTORICAL OHLC DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_historical_ohlc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL CHECK (timeframe IN ('1min', '5min', '15min', '1H', '1D', '1W', '1M')),
    "timestamp" TIMESTAMPTZ NOT NULL,
    
    -- OHLCV Data
    "open" NUMERIC NOT NULL,
    "high" NUMERIC NOT NULL,
    "low" NUMERIC NOT NULL,
    "close" NUMERIC NOT NULL,
    volume BIGINT,
    
    -- Additional fields
    adjusted_close NUMERIC, -- For corporate actions (splits, dividends)
    trades_count INTEGER, -- Number of trades in this period
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no duplicates
    UNIQUE(symbol, timeframe, "timestamp")
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_historical_ohlc_symbol_time 
    ON public.market_historical_ohlc(symbol, timeframe, "timestamp" DESC);

CREATE INDEX IF NOT EXISTS idx_historical_ohlc_timestamp 
    ON public.market_historical_ohlc("timestamp" DESC);

CREATE INDEX IF NOT EXISTS idx_historical_ohlc_symbol 
    ON public.market_historical_ohlc(symbol);

-- Partial index for daily data (most common queries)
CREATE INDEX IF NOT EXISTS idx_historical_ohlc_daily 
    ON public.market_historical_ohlc(symbol, "timestamp" DESC) 
    WHERE timeframe = '1D';

-- =====================================================
-- 2. HISTORICAL DATA SYNC STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.historical_data_sync_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL CHECK (timeframe IN ('1min', '5min', '15min', '1H', '1D', '1W', '1M')),
    
    -- Sync information
    earliest_date DATE,
    latest_date DATE,
    total_records INTEGER DEFAULT 0,
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status tracking
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    data_source TEXT, -- 'NSE', 'Yahoo Finance', etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(symbol, timeframe)
);

CREATE INDEX IF NOT EXISTS idx_sync_status_symbol ON public.historical_data_sync_status(symbol);
CREATE INDEX IF NOT EXISTS idx_sync_status_timeframe ON public.historical_data_sync_status(timeframe);
CREATE INDEX IF NOT EXISTS idx_sync_status_status ON public.historical_data_sync_status(sync_status);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.market_historical_ohlc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_data_sync_status ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view historical data)
DROP POLICY IF EXISTS "Public read historical OHLC" ON public.market_historical_ohlc;
CREATE POLICY "Public read historical OHLC" ON public.market_historical_ohlc
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read sync status" ON public.historical_data_sync_status;
CREATE POLICY "Public read sync status" ON public.historical_data_sync_status
    FOR SELECT USING (true);

-- Service role can insert/update (for data fetching scripts)
DROP POLICY IF EXISTS "Service role can manage historical data" ON public.market_historical_ohlc;
CREATE POLICY "Service role can manage historical data" ON public.market_historical_ohlc
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage sync status" ON public.historical_data_sync_status;
CREATE POLICY "Service role can manage sync status" ON public.historical_data_sync_status
    FOR ALL WITH CHECK (true);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get historical OHLC data for a symbol and date range
CREATE OR REPLACE FUNCTION get_ohlc_data(
    p_symbol TEXT,
    p_timeframe TEXT DEFAULT '1D',
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 year',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    "timestamp" TIMESTAMPTZ,
    "open" NUMERIC,
    "high" NUMERIC,
    "low" NUMERIC,
    "close" NUMERIC,
    volume BIGINT,
    adjusted_close NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h."timestamp",
        h."open",
        h."high",
        h."low",
        h."close",
        h.volume,
        h.adjusted_close
    FROM public.market_historical_ohlc h
    WHERE h.symbol = p_symbol
        AND h.timeframe = p_timeframe
        AND h."timestamp" >= p_start_date
        AND h."timestamp" <= p_end_date
    ORDER BY h."timestamp" ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest sync date for a symbol
CREATE OR REPLACE FUNCTION get_latest_sync_date(
    p_symbol TEXT,
    p_timeframe TEXT DEFAULT '1D'
)
RETURNS DATE AS $$
DECLARE
    v_latest_date DATE;
BEGIN
    SELECT latest_date INTO v_latest_date
    FROM public.historical_data_sync_status
    WHERE symbol = p_symbol
        AND timeframe = p_timeframe;
    
    RETURN COALESCE(v_latest_date, CURRENT_DATE - INTERVAL '5 years');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update sync status
CREATE OR REPLACE FUNCTION update_sync_status(
    p_symbol TEXT,
    p_timeframe TEXT,
    p_earliest_date DATE,
    p_latest_date DATE,
    p_total_records INTEGER,
    p_status TEXT DEFAULT 'completed',
    p_data_source TEXT DEFAULT 'NSE',
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.historical_data_sync_status (
        symbol,
        timeframe,
        earliest_date,
        latest_date,
        total_records,
        sync_status,
        data_source,
        error_message,
        last_sync_at,
        updated_at
    ) VALUES (
        p_symbol,
        p_timeframe,
        p_earliest_date,
        p_latest_date,
        p_total_records,
        p_status,
        p_data_source,
        p_error_message,
        NOW(),
        NOW()
    )
    ON CONFLICT (symbol, timeframe) 
    DO UPDATE SET
        earliest_date = LEAST(EXCLUDED.earliest_date, historical_data_sync_status.earliest_date),
        latest_date = GREATEST(EXCLUDED.latest_date, historical_data_sync_status.latest_date),
        total_records = EXCLUDED.total_records,
        sync_status = EXCLUDED.sync_status,
        data_source = EXCLUDED.data_source,
        error_message = EXCLUDED.error_message,
        last_sync_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data gaps (missing dates) for a symbol
CREATE OR REPLACE FUNCTION get_data_gaps(
    p_symbol TEXT,
    p_timeframe TEXT DEFAULT '1D',
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 year',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    gap_start DATE,
    gap_end DATE,
    days_missing INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            p_start_date::timestamp,
            p_end_date::timestamp,
            CASE 
                WHEN p_timeframe = '1D' THEN '1 day'::interval
                WHEN p_timeframe = '1W' THEN '1 week'::interval
                WHEN p_timeframe = '1M' THEN '1 month'::interval
                ELSE '1 day'::interval
            END
        )::date AS expected_date
    ),
    actual_dates AS (
        SELECT DISTINCT "timestamp"::date AS actual_date
        FROM public.market_historical_ohlc
        WHERE symbol = p_symbol
            AND timeframe = p_timeframe
            AND "timestamp"::date BETWEEN p_start_date AND p_end_date
    ),
    gaps AS (
        SELECT 
            ds.expected_date,
            CASE WHEN ad.actual_date IS NULL THEN 1 ELSE 0 END AS is_gap,
            SUM(CASE WHEN ad.actual_date IS NULL THEN 1 ELSE 0 END) 
                OVER (ORDER BY ds.expected_date) AS gap_group
        FROM date_series ds
        LEFT JOIN actual_dates ad ON ds.expected_date = ad.actual_date
    )
    SELECT 
        MIN(expected_date)::date AS gap_start,
        MAX(expected_date)::date AS gap_end,
        COUNT(*)::integer AS days_missing
    FROM gaps
    WHERE is_gap = 1
    GROUP BY gap_group
    HAVING COUNT(*) > 0
    ORDER BY gap_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
