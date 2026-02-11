from curl_cffi import requests
from bs4 import BeautifulSoup
from utils import log_info, log_error, log_success
import time
import random

class ScreenerFetcher:
    def __init__(self):
        self.base_url = "https://www.screener.in/company/{symbol}/consolidated/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }

    def fetch_fundamentals(self, symbol: str):
        """
        Fetch fundamental data from Screener.in for a given symbol.
        """
        url = self.base_url.format(symbol=symbol)
        log_info(f"Fetching Fundamentals for {symbol} from Screener.in...")
        
        # List of browser versions to try
        browsers = ["chrome110", "chrome120", "safari15_3"]
        
        for browser in browsers:
            try:
                # Random delay to be polite
                time.sleep(random.uniform(1.0, 3.0))
                
                log_info(f"Trying with {browser}...")
                response = requests.get(url, impersonate=browser, timeout=30)
                
                if response.status_code == 200:
                    return self._parse_html(symbol, response.text)
                elif response.status_code == 404:
                    # Try standalone URL if consolidated fails
                    url_alt = f"https://www.screener.in/company/{symbol}/"
                    response = requests.get(url_alt, impersonate=browser, timeout=30)
                    if response.status_code == 200:
                        return self._parse_html(symbol, response.text)
                    else:
                        break # If 404 on both, it's likely invalid symbol
                
                log_error(f"Failed to fetch {symbol} with {browser}: Status {response.status_code}")
                
            except Exception as e:
                log_error(f"Error fetching {symbol} with {browser}: {e}")
                
        return None

    def _parse_html(self, symbol, html_content):
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            data = {
                "symbol": symbol,
                "pros": [],
                "cons": []
            }
            
            # Extract Top Ratios
            top_ratios = soup.select("#top-ratios li")
            for li in top_ratios:
                name_el = li.select_one(".name")
                value_el = li.select_one(".value")
                
                if name_el and value_el:
                    name = name_el.text.strip()
                    value = value_el.text.strip()
                    
                    # Map to DB keys
                    if "Market Cap" in name: data["market_cap"] = value
                    elif "Current Price" in name: data["current_price"] = value
                    elif "High / Low" in name: data["high_low"] = value
                    elif "Stock P/E" in name: data["stock_pe"] = value
                    elif "Book Value" in name: data["book_value"] = value
                    elif "Dividend Yield" in name: data["dividend_yield"] = value
                    elif "ROCE" in name: data["roce"] = value
                    elif "ROE" in name: data["roe"] = value
                    elif "Face Value" in name: data["face_value"] = value

            # Extract Pros
            pros_section = soup.select(".pros ul li")
            if pros_section:
                data["pros"] = [li.text.strip() for li in pros_section]

            # Extract Cons
            cons_section = soup.select(".cons ul li")
            if cons_section:
                data["cons"] = [li.text.strip() for li in cons_section]
                
            log_success(f"Parsed Fundamentals for {symbol}")
            return data
            
        except Exception as e:
            log_error(f"Error parsing HTML for {symbol}: {e}")
            return None

if __name__ == "__main__":
    fetcher = ScreenerFetcher()
    data = fetcher.fetch_fundamentals("COASTCORP")
    import json
    print(json.dumps(data, indent=2))
