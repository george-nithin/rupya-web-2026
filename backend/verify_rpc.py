
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from supabase_manager import SupabaseManager

def verify_rpc():
    print("--- Verifying RPC 'get_target_symbols_for_fundamentals' ---")
    db = SupabaseManager()
    
    if not db.supabase:
        print("❌ Supabase connection failed.")
        return

    try:
        print("Calling get_symbols_for_fundamentals_update(limit=5)...")
        symbols = db.get_symbols_for_fundamentals_update(limit=5)
        print(f"✅ RPC returned {len(symbols)} symbols:")
        print(symbols)
        
    except Exception as e:
        print(f"❌ RPC call failed: {e}")

if __name__ == "__main__":
    verify_rpc()
