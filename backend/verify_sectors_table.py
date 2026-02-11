
import sys
import os

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_manager import SupabaseManager

def check_table():
    db = SupabaseManager()
    try:
        # Try to select from the table. If it fails, table likely doesn't exist.
        response = db.supabase.table("market_sectors").select("symbol").limit(1).execute()
        print("✅ Table 'market_sectors' exists.")
        return True
    except Exception as e:
        print(f"❌ Table 'market_sectors' check failed: {e}")
        return False

if __name__ == "__main__":
    check_table()
