
from nse_session import NSESession
from nse_options import NSEOptions
from utils import log_info, log_error

try:
    session = NSESession()
    options = NSEOptions(session)
    
    log_info("Fetching NIFTY Option Chain (Raw)...")
    url = "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY"
    response = session.session.get(url, headers=session.headers)
    
    log_info(f"Status Code: {response.status_code}")
    log_info(f"Response Headers: {response.headers}")
    if response.status_code == 200:
        log_info("Success! Data received.")
        print(str(response.json())[:200])
    else:
        log_error(f"Failed. Response: {response.text[:500]}")

except Exception as e:
    log_error(f"Exception: {e}")
