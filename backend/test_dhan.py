
import sys
import os
from dhan_client import DhanClient
from utils import log_info, log_error, log_success
from datetime import datetime, timedelta

def test_dhan():
    log_info("Testing Dhan Client Phase 2...")
    
    dhan = DhanClient()
    if not dhan.dhan:
        log_error("Dhan Client Init Failed")
        return

    # 1. Test Option Chain
    try:
        log_info("Fetching NIFTY Option Chain...")
        # Assuming NIFTY is mapped to NIFTY in client
        oc = dhan.fetch_option_chain("NIFTY")
        if oc:
            log_success("Option Chain Fetched")
            # print(oc.keys())
        else:
            log_error("Failed to fetch Option Chain")
    except Exception as e:
        log_error(f"Option Chain Test Failed: {e}")

    # 2. Test Historical Data
    try:
        log_info("Fetching Historical Data for TCS (Equity)...")
        # Need to find TCS ID or stick to NIFTY
        # Let's try NIFTY 50 (Index) history
        
        # Mapping symbol 'NIFTY' to ID is handled inside get_historical_data via get_security_id
        # But get_security_id checks 'NIFTY 50' for 'NIFTY' symbol.
        
        start = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
        end = datetime.now().strftime('%Y-%m-%d')
        
        hist = dhan.get_historical_data("NIFTY", exchange='NSE', segment='INDEX', interval='D', start_date=start, end_date=end)
        
        if hist:
            log_success(f"Historical Data Fetched: {len(hist)} records")
        else:
            log_error("Failed to fetch Historical Data")
            
    except Exception as e:
        log_error(f"Historical Data Test Failed: {e}")
        
    # 3. Test Order Placement (Dry Run / Check Method Existence)
    # We won't actually place order, just ensure method exists and args are accepted.
    if hasattr(dhan, 'place_order'):
        log_success("place_order method exists")
    else:
        log_error("place_order method missing")

if __name__ == "__main__":
    test_dhan()
