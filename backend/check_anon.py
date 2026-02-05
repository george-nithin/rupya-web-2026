from supabase import create_client

URL = "https://uywnylyarazecapuxjvh.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5d255bHlhcmF6ZWNhcHV4anZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDUwMjcsImV4cCI6MjA3NzcyMTAyN30.ue2Nzzohz9L4-T4w6aaajs_MAQ7Fd-x124hjYYQHRrM"

def check_anon():
    print(f"Connecting to {URL} with ANON KEY...")
    try:
        supabase = create_client(URL, ANON_KEY)
        
        # Try to read market_indices
        print("Attempting to read market_indices...")
        res = supabase.table("market_indices").select("*").limit(5).execute()
        print(f"market_indices: Success. Found {len(res.data)} rows.")
        print(res.data)
        
        # Try to read market_equity_quotes
        print("Attempting to read market_equity_quotes...")
        res2 = supabase.table("market_equity_quotes").select("symbol,last_price").limit(5).execute()
        print(f"market_equity_quotes: Success. Found {len(res2.data)} rows.")
        
    except Exception as e:
        print(f"Check Failed: {e}")

if __name__ == "__main__":
    check_anon()
