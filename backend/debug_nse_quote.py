
from nse_session import NSESession
from nse_equity import NSEEquity
import json

try:
    session = NSESession()
    equity = NSEEquity(session)

    symbol = "RELIANCE"
    print(f"Fetching Quote for {symbol}...")
    data = equity.fetch_quote(symbol) 
    # fetch_quote in nse_equity.py parses the response. 
    # I want to see the RAW response to see if I missed any fields in the parser.
    # So I will access session directly.
    
    endpoint = "/api/quote-equity"
    params = {"symbol": symbol}
    raw_data = session.get(endpoint, params=params)
    
    if raw_data:
        print("Raw Data Keys:", raw_data.keys())
        if "info" in raw_data:
            print("Info:", json.dumps(raw_data["info"], indent=2))
        if "metadata" in raw_data:
            print("Metadata:", json.dumps(raw_data["metadata"], indent=2))
        if "industryInfo" in raw_data:
            print("IndustryInfo:", json.dumps(raw_data["industryInfo"], indent=2))
            
    else:
        print("No data found.")

except Exception as e:
    print(f"Error: {e}")
