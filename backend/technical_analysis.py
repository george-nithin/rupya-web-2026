import pandas as pd
import numpy as np
from utils import log_error

class TechnicalAnalysis:
    """
    Pure Python/Pandas implementation of Technical Indicators.
    Avoids heavy dependencies like TA-Lib for easier deployment.
    """

    @staticmethod
    def calculate_rsi(prices: list, period=14):
        """
        Relative Strength Index (RSI)
        """
        try:
            if not prices or len(prices) < period:
                return None
            
            series = pd.Series(prices)
            delta = series.diff()
            
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # Return the last valid RSI value
            return rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else None
        except Exception as e:
            log_error(f"Error calculating RSI: {e}")
            return None

    @staticmethod
    def calculate_macd(prices: list, fast=12, slow=26, signal=9):
        """
        Moving Average Convergence Divergence (MACD)
        Returns: (macd_line, signal_line, histogram)
        """
        try:
            if not prices or len(prices) < slow:
                return None, None, None
            
            series = pd.Series(prices)
            exp1 = series.ewm(span=fast, adjust=False).mean()
            exp2 = series.ewm(span=slow, adjust=False).mean()
            
            macd = exp1 - exp2
            signal_line = macd.ewm(span=signal, adjust=False).mean()
            histogram = macd - signal_line
            
            return (
                macd.iloc[-1],
                signal_line.iloc[-1],
                histogram.iloc[-1]
            )
        except Exception as e:
            log_error(f"Error calculating MACD: {e}")
            return None, None, None

    @staticmethod
    def calculate_sma(prices: list, period=20):
        """
        Simple Moving Average
        """
        try:
            if not prices or len(prices) < period:
                return None
            series = pd.Series(prices)
            sma = series.rolling(window=period).mean()
            return sma.iloc[-1]
        except Exception as e:
            log_error(f"Error calculating SMA: {e}")
            return None

    @staticmethod
    def calculate_ema(prices: list, period=20):
        """
        Exponential Moving Average
        """
        try:
            if not prices or len(prices) < period:
                return None
            series = pd.Series(prices)
            ema = series.ewm(span=period, adjust=False).mean()
            return ema.iloc[-1]
        except Exception as e:
            log_error(f"Error calculating EMA: {e}")
            return None
