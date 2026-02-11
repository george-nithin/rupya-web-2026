
from nse_session import NSESession
from utils import log_info, log_error
from curl_cffi import requests

try:
    # Manual Session Setup for Debugging
    session = NSESession()
    
    # Override with Safari
    log_info("Overriding session with Safari impersonation...")
    session.session = requests.Session(impersonate="safari15_3")
    session.headers["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15"
    session.session.headers.update(session.headers)
    
    # Initialize Cookies with new session
    session._initialize_cookies()
    
    # 1. Visit Option Chain Page first
    log_info("Visiting Option Chain Page...")
    session.session.get("https://www.nseindia.com/option-chain")
    
    # 2. Update Referer
    session.session.headers.update({"Referer": "https://www.nseindia.com/option-chain"})
    
    # 3. Call API for Equity (Start with Equity as it's often easier)
    # url = "https://www.nseindia.com/api/option-chain-equities?symbol=RELIANCE"
    # Call API for Index
    url = "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY"
    
    log_info(f"Fetching: {url}")
    
    response = session.session.get(url)
    
    log_info(f"Status: {response.status_code}")
    log_info(f"Response Len: {len(response.text)}")
    if len(response.text) < 1000:
        print("Full Response:")
        print(response.text)
    else:
        print("Response starts with:")
        print(response.text[:200])

except Exception as e:
    log_error(f"Error: {e}")
