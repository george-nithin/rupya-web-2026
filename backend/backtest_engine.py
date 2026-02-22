
import os
import time
import json
import traceback
import pandas as pd
import pandas_ta as ta
import yfinance as yf
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in .env file.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Trading constants
INITIAL_CAPITAL = 100000

def fetch_market_data(symbol="^NSEI", period="1y"):
    """
    Fetch historical data for backtesting.
    """
    print(f"Fetching data for {symbol} over {period}...")
    try:
        df = yf.download(symbol, period=period, progress=False)
        # Flatten MultiIndex columns if present (yfinance 0.2.x behavior)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        
        # Standardize column names to lowercase
        df.columns = [c.lower() for c in df.columns]
        
        # Ensure we have required columns
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in required_cols:
            if col not in df.columns:
                print(f"Missing column: {col}")
                return None
                
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def execute_strategy(code, data):
    """
    Executes the user's custom strategy code.
    returns: A Series of signals ('BUY', 'SELL', 'HOLD')
    WARNING: exec() is used here for demonstration. In production, use a secure sandbox.
    """
    local_scope = {'data': data, 'ta': ta, 'pd': pd, 'np': np}
    signals = []
    
    try:
        # Wrap user code in a function definition if not present, or assume it defines `strategy(data)`
        # For this MVP, we expect the user to define a function `def strategy(data):`
        exec(code, {}, local_scope)
        
        if 'strategy' not in local_scope:
            return None, "Error: 'strategy(data)' function not found in code."
            
        strategy_func = local_scope['strategy']
        
        # Iterate through data to generate signals (Vectorized is better, but row-by-row is easier for custom logic)
        # To make it fast, we can pass the whole dataframe if the strategy is vectorized,
        # otherwise we simulate row by row.
        # Let's try row-by-row simulation for "realistic" backtest (avoiding lookahead bias can be hard for users)
        
        # ACTUALLY, simpler approach for MVP:
        # User code should return a Signal Series or list aligned with Data
        # Let's assume the user code modifies 'data' to add a 'signal' column OR returns a list
        
        # Let's stick to the prompt's example:
        # def strategy(data):
        #    ...
        #    return "BUY" # logic for *current* candle
        
        # We will run this row by row. Slow but correct for this interface.
        print("Running strategy loop...")
        for i in range(len(data)):
             # Pass data up to current index to prevent lookahead
             # Slice is slow, but safe
             window = data.iloc[:i+1]
             if len(window) < 20: # Warmup
                 signals.append("HOLD")
                 continue
                 
             try:
                 sig = strategy_func(window)
                 signals.append(sig)
             except Exception as e:
                 signals.append("HOLD") # On error, hold
                 
        return signals, None
        
    except Exception as e:
        return None, str(e)

def calculate_performance(data, signals):
    """
    Simulates trades based on signals and calculates performance metrics.
    """
    capital = INITIAL_CAPITAL
    position = 0 # 0: Flat, 1: Long, -1: Short (optional)
    equity_curve = []
    trades = []
    entry_price = 0
    
    # Simple Long-Only logic for MVP (Buy/Sell)
    # Transaction costs ignored for simplicity
    
    for i, (index, row) in enumerate(data.iterrows()):
        date_str = index.strftime('%Y-%m-%d')
        price = row['close']
        signal = signals[i] if i < len(signals) else "HOLD"
        
        # Execute orders based on PREVIOUS signal (simulate execution on open of next candle, or close of this one)
        # We'll execute on Close of same candle for simplicity (assuming strategy ran before close)
        
        if position == 0 and signal == "BUY":
            position = 1
            entry_price = price
            trades.append({'type': 'BUY', 'date': date_str, 'price': price, 'capital': capital})
        
        elif position == 1 and signal == "SELL":
            position = 0
            pnl = (price - entry_price) * (capital / entry_price)
            # capital updated
            shares = capital / entry_price
            capital = shares * price
            trades.append({'type': 'SELL', 'date': date_str, 'price': price, 'capital': capital, 'pnl': capital - (shares * entry_price)})
            
        # If position is held, capital fluctuates with price
        current_equity = capital
        if position == 1:
            shares = capital / entry_price # This is fixed at entry
            # Wait, simplified capital tracking: 
            # If invested, equity = shares * current_price
            # If cash, equity = cash
            pass 
        
        # Let's do it properly
        daily_val = capital
        if position == 1:
             shares = (capital / entry_price) # Logic error in loop above, need separate variable for cash vs invested
             # Redoing logic below
             pass

    # -- RESTART SIMULATION LOGIC --
    capital = INITIAL_CAPITAL
    shares = 0
    equity_curve = []
    trades = []
    
    for i, (index, row) in enumerate(data.iterrows()):
        date_str = index.strftime('%Y-%m-%d')
        price = row['close']
        signal = signals[i] if i < len(signals) else "HOLD"
        
        # Calc Equity
        if shares > 0:
            current_equity = shares * price
        else:
            current_equity = capital
            
        equity_curve.append({'date': date_str, 'equity': current_equity})
        
        # Trade Logic
        if shares == 0 and signal == "BUY":
            shares = capital / price
            capital = 0 # All in
            trades.append({'type': 'BUY', 'date': date_str, 'price': price, 'shares': shares})
            
        elif shares > 0 and signal == "SELL":
            capital = shares * price
            trades.append({'type': 'SELL', 'date': date_str, 'price': price, 'shares': shares, 'pnl': capital - (trades[-1]['shares'] * trades[-1]['price'])})
            shares = 0 # All out
            
    # Calculate Metrics
    final_equity = equity_curve[-1]['equity']
    total_return_pct = ((final_equity - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100
    
    # CAGR
    days = (data.index[-1] - data.index[0]).days
    if days > 0:
        cagr = (final_equity / INITIAL_CAPITAL) ** (365 / days) - 1
    else:
        cagr = 0
        
    # Drawdown
    equity_series = pd.Series([e['equity'] for e in equity_curve])
    rolling_max = equity_series.cummax()
    drawdown = (equity_series - rolling_max) / rolling_max
    max_drawdown = drawdown.min() * 100
    
    # Monthly Returns
    # Convert list to DF
    eq_df = pd.DataFrame(equity_curve)
    eq_df['date'] = pd.to_datetime(eq_df['date'])
    eq_df.set_index('date', inplace=True)
    monthly_ret = eq_df['equity'].resample('ME').last().pct_change() * 100
    monthly_returns_dict = {k.strftime('%Y-%m'): v for k, v in monthly_ret.items() if not pd.isna(v)}
    
    metrics = {
        'total_return': round(total_return_pct, 2),
        'cagr': round(cagr * 100, 2),
        'max_drawdown': round(max_drawdown, 2),
        'win_rate': 0, # TODO: Calc from trades
        'sharpe_ratio': 0 # TODO: Calc
    }
    
    return {
        'equity_curve': equity_curve,
        'trades': trades,
        'metrics': metrics,
        'monthly_returns': monthly_returns_dict,
        'drawdown_per': [{'date': index.strftime('%Y-%m-%d'), 'drawdown': val * 100} for index, val in drawdown.items()]
    }


# Predefined Strategy Codes
PREDEFINED_STRATEGIES = {
    'expanding_range_breakout': """
def strategy(data):
    # Expanding Range Breakout Logic
    # Returns a list/series of signals aligned with data
    
    df = data.copy()
    
    # Calculate Daily Range
    df['range'] = (df['high'] - df['low']).abs()
    
    # Calculate Expanding Range (Current > Prev > Prev2 > Prev3)
    df['range_1'] = df['range'].shift(1)
    df['range_2'] = df['range'].shift(2)
    df['range_3'] = df['range'].shift(3)
    df['range_4'] = df['range'].shift(4)

    condition_expanding = (
        (df['range'] > df['range_1']) &
        (df['range_1'] > df['range_2']) &
        (df['range_2'] > df['range_3']) &
        (df['range_3'] > df['range_4'])
    )

    # Bullish Day
    condition_bullish = df['close'] > df['open']
    
    # Turnover (Volume * Close) > 1M
    df['turnover'] = df['volume'] * df['close']
    condition_turnover = df['turnover'] >= 1000000

    # Gap Strength: Low > (Prev Close - Abs(Prev Close / 222))
    prev_close = df['close'].shift(1)
    condition_gap = df['low'] > (prev_close - (prev_close / 222).abs())

    # Final Signal
    df['signal'] = "HOLD"
    
    long_condition = (
        condition_expanding & 
        condition_bullish & 
        condition_turnover & 
        condition_gap
    )
    
    df.loc[long_condition, 'signal'] = "BUY"
    
    # Simple Exit: 3% Stop Loss, 6% Take Profit (Handled by execution engine implicitly?)
    # For this simple "signal" returning function, we just return BUY signals.
    # The engine handles position management (Hold until Sell signal or manually managed?)
    # The current engine is simple: BUY enters, SELL exits.
    # To implement SL/TP in this engine, we'd need to track position in the loop.
    # But since execute_strategy returns signals only, let's just return expanding range BUYs.
    # And let's add a trailing stop or partial exit logic mimicking the Pine Script?
    # Pine Script: strategy.exit("Exit", stop=0.97, limit=1.06)
    # Since our simple engine doesn't support complex bracket orders from a simple signal list easily,
    # We will just return the BUY signals. The engine executes them.
    # TODO: Enhance engine for SL/TP.
    
    return df['signal'].tolist()
""",
    'ma_crossover': """
def strategy(data):
    df = data.copy()
    df['fast_ma'] = df['close'].rolling(window=20).mean()
    df['slow_ma'] = df['close'].rolling(window=50).mean()
    
    df['signal'] = "HOLD"
    df.loc[df['fast_ma'] > df['slow_ma'], 'signal'] = "BUY"
    df.loc[df['fast_ma'] < df['slow_ma'], 'signal'] = "SELL"
    
    # Valid signals are crossovers only?
    # Engine logic: if pos=0 and BUY -> Buy. If pos=1 and SELL -> Sell.
    # So continuous BUY is fine (holds).
    return df['signal'].tolist()
""",
    'rsi_mean_reversion': """
import pandas_ta as ta
def strategy(data):
    df = data.copy()
    df['rsi'] = ta.rsi(df['close'], length=14)
    
    df['signal'] = "HOLD"
    df.loc[df['rsi'] < 30, 'signal'] = "BUY"
    df.loc[df['rsi'] > 70, 'signal'] = "SELL"
    return df['signal'].tolist()
""",
    'breakout': """
def strategy(data):
    df = data.copy()
    df['rolling_max'] = df['high'].rolling(window=20).max()
    df['signal'] = "HOLD"
    # Breakout
    df.loc[df['close'] > df['rolling_max'].shift(1), 'signal'] = "BUY"
    # Exit if falls below 20 day low? Or simple trailing?
    # For now, just BUY signals.
    return df['signal'].tolist()
""",
    'buy_and_hold': """
def strategy(data):
    signals = ["HOLD"] * len(data)
    if len(signals) > 0:
        signals[0] = "BUY"
    return signals
"""
}

def process_backtest(job):
    print(f"Processing job {job['id']} for strategy {job['strategy_id']}")
    
    # 1. Fetch Strategy Code
    try:
        code = None
        strategy_id = job['strategy_id']
        
        if strategy_id in PREDEFINED_STRATEGIES:
            print(f"Using predefined strategy: {strategy_id}")
            code = PREDEFINED_STRATEGIES[strategy_id]
        else:
            strategy_resp = supabase.from('algo_strategies').select('code').eq('id', strategy_id).single().execute()
            if strategy_resp.data:
                code = strategy_resp.data['code']
        
        if not code:
            print("Strategy code not found")
            return
        
        # 2. Fetch Data
        # 2. Fetch Data
        params = job.get('parameters', {}) or {}
        symbol = params.get('symbol', '^NSEI')
        period = params.get('period', '1y')
        
        data = fetch_market_data(symbol=symbol, period=period)
        if data is None or data.empty:
            raise Exception(f"Failed to fetch market data for {symbol}")
            
        # 3. Execute
        signals, error = execute_strategy(code, data)
        if error:
            print(f"Strategy Error: {error}")
            supabase.from('algo_backtest_results').update({
                'status': 'Failed',
                'metrics': {'error': error}
            }).eq('id', job['id']).execute()
            return
            
        # 4. Calculate Perf
        results = calculate_performance(data, signals)
        
        # 5. Save Results
        supabase.from('algo_backtest_results').update({
            'status': 'Completed',
            'equity_curve': results['equity_curve'],
            'metrics': results['metrics'],
            'monthly_returns': results['monthly_returns'],
            'drawdown_periods': results['drawdown_per'], # Storing full series for chart for now
            'trade_log': results['trades']
        }).eq('id', job['id']).execute()
        
        print(f"Job {job['id']} completed successfully.")
        
    except Exception as e:
        print(f"Job failed: {e}")
        traceback.print_exc()
        supabase.from('algo_backtest_results').update({
            'status': 'Failed',
            'metrics': {'error': str(e)}
        }).eq('id', job['id']).execute()


def main():
    print("Starting Backtest Worker...")
    while True:
        try:
            # Poll for pending jobs
            response = supabase.from('algo_backtest_results').select('*').eq('status', 'Pending').limit(1).execute()
            
            if response.data and len(response.data) > 0:
                job = response.data[0]
                # Mark as processing
                supabase.from('algo_backtest_results').update({'status': 'Processing'}).eq('id', job['id']).execute()
                process_backtest(job)
            else:
                # Sleep if no jobs
                time.sleep(2)
                
        except Exception as e:
            print(f"Worker Loop Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
