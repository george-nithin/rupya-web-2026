from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

def inspect():
    res = supabase.table("market_equity_quotes").select("*").limit(10).execute()
    print("--- First 10 rows ---")
    for row in res.data:
        print(f"Symbol: {row.get('symbol')}, Price: {row.get('last_price')}, Change: {row.get('percent_change')}, Vol: {row.get('total_traded_volume')}")
    
    # Check for non-zero percent_change
    non_zero = supabase.table("market_equity_quotes").select("symbol").neq("percent_change", 0).limit(5).execute()
    print("\n--- Non-zero Percent Change samples ---")
    print(non_zero.data)

    # Check top gainers
    gainers = supabase.table("market_equity_quotes").select("symbol", "percent_change").order("percent_change", desc=True).limit(5).execute()
    print("\n--- Top Gainers ---")
    print(gainers.data)

    # Check top losers
    losers = supabase.table("market_equity_quotes").select("symbol", "percent_change").order("percent_change", desc=False).limit(5).execute()
    print("\n--- Top Losers ---")
    print(losers.data)

if __name__ == "__main__":
    inspect()
