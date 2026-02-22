
import os
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)


try:
    # Count Stocks
    res_stocks = supabase.table("market_equity_quotes").select("symbol", count="exact").execute()
    count_stocks = res_stocks.count
    print(f"Total Stocks in DB: {count_stocks}")

    # Count Historical Data
    # Note: count might be slow for large tables, but okay for dev
    res_hist = supabase.table("market_historical_ohlc").select("id", count="exact", head=True).execute() 
    count_hist = res_hist.count
    print(f"Total Historical OHLC Records: {count_hist}")

    # distinct symbols in history? (Hard via simple API, maybe just count)
except Exception as e:
    print(f"Error: {e}")

