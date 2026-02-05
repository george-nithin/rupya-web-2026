
import pandas as pd

def calculate_market_sentiment(nifty_data: pd.DataFrame):
    """
    Calculates a simple 'Fear & Greed' index (0-100) based on recent market moves.
    
    Logic (Simplified):
    - Analyze the last 14 days of Nifty 50.
    - If RSI < 30 -> Extreme Fear (0-25)
    - If RSI > 70 -> Extreme Greed (75-100)
    - Volatility (Standard Deviation) affects the score.
    """
    try:
        if nifty_data.empty:
            return {"value": 50, "status": "Neutral", "metric_name": "fear_index"}

        # Calculate simple RSI
        delta = nifty_data['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        current_rsi = rsi.iloc[-1]
        
        # Determine status
        score = current_rsi # Direct mapping for simplicity now, usually it's more complex
        
        status = "Neutral"
        if score < 30: status = "Extreme Fear"
        elif score < 45: status = "Fear"
        elif score > 70: status = "Extreme Greed"
        elif score > 55: status = "Greed"
        
        return {
            "value": round(score, 2),
            "status": status,
            "metric_name": "fear_index"
        }

    except Exception as e:
        print(f"Error calculating sentiment: {e}")
        return {"value": 50, "status": "Error", "metric_name": "fear_index"}
