import sys
import os

# Add the current directory to sys.path so we can import backend
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import config
from supabase_manager import SupabaseManager

db = SupabaseManager()

def inspect():
    if not db.supabase:
        print("Failed to connect to Supabase.")
        return

    res = db.supabase.table("market_equity_quotes").select("*").limit(20).execute()
    print(f"--- Total Rows in sample: {len(res.data)} ---")
    
    # Check if we have variety in percent_change
    changes = [row.get('percent_change') for row in res.data if row.get('percent_change') is not None]
    volumes = [row.get('total_traded_volume') for row in res.data if row.get('total_traded_volume') is not None]
    
    print(f"Sample Percent Changes: {changes[:10]}")
    print(f"Sample Volumes: {volumes[:10]}")

    # Test ordering
    gainers = db.supabase.table("market_equity_quotes").select("symbol", "percent_change").order("percent_change", desc=True).limit(5).execute()
    print("\n--- DB Top 5 Gainers ---")
    for r in gainers.data:
        print(f"{r['symbol']}: {r['percent_change']}%")

    losers = db.supabase.table("market_equity_quotes").select("symbol", "percent_change").order("percent_change", desc=False).limit(5).execute()
    print("\n--- DB Top 5 Losers ---")
    for r in losers.data:
        print(f"{r['symbol']}: {r['percent_change']}%")

if __name__ == "__main__":
    inspect()
