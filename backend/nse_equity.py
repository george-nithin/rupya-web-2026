import pandas as pd
from nse_session import NSESession
from utils import log_info, log_error

class NSEEquity:
    def __init__(self, session: NSESession):
        self.session = session

    def fetch_quote(self, symbol: str):
        """
        Fetch real-time quote for an equity symbol.
        Endpoint: /api/quote-equity?symbol={SYMBOL}
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
            log_error(f"No valid data found for {symbol}")
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

    def fetch_index(self, index_name):
        """
        Fetch stocks for a specific index.
        Endpoint: /api/equity-stockIndices?index={index_name}
        """
        log_info(f"Fetching Index: {index_name}...")
        endpoint = "/api/equity-stockIndices"
        params = {"index": index_name}
        return self.session.get(endpoint, params=params)

    def fetch_nifty_total_market(self):
        """
        Fetch NIFTY 500 (Total Market).
        """
        return self.fetch_index("NIFTY 500")

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
