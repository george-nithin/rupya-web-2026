
import os
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    # Fetch one row to see keys
    res = supabase.table("algo_strategies").select("*").limit(1).execute()
    if res.data:
        print("Keys:", res.data[0].keys())
        print("Sample:", res.data[0])
    else:
        print("No data, cannot infer schema easily via select. Trying to insert dummy to see error?")
except Exception as e:
    print(e)
