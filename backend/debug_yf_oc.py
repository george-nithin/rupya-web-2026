
import yfinance as yf
from utils import log_info, log_error

try:
    symbol = "^NSEI" # NIFTY
    log_info(f"Fetching Option Chain for {symbol} via yfinance...")
    
    tk = yf.Ticker(symbol)
    exps = tk.options
    
    if not exps:
        log_error("No expiry dates found.")
    else:
        log_info(f"Found Expiries: {exps}")
        
        # Fetch first expiry
        expiry = exps[0]
        log_info(f"Fetching data for Expiry: {expiry}")
        
        chain = tk.option_chain(expiry)
        
        log_info(f"Calls: {len(chain.calls)}")
        log_info(f"Puts: {len(chain.puts)}")
        
        if not chain.calls.empty:
            print(chain.calls.head())

except Exception as e:
    log_error(f"Error: {e}")
