import pandas as pd
from nse_session import NSESession
from utils import log_info, log_error, log_success
import csv
import io
import datetime

class NSEEquity:
    def __init__(self, session: NSESession):
        self.session = session

    def fetch_quote(self, symbol: str):
        """
        Fetch real-time quote for an equity symbol.
        Endpoint: /api/quote-equity?symbol={SYMBOL} with yfinance fallback.
        """
        log_info(f"Fetching Quote for {symbol}...")
        endpoint = "/api/quote-equity"
        params = {"symbol": symbol}
        
        data = self.session.get(endpoint, params=params)
        if data and "priceInfo" in data:
            # Parse crucial info
            info = data.get("info", {})
            price = data.get("priceInfo", {})
            metadata = data.get("metadata", {})
            
            parsed = {
                "symbol": info.get("symbol"),
                "companyName": info.get("companyName"),
                "lastPrice": price.get("lastPrice"),
                "change": price.get("change"),
                "pChange": price.get("pChange"),
                "open": price.get("open"),
                "dayHigh": price.get("intraDayHighLow", {}).get("max"),
                "dayLow": price.get("intraDayHighLow", {}).get("min"),
                "previousClose": price.get("previousClose"),
                "lastUpdateTime": metadata.get("lastUpdateTime"),
                "totalTradedVolume": price.get("totalTradedVolume")
            }
            return parsed
        else:
            log_info(f"NSE failed for {symbol}. Trying yfinance fallback...")
            return self._fetch_via_yfinance(symbol)

    def _fetch_via_yfinance(self, symbol: str):
        """Fallback using yfinance for equity quotes"""
        try:
            import yfinance as yf
            ticker = f"{symbol}.NS"
            tk = yf.Ticker(ticker)
            hist = tk.history(period="1d")
            if hist.empty:
                return None
            
            latest = hist.iloc[-1]
            price = float(latest['Close'])
            open_p = float(latest['Open'])
            change = price - open_p
            p_change = (change / open_p * 100) if open_p > 0 else 0
            
            parsed = {
                "symbol": symbol,
                "companyName": symbol, # Limited info via hist
                "lastPrice": round(price, 2),
                "change": round(change, 2),
                "pChange": round(p_change, 2),
                "open": round(open_p, 2),
                "dayHigh": round(float(latest['High']), 2),
                "dayLow": round(float(latest['Low']), 2),
                "previousClose": 0, # Could get from iloc[-2] if period="5d"
                "lastUpdateTime": str(datetime.datetime.now()),
                "totalTradedVolume": int(latest['Volume'])
            }
            log_success(f"Fetched {symbol} quote via yfinance fallback.")
            return parsed
        except Exception as e:
            log_error(f"yfinance fallback for {symbol} failed: {e}")
            return None


    def fetch_market_breadth(self):
        """
        Fetch market breadth (Advance/Decline).
        Endpoint: /api/live-analysis-advance (or decline)
        """
        log_info("Fetching Market Breadth...")
        # Note: NSE usually separates NIFTY 50, etc. This endpoint gives a broad view.
        # We will use /api/marketStatus for a quick snapshot if needed or specific indices.
        # Here using the requested endpoint.
        endpoint = "/api/live-analysis-advance" 
        return self.session.get(endpoint)

    def fetch_top_gainers(self):
        """
        Fetch Top Gainers.
        Endpoint: /api/live-analysis-variations?index=gainers
        """
        log_info("Fetching Top Gainers...")
        endpoint = "/api/live-analysis-variations"
        params = {"index": "gainers"}
        data = self.session.get(endpoint, params=params)
        # Normalize: response["NIFTY"] might be a list OR a dict with "data"
        if data and "data" not in data and "NIFTY" in data:
             nifty_val = data["NIFTY"]
             if isinstance(nifty_val, dict) and "data" in nifty_val:
                 return {"data": nifty_val["data"]}
             elif isinstance(nifty_val, list):
                 return {"data": nifty_val}
        return data

    def fetch_top_losers(self):
        """
        Fetch Top Losers.
        Endpoint: /api/live-analysis-variations?index=losers
        """
        log_info("Fetching Top Losers...")
        endpoint = "/api/live-analysis-variations"
        params = {"index": "losers"}
        data = self.session.get(endpoint, params=params)
        
        if not data:
            return []
            
        # Normalize to list of stocks
        if isinstance(data, dict):
            # Case 1: {"data": [...]} (Standard)
            if "data" in data:
                return data["data"]
            # Case 2: {"NIFTY": {"data": [...]}} or {"NIFTY": [...]} (Variations)
            elif "NIFTY" in data:
                nifty_val = data["NIFTY"]
                if isinstance(nifty_val, dict) and "data" in nifty_val:
                    return nifty_val["data"]
                elif isinstance(nifty_val, list):
                    return nifty_val
        
        # Case 3: List directly
        if isinstance(data, list):
            return data

        return []

    def fetch_nifty_total_market(self, indices_obj):
        """
        Fetch NIFTY 500 (Total Market).
        """
        return indices_obj.fetch_index("NIFTY 500")

    def fetch_historical_data(self, symbol: str, days=50):
        """
        Fetch historical candle data (daily) for a symbol to calc technicals.
        Endpoint: /api/chart-databyindex?index={SYMBOL}&indices=true/false
        NOTE: For stocks, index is the symbol itself.
        """
        log_info(f"Fetching History for {symbol} ({days} days)...")
        # Can use chart-databyindex or other endpoints. 
        # Usually: /api/chart-databyindex?index={symbol}
        # Note: Pre-market or indices might behave differently.
        endpoint = "/api/chart-databyindex"
        params = {"index": symbol}
        
        data = self.session.get(endpoint, params=params)
        
        # Structure: { "grapthData": [ [timestamp, open, high, low, close, volume], ... ] }
        if data and "grapthData" in data:
            candles = data["grapthData"]
            # We need at least 'days' candles. 
            # The API might return intraday or daily depending on request/time.
            # Assuming daily/long-term API or filtering.
            # For simplicity, if we get intraday, we might need to resample, but let's assume
            # we get enough history for daily calc if we just take the close prices.
            
            # Actually, `chart-databyindex` usually gives intraday data for TODAY.
            # For historical daily data, we might need `/api/historical/cm/equity` (requires parsing HTML).
            # ALTERNATIVE: Use 1-year chart endpoint? 
            # /api/chart-databyindex?index=RELIANCE&type=symbol
            
            # Let's try to extract Close prices.
            # Convert to list of close prices
            closes = [c[4] for c in candles] # index 4 is usually Close
            return closes
        
        return []

    def fetch_nifty500_list(self):
        """
        Fetch NIFTY 500 list from NSE CSV to get Sector/Industry mapping.
        Returns: { symbol: sector_name }
        """
        url = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"
        log_info(f"Fetching NIFTY 500 CSV for Sector Data...")
        
        try:
            # Bypass the wrapper which EXPECTS JSON and use the underlying session
            response = self.session.session.get(url, headers=self.session.headers)
            
            if response.status_code == 200:
                csv_text = response.text
                reader = csv.DictReader(io.StringIO(csv_text))
                
                sector_map = {}
                for row in reader:
                    symbol = row.get("Symbol")
                    industry = row.get("Industry")
                    if symbol and industry:
                        sector_map[symbol] = industry
                
                log_success(f"Loaded Sector Map for {len(sector_map)} stocks")
                return sector_map
            else:
                log_error(f"Failed to fetch NIFTY 500 CSV: {response.status_code}")
                return {}
        except Exception as e:
            log_error(f"Error fetching NIFTY 500 CSV: {e}")
            return {}
