from curl_cffi import requests
import config
from utils import log_error, log_info, log_warning, sleep_random
import time

class NSESession:
    def __init__(self):
        # use curl_cffi Session for TLS impersonation
        self.session = requests.Session(impersonate="chrome110")
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE",
        }
        self.session.headers.update(self.headers)
        
        # Initialize Cookies
        self._initialize_cookies()

    def _initialize_cookies(self):
        """
        Hit the NSE homepage to establish session cookies.
        """
        try:
            log_info("Initializing NSE Session & Cookies (curl_cffi)...")
            response = self.session.get(config.NSE_BASE_URL, timeout=config.NSE_TIMEOUT)
            if response.status_code == 200:
                log_info("✅ Cookies established.")
            else:
                log_error(f"Failed to initialize cookies: {response.status_code}")
        except Exception as e:
            log_error(f"Cookie initialization failed: {e}")

    def get(self, endpoint, params=None):
        """
        Wrapper for session.get with checks for 401/403 and re-initialization.
        """
        url = f"{config.NSE_BASE_URL}{endpoint}"
        
        try:
            sleep_random(config.DELAY_MIN, config.DELAY_MAX)
            response = self.session.get(url, params=params, timeout=config.NSE_TIMEOUT)
            
            # Handle Session Expiry (401/403)
            if response.status_code in [401, 403]:
                log_warning(f"Session expired or blocked ({response.status_code}). Re-initializing...")
                self._initialize_cookies()
                sleep_random(config.DELAY_MIN, config.DELAY_MAX)
                # Retry once
                response = self.session.get(url, params=params, timeout=config.NSE_TIMEOUT)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                log_error("Rate Limit Hit (429). Backing off for 10s...")
                time.sleep(10)
                return None
            else:
                log_error(f"Request failed: {url} | Status: {response.status_code}")
                return None

        except Exception as e:
            # curl_cffi might raise different exceptions, general catch is safer for specific 403 logic
            log_error(f"Exception during GET {url}: {e}")
            return None
