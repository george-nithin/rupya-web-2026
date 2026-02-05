import time
import datetime
import sys
from nse_session import NSESession
from nse_equity import NSEEquity
from nse_indices import NSEIndices
from nse_options import NSEOptions
from supabase_manager import SupabaseManager
from technical_analysis import TechnicalAnalysis
from utils import log_info, log_error, sleep_random, log_success

def is_market_hours():
    """Check if current time is within 09:00 to 16:00 IST"""
    # Get current time in UTC and adjust to IST (+5:30)
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ist_offset = datetime.timedelta(hours=5, minutes=30)
    now_ist = now_utc + ist_offset
    
    # Check weekday (0=Monday, 6=Sunday)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False
        
    start_time = now_ist.replace(hour=9, minute=0, second=0, microsecond=0)
    end_time = now_ist.replace(hour=16, minute=0, second=0, microsecond=0)
    
    return start_time <= now_ist <= end_time

def main():
    log_info("Starting NSE Backend Orchestrator 🚀")
    
    # Check for --once flag for GitHub Actions / Cron
    run_once = "--once" in sys.argv
    
    # 1. Initialize Components
    session = NSESession()
    equity = NSEEquity(session)
    indices = NSEIndices(session)
    options = NSEOptions(session)
    db = SupabaseManager()
    
    cycle_counter = 0
    # Every 10 iterations = ~20 seconds for slow lane
    SLOW_LANE_INTERVAL = 10 

    while True:
        # Check market hours (unless running a single manual cycle)
        if not is_market_hours() and not run_once:
            log_info("Outside Market Hours (09:00 - 16:00 IST). Sleeping for 5 minutes...")
            time.sleep(300)
            continue

        cycle_start_time = time.time()
        try:
            log_info(f"\n--- Starting Fetch Cycle (Iter {cycle_counter}) ---")
            
            # ==========================================
            # FAST LANE (Runs EVERY Cycle - Target: 2s)
            # ==========================================
            # A. INDICES (NIFTY 50, BANKNIFTY, etc.)
            indices_data = indices.fetch_all_indices()
            if indices_data:
                db.upsert_indices(indices_data)
                log_success(f"Updated {len(indices_data)} indices")

            # C. MARKET MOVERS (Gainers/Losers)
            try:
                gainers = equity.fetch_top_gainers()
                if gainers and "data" in gainers:
                    db.upsert_top_movers(gainers["data"], "gainer")
                
                losers = equity.fetch_top_losers()
                if losers and "data" in losers:
                    db.upsert_top_movers(losers["data"], "loser")
            except Exception as e:
                log_error(f"Error updating movers: {e}")
            
            # ==========================================
            # SLOW LANE (Runs every N cycles)
            # ==========================================
            if cycle_counter % SLOW_LANE_INTERVAL == 0:
                log_info("--- Entering Slow Lane ---")
                
                # B. EQUITIES (ALL STOCKS via NIFTY 500)
                market_wide_data = equity.fetch_nifty_total_market()
                if market_wide_data and "data" in market_wide_data:
                    db.upsert_equities_bulk(market_wide_data["data"])
                    log_success(f"Updated {len(market_wide_data['data'])} stocks (NIFTY 500)")
                
                # D. OPTION CHAINS
                for index_symbol in ["NIFTY", "BANKNIFTY"]:
                    try:
                        oc_data = options.fetch_option_chain(index_symbol, is_index=True)
                        if oc_data:
                             db.upsert_option_chain(oc_data)
                    except Exception as e:
                        log_error(f"Error fetching OC for {index_symbol}: {e}")
                
                log_info("--- Slow Lane Complete ---")
            
            elapsed = time.time() - cycle_start_time
            sleep_duration = max(0, 2.0 - elapsed) # Target 2.0s cycle
            
            if not run_once:
                log_info(f"Cycle took {elapsed:.2f}s. Sleeping for {sleep_duration:.2f}s...")
                time.sleep(sleep_duration) 
            
            cycle_counter += 1 
            
            if run_once:
                log_info("Single cycle complete. Exiting (GitHub Actions Mode).")
                break
                
        except KeyboardInterrupt:
            log_info("Stopping Backend...")
            break
        except Exception as e:
            log_error(f"Cycle Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
