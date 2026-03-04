import pandas as pd
import yfinance as yf
from nse_session import NSESession
from utils import log_info, log_error, log_success

class NSEIndices:
    def __init__(self, session: NSESession):
        self.session = session
        self.indices_map = {
            "^NSEI": "NIFTY 50",
            "^NSEBANK": "NIFTY BANK",
            "^BSESN": "SENSEX",
            "^CNXIT": "NIFTY IT",
            "^CNXAUTO": "NIFTY AUTO",
            "^CNXENERGY": "NIFTY ENERGY",
            "^CNXFMCG": "NIFTY FMCG",
            "^CNXMETAL": "NIFTY METAL",
            "^CNXPHARMA": "NIFTY PHARMA",
            "^CNXREALTY": "NIFTY REALTY",
            "^INDIAVIX": "INDIA VIX"
        }

    def fetch_all_indices(self):
        """
        Fetch snapshot of all indices.
        Endpoint: /api/allIndices with yfinance fallback.
        """
        log_info("Fetching All Indices Snapshot...")
        endpoint = "/api/allIndices"
        data = self.session.get(endpoint)
        
        if data and "data" in data:
            indices = data["data"]
            # Map all indices available from NSE
            mapped = [
                {
                    "index": i.get("index"),
                    "last": i.get("last"),
                    "change": i.get("variation"),
                    "pChange": i.get("percentChange"),
                    "open": i.get("open"),
                    "high": i.get("high"),
                    "low": i.get("low"),
                    "previousClose": i.get("previousClose"),
                    "timestamp": data.get("timestamp")
                }
                for i in indices
            ]
            return mapped
        else:
            log_error("Failed to fetch indices from NSE. Attempting yfinance fallback...")
            return self._fetch_via_yfinance()

    def _fetch_via_yfinance(self):
        """Fallback using yfinance for major indices"""
        symbols = list(self.indices_map.keys())
        try:
            data = yf.download(symbols, period="1d", group_by='ticker', progress=False)
            updates = []
            
            for sym, name in self.indices_map.items():
                try:
                    if len(symbols) > 1:
                        if sym not in data.columns.levels[0]: continue
                        df = data[sym]
                    else:
                        df = data
                    
                    if df.empty: continue
                    latest = df.iloc[-1]
                    
                    price = float(latest['Close'])
                    open_p = float(latest['Open'])
                    change = price - open_p
                    p_change = (change / open_p * 100) if open_p > 0 else 0
                    
                    updates.append({
                        "index": name,
                        "last": round(price, 2),
                        "change": round(change, 2),
                        "pChange": round(p_change, 2),
                        "open": round(open_p, 2),
                        "high": round(float(latest['High']), 2),
                        "low": round(float(latest['Low']), 2),
                        "previousClose": round(float(df.iloc[-2]['Close']), 2) if len(df) > 1 else 0
                    })
                except:
                    continue
            
            if updates:
                log_success(f"Fetched {len(updates)} indices via yfinance fallback.")
            return updates
        except Exception as e:
            log_error(f"yfinance fallback failed: {e}")
            return []

    def fetch_index(self, index_name):
        """
        Fetch stocks for a specific index.
        Endpoint: /api/equity-stockIndices?index={index_name}
        """
        log_info(f"Fetching Index: {index_name}...")
        endpoint = "/api/equity-stockIndices"
        params = {"index": index_name}
        return self.session.get(endpoint, params=params)
