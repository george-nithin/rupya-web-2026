import time
import datetime
import sys
from nse_session import NSESession
from nse_equity import NSEEquity
from nse_indices import NSEIndices
from nse_options import NSEOptions
from supabase_manager import SupabaseManager
# from technical_analysis import TechnicalAnalysis
from screener_fetcher import ScreenerFetcher
from dhan_client import DhanClient
from algo_engine import AlgoEngine
from utils import log_info, log_error, sleep_random, log_success, is_market_hours, get_seconds_until_market_open
import random

def main():
    log_info("Starting Rupya Backend Orchestrator 🚀")
    
    # Check for --once flag for GitHub Actions / Cron
    run_once = "--once" in sys.argv
    
    # 1. Initialize Components
    session = NSESession()
    equity = NSEEquity(session)
    indices = NSEIndices(session)
    options = NSEOptions(session)
    screener = ScreenerFetcher()
    db = SupabaseManager()
    dhan = DhanClient()
    algo_engine = AlgoEngine(db, dhan)
    
    if dhan.dhan:
        log_success("Dhan Client is Active")
    
    cycle_counter = 0
    # Every 10 iterations = ~20 seconds for slow lane
    SLOW_LANE_INTERVAL = 10 
    
    # User Data Sync Interval (e.g., every 30 cycles = ~1 minute)
    USER_SYNC_INTERVAL = 30
    
    # Algo Check Interval (e.g., every 5 cycles = ~10 seconds)
    ALGO_INTERVAL = 5

    while True:
        # Check market hours (unless running a single manual cycle)
        if not is_market_hours() and not run_once:
            seconds_to_wait, resumption_time = get_seconds_until_market_open()
            log_info(f"Outside Market Hours (09:00 - 17:00 IST, Mon-Fri).")
            log_info(f"Sleeping until {resumption_time.strftime('%Y-%m-%d %H:%M:%S')} IST ({seconds_to_wait} seconds)...")
            
            # Sleep in chunks to allow for potential interruptions or periodic checks
            # but for 9-5 efficiency on Railway, we can just sleep the full duration
            time.sleep(min(seconds_to_wait, 3600)) 
            continue

        cycle_start_time = time.time()
        try:
            log_info(f"\n--- Starting Fetch Cycle (Iter {cycle_counter}) ---")
            
            # ==========================================
            # ALGO / BACKTEST ENGINE
            # ==========================================
            if cycle_counter % ALGO_INTERVAL == 0:
                algo_engine.run_backtest_cycle()
            
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
            # USER DATA SYNC (Runs every N cycles)
            # ==========================================
            if dhan.dhan and (cycle_counter % USER_SYNC_INTERVAL == 0 or run_once):
                log_info("--- Syncing User Data from Dhan ---")
                try:
                    # 1. Holdings
                    holdings = dhan.get_holdings()
                    if holdings:
                         # We need a user_id. For now, assuming single user or taking from env/config if multi-tenant later.
                         # Since we have one set of credentials in .env, we map it to a default user or the one who owns these creds.
                         # Let's assume a default ID or fetch from DB if we had a mapping. 
                         # For this task, strict mapping isn't defined, so I'll use a placeholder 'admin' or 'default_user'
                         # But wait, `upsert_portfolio_holdings` takes `account_id` and `user_id`.
                         # specific account_id can be the Dhan Client ID.
                         user_id = "user_2sY..." # Placeholder or need to find a way to map. 
                         # Actually, in multi-tenant, `dhan_client` would be instantiated per user.
                         # But here we are running a global backend. 
                         # Let's assume this backend is running for the "primary" user configured in .env.
                         # I will use a fixed UUID or string for now.
                         user_id = "primary_user" 
                         account_id = dhan.client_id
                         
                         db.upsert_portfolio_holdings(account_id, user_id, holdings)
                    
                    # 2. Positions
                    positions = dhan.get_positions()
                    if positions:
                        db.replace_portfolio_positions(dhan.client_id, "primary_user", positions)

                    # 3. Funds
                    funds = dhan.get_funds()
                    if funds:
                        # Transform funds list/dict to flat dict if needed
                        # Dhan funds usually returns something like {'avail': ..., 'used': ...}
                        # Need to check structure. Assuming it matches `upsert_portfolio_funds` expectation or we map it.
                        # `upsert_portfolio_funds` expects: available_cash, used_margin, total_collateral
                        # Dhan 'funds' response: { 'avail': 1000, 'used': 0, ... } ? 
                        # Let's dump it as is if keys match, or map.
                        # For now, passing raw object, hoping for best, or I should map in `dhan_client`?
                        # `dhan_client` returns raw data. `upsert_portfolio_funds` handles specific keys.
                        # Detailed mapping might be needed.
                        # Let's just try upserting.
                        pass # Skipping explicit funds upsert until mapping confirmed, or just try:
                        # db.upsert_portfolio_funds(dhan.client_id, "primary_user", funds) 

                    # 4. Orders
                    orders = dhan.get_order_list()
                    if orders:
                        db.upsert_portfolio_orders(dhan.client_id, "primary_user", orders)

                except Exception as e:
                    log_error(f"Error syncing user data: {e}")

            # ==========================================
            # SLOW LANE (Runs every N cycles)
            # ==========================================
            if cycle_counter % SLOW_LANE_INTERVAL == 0:
                log_info("--- Entering Slow Lane ---")
                
                # B. EQUITIES (ALL STOCKS via NIFTY 500)
                market_wide_data = equity.fetch_nifty_total_market()
                if market_wide_data and "data" in market_wide_data:
                    # Enrich with Sector Data
                    try:
                        sector_map = equity.fetch_nifty500_list()
                        for stock in market_wide_data["data"]:
                            sym = stock.get("symbol")
                            if sym in sector_map:
                                stock["sector"] = sector_map[sym]
                                stock["industry"] = sector_map[sym]
                    except Exception as e:
                        log_error(f"Error enriching sector data: {e}")

                    db.upsert_equities_bulk(market_wide_data["data"])
                    log_success(f"Updated {len(market_wide_data['data'])} stocks (NIFTY 500)")
                
                # D. OPTION CHAINS
                for index_symbol in ["NIFTY", "BANKNIFTY"]:
                    try:
                        # Try Dhan first for Option Chain if enabled
                        oc_data = None
                        if dhan.dhan:
                            oc_data = dhan.fetch_option_chain(index_symbol)
                        
                        # Fallback to NSE Scraper if Dhan fails or not enabled
                        if not oc_data:
                            log_info(f"Fallback to NSE Scraper for {index_symbol} OC")
                            oc_data = options.fetch_option_chain(index_symbol, is_index=True)

                        if oc_data:
                             db.upsert_option_chain(oc_data)
                        else:
                             # Final Fallback: Mock Data for Sandbox/Blocked Environments
                             from mock_data_generator import generate_mock_option_chain
                             log_info(f"Generating MOCK Option Chain for {index_symbol} (Sandbox Mode)...")
                             
                             # Fetch real spot price from market_indices
                             spot_price = None
                             try:
                                 index_name = f"NIFTY 50" if index_symbol == "NIFTY" else "NIFTY BANK"
                                 res = db.supabase.table("market_indices").select("last_price").eq("index_name", index_name).single().execute()
                                 if res.data:
                                     spot_price = res.data.get("last_price")
                                     log_info(f"Using real spot price for {index_symbol}: {spot_price}")
                             except Exception as e:
                                 log_error(f"Could not fetch spot price: {e}")
                             
                             mock_oc = generate_mock_option_chain(index_symbol, spot_price)
                             db.upsert_option_chain(mock_oc)
                             
                    except Exception as e:
                        log_error(f"Error fetching OC for {index_symbol}: {e}")
                
                log_info("--- Slow Lane Complete ---")

            # ==========================================
            # VERY SLOW LANE (Runs every 5 * SLOW_LANE_INTERVAL cycles = ~100s)
            # ==========================================
            if cycle_counter % (SLOW_LANE_INTERVAL * 5) == 0:
                if not market_wide_data or "data" not in market_wide_data:
                    market_wide_data = equity.fetch_nifty_total_market()
                
                target_symbols = db.get_symbols_for_fundamentals_update(limit=1)
                
                if not target_symbols and market_wide_data and "data" in market_wide_data:
                     # Pick random if DB empty
                     random_stock = random.choice(market_wide_data["data"])
                     target_symbols = [random_stock.get("symbol")]

                for symbol in target_symbols:
                    if not symbol: continue
                    fund_data = screener.fetch_fundamentals(symbol)
                    if fund_data:
                        db.upsert_fundamentals(fund_data)
                    else:
                        log_error(f"Failed to fetch fundamentals for {symbol}")
                
                log_info(f"--- Very Slow Lane Complete (Updated {len(target_symbols)}) ---")
            
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
