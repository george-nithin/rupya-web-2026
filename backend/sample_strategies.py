"""
Sample Trading Strategies
Demonstrates various trading strategy implementations
"""

from backtesting_engine import TradingStrategy, Order, OrderSide, OrderType
from datetime import datetime
from typing import List, Dict
import pandas as pd
import numpy as np


class MovingAverageCrossover(TradingStrategy):
    """
    Simple Moving Average Crossover Strategy
    Buy when fast MA crosses above slow MA
    Sell when fast MA crosses below slow MA
    """
    
    def __init__(
        self,
        fast_period: int = 20,
        slow_period: int = 50,
        position_size_percent: float = 0.95
    ):
        super().__init__(
            name="Moving Average Crossover",
            parameters={
                'fast_period': fast_period,
                'slow_period': slow_period,
                'position_size_percent': position_size_percent
            }
        )
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.position_size_percent = position_size_percent
        self.in_position = False
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate moving averages and generate signals"""
        df = data.copy()
        
        # Calculate moving averages
        df['fast_ma'] = df['close'].rolling(window=self.fast_period).mean()
        df['slow_ma'] = df['close'].rolling(window=self.slow_period).mean()
        
        # Generate signals
        df['signal'] = 0
        df.loc[df['fast_ma'] > df['slow_ma'], 'signal'] = 1  # Buy signal
        df.loc[df['fast_ma'] < df['slow_ma'], 'signal'] = -1  # Sell signal
        
        # Detect crossovers
        df['position'] = df['signal'].diff()
        
        return df
    
    def on_data(
        self,
        timestamp: datetime,
        current_bar: Dict,
        historical_data: pd.DataFrame
    ) -> List[Order]:
        """Generate orders based on MA crossover"""
        orders = []
        
        # Need enough data for slow MA
        if len(historical_data) < self.slow_period:
            return orders
        
        # Calculate signals
        signals = self.calculate_signals(historical_data)
        current_signal = signals.iloc[-1]
        
        # Check for crossover
        if current_signal['position'] == 2:  # Bullish crossover
            if not self.in_position:
                # Calculate position size
                available_cash = self.portfolio.cash * self.position_size_percent
                quantity = int(available_cash / current_bar['close'])
                
                if quantity > 0:
                    orders.append(Order(
                        symbol=historical_data.index[-1].strftime('%Y-%m-%d'),  # Symbol from data
                        side=OrderSide.BUY,
                        quantity=quantity,
                        order_type=OrderType.MARKET
                    ))
                    self.in_position = True
        
        elif current_signal['position'] == -2:  # Bearish crossover
            if self.in_position:
                # Sell entire position
                symbol = list(self.portfolio.positions.keys())[0] if self.portfolio.positions else None
                if symbol:
                    position = self.portfolio.positions[symbol]
                    orders.append(Order(
                        symbol=symbol,
                        side=OrderSide.SELL,
                        quantity=position.quantity,
                        order_type=OrderType.MARKET
                    ))
                    self.in_position = False
        
        return orders


class RSIMeanReversion(TradingStrategy):
    """
    RSI Mean Reversion Strategy
    Buy when RSI < oversold threshold
    Sell when RSI > overbought threshold
    """
    
    def __init__(
        self,
        rsi_period: int = 14,
        oversold: float = 30,
        overbought: float = 70,
        position_size_percent: float = 0.95
    ):
        super().__init__(
            name="RSI Mean Reversion",
            parameters={
                'rsi_period': rsi_period,
                'oversold': oversold,
                'overbought': overbought,
                'position_size_percent': position_size_percent
            }
        )
        self.rsi_period = rsi_period
        self.oversold = oversold
        self.overbought = overbought
        self.position_size_percent = position_size_percent
        self.in_position = False
    
    def calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate RSI indicator"""
        delta = data['close'].diff()
        
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate RSI and generate signals"""
        df = data.copy()
        
        # Calculate RSI
        df['rsi'] = self.calculate_rsi(df, self.rsi_period)
        
        # Generate signals
        df['signal'] = 0
        df.loc[df['rsi'] < self.oversold, 'signal'] = 1  # Buy signal
        df.loc[df['rsi'] > self.overbought, 'signal'] = -1  # Sell signal
        
        return df
    
    def on_data(
        self,
        timestamp: datetime,
        current_bar: Dict,
        historical_data: pd.DataFrame
    ) -> List[Order]:
        """Generate orders based on RSI"""
        orders = []
        
        # Need enough data for RSI
        if len(historical_data) < self.rsi_period + 1:
            return orders
        
        # Calculate signals
        signals = self.calculate_signals(historical_data)
        current_signal = signals.iloc[-1]
        previous_signal = signals.iloc[-2] if len(signals) > 1 else None
        
        # Buy signal: RSI crosses below oversold
        if current_signal['signal'] == 1 and not self.in_position:
            if previous_signal is None or previous_signal['signal'] != 1:
                # Calculate position size
                available_cash = self.portfolio.cash * self.position_size_percent
                quantity = int(available_cash / current_bar['close'])
                
                if quantity > 0:
                    symbol = list(historical_data.columns)[0] if len(historical_data.columns) > 0 else 'UNKNOWN'
                    orders.append(Order(
                        symbol=symbol,
                        side=OrderSide.BUY,
                        quantity=quantity,
                        order_type=OrderType.MARKET
                    ))
                    self.in_position = True
        
        # Sell signal: RSI crosses above overbought
        elif current_signal['signal'] == -1 and self.in_position:
            if previous_signal is None or previous_signal['signal'] != -1:
                # Sell entire position
                symbol = list(self.portfolio.positions.keys())[0] if self.portfolio.positions else None
                if symbol:
                    position = self.portfolio.positions[symbol]
                    orders.append(Order(
                        symbol=symbol,
                        side=OrderSide.SELL,
                        quantity=position.quantity,
                        order_type=OrderType.MARKET
                    ))
                    self.in_position = False
        
        return orders


class BreakoutStrategy(TradingStrategy):
    """
    Breakout Strategy
    Buy when price breaks above recent high
    Sell on stop-loss or profit target
    """
    
    def __init__(
        self,
        lookback_period: int = 20,
        stop_loss_percent: float = 5.0,
        profit_target_percent: float = 10.0,
        position_size_percent: float = 0.95
    ):
        super().__init__(
            name="Breakout Strategy",
            parameters={
                'lookback_period': lookback_period,
                'stop_loss_percent': stop_loss_percent,
                'profit_target_percent': profit_target_percent,
                'position_size_percent': position_size_percent
            }
        )
        self.lookback_period = lookback_period
        self.stop_loss_percent = stop_loss_percent
        self.profit_target_percent = profit_target_percent
        self.position_size_percent = position_size_percent
        self.in_position = False
        self.entry_price = None
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate breakout signals"""
        df = data.copy()
        
        # Calculate rolling high
        df['rolling_high'] = df['high'].rolling(window=self.lookback_period).max()
        
        # Generate buy signal when price breaks above rolling high
        df['breakout'] = df['close'] > df['rolling_high'].shift(1)
        
        return df
    
    def on_data(
        self,
        timestamp: datetime,
        current_bar: Dict,
        historical_data: pd.DataFrame
    ) -> List[Order]:
        """Generate orders based on breakout"""
        orders = []
        
        # Need enough data for lookback
        if len(historical_data) < self.lookback_period + 1:
            return orders
        
        # Calculate signals
        signals = self.calculate_signals(historical_data)
        current_signal = signals.iloc[-1]
        
        current_price = current_bar['close']
        
        # Entry: Breakout detected
        if current_signal['breakout'] and not self.in_position:
            # Calculate position size
            available_cash = self.portfolio.cash * self.position_size_percent
            quantity = int(available_cash / current_price)
            
            if quantity > 0:
                symbol = list(historical_data.columns)[0] if len(historical_data.columns) > 0 else 'UNKNOWN'
                orders.append(Order(
                    symbol=symbol,
                    side=OrderSide.BUY,
                    quantity=quantity,
                    order_type=OrderType.MARKET
                ))
                self.in_position = True
                self.entry_price = current_price
        
        # Exit: Stop-loss or profit target
        elif self.in_position and self.entry_price:
            pnl_percent = ((current_price - self.entry_price) / self.entry_price) * 100
            
            should_exit = False
            
            # Check stop-loss
            if pnl_percent <= -self.stop_loss_percent:
                should_exit = True
            
            # Check profit target
            if pnl_percent >= self.profit_target_percent:
                should_exit = True
            
            if should_exit:
                # Sell entire position
                symbol = list(self.portfolio.positions.keys())[0] if self.portfolio.positions else None
                if symbol:
                    position = self.portfolio.positions[symbol]
                    orders.append(Order(
                        symbol=symbol,
                        side=OrderSide.SELL,
                        quantity=position.quantity,
                        order_type=OrderType.MARKET
                    ))
                    self.in_position = False
                    self.entry_price = None
        
        return orders


class BuyAndHold(TradingStrategy):
    """
    Buy and Hold Strategy
    Buy on first day and hold until end
    """
    
    def __init__(self, position_size_percent: float = 0.95):
        super().__init__(
            name="Buy and Hold",
            parameters={'position_size_percent': position_size_percent}
        )
        self.position_size_percent = position_size_percent
        self.has_bought = False
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """No signals needed for buy and hold"""
        return data
    
    def on_data(
        self,
        timestamp: datetime,
        current_bar: Dict,
        historical_data: pd.DataFrame
    ) -> List[Order]:
        """Buy on first bar"""
        orders = []
        
        if not self.has_bought:
            # Calculate position size
            available_cash = self.portfolio.cash * self.position_size_percent
            quantity = int(available_cash / current_bar['close'])
            
            if quantity > 0:
                symbol = list(historical_data.columns)[0] if len(historical_data.columns) > 0 else 'UNKNOWN'
                orders.append(Order(
                    symbol=symbol,
                    side=OrderSide.BUY,
                    quantity=quantity,
                    order_type=OrderType.MARKET
                ))
                self.has_bought = True
        
        return orders
