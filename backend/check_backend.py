import os
import config
from supabase import create_client

def check_config():
    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    
    print("--- Checking RLS Policies ---")
    try:
        # We can't query pg_catalog directly via PostgREST unless we have a stored procedure or it's exposed.
        # But we can try to fetch data using the *ANON* key if we had it.
        # Since I only have the service key here effectively (in config.py), I can't easily simulation Anon.
        # Wait, I can grab the ANON key from the flutter .env file if I parse it, or just ask the DB info via SQL function if available.
        
        # Alternative: Just try to read data with the Service Key (which works) vs "Anon" is hard.
        pass
    except Exception as e:
        print(e)
        
    print("--- Checking Realtime Publication ---")
    # This also usually requires SQL access.
    
    # Since I cannot run SQL directly, I have to rely on inference.
    
    # 1. Attempt to select from market_indices.
    try:
        res = supabase.table("market_indices").select("*").limit(1).execute()
        print(f"Read market_indices (Service Key): Success, got {len(res.data)} rows")
    except Exception as e:
        print(f"Read market_indices (Service Key): Failed - {e}")

if __name__ == "__main__":
    check_config()
