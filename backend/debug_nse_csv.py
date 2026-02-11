
from nse_session import NSESession
import csv
import io

try:
    session = NSESession()
    url = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"
    print(f"Fetching CSV from {url}...")
    
    # Bypass the wrapper which expects JSON
    response = session.session.get(url, headers=session.headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        csv_text = response.text
        print("CSV Fetched. First 5 lines:")
        lines = csv_text.splitlines()
        for i in range(min(5, len(lines))):
            print(lines[i])
            
        # Parse headers to confirm 'Industry' column
        reader = csv.reader(lines)
        headers = next(reader)
        print("Headers:", headers)
        
    else:
        print("Failed to fetch CSV")

except Exception as e:
    print(f"Error: {e}")
