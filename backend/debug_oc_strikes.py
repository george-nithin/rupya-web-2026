
from supabase_manager import SupabaseManager
from utils import log_info
import json

db = SupabaseManager()
response = db.supabase.table('market_option_chains').select('symbol, data').eq('symbol', 'NIFTY').single().execute()

if response.data:
    data = response.data['data']
    log_info(f"Spot Price: {data['records']['underlyingValue']}")
    log_info(f"Number of strikes: {len(data['records']['data'])}")
    
    # Show first 5 strikes
    strikes = data['records']['data'][:5]
    for s in strikes:
        log_info(f"Strike: {s['strikePrice']}, CE LTP: {s['CE']['lastPrice']}, PE LTP: {s['PE']['lastPrice']}")
    
    # Check if sorted
    all_strikes = [s['strikePrice'] for s in data['records']['data']]
    log_info(f"Strike range: {min(all_strikes)} to {max(all_strikes)}")
