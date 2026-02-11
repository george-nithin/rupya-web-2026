
import sys
import os
import time
import random

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_manager import SupabaseManager
from screener_fetcher import ScreenerFetcher

# Logging utility
def log_info(msg):
    print(f"INFO: {msg}")

def log_error(msg):
    print(f"ERROR: {msg}")

def bulk_fetch():
    log_info("--- Starting Aggressive Bulk Fetch (Fundamentals) ---")
    db = SupabaseManager()
    screener = ScreenerFetcher()
    
    if not db.supabase:
        log_error("Supabase connection failed.")
        return

    while True:
        try:
            # 1. Get next batch of symbols needing update
            # We use the same RPC but loop tighter
            target_symbols = db.get_symbols_for_fundamentals_update(limit=5)
            
            if not target_symbols:
                log_info("No symbols returned by RPC. Checking if we need to fetch all equities...")
                # If RPC returns nothing, maybe we need to query market_equity_quotes directly
                # However, the RPC logic covers "missing" symbols.
                # If it's empty, either DB is empty or all are updated.
                
                # Double check total count
                res = db.supabase.table("market_equity_quotes").select("symbol", count="exact").execute()
                total_equities = res.count
                if total_equities == 0:
                    log_error("No equities in market_equity_quotes. Run main.py to fetch market data first.")
                    break
                
                # Fetch random one to re-verify if table is populated
                res = db.supabase.table("market_equity_quotes").select("symbol").limit(1).execute()
                if res.data:
                    log_info("Equities exist. RPC might be returning empty if all are fresh. Forcing update on oldest.")
                    # Force fetch oldest irrespective of "missing" logic
                    res = db.supabase.table("stock_fundamentals").select("symbol").order("updated_at", desc=False).limit(5).execute()
                    target_symbols = [r['symbol'] for r in res.data]
            
            if not target_symbols:
                log_info("Nothing to fetch. Sleeping...")
                time.sleep(10)
                continue
                
            for symbol in target_symbols:
                log_info(f"Fetching {symbol}...")
                data = screener.fetch_fundamentals(symbol)
                
                if data:
                    db.upsert_fundamentals(data)
                    log_info(f"✅ Saved {symbol}")
                else:
                    log_error(f"❌ Failed {symbol}")
                
                # Aggressive delay: 5-10 seconds (vs 100s in main.py)
                # This is risky for IP blocking but user wants data NOW.
                delay = random.uniform(5.0, 10.0)
                log_info(f"Sleeping {delay:.2f}s...")
                time.sleep(delay)
                
        except KeyboardInterrupt:
            log_info("Stopped by user.")
            break
        except Exception as e:
            log_error(f"Loop error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    bulk_fetch()
