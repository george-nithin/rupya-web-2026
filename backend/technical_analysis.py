import pandas as pd
import numpy as np

def calculate_rsi(prices, period=14):
    """
    Calculate Relative Strength Index (RSI)
    Using simple method for now (delta gain/loss average)
    """
    try:
        # Check if we have enough data
        if len(prices) < period:
            return None
            
        delta = prices.diff()
        gain = delta.clip(lower=0)
        loss = -1 * delta.clip(upper=0)
        
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1]
    except:
        return None

def calculate_ema(prices, span):
    """
    Calculate Exponential Moving Average
    """
    try:
        if len(prices) < span: return None
        return prices.ewm(span=span, adjust=False).mean().iloc[-1]
    except:
        return None

def calculate_sma(prices, window):
    """
    Calculate Simple Moving Average
    """
    try:
        if len(prices) < window: return None
        return prices.rolling(window=window).mean().iloc[-1]
    except:
        return None

def calculate_macd(prices, fast=12, slow=26, signal=9):
    """
    Calculate MACD Line, Signal Line, Histogram
    """
    try:
        if len(prices) < slow: return None, None, None
        
        ema_fast = prices.ewm(span=fast, adjust=False).mean()
        ema_slow = prices.ewm(span=slow, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        
        macd_signal = macd_line.ewm(span=signal, adjust=False).mean()
        macd_hist = macd_line - macd_signal
        
        return macd_line.iloc[-1], macd_signal.iloc[-1], macd_hist.iloc[-1]
    except:
        return None, None, None

def identify_candlestick_pattern(df):
    """
    Identify simple candlestick patterns: Doji, Engulfing.
    Input df must have 'Open', 'High', 'Low', 'Close'
    """
    try:
        if len(df) < 2: return None
        
        # Latest Candle
        o, h, l, c = df['Open'].iloc[-1], df['High'].iloc[-1], df['Low'].iloc[-1], df['Close'].iloc[-1]
        
        # Previous Candle
        o_prev, h_prev, l_prev, c_prev = df['Open'].iloc[-2], df['High'].iloc[-2], df['Low'].iloc[-2], df['Close'].iloc[-2]
        
        # Doji Logic
        body = abs(c - o)
        rng = h - l
        if rng > 0 and (body / rng) < 0.1:
            return "Doji"
        
        # Bullish Engulfing
        # Prev Red: c_prev < o_prev
        # Curr Green: c > o
        # Engulfing: c > o_prev AND o < c_prev
        if (c_prev < o_prev) and (c > o):
            if (c > o_prev) and (o < c_prev):
                return "Bullish Engulfing"
                
        # Bearish Engulfing
        # Prev Green: c_prev > o_prev
        # Curr Red: c < o
        # Engulfing: c < o_prev AND o > c_prev
        if (c_prev > o_prev) and (c < o):
            if (c < o_prev) and (o > c_prev):
                return "Bearish Engulfing"
                
        return None
    except:
        return None

def get_signal_type(rsi, macd, signal):
    """
    Determine basic signal: Bullish, Bearish, Neutral
    """
    try:
        score = 0
        if rsi is not None and rsi > 50: score += 1
        elif rsi is not None and rsi < 50: score -= 1
        
        if macd is not None and signal is not None:
            if macd > signal: score += 1
            else: score -= 1
            
        if score > 0: return "Bullish"
        elif score < 0: return "Bearish"
        else: return "Neutral"
    except:
        return "Neutral"

def calculate_returns(history):
    """
    Calculate 1W, 1M, 3M, 6M, 1Y, 5Y % Returns
    Input history DF with 'Close'
    """
    try:
        periods = {
            "1W": 5, 
            "1M": 21, 
            "3M": 63, 
            "6M": 126, 
            "1Y": 252, 
            "5Y": 1260
        }
        
        ret_data = {}
        curr = history['Close'].iloc[-1]
        
        for p_name, days in periods.items():
            if len(history) > days:
                prev = history['Close'].iloc[-(days+1)]
                pct = ((curr - prev) / prev) * 100
                ret_data[p_name] = round(pct, 2)
            else:
                ret_data[p_name] = None
        
        return ret_data
    except:
        return {}
