
import time
import yfinance as yf
import pandas as pd
import io
import math
import random

from nse_session import NSESession
from nse_options import NSEOptions
from dhan_client import DhanClient
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success
from curl_cffi import requests
import technical_analysis as ta

# Configuration
NIFTY_500_URL = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"

# Map to common YF indices
INDICES_MAP = {
    "^NSEI": "NIFTY 50",
    "^NSEBANK": "NIFTY BANK",
    "^BSESN": "SENSEX",
    "^CNXIT": "NIFTY IT",
    "^CNXAUTO": "NIFTY AUTO",
    "^CNXENERGY": "NIFTY ENERGY",
    "^CNXFMCG": "NIFTY FMCG",
    "^CNXMETAL": "NIFTY METAL",
    "^CNXPHARMA": "NIFTY PHARMA",
    "^CNXREALTY": "NIFTY REALTY"
}

def sanitize_value(val):
    try:
        if pd.isna(val) or val is None or math.isinf(float(val)):
            return 0
        return float(val)
    except:
        return 0

class MarketEngine:
    def __init__(self):
        self.db = SupabaseManager()
        self.nse_session = NSESession()
        self.nse_options = NSEOptions(self.nse_session)
        self.dhan_client = DhanClient()

    def fetch_indices(self):
        """Fetch and Upsert Major Indices"""
        log_info("Fetching Major Indices...")
        symbols = list(INDICES_MAP.keys())
        
        try:
            # yfinance download
            data = yf.download(symbols, period="1d", group_by='ticker', progress=False)
            updates = []
            
            for sym, name in INDICES_MAP.items():
                try:
                    # Check if data exists in multi-index DF
                    if len(symbols) > 1:
                        if sym not in data.columns.levels[0]: 
                            continue
                        df = data[sym]
                    else:
                        df = data
                    
                    if df.empty: continue
                    
                    latest = df.iloc[-1]
                    price = sanitize_value(latest['Close'])
                    open_p = sanitize_value(latest['Open'])
                    high = sanitize_value(latest['High'])
                    low = sanitize_value(latest['Low'])
                    
                    change = price - open_p # Approx change
                    p_change = (change / open_p * 100) if open_p > 0 else 0
                    
                    if price > 0:
                        updates.append({
                            "index": name,
                            "last": price,
                            "change": round(change, 2),
                            "pChange": round(p_change, 2),
                            "open": open_p,
                            "high": high,
                            "low": low,
                            "previousClose": 0 
                        })
                except Exception as e:
                    # log_error(f"Index {sym} error: {e}")
                    continue

            if updates:
                self.db.upsert_indices(updates)
                log_success(f"Upserted {len(updates)} Indices")
                
        except Exception as e:
            log_error(f"Failed to fetch indices: {e}")

    def fetch_market_sentiment(self):
        """Fetch India VIX"""
        try:
            vix = yf.Ticker("^INDIAVIX")
            hist = vix.history(period="1d")
            if not hist.empty:
                val = hist['Close'].iloc[-1]
                
                status = "Neutral"
                if val < 12: status = "Complacency"
                elif val > 20: status = "Fear"
                elif val > 30: status = "Extreme Fear"
                
                self.db.upsert_market_sentiment({
                    "metric_name": "fear_index",
                    "value": round(val, 2),
                    "status": status
                })
                log_success(f"Updated VIX: {val}")
        except Exception as e:
             log_error(f"VIX error: {e}")

    def fetch_option_chains(self):
        """Fetch Option Chains for NIFTY/BANKNIFTY using Dhan API"""
        log_info("Fetching Option Chains (Dhan API)...")
        if not self.dhan_client.dhan:
             log_error("Dhan Client not initialized (check .env credentials)")
             return

        for symbol in ["NIFTY", "BANKNIFTY"]:
            try:
                data = self.dhan_client.fetch_option_chain(symbol)
                if data:
                    self.db.upsert_option_chain(data)
                    log_success(f"Upserted Option Chain for {symbol}")
            except Exception as e:
                log_error(f"Option Chain {symbol} error: {e}")

    def fetch_nifty500_stocks(self):
        """Fetch NIFTY 500 Stocks and compute Top Movers"""
        log_info("Fetching NIFTY 500 List...")
        
        stock_map = {}
        
        # 1. Get List from NSE (fallback to hardcoded/DB if fail)
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.nseindia.com/products/content/equities/indices/nifty_500.htm",
            }
            session = requests.Session(impersonate="chrome110")
            session.get("https://www.nseindia.com", headers=headers, timeout=10)
            time.sleep(1)
            response = session.get(NIFTY_500_URL, headers=headers, timeout=15)
            
            if response.status_code == 200:
                df_list = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
                stock_map = {row['Symbol']: {"sector": row['Industry'], "name": row['Company Name']} for i, row in df_list.iterrows()}
            else:
                log_error("Failed to fetch NIFTY 500 CSV")
                return []

        except Exception as e:
            log_error(f"CSV fetch error: {e}")
            return []

        tickers = [f"{s}.NS" for s in stock_map.keys()]
        all_stock_data = [] # List of dicts for movers calculation
        
        # 2. Batch Download
        batch_size = 50 
        total_batches = (len(tickers) + batch_size - 1) // batch_size
        
        for i in range(0, len(tickers), batch_size):
            batch = tickers[i:i+batch_size]
            
            try:
                data = yf.download(batch, period="1d", group_by='ticker', progress=False, threads=True)
                batch_updates = [] # For DB upsert
                
                for t in batch:
                    sym = t.replace('.NS', '')
                    
                    try:
                        if len(batch) > 1:
                            if t not in data.columns.levels[0]: continue
                            df = data[t]
                        else:
                            df = data
                            
                        if df.empty: continue
                        latest = df.iloc[-1]
                        
                        price = sanitize_value(latest['Close'])
                        open_p = sanitize_value(latest['Open'])
                        high = sanitize_value(latest['High'])
                        low = sanitize_value(latest['Low'])
                        vol = sanitize_value(latest['Volume'])
                        
                        if price == 0: continue

                        change = price - open_p
                        p_change = (change / open_p * 100) if open_p > 0 else 0
                        
                        # Prepare dict for bulk upsert
                        # Matches SupabaseManager.upsert_equities_bulk expectations
                        # keys: symbol, companyName, lastPrice, change, pChange, open, dayHigh, dayLow, totalTradedVolume, sector
                        
                        stock_obj = {
                            "symbol": sym,
                            "companyName": stock_map[sym]["name"],
                            "sector": stock_map[sym]["sector"],
                            "lastPrice": price,
                            "change": round(change, 2),
                            "pChange": round(p_change, 2),
                            "open": open_p,
                            "dayHigh": high,
                            "dayLow": low,
                            "totalTradedVolume": int(vol),
                            "description": stock_map[sym]["sector"] # Extra
                        }
                        
                        batch_updates.append(stock_obj)
                        all_stock_data.append(stock_obj)
                        
                    except Exception as inner_e: 
                        continue
                
                # Upsert batch
                if batch_updates:
                    self.db.upsert_equities_bulk(batch_updates)
                    
            except Exception as e:
                log_error(f"Batch Error: {e}")
            
            # Rate limit
            time.sleep(1)

        log_success(f"Updated {len(all_stock_data)} Stocks")
        return all_stock_data

    def derive_and_update_movers(self, all_data):
        """Derive Top Gainers/Losers from fetched data"""
        if not all_data: return
        
        # Sort by pChange
        # key "pChange" is used in all_data dict above
        sorted_data = sorted(all_data, key=lambda x: x['pChange'], reverse=True)
        
        gainers = sorted_data[:10]
        losers = sorted_data[-10:]
        losers.reverse() # Most negative first
        
        # Format for DB (upsert_top_movers expects: symbol, ltp, netPrice, pChange)
        
        g_payload = [{
            "symbol": x["symbol"],
            "ltp": x["lastPrice"],
            "netPrice": x["change"],
            "pChange": x["pChange"]
        } for x in gainers]
        
        l_payload = [{
            "symbol": x["symbol"],
            "ltp": x["lastPrice"],
            "netPrice": x["change"],
            "pChange": x["pChange"]
        } for x in losers]
        
        self.db.upsert_top_movers(g_payload, "gainer")
        self.db.upsert_top_movers(l_payload, "loser")
        log_success("Updated Top Movers")

    def derive_and_update_fno_movers(self, all_data):
        """
        Derive F&O Movers & Buildups from stock data.
        Since we don't have real-time OI for all 500 stocks without paid API,
        we will simulate OI change based on Volume to demonstrate the Buildup feature.
        """
        if not all_data: return
        
        fno_updates = []
        
        for stock in all_data:
            # Simulate OI Change for Demo (Real logic would use fetch_option_chain for each stock)
            # We use Volume as a proxy for "Activity" and randomize direction
            vol = stock['totalTradedVolume']
            price_change = stock['pChange']
            
            # Simulated OI Change (-15% to +15%)
            oi_change_pct = round(random.uniform(-15, 15), 2)
            
            # Logic for Buildup
            buildup = "Neutral"
            if price_change > 0 and oi_change_pct > 0:
                buildup = "Long Buildup"
            elif price_change < 0 and oi_change_pct > 0:
                buildup = "Short Buildup"
            elif price_change < 0 and oi_change_pct < 0:
                buildup = "Long Unwinding"
            elif price_change > 0 and oi_change_pct < 0:
                buildup = "Short Covering"
                
            fno_updates.append({
                "symbol": stock['symbol'],
                "ltp": stock['lastPrice'],
                "change": stock['change'],
                "percent_change": stock['pChange'],
                "open_interest": int(vol * random.uniform(0.1, 0.5)), # Simulated OI
                "oi_change": int(vol * (oi_change_pct/100) * 0.1),
                "oi_percent_change": oi_change_pct,
                "buildup": buildup,
                "sector": stock['sector']
            })
            
        if fno_updates:
            self.db.upsert_fno_movers(fno_updates)
            log_success(f"Updated {len(fno_updates)} F&O Movers")

    def update_technical_analysis(self, stock_list):
        """
        Fetch historical data and update Technical Signals, Performance & Recommendations.
        stock_list: List of dicts with 'symbol' key.
        """
        if not stock_list: return
        log_info("Starting Technical Analysis & Recommendations Update...")
        
        symbols = [s['symbol'] + ".NS" for s in stock_list]
        total = len(symbols)
        # Process in smaller batches to avoid yfinance timeouts
        batch_size = 20 
        
        tech_updates = []
        perf_updates = []
        rec_updates = []
        
        for i in range(0, total, batch_size):
            batch = symbols[i:i+batch_size]
            try:
                # Fetch 1y history for TA and Performance
                data = yf.download(batch, period="1y", group_by='ticker', progress=False, threads=True)
                
                for ticker in batch:
                    sym = ticker.replace('.NS', '')
                    try:
                        if len(batch) > 1:
                            if ticker not in data.columns.levels[0]: continue
                            df = data[ticker]
                        else:
                            df = data
                        
                        # Clean DF
                        df = df.dropna(subset=['Close'])
                        if df.empty or len(df) < 50: continue
                        
                        # Calculate Indicators
                        rsi = ta.calculate_rsi(df['Close'])
                        macd, signal, hist = ta.calculate_macd(df['Close'])
                        ema_20 = ta.calculate_ema(df['Close'], 20)
                        sma_50 = ta.calculate_sma(df['Close'], 50)
                        sma_200 = ta.calculate_sma(df['Close'], 200)
                        pattern = ta.identify_candlestick_pattern(df)
                        sig_type = ta.get_signal_type(rsi, macd, signal)
                        
                        tech_updates.append({
                            "symbol": sym,
                            "rsi_14": round(rsi, 2) if rsi else None,
                            "macd_value": round(macd, 2) if macd else None,
                            "macd_signal": round(signal, 2) if signal else None,
                            "macd_histogram": round(hist, 2) if hist else None,
                            "ema_20": round(ema_20, 2) if ema_20 else None,
                            "sma_50": round(sma_50, 2) if sma_50 else None,
                            "sma_200": round(sma_200, 2) if sma_200 else None,
                            "candlestick_pattern": pattern,
                            "signal_type": sig_type
                        })
                        
                        # Calculate Performance
                        rets = ta.calculate_returns(df)
                        perf_updates.append({
                            "symbol": sym,
                            "return_1w": rets.get("1W"),
                            "return_1m": rets.get("1M"),
                            "return_3m": rets.get("3M"),
                            "return_6m": rets.get("6M"),
                            "return_1y": rets.get("1Y"), 
                            "return_5y": rets.get("5Y") 
                        })

                        # GENERATE RECOMMENDATIONS based on Technicals
                        # Simple Logic: RSI Extremes + Trend
                        current_price = df['Close'].iloc[-1]
                        rec_type = "HOLD"
                        if rsi and rsi < 30:
                            rec_type = "BUY"
                            target = current_price * 1.05
                            stoploss = current_price * 0.98
                            conviction = "High"
                        elif rsi and rsi > 70:
                            rec_type = "SELL"
                            target = current_price * 0.95
                            stoploss = current_price * 1.02
                            conviction = "Medium"
                        
                        if rec_type != "HOLD":
                            rec_updates.append({
                                "symbol": sym,
                                "recommendation_type": rec_type,
                                "timeframe": "Short Term",
                                "entry_price": round(current_price, 2),
                                "target_price": round(target, 2),
                                "stop_loss": round(stoploss, 2),
                                "conviction": conviction,
                                "active": True
                            })
                        
                    except Exception as inner_e:
                        continue
                        
            except Exception as e:
                log_error(f"TA Batch Error: {e}")
            
            # Upsert Batches
            if tech_updates:
                self.db.upsert_technical_signals(tech_updates)
                tech_updates = []
            if perf_updates:
                self.db.upsert_stock_performance(perf_updates)
                perf_updates = []
            if rec_updates:
                self.db.upsert_recommendations(rec_updates)
                rec_updates = []
                
            time.sleep(0.5) # rate limit
            
        log_success("Technical Analysis & Recommendations Update Complete.")

    def run(self):
        log_info("Starting Market Engine (yfinance + NSE Hybrid) 🚀")
        
        # 1. Indices
        self.fetch_indices()
        
        # 2. Sentiment (VIX)
        self.fetch_market_sentiment()
        
        # 3. Option Chains (NSE Direct)
        # self.fetch_option_chains() # Skip for now if Dhan not configured or slow
        
        # 4. Stocks & Movers & F&O Data
        stocks = self.fetch_nifty500_stocks()
        if stocks:
            self.derive_and_update_movers(stocks)
            # New Step: Derived F&O Data
            self.derive_and_update_fno_movers(stocks)
            
            # 5. Technicals, Performance & Recommendations
            self.update_technical_analysis(stocks)
            
        log_success("Market Cycle Complete.")

if __name__ == "__main__":
    engine = MarketEngine()
    engine.run()
