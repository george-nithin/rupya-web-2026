
import pandas as pd
import io
import time
import yfinance as yf
from curl_cffi import requests
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success
import math

def sanitize_value(val):
    try:
        if pd.isna(val) or val is None or math.isinf(float(val)):
            return 0
        return float(val)
    except:
        return 0

def fetch_and_update_market_data():
    db = SupabaseManager()

    # 1. Fetch NIFTY 500 List for Sector Mapping
    log_info("Fetching NIFTY 500 List from NSE...")
    url = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.nseindia.com/products/content/equities/indices/nifty_500.htm",
    }

    try:
        # Get NSE List first
        session = requests.Session(impersonate="chrome110")
        session.get("https://www.nseindia.com", headers=headers, timeout=10) # Cookies
        time.sleep(1)
        response = session.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            log_error(f"Failed to fetch CSV: {response.status_code}")
            # Fallback if NSE fails: Use a hardcoded list or DB existing
            return

        content = response.content.decode('utf-8')
        df = pd.read_csv(io.StringIO(content))
        log_success(f"Fetched {len(df)} symbols from NSE.")
        
        symbols_map = {} # SYMBOL -> {Sector, CompanyName}
        for index, row in df.iterrows():
            sym = row['Symbol']
            industry = row['Industry']
            name = row['Company Name']
            symbols_map[sym] = {"sector": industry, "name": name}

        # 2. Fetch via yfinance
        tickers = [f"{s}.NS" for s in symbols_map.keys()]
        batch_size = 50
        
        for i in range(0, len(tickers), batch_size):
            batch = tickers[i:i+batch_size]
            log_info(f"Downloading batch {i//batch_size + 1} ({len(batch)} stocks)...")
            
            try:
                # Get current price data
                data = yf.download(batch, period="1d", group_by='ticker', threads=True, progress=False)
                
                updates = []
                
                for ticker in batch:
                    sym = ticker.replace('.NS', '')
                    
                    try:
                        # Extract data for this ticker
                        # If multi-index
                        if len(batch) > 1:
                            if ticker not in data.columns.levels[0]:
                                continue
                            stock_df = data[ticker]
                        else:
                            stock_df = data
                            
                        if stock_df.empty:
                            continue
                            
                        latest = stock_df.iloc[-1]
                        
                        price = sanitize_value(latest['Close'])
                        open_p = sanitize_value(latest['Open'])
                        high = sanitize_value(latest['High'])
                        low = sanitize_value(latest['Low'])
                        vol = sanitize_value(latest['Volume'])
                        
                        # Calculate change
                        change = price - open_p
                        p_change = (change / open_p * 100) if open_p != 0 else 0
                        
                        updates.append({
                            "symbol": sym,
                            "company_name": symbols_map[sym]["name"],
                            "sector": symbols_map[sym]["sector"],
                            "last_price": price,
                            "open": open_p,
                            "high": high,
                            "low": low,
                            "volume": int(vol),
                            "change": round(change, 2),
                            "percent_change": round(p_change, 2),
                            "description": symbols_map[sym]["sector"]
                        })
                        
                    except Exception as e:
                        print(f"Skipping {sym}: {e}")
                        continue
                
                if updates:
                    # Upsert to Supabase
                    db.supabase.table("market_equity_quotes").upsert(updates, on_conflict="symbol").execute()
                    log_success(f"Upserted {len(updates)} records.")
                    
            except Exception as e:
                log_error(f"Batch failed: {e}")
            
            time.sleep(1)

        log_success("Market Data Sync Complete.")

    except Exception as e:
        log_error(f"Script failed: {e}")

if __name__ == "__main__":
    fetch_and_update_market_data()
