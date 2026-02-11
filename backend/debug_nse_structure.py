
from nse_session import NSESession
from nse_equity import NSEEquity
import json

try:
    session = NSESession()
    equity = NSEEquity(session)

    print("Fetching NIFTY 500...")
    data = equity.fetch_nifty_total_market()
    
    if data and "data" in data and len(data["data"]) > 0:
        first_item = data["data"][0]
        print("First item keys:", first_item.keys())
        print("First item sample:", json.dumps(first_item, indent=2))
        
        # Check for sector/industry
        if "sector" in first_item:
            print("Sector found:", first_item["sector"])
        elif "industry" in first_item:
            print("Industry found:", first_item["industry"])
        elif "meta" in first_item and "industry" in first_item["meta"]:
             print("Meta Industry found:", first_item["meta"]["industry"])
        else:
            print("No obvious sector field found in bulk list.")
            
    else:
        print("No data found or empty list.")

except Exception as e:
    print(f"Error: {e}")
