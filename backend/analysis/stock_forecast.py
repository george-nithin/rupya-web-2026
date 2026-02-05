
import pandas as pd
import numpy as np

def calculate_stock_forecast(stock_data: pd.DataFrame, days_to_forecast=252):
    """
    Calculates a linear regression forecast for the next year (252 trading days).
    
    Args:
        stock_data (pd.DataFrame): DataFrame with 'date' and 'close' columns.
        days_to_forecast (int): Number of days to project. Default 252 (1 year).
        
    Returns:
        dict: {
            "prognosis": "Bullish/Bearish",
            "current_price": float,
            "forecast_price": float,
            "upside": float (percentage)
        }
    """
    try:
        if stock_data.empty or len(stock_data) < 30:
            return None

        # Prepare data for regression
        # Use simple integer index as X
        stock_data = stock_data.sort_values('date')
        df = stock_data.copy()
        df['x'] = np.arange(len(df))
        y = df['close'].values
        x = df['x'].values
        
        # Fit Linear Regression (degree 1)
        slope, intercept = np.polyfit(x, y, 1)
        
        # Future X
        future_x = len(df) + days_to_forecast
        forecast_price = (slope * future_x) + intercept
        
        current_price = y[-1]
        
        upside = ((forecast_price - current_price) / current_price) * 100
        
        sentiment = "Neutral"
        if upside > 10: sentiment = "Bullish"
        elif upside < -10: sentiment = "Bearish"
        
        return {
            "sentiment": sentiment,
            "current_price": round(current_price, 2),
            "forecast_price": round(forecast_price, 2),
            "upside": round(upside, 2)
        }

    except Exception as e:
        print(f"Error calculating forecast: {e}")
        return None
