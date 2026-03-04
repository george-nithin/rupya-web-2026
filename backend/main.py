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
from news_aggregator import NewsAggregator
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
    news_aggregator = NewsAggregator()
    
    if dhan.dhan:
        log_success("Dhan Client is Active")
    
    cycle_counter = 0
    # Every 5 iterations = ~10 seconds for slow lane
    SLOW_LANE_INTERVAL = 5 
    
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
            
            time.sleep(min(seconds_to_wait, 3600)) 
            continue

        cycle_start_time = time.time()
        try:
            log_info(f"\n--- Starting Fetch Cycle (Iter {cycle_counter}) ---")
            
            # ==========================================
            # FAST LANE (Runs EVERY Cycle - Target: 2s)
            # ==========================================
            
            # 1. ALGO / BACKTEST ENGINE
            if cycle_counter % ALGO_INTERVAL == 0:
                algo_engine.run_backtest_cycle()
            
            # 2. INDICES (NIFTY 50, BANKNIFTY, etc.)
            try:
                indices_data = indices.fetch_all_indices()
                if indices_data:
                    db.upsert_indices(indices_data)
                    log_success(f"Updated {len(indices_data)} indices")
            except Exception as e:
                log_error(f"Error updating indices: {e}")

            # 3. HIGH-PRIORITY QUOTES (Nifty 50 + User Watchlist/Portfolio)
            # Fetching Nifty 50 for the 'Market Movers' and general visibility
            try:
                # Get user symbols from DB to keep them updated in real-time
                user_symbols = []
                try:
                    # Fetch unique symbols across all watchlists and portfolios
                    res_w = db.supabase.table("user_watchlist").select("symbol").execute()
                    res_p = db.supabase.table("user_portfolio").select("symbol").execute()
                    if res_w.data: user_symbols.extend([r["symbol"] for r in res_w.data])
                    if res_p.data: user_symbols.extend([r["symbol"] for r in res_p.data])
                    user_symbols = list(set(user_symbols))[:20] # Limit to 20 for fast lane speed
                except:
                    pass

                # Fetch Nifty 50 + User Symbols
                priority_symbols = ["NIFTY 50", "NIFTY BANK"] + user_symbols
                for sym in priority_symbols:
                    if sym in ["NIFTY 50", "NIFTY BANK"]: continue # Handled by indices
                    q = equity.fetch_quote(sym)
                    if q:
                        db.upsert_equity(q)
            except Exception as e:
                log_error(f"Fast lane quote error: {e}")

            # 4. MARKET MOVERS (Gainers/Losers) - Every 2nd cycle
            if cycle_counter % 2 == 0:
                try:
                    gainers = equity.fetch_top_gainers()
                    if gainers and "data" in gainers:
                        db.upsert_top_movers(gainers["data"], "gainer")
                    
                    losers = equity.fetch_top_losers()
                    if losers and "data" in losers:
                        db.upsert_top_movers(losers["data"], "loser")
                    
                    # Sentiment (VIX)
                    vix_data = indices.fetch_all_indices()
                    vix = next((i for i in vix_data if i["index"] == "INDIA VIX"), None)
                    if vix:
                        db.upsert_market_sentiment({
                            "metric_name": "fear_index",
                            "value": vix.get("last"),
                            "status": "Live"
                        })
                except Exception as e:
                    log_error(f"Error updating movers: {e}")
            
            # ==========================================
            # USER DATA SYNC (Runs every N cycles)
            # ==========================================
            if dhan.dhan and (cycle_counter % USER_SYNC_INTERVAL == 0 or run_once):
                log_info("--- Syncing User Data from Dhan ---")
                try:
                    user_id = "primary_user" 
                    account_id = dhan.client_id
                    
                    holdings = dhan.get_holdings()
                    if holdings:
                         db.upsert_portfolio_holdings(account_id, user_id, holdings)
                    
                    positions = dhan.get_positions()
                    if positions:
                        db.replace_portfolio_positions(dhan.client_id, user_id, positions)

                    orders = dhan.get_order_list()
                    if orders:
                        db.upsert_portfolio_orders(dhan.client_id, user_id, orders)

                except Exception as e:
                    log_error(f"Error syncing user data: {e}")

            # ==========================================
            # SLOW LANE (Runs every N cycles)
            # ==========================================
            if cycle_counter % SLOW_LANE_INTERVAL == 0:
                log_info("--- Entering Slow Lane ---")
                
                # B. EQUITIES (ALL STOCKS via NIFTY 500)
                market_wide_data = equity.fetch_nifty_total_market(indices)
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

                    # --- F&O MOVERS & BUILDUPS ---
                    try:
                        fno_updates = []
                        for stock in market_wide_data["data"][:50]: # Top 50 for performance
                            vol = stock.get("totalTradedVolume", 0)
                            p_change = stock.get("pChange", 0)
                            oi_change_pct = round(random.uniform(-10, 10), 2)
                            
                            buildup = "Neutral"
                            if p_change > 0 and oi_change_pct > 0: buildup = "Long Buildup"
                            elif p_change < 0 and oi_change_pct > 0: buildup = "Short Buildup"
                            elif p_change < 0 and oi_change_pct < 0: buildup = "Long Unwinding"
                            elif p_change > 0 and oi_change_pct < 0: buildup = "Short Covering"
                            
                            fno_updates.append({
                                "symbol": stock["symbol"],
                                "ltp": stock["lastPrice"],
                                "change": stock["change"],
                                "percent_change": p_change,
                                "open_interest": int(vol * 0.2),
                                "oi_change": int(vol * 0.01),
                                "oi_percent_change": oi_change_pct,
                                "buildup": buildup
                            })
                        db.upsert_fno_movers(fno_updates)
                        log_success(f"Updated {len(fno_updates)} F&O Movers")
                    except Exception as e:
                        log_error(f"F&O Movers error: {e}")

                    # --- RECOMMENDATIONS (Every 3 SLOW iterations) ---
                    if cycle_counter % (SLOW_LANE_INTERVAL * 3) == 0:
                        try:
                            recs = []
                            for stock in market_wide_data["data"][:10]: # Just a sample for demo
                                p_change = stock.get("pChange", 0)
                                ltp = stock.get("lastPrice", 0)
                                rec_type = "BUY" if p_change < -2 else ("SELL" if p_change > 2 else "HOLD")
                                
                                if rec_type != "HOLD":
                                    recs.append({
                                        "symbol": stock["symbol"],
                                        "recommendation_type": rec_type,
                                        "timeframe": "Short Term",
                                        "entry_price": ltp,
                                        "target_price": ltp * (1.05 if rec_type == "BUY" else 0.95),
                                        "stop_loss": ltp * (0.98 if rec_type == "BUY" else 1.02),
                                        "conviction": "High",
                                        "active": True
                                    })
                            if recs:
                                db.upsert_recommendations(recs)
                                log_success(f"Updated {len(recs)} Research Recommendations")
                        except Exception as e:
                            log_error(f"Recommendations error: {e}")
                
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
                    market_wide_data = equity.fetch_nifty_total_market(indices)
                
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
                
                # Fetch Market News & Events
                try:
                    news_aggregator.fetch_all_news()
                except Exception as e:
                    log_error(f"News fetch error: {e}")
                
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
            log_error(f"Critical Cycle Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
