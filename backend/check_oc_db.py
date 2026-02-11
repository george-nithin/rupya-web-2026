
from supabase_manager import SupabaseManager
from utils import log_info, log_error

try:
    db = SupabaseManager()
    response = db.supabase.table('market_option_chains').select('symbol, last_update_time, data').execute()
    
    if response.data:
        log_info(f"Found {len(response.data)} records in market_option_chains")
        for row in response.data:
            data_preview = str(row['data'])[:100] if row['data'] else "None"
            log_info(f"Symbol: {row['symbol']}, Updated: {row['last_update_time']}, Data: {data_preview}...")
    else:
        log_info("market_option_chains table is EMPTY")

except Exception as e:
    log_error(f"Error checking DB: {e}")
