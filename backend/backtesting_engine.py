"""
Backtesting Engine
Event-driven backtesting system for trading strategies
Supports multiple symbols, realistic order execution, and comprehensive performance metrics
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import pandas as pd
import numpy as np
from supabase import create_client, Client
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


class OrderType(Enum):
    """Order types"""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderSide(Enum):
    """Order sides"""
    BUY = "buy"
    SELL = "sell"


class OrderStatus(Enum):
    """Order statuses"""
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


@dataclass
class Order:
    """Represents a trading order"""
    symbol: str
    side: OrderSide
    quantity: int
    order_type: OrderType = OrderType.MARKET
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    timestamp: datetime = field(default_factory=datetime.now)
    status: OrderStatus = OrderStatus.PENDING
    filled_price: Optional[float] = None
    filled_timestamp: Optional[datetime] = None
    order_id: Optional[str] = None


@dataclass
class Position:
    """Represents a trading position"""
    symbol: str
    quantity: int
    entry_price: float
    entry_timestamp: datetime
    current_price: float = 0.0
    
    @property
    def market_value(self) -> float:
        """Current market value of position"""
        return self.quantity * self.current_price
    
    @property
    def unrealized_pnl(self) -> float:
        """Unrealized profit/loss"""
        return (self.current_price - self.entry_price) * self.quantity
    
    @property
    def pnl_percent(self) -> float:
        """Unrealized P&L percentage"""
        if self.entry_price == 0:
            return 0.0
        return ((self.current_price - self.entry_price) / self.entry_price) * 100


@dataclass
class Trade:
    """Represents a completed trade"""
    symbol: str
    entry_date: datetime
    exit_date: datetime
    entry_price: float
    exit_price: float
    quantity: int
    pnl: float
    pnl_percent: float
    holding_period_days: int
    
    @property
    def is_win(self) -> bool:
        return self.pnl > 0


class Portfolio:
    """Manages portfolio cash and positions"""
    
    def __init__(self, initial_capital: float, commission: float = 0.001):
        """
        Initialize portfolio
        
        Args:
            initial_capital: Starting cash
            commission: Commission rate per trade (default 0.1%)
        """
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.commission = commission
        self.positions: Dict[str, Position] = {}
        self.trades: List[Trade] = []
        self.equity_curve: List[Dict] = []
        
    def update_positions(self, current_prices: Dict[str, float]):
        """Update current prices for all positions"""
        for symbol, position in self.positions.items():
            if symbol in current_prices:
                position.current_price = current_prices[symbol]
    
    @property
    def total_value(self) -> float:
        """Total portfolio value (cash + positions)"""
        return self.cash + sum(pos.market_value for pos in self.positions.values())
    
    @property
    def positions_value(self) -> float:
        """Total value of all positions"""
        return sum(pos.market_value for pos in self.positions.values())
    
    def can_buy(self, symbol: str, price: float, quantity: int) -> bool:
        """Check if we have enough cash to buy"""
        cost = price * quantity * (1 + self.commission)
        return self.cash >= cost
    
    def execute_buy(self, symbol: str, price: float, quantity: int, timestamp: datetime) -> bool:
        """Execute a buy order"""
        cost = price * quantity
        commission_cost = cost * self.commission
        total_cost = cost + commission_cost
        
        if self.cash < total_cost:
            return False
        
        self.cash -= total_cost
        
        if symbol in self.positions:
            # Add to existing position (average price)
            pos = self.positions[symbol]
            total_quantity = pos.quantity + quantity
            avg_price = ((pos.entry_price * pos.quantity) + (price * quantity)) / total_quantity
            pos.quantity = total_quantity
            pos.entry_price = avg_price
            pos.current_price = price
        else:
            # Create new position
            self.positions[symbol] = Position(
                symbol=symbol,
                quantity=quantity,
                entry_price=price,
                entry_timestamp=timestamp,
                current_price=price
            )
        
        return True
    
    def execute_sell(self, symbol: str, price: float, quantity: int, timestamp: datetime) -> bool:
        """Execute a sell order"""
        if symbol not in self.positions:
            return False
        
        pos = self.positions[symbol]
        
        if pos.quantity < quantity:
            return False
        
        # Calculate P&L
        proceeds = price * quantity
        commission_cost = proceeds * self.commission
        net_proceeds = proceeds - commission_cost
        
        self.cash += net_proceeds
        
        # Record trade
        pnl = (price - pos.entry_price) * quantity - (commission_cost + (pos.entry_price * quantity * self.commission))
        pnl_percent = ((price - pos.entry_price) / pos.entry_price) * 100
        holding_days = (timestamp - pos.entry_timestamp).days
        
        trade = Trade(
            symbol=symbol,
            entry_date=pos.entry_timestamp,
            exit_date=timestamp,
            entry_price=pos.entry_price,
            exit_price=price,
            quantity=quantity,
            pnl=pnl,
            pnl_percent=pnl_percent,
            holding_period_days=holding_days
        )
        self.trades.append(trade)
        
        # Update or remove position
        pos.quantity -= quantity
        pos.current_price = price
        
        if pos.quantity == 0:
            del self.positions[symbol]
        
        return True
    
    def record_equity(self, timestamp: datetime):
        """Record current portfolio value"""
        self.equity_curve.append({
            'timestamp': timestamp.isoformat(),
            'equity': self.total_value,
            'cash': self.cash,
            'positions_value': self.positions_value
        })


class TradingStrategy:
    """Base class for trading strategies"""
    
    def __init__(self, name: str, parameters: Dict = None):
        self.name = name
        self.parameters = parameters or {}
        self.portfolio: Optional[Portfolio] = None
        self.data: Optional[pd.DataFrame] = None
    
    def initialize(self, portfolio: Portfolio, data: pd.DataFrame):
        """Initialize strategy with portfolio and data"""
        self.portfolio = portfolio
        self.data = data
    
    def on_data(self, timestamp: datetime, current_bar: Dict, historical_data: pd.DataFrame) -> List[Order]:
        """
        Called on each bar/candle
        
        Args:
            timestamp: Current timestamp
            current_bar: Current OHLC data
            historical_data: All data up to current timestamp
            
        Returns:
            List of orders to execute
        """
        raise NotImplementedError("Strategy must implement on_data method")
    
    def on_order_fill(self, order: Order):
        """Called when an order is filled"""
        pass
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate trading signals - to be implemented by strategy"""
        raise NotImplementedError("Strategy must implement calculate_signals method")


class BacktestEngine:
    """Main backtesting engine"""
    
    def __init__(self, commission: float = 0.001, slippage: float = 0.0001):
        """
        Initialize backtesting engine
        
        Args:
            commission: Commission rate (default 0.1%)
            slippage: Slippage rate (default 0.01%)
        """
        self.commission = commission
        self.slippage = slippage
    
    def load_historical_data(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        timeframe: str = '1D'
    ) -> pd.DataFrame:
        """Load historical OHLC data from database"""
        try:
            result = supabase.rpc('get_ohlc_data', {
                'p_symbol': symbol,
                'p_timeframe': timeframe,
                'p_start_date': start_date.isoformat(),
                'p_end_date': end_date.isoformat()
            }).execute()
            
            if not result.data:
                logger.warning(f"No historical data found for {symbol}")
                return pd.DataFrame()
            
            df = pd.DataFrame(result.data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.set_index('timestamp')
            df = df.sort_index()
            
            logger.info(f"Loaded {len(df)} bars for {symbol}")
            return df
            
        except Exception as e:
            logger.error(f"Error loading historical data: {e}")
            return pd.DataFrame()
    
    def execute_order(
        self,
        order: Order,
        current_price: float,
        portfolio: Portfolio,
        timestamp: datetime
    ) -> bool:
        """Execute an order with slippage"""
        if order.side == OrderSide.BUY:
            # Apply slippage (buy at higher price)
            execution_price = current_price * (1 + self.slippage)
            success = portfolio.execute_buy(
                order.symbol,
                execution_price,
                order.quantity,
                timestamp
            )
        else:  # SELL
            # Apply slippage (sell at lower price)
            execution_price = current_price * (1 - self.slippage)
            success = portfolio.execute_sell(
                order.symbol,
                execution_price,
                order.quantity,
                timestamp
            )
        
        if success:
            order.status = OrderStatus.FILLED
            order.filled_price = execution_price
            order.filled_timestamp = timestamp
        else:
            order.status = OrderStatus.REJECTED
        
        return success
    
    def run(
        self,
        strategy: TradingStrategy,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        initial_capital: float = 100000,
        timeframe: str = '1D'
    ) -> 'BacktestResult':
        """
        Run backtest
        
        Args:
            strategy: Trading strategy instance
            symbol: Stock symbol
            start_date: Backtest start date
            end_date: Backtest end date
            initial_capital: Starting capital
            timeframe: Data timeframe
            
        Returns:
            BacktestResult object
        """
        logger.info(f"Starting backtest: {strategy.name} on {symbol}")
        logger.info(f"Period: {start_date.date()} to {end_date.date()}")
        logger.info(f"Initial capital: ₹{initial_capital:,.2f}")
        
        # Load data
        data = self.load_historical_data(symbol, start_date, end_date, timeframe)
        
        if data.empty:
            raise ValueError(f"No data available for {symbol}")
        
        # Initialize portfolio
        portfolio = Portfolio(initial_capital, self.commission)
        
        # Initialize strategy
        strategy.initialize(portfolio, data)
        
        # Event loop - iterate through each bar
        for i in range(len(data)):
            current_timestamp = data.index[i]
            current_bar = {
                'open': data.iloc[i]['open'],
                'high': data.iloc[i]['high'],
                'low': data.iloc[i]['low'],
                'close': data.iloc[i]['close'],
                'volume': data.iloc[i]['volume']
            }
            
            # Update position prices
            portfolio.update_positions({symbol: current_bar['close']})
            
            # Get historical data up to current point
            historical_data = data.iloc[:i+1]
            
            # Get signals from strategy
            orders = strategy.on_data(current_timestamp, current_bar, historical_data)
            
            # Execute orders
            if orders:
                for order in orders:
                    # Use next bar's open price for execution (avoid look-ahead bias)
                    if i < len(data) - 1:
                        next_open = data.iloc[i+1]['open']
                        success = self.execute_order(order, next_open, portfolio, current_timestamp)
                        
                        if success:
                            strategy.on_order_fill(order)
            
            # Record equity
            portfolio.record_equity(current_timestamp)
        
        # Create result
        result = BacktestResult(
            strategy_name=strategy.name,
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital,
            final_capital=portfolio.total_value,
            portfolio=portfolio,
            parameters=strategy.parameters
        )
        
        logger.info(f"Backtest complete. Final value: ₹{portfolio.total_value:,.2f}")
        logger.info(f"Total return: {result.total_return:.2f}%")
        logger.info(f"Total trades: {len(portfolio.trades)}")
        
        return result


@dataclass
class BacktestResult:
    """Contains backtest results and performance metrics"""
    strategy_name: str
    symbol: str
    start_date: datetime
    end_date: datetime
    initial_capital: float
    final_capital: float
    portfolio: Portfolio
    parameters: Dict
    
    @property
    def total_return(self) -> float:
        """Total return percentage"""
        return ((self.final_capital - self.initial_capital) / self.initial_capital) * 100
    
    @property
    def total_trades(self) -> int:
        """Total number of trades"""
        return len(self.portfolio.trades)
    
    @property
    def winning_trades(self) -> int:
        """Number of winning trades"""
        return sum(1 for t in self.portfolio.trades if t.is_win)
    
    @property
    def losing_trades(self) -> int:
        """Number of losing trades"""
        return sum(1 for t in self.portfolio.trades if not t.is_win)
    
    @property
    def win_rate(self) -> float:
        """Win rate percentage"""
        if self.total_trades == 0:
            return 0.0
        return (self.winning_trades / self.total_trades) * 100
    
    @property
    def average_win(self) -> float:
        """Average winning trade P&L"""
        wins = [t.pnl for t in self.portfolio.trades if t.is_win]
        return np.mean(wins) if wins else 0.0
    
    @property
    def average_loss(self) -> float:
        """Average losing trade P&L"""
        losses = [t.pnl for t in self.portfolio.trades if not t.is_win]
        return np.mean(losses) if losses else 0.0
    
    @property
    def profit_factor(self) -> float:
        """Profit factor (gross profit / gross loss)"""
        gross_profit = sum(t.pnl for t in self.portfolio.trades if t.is_win)
        gross_loss = abs(sum(t.pnl for t in self.portfolio.trades if not t.is_win))
        
        if gross_loss == 0:
            return float('inf') if gross_profit > 0 else 0.0
        
        return gross_profit / gross_loss
    
    @property
    def max_drawdown(self) -> float:
        """Maximum drawdown percentage"""
        if not self.portfolio.equity_curve:
            return 0.0
        
        equity_values = [point['equity'] for point in self.portfolio.equity_curve]
        peak = equity_values[0]
        max_dd = 0.0
        
        for value in equity_values:
            if value > peak:
                peak = value
            dd = ((peak - value) / peak) * 100
            if dd > max_dd:
                max_dd = dd
        
        return max_dd
    
    @property
    def sharpe_ratio(self) -> float:
        """Sharpe ratio (annualized)"""
        if len(self.portfolio.equity_curve) < 2:
            return 0.0
        
        # Calculate daily returns
        equity_values = [point['equity'] for point in self.portfolio.equity_curve]
        returns = np.diff(equity_values) / equity_values[:-1]
        
        if len(returns) == 0:
            return 0.0
        
        # Annualized Sharpe (assuming 252 trading days)
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        
        if std_return == 0:
            return 0.0
        
        return (mean_return / std_return) * np.sqrt(252)
    
    @property
    def cagr(self) -> float:
        """Compound Annual Growth Rate"""
        days = (self.end_date - self.start_date).days
        if days == 0:
            return 0.0
        
        years = days / 365.25
        return ((self.final_capital / self.initial_capital) ** (1 / years) - 1) * 100
    
    def to_dict(self) -> Dict:
        """Convert result to dictionary for storage"""
        data = {
            'strategy_name': self.strategy_name,
            'symbol': self.symbol,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'initial_capital': self.initial_capital,
            'final_capital': self.final_capital,
            'total_return': self.total_return,
            'cagr': self.cagr,
            'sharpe_ratio': self.sharpe_ratio,
            'max_drawdown': self.max_drawdown,
            'total_trades': self.total_trades,
            'winning_trades': self.winning_trades,
            'losing_trades': self.losing_trades,
            'win_rate': self.win_rate,
            'profit_factor': self.profit_factor,
            'average_win': self.average_win,
            'average_loss': self.average_loss,
        }
        
        # Sanitize float values (remove Infinity/NaN for JSON)
        for k, v in data.items():
            if isinstance(v, float) and (np.isinf(v) or np.isnan(v)):
                data[k] = None
                
        return data
    
    def save_to_database(self, strategy_id: str) -> Optional[str]:
        """Save backtest results to database"""
        try:
            # Prepare data
            result_data = {
                'strategy_id': strategy_id,
                'equity_curve': self.portfolio.equity_curve,
                'metrics': self.to_dict(),
                'trade_log': [
                    {
                        'symbol': t.symbol,
                        'entry_date': t.entry_date.isoformat(),
                        'exit_date': t.exit_date.isoformat(),
                        'entry_price': t.entry_price,
                        'exit_price': t.exit_price,
                        'quantity': t.quantity,
                        'pnl': t.pnl,
                        'pnl_percent': t.pnl_percent,
                        'holding_days': t.holding_period_days
                    }
                    for t in self.portfolio.trades
                ],
                'parameters': self.parameters,
                'status': 'Completed'
            }
            
            # Insert into database
            response = supabase.table('algo_backtest_results').insert(result_data).execute()
            
            if response.data:
                result_id = response.data[0]['id']
                logger.info(f"Saved backtest results with ID: {result_id}")
                return result_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error saving backtest results: {e}")
            return None
