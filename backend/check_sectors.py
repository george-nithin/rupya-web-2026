
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from supabase_manager import SupabaseManager

def check_sectors():
    db = SupabaseManager()
    try:
        # Get unique sectors from quotes
        response = db.supabase.table("market_equity_quotes").select("sector, symbol").limit(20).execute()
        print("Sample Stocks & Sectors:")
        for item in response.data:
            print(f"{item['symbol']}: {item.get('sector')}")
            
        print("\n--- Market Sectors (Indices) ---")
        indices = db.supabase.table("market_sectors").select("symbol").limit(10).execute()
        for item in indices.data:
            print(item['symbol'])

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_sectors()
