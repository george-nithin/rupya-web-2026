
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from supabase_manager import SupabaseManager

def check_progress():
    db = SupabaseManager()
    if not db.supabase: return
    
    try:
        # Check count
        c_fund = db.supabase.table("stock_fundamentals").select("symbol", count="exact").execute().count
        c_quotes = db.supabase.table("market_equity_quotes").select("symbol", count="exact").execute().count
        
        print(f"Fundamentals Fetched: {c_fund}")
        print(f"Total Equities: {c_quotes}")
        print(f"Coverage: {c_fund/c_quotes*100:.2f}%" if c_quotes else "0%")
        
        # Check last update
        res = db.supabase.table("stock_fundamentals").select("symbol, updated_at").order("updated_at", desc=True).limit(5).execute()
        print("\nLast 5 Fetched:")
        for r in res.data:
            print(f"- {r['symbol']} ({r['updated_at']})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_progress()
