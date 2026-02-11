-- Function to get symbols that need fundamentals update
-- Priority 1: Symbols that don't exist in stock_fundamentals
-- Priority 2: Symbols with oldest updated_at
CREATE OR REPLACE FUNCTION public.get_target_symbols_for_fundamentals(limit_count int)
RETURNS TABLE (symbol text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    (
        -- 1. Missing symbols (New)
        SELECT q.symbol
        FROM public.market_equity_quotes q
        LEFT JOIN public.stock_fundamentals f ON q.symbol = f.symbol
        WHERE f.symbol IS NULL
        LIMIT limit_count
    )
    UNION
    (
        -- 2. Stale symbols (Update)
        SELECT f.symbol
        FROM public.stock_fundamentals f
        ORDER BY f.updated_at ASC
        LIMIT limit_count
    )
    LIMIT limit_count;
END;
$$;
