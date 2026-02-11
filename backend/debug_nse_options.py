from nse_session import NSESession
from nse_options import NSEOptions
from utils import log_info, log_error

def debug_options():
    try:
        session = NSESession()
        
        symbol = "NIFTY"
        log_info(f"Testing Option Chain for {symbol}...")
        
        # Visit Option Chain Page first to set specific cookies
        chain_page = "https://www.nseindia.com/option-chain"
        log_info(f"Visiting {chain_page}...")
        session.session.get(chain_page, timeout=10)
        
        endpoint = "/api/option-chain-indices"
        params = {"symbol": symbol}
        
        # Using the session.session (curl_cffi) directly to inspect
        url = f"https://www.nseindia.com{endpoint}"
        log_info(f"GET {url}")
        
        # Direct call with headers
        response = session.session.get(
            url, 
            params=params, 
            headers={"Referer": "https://www.nseindia.com/option-chain"},
            timeout=10
        )
        
        log_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            log_info(f"Response Text Preview: {response.text[:500]}")
            try:
                data = response.json()
                keys = list(data.keys())
                log_info(f"Response Keys: {keys}")
            except:
                log_error("Failed to parse JSON")
        else:
            log_error(f"Failed. Content: {response.text[:200]}")

    except Exception as e:
        log_error(f"Exception: {e}")

if __name__ == "__main__":
    debug_options()
