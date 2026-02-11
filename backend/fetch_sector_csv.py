
import pandas as pd
import io
import time
from curl_cffi import requests
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success

def update_sectors_direct():
    db = SupabaseManager()

    log_info("Fetching NIFTY 500 List from NSE (Direct Request)...")
    url = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": "https://www.nseindia.com/products/content/equities/indices/nifty_500.htm",
    }

    try:
        # Use a fresh session with browser impersonation
        session = requests.Session(impersonate="chrome110")
        
        # First hit homepage to get cookies
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        time.sleep(1)
        
        # Now fetch CSV
        response = session.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            log_error(f"Failed to fetch CSV: Status {response.status_code}")
            return

        content = response.content.decode('utf-8')
        df = pd.read_csv(io.StringIO(content))
        
        log_info(f"Fetched {len(df)} rows. Updating database...")
        
        updates = []
        for index, row in df.iterrows():
            symbol = row['Symbol']
            industry = row['Industry']
            
            updates.append({
                "symbol": symbol,
                "sector": industry
            })
            
        batch_size = 100
        for i in range(0, len(updates), batch_size):
            batch = updates[i:i+batch_size]
            try:
                db.supabase.table("market_equity_quotes").upsert(batch, on_conflict="symbol").execute()
                print(f"Upserted batch {i//batch_size + 1}")
            except Exception as e:
                log_error(f"Error updating batch {i}: {e}")
                
        log_success("Sector update complete.")

    except Exception as e:
        log_error(f"Script failed: {e}")

if __name__ == "__main__":
    update_sectors_direct()
