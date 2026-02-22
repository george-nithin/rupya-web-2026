
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing credentials")
    exit(1)

supabase = create_client(url, key)

print("Checking 'market_equity_quotes' for 'RELIANCE'...")
try:
    # Try exact match
    res = supabase.table("market_equity_quotes").select("*").eq("symbol", "RELIANCE").execute()
    
    print(f"Exact match count: {len(res.data)}")
    if res.data:
        # print("First record:", res.data[0])
        pass
    else:
        print("No exact match found.")
    
    # Try ilike
    res_search = supabase.table("market_equity_quotes").select("symbol").ilike("symbol", "%RELIANCE%").limit(5).execute()
    print(f"Search match count: {len(res_search.data)}")
    print("Search results:", res_search.data)
    
    # Check total count
    res_count = supabase.table("market_equity_quotes").select("symbol", count="exact").limit(1).execute()
    print(f"Total symbols in table: {res_count.count}")

except Exception as e:
    print(f"Error querying: {e}")
