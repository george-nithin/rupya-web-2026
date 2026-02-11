# Historical Data & Backtesting - Usage Guide

This guide explains how to use the historical data fetcher and backtesting engine.

## Overview

The Rupya platform now includes:
1. **Historical OHLC Data Storage**: Database tables for storing candlestick data
2. **Data Fetcher**: Python script to fetch historical data from NSE and Yahoo Finance
3. **Backtesting Engine**: Event-driven backtesting system with portfolio management
4. **Frontend Dashboard**: Web interface for running and visualizing backtests

## Quick Start

### 1. Fetch Historical Data

First, ensure you have the required Python dependencies:

```bash
cd backend
source venv/bin/activate
pip install yfinance pandas numpy
```

#### Fetch Data for Specific StocksFor specific stocks (e.g., RELIANCE, TCS, INFY):

```bash
chmod +x run_historical_sync.sh
./run_historical_sync.sh --symbols "RELIANCE,TCS,INFY" --days 365
```

#### Fetch Data for All Stocks

```bash
./run_historical_sync.sh --days 365
```

#### Fetch Data with Custom Date Range

```bash
python historical_data_fetcher.py --symbols "RELIANCE" --days 1825  # 5 years
```

### 2. Run a Backtest

#### Using the CLI

```bash
python run_backtest.py --strategy ma_crossover --symbol RELIANCE --start-date 2024-01-01 --end-date 2025-01-01
```

#### Available Strategies

- `ma_crossover`: Moving Average Crossover (20/50 day)
- `rsi_mean_reversion`: RSI Mean Reversion (oversold < 30, overbought > 70)
- `breakout`: Breakout Strategy (20-day high with stop-loss)
- `buy_and_hold`: Buy and Hold Benchmark

#### Custom Parameters

```bash
python run_backtest.py \
  --strategy rsi_mean_reversion \
  --symbol TCS \
  --start-date 2023-01-01 \
  --end-date 2024-01-01 \
  --capital 500000 \
  --commission 0.002 \
  --slippage 0.0005
```

### 3. Using the Web Interface

1. Navigate to `/dashboard/backtesting`
2. Select a strategy from the dropdown
3. Enter the stock symbol (e.g., RELIANCE)
4. Set the date range and initial capital
5. Click "Run Backtest"

**Note**: The web interface currently requires backend API endpoints to be implemented. For now, use the CLI tool.

## Data Sources

### NSE India (Primary)
- **Availability**: Up to 1 year of daily data
- **Format**: OHLCV (Open, High, Low, Close, Volume)
- **Limitations**: No intraday data, requires session management

### Yahoo Finance (Fallback)
- **Availability**: Multi-year historical data
- **Format**: OHLCV with adjusted close
- **Advantages**: More reliable, longer history

## Database Schema

### `market_historical_ohlc`

Stores OHLC candlestick data:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| symbol | TEXT | Stock symbol |
| timeframe | TEXT | Data timeframe (1D, 1W, 1M) |
| timestamp | TIMESTAMPTZ | Candle timestamp |
| open | NUMERIC | Opening price |
| high | NUMERIC | Highest price |
| low | NUMERIC | Lowest price |
| close | NUMERIC | Closing price |
| volume | BIGINT | Trading volume |
| adjusted_close | NUMERIC | Adjusted close (for corporate actions) |

### `historical_data_sync_status`

Tracks data fetching progress:

| Column | Type | Description |
|--------|------|-------------|
| symbol | TEXT | Stock symbol |
| timeframe | TEXT | Data timeframe |
| earliest_date | DATE | Earliest data point |
| latest_date | DATE | Latest data point |
| total_records | INTEGER | Number of records |
| sync_status | TEXT | pending/completed/failed |
| data_source | TEXT | NSE/Yahoo Finance |

## Helper Functions

### `get_ohlc_data(symbol, timeframe, start_date, end_date)`

Fetch historical OHLC data for a symbol:

```sql
SELECT * FROM get_ohlc_data('RELIANCE', '1D', '2024-01-01', '2025-01-01');
```

### `get_latest_sync_date(symbol, timeframe)`

Get the last synced date for incremental updates:

```sql
SELECT get_latest_sync_date('RELIANCE', '1D');
```

### `get_data_gaps(symbol, timeframe, start_date, end_date)`

Identify missing dates in historical data:

```sql
SELECT * FROM get_data_gaps('RELIANCE', '1D', '2024-01-01', '2025-01-01');
```

## Backtesting Engine

### Architecture

The backtesting engine is event-driven and simulates realistic trading:

1. **Data Provider**: Streams historical data chronologically
2. **Strategy**: Generates buy/sell signals based on data
3. **Portfolio Manager**: Tracks positions and cash
4. **Order Execution**: Simulates market/limit orders with slippage
5. **Performance Analytics**: Calculates metrics (Sharpe, CAGR, drawdown)

### Creating Custom Strategies

```python
from backtesting_engine import TradingStrategy, Order, OrderSide
from typing import List, Dict
from datetime import datetime
import pandas as pd

class MyStrategy(TradingStrategy):
    def __init__(self, param1=10, param2=20):
        super().__init__(
            name="My Custom Strategy",
            parameters={'param1': param1, 'param2': param2}
        )
        self.param1 = param1
        self.param2 = param2
    
    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        # Implement your signal logic
        df = data.copy()
        df['signal'] = 0  # 1 for buy, -1 for sell
        return df
    
    def on_data(
        self,
        timestamp: datetime,
        current_bar: Dict,
        historical_data: pd.DataFrame
    ) -> List[Order]:
        orders = []
        
        # Generate orders based on signals
        signals = self.calculate_signals(historical_data)
        
        # Buy logic
        if signals.iloc[-1]['signal'] == 1:
            quantity = int(self.portfolio.cash * 0.95 / current_bar['close'])
            if quantity > 0:
                orders.append(Order(
                    symbol=historical_data.index[-1].strftime('%Y-%m-%d'),
                    side=OrderSide.BUY,
                    quantity=quantity
                ))
        
        # Sell logic
        elif signals.iloc[-1]['signal'] == -1:
            # Sell positions logic
            pass
        
        return orders
```

### Running Custom Strategy

```python
from backtesting_engine import BacktestEngine
from my_strategy import MyStrategy
from datetime import datetime

engine = BacktestEngine()
strategy = MyStrategy(param1=15, param2=25)

result = engine.run(
    strategy=strategy,
    symbol='RELIANCE',
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2025, 1, 1),
    initial_capital=100000
)

print(f"Total Return: {result.total_return:.2f}%")
print(f"Sharpe Ratio: {result.sharpe_ratio:.2f}")
print(f"Max Drawdown: {result.max_drawdown:.2f}%")
```

## Performance Metrics

The backtesting engine calculates the following metrics:

| Metric | Description |
|--------|-------------|
| **Total Return** | Percentage gain/loss from initial capital |
| **CAGR** | Compound Annual Growth Rate |
| **Sharpe Ratio** | Risk-adjusted return (higher is better) |
| **Max Drawdown** | Maximum peak-to-trough decline |
| **Win Rate** | Percentage of winning trades |
| **Profit Factor** | Gross profit / gross loss ratio |
| **Average Win/Loss** | Average P&L per winning/losing trade |

## Automation

### Cron Job Setup

To automatically fetch historical data daily:

```bash
crontab -e
```

Add this line to run every day at 6 PM:

```
0 18 * * * cd /path/to/Rupya-webapp/backend && ./run_historical_sync.sh >> /tmp/historical_sync.log 2>&1
```

## Storage Considerations

- **Daily data for 2000 stocks x 5 years**: ~3.65M rows (~400 MB)
- **Indexes add**: ~100-200 MB
- **Total estimated size**: ~600 MB for 5 years of daily data

For intraday data (1-minute candles), storage requirements increase significantly:
- **1-minute data for 1 stock x 1 year**: ~100K rows
- **1-minute data for 2000 stocks x 1 year**: ~200M rows

Consider implementing data retention policies or partitioning for large datasets.

## Troubleshooting

### Data Fetch Fails

**Problem**: NSE API returns 404 or 403

**Solution**:
1. NSE blocks requests without proper headers - the fetcher includes headers
2. Use Yahoo Finance fallback: it automatically activates
3. Check `historical_data_fetcher.log` for details

### Missing Data

**Problem**: Gaps in historical data

**Solution**:
```sql
-- Check for gaps
SELECT * FROM get_data_gaps('RELIANCE', '1D', '2024-01-01', '2025-01-01');

-- Re-fetch specific date range
python historical_data_fetcher.py --symbols "RELIANCE" --days 365 --force
```

### Backtest Shows No Trades

**Problem**: Strategy not generating orders

**Solution**:
1. Ensure enough historical data exists (check `--days` parameter)
2. Verify strategy parameters are reasonable
3. Add logging to your strategy's `on_data()` method
4. Check if conditions are ever met (e.g., RSI < 30)

## API Integration (Future)

The frontend currently shows a placeholder. To integrate with a backend API:

1. Create `/api/backtest/run` endpoint
2. Accept: strategy_id, symbol, date range, capital
3. Queue backtest job (use Celery/RQ for async processing)
4. Return job_id
5. Poll `/api/backtest/results/:job_id` for completion

Example API structure:

```typescript
// POST /api/backtest/run
{
  "strategy_id": "ma_crossover",
  "symbol": "RELIANCE",
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "initial_capital": 100000,
  "parameters": { "fast_period": 20, "slow_period": 50 }
}

// Response
{
  "job_id": "abc-123",
  "status": "queued"
}

// GET /api/backtest/results/abc-123
{
  "status": "completed",
  "metrics": { ... },
  "equity_curve": [ ... ],
  "trade_log": [ ... ]
}
```

## Next Steps

1. **Implement REST API endpoints** for backtest execution
2. **Add more strategies**: Bollinger Bands, MACD, Pairs Trading
3. **Support intraday data**: 1-minute, 5-minute candles
4. **Portfolio backtesting**: Test strategies across multiple symbols
5. **Walk-forward optimization**: Optimize strategy parameters
6. **Monte Carlo simulation**: Assess strategy robustness

## Support

For issues or questions:
1. Check logs: `/backend/historical_data_fetcher.log`
2. Verify database connectivity
3. Ensure Python dependencies are installed
4. Review strategy implementation for custom strategies
