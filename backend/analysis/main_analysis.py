
import sys
import os
import pandas as pd
import datetime

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nse_session import NSESession
from nse_equity import NSEEquity
from supabase_manager import SupabaseManager
from analysis.market_sentiment import calculate_market_sentiment
from analysis.stock_forecast import calculate_stock_forecast
from utils import log_info, log_error, log_success

def main():
    log_info("Starting Market Analysis...")
    
    # Initialize
    db = SupabaseManager()
    session = NSESession()
    equity_api = NSEEquity(session)
    
    # 1. Market Sentiment (Fear & Greed)
    # Fetch NIFTY 50 history
    log_info("Fetching NIFTY 50 history for sentiment analysis...")
    # fetching raw candles manually to get timestamps
    nifty_symbol = "NIFTY 50"
    
    # We use a hack here: fetch_historical_data in nse_equity returns only closes. 
    # We will try to fetch using the session directly or just use closes if sentiment allows.
    # checking nse_equity.py, it calls /api/chart-databyindex
    
    # Let's try leveraging fetch_historical_data but we need to reconstruct DF
    # Actually, nse_equity.fetch_historical_data returns list of closes.
    # market_sentiment.calculate_market_sentiment expects a DataFrame with 'close'.
    
    nifty_closes = equity_api.fetch_historical_data(nifty_symbol, days=50)
    
    if nifty_closes:
        df_nifty = pd.DataFrame({'close': nifty_closes})
        sentiment_result = calculate_market_sentiment(df_nifty)
        
        # Upsert Sentiment
        db.upsert_market_sentiment(sentiment_result)
    else:
        log_error("Could not fetch stats for NIFTY 50")

    # 2. Stock Forecasts
    # Get list of stocks to analyze. Ideally getting from DB 'market_equity_quotes' 
    # but for now let's just do top 10 Nifty stocks or a manual list to be fast.
    # Or fetch all from DB.
    
    status_response = db.supabase.table("market_equity_quotes").select("symbol").limit(20).execute()
    symbols = [row['symbol'] for row in status_response.data] if status_response.data else []
    
    if not symbols:
        symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"] # Fallback
    
    log_info(f"Forecasting for {len(symbols)} stocks...")
    
    forecasts = []
    
    for symbol in symbols:
        try:
            # history
            closes = equity_api.fetch_historical_data(symbol, days=365)
            if not closes or len(closes) < 30:
                continue
                
            # Create DF with dummy dates since we just need order for regression
            dates = pd.date_range(end=datetime.datetime.today(), periods=len(closes))
            df_stock = pd.DataFrame({'date': dates, 'close': closes})
            
            prediction = calculate_stock_forecast(df_stock, days_to_forecast=252)
            
            if prediction:
                prediction['symbol'] = symbol
                forecasts.append(prediction)
                # log_info(f"Forecast for {symbol}: {prediction['sentiment']} (Upside: {prediction['upside']}%)")
                
        except Exception as e:
            log_error(f"Failed analysis for {symbol}: {e}")
            
    # Upsert Forecasts
    if forecasts:
        db.upsert_stock_forecast(forecasts)
        
    log_success("Market Analysis Complete.")

if __name__ == "__main__":
    main()
