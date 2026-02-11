-- Predefined Custom Screeners
-- Run this after the main migration to add preset custom screeners

INSERT INTO public.screener_configs (name, description, source, filters, is_default, is_public) VALUES
(
    'Value Stocks',
    'Undervalued companies with low P/E and high dividend yield',
    'custom',
    '{"pe_ratio": {"operator": "lt", "value": 15}, "dividend_yield": {"operator": "gt", "value": 3}}'::jsonb,
    true,
    true
),
(
    'Growth Stocks',
    'High growth potential stocks with strong revenue growth',
    'custom',
    '{"pe_ratio": {"operator": "gt", "value": 25}, "percent_change": {"operator": "gt", "value": 5}}'::jsonb,
    true,
    true
),
(
    'Large Cap Leaders',
    'Established companies with high market cap and volume',
    'custom',
    '{"market_cap": {"operator": "gt", "value": 100000000000}, "total_traded_volume": {"operator": "gt", "value": 1000000}}'::jsonb,
    true,
    true
),
(
    'Penny Stocks',
    'Low-priced stocks with potential for high returns',
    'custom',
    '{"last_price": {"operator": "lt", "value": 50}, "total_traded_volume": {"operator": "gt", "value": 500000}}'::jsonb,
    true,
    true
),
(
    'Dividend Stars',
    'High dividend yielding stocks for income investors',
    'custom',
    '{"dividend_yield": {"operator": "gt", "value": 3}, "market_cap": {"operator": "gt", "value": 10000000000}}'::jsonb,
    true,
    true
);
