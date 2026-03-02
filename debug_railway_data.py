import time
import datetime
from supabase import create_client, Client
import os

# Manual config since we want to be sure
URL = "https://uywnylyarazecapuxjvh.supabase.co"
# Using the key from your .env.local
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5d255bHlhcmF6ZWNhcHV4anZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE0NTAyNywiZXhwIjoyMDc3NzIxMDI3fQ.XCgN5RQ8XjzB3wfXoR_69zzBVa5_tqflPXu9nNlquFI"

def get_ist_now():
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ist_offset = datetime.timedelta(hours=5, minutes=30)
    return now_utc + ist_offset

def check_data():
    supabase = create_client(URL, KEY)
    print(f"Checking Supabase Data Freshness (IST: {get_ist_now().strftime('%H:%M:%S')})")
    print("-" * 50)
    
    # 1. Market Indices (Top 10 freshest)
    res = supabase.table("market_indices").select("index_name, updated_at, last_price").order("updated_at", desc=True).limit(10).execute()
    if res.data:
        print(f"Freshest Indices:")
        for i in res.data:
            print(f"  - {i['index_name']}: {i['last_price']} (Last Update: {i['updated_at']})")
    else:
        print("No indices found.")
    
    # 2. Top Movers (Freshest 5)
    res = supabase.table("market_movers").select("symbol, type, last_update_time").order("last_update_time", desc=True).limit(5).execute()
    if res.data:
        print(f"\nFreshest Top Movers:")
        for m in res.data:
            print(f"  - {m['symbol']} ({m['type']}): {m['last_update_time']}")

    # 3. Option Chains (Freshest 5)
    res = supabase.table("market_option_chains").select("symbol, last_update_time").order("last_update_time", desc=True).limit(5).execute()
    if res.data:
        print(f"\nFreshest Option Chains:")
        for oc in res.data:
            print(f"  - {oc['symbol']}: {oc['last_update_time']}")

if __name__ == "__main__":
    check_data()
