import pandas as pd
from nse_session import NSESession
from utils import log_info, log_error

class NSEOptions:
    def __init__(self, session: NSESession):
        self.session = session

    def fetch_option_chain(self, symbol: str, is_index=True):
        """
        Fetch Option Chain for Index or Equity.
        Endpoint: /api/option-chain-indices?symbol=NIFTY
                  /api/option-chain-equities?symbol=RELIANCE
        """
        log_info(f"Fetching Option Chain for {symbol}...")
        
        if is_index:
            endpoint = "/api/option-chain-indices"
        else:
            endpoint = "/api/option-chain-equities"
            
        # NSE is strict about Referer for Option Chain
        self.session.headers.update({
            "Referer": "https://www.nseindia.com/option-chain"
        })
        
        params = {"symbol": symbol}
        data = self.session.get(endpoint, params=params)
        
        if data and "records" in data:
            records = data["records"]
            expiry_dates = records.get("expiryDates", [])
            underlying_value = records.get("underlyingValue")
            
            # Frontend expects raw NSE structure (records, filtered, etc.)
            # We inject 'symbol' for DB upsert requirements
            data["symbol"] = symbol
            return data
        
        if data:
            log_error(f"Option Chain Data Missing 'records'. Keys: {list(data.keys())}")
        
        log_error(f"Failed to fetch Option Chain for {symbol}")
        return None

    def fetch_oi_spurts(self):
        """
        Fetch OI Spurts (Rise in OI/Price, etc.)
        Endpoint: /api/live-analysis-oi-spurts-contracts
        """
        log_info("Fetching OI Spurts...")
        endpoint = "/api/live-analysis-oi-spurts-contracts"
        return self.session.get(endpoint)
