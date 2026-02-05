import time
from nse_session import NSESession
from nse_equity import NSEEquity
from nse_indices import NSEIndices
from nse_options import NSEOptions
from supabase_manager import SupabaseManager
from technical_analysis import TechnicalAnalysis
from utils import log_info, log_error, sleep_random, log_success

def main():
    log_info("Starting NSE Backend Orchestrator 🚀")
    
    # 1. Initialize Components
    session = NSESession()
    equity = NSEEquity(session)
    indices = NSEIndices(session)
    options = NSEOptions(session)
    db = SupabaseManager()
    
    # Symbols to track (Example List) - can be fetched from DB later
    # watchlist = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "SBIN"] 
    
    cycle_counter = 0
    SLOW_LANE_INTERVAL = 3 # Run slow lane every 3 cycles (~ 2-3 seconds if fast lane is ~0.8s)

    while True:
        cycle_start_time = time.time()
        try:
            log_info("\n--- Starting Fetch Cycle ---")
            
            # ==========================================
            # FAST LANE (Runs EVERY Cycle - Target: 2s)
            # ==========================================
            # A. INDICES (NIFTY 50, BANKNIFTY, etc.)
            indices_data = indices.fetch_all_indices()
            if indices_data:
                db.upsert_indices(indices_data)
                log_success(f"Updated {len(indices_data)} indices (Fast Lane)")

            # C. MARKET MOVERS (Gainers/Losers) - Moved to Fast Lane
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
                # 1. Main Market Quote Sync (NIFTY 500 covers most active stocks)
                market_wide_data = equity.fetch_nifty_total_market()
                stocks_list = []
                if market_wide_data and "data" in market_wide_data:
                    stocks_list = market_wide_data["data"]
                    db.upsert_equities_bulk(stocks_list)
                    log_success(f"Updated {len(stocks_list)} stocks (NIFTY 500)")
                
                # 2. Sync Index Constituents for Heatmaps
                indices_to_fetch = ["NIFTY 50", "NIFTY MIDCAP 150", "NIFTY SMALLCAP 250", "NIFTY BANK"]
                for idx_name in indices_to_fetch:
                    idx_data = equity.fetch_index(idx_name)
                    if idx_data and "data" in idx_data:
                        c_stocks = idx_data["data"]
                        c_symbols = [s.get("symbol") for s in c_stocks if s.get("symbol")]
                        
                        # Upsert quotes first to ensure FK integrity
                        db.upsert_equities_bulk(c_stocks) 
                        
                        # Sync Constituents
                        db.upsert_index_constituents(idx_name, c_symbols)
                
                # D. OPTION CHAINS
                for index_symbol in ["NIFTY", "BANKNIFTY"]:
                    try:
                        oc_data = options.fetch_option_chain(index_symbol, is_index=True)
                        if oc_data:
                             db.upsert_option_chain(oc_data)
                    except Exception as e:
                        log_error(f"Error fetching OC for {index_symbol}: {e}")

                # E. TECHNICAL INDICATORS (RSI, MACD)
                # Optimize: Only calculate for a subset or key stocks to avoid rate limiting
                tracking_symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "SBIN", "ICICIBANK", "TATAMOTORS"]
                
                for symbol in tracking_symbols:
                    try:
                        # 1. Fetch History
                        closes = equity.fetch_historical_data(symbol, days=50)
                        if not closes or len(closes) < 30:
                            continue
                            
                        # 2. Calculate Indicators
                        rsi = TechnicalAnalysis.calculate_rsi(closes)
                        macd, signal, hist = TechnicalAnalysis.calculate_macd(closes)
                        sma = TechnicalAnalysis.calculate_sma(closes, period=20)
                        ema = TechnicalAnalysis.calculate_ema(closes, period=20)
                        
                        if rsi:
                            log_info(f"Technicals for {symbol}: RSI={rsi:.2f} MACD={macd:.2f}")
                            
                            # 3. Store
                            tech_data = {
                                "symbol": symbol,
                                "rsi": rsi,
                                "macd": macd,
                                "macd_signal": signal,
                                "macd_hist": hist,
                                "sma": sma,
                                "ema": ema
                            }
                            db.upsert_technicals(tech_data)
                    except Exception as e:
                        log_error(f"Error processing technicals for {symbol}: {e}")
                
                log_info("--- Slow Lane Complete ---")
            else:
                 log_info(f"Skipping Slow Lane (Cycle {cycle_counter % SLOW_LANE_INTERVAL}/{SLOW_LANE_INTERVAL})")

            
            elapsed = time.time() - cycle_start_time
            sleep_duration = max(0, 0.5 - elapsed) # Target 0.5s cycle (requested 0.5-1s)
            log_info(f"Cycle took {elapsed:.2f}s. Sleeping for {sleep_duration:.2f}s...")
            time.sleep(sleep_duration) 
            
            cycle_counter += 1 
            
        except KeyboardInterrupt:
            log_info("Stopping Backend...")
            break
        except Exception as e:
            log_error(f"Cycle Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
