
import pandas as pd
import io
from supabase_manager import SupabaseManager
from nse_session import NSESession
from utils import log_info, log_error, log_success

def update_sectors():
    session = NSESession()
    db = SupabaseManager()

    log_info("Fetching NIFTY 500 List from NSE...")
    url = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"
    
    try:
        response = session.get(url, is_json=False)
        if not response:
            log_error("Failed to fetch CSV")
            return

        # Decode content if bytes, or use string directly
        if isinstance(response, bytes):
            content = response.decode('utf-8')
        else:
            content = response

        df = pd.read_csv(io.StringIO(content))
        
        # CSV Columns: Company Name, Industry, Symbol, Series, ISIN Code
        # We need Symbol -> Industry mapping
        
        log_info(f"Fetched {len(df)} rows. Updating database...")
        
        updates = []
        for index, row in df.iterrows():
            symbol = row['Symbol']
            industry = row['Industry']
            
            updates.append({
                "symbol": symbol,
                "sector": industry
            })
            
        # Batch update (upsert is fine, but we only want to update sector)
        # Supabase options: upsert whole row? Or update matched rows.
        # Since we don't want to overwrite other fields with None, standard SQL update is better.
        # But for Supabase client, upsert requires all non-nullable fields or defaults. 
        # Actually, upsert ON CONFLICT (symbol) DO UPDATE SET sector = EXCLUDED.sector is standard Postgres.
        # Supabase-py `upsert` handles this if we provide the primary key.
        # However, if other required fields are missing in our payload, it might fail if they don't have defaults.
        # Let's try upserting just symbol and sector. If it fails, we might need a custom RPC or loop.
        
        # Let's try a small batch first to see if it works with partial data
        batch_size = 100
        for i in range(0, len(updates), batch_size):
            batch = updates[i:i+batch_size]
            try:
                # ignore_duplicates=False means update if exists
                db.supabase.table("market_equity_quotes").upsert(batch, on_conflict="symbol").execute()
                # log_success(f"Updated batch {i//batch_size + 1}")
            except Exception as e:
                log_error(f"Error updating batch {i}: {e}")
                
        log_success("Sector update complete.")

    except Exception as e:
        log_error(f"Script failed: {e}")

if __name__ == "__main__":
    update_sectors()
