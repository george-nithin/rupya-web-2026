#!/usr/bin/env python3
"""
CLI tool to run backtests
Usage: python run_backtest.py --strategy <strategy_name> --symbol <symbol> --start-date YYYY-MM-DD --end-date YYYY-MM-DD
"""

import argparse
from datetime import datetime
import sys
import os
import traceback # Added for better error reporting

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Supabase client
from supabase import create_client

from backtesting_engine import BacktestEngine, TradingStrategy # Imported TradingStrategy for custom loading
from sample_strategies import (
    MovingAverageCrossover,
    RSIMeanReversion,
    BreakoutStrategy,
    BuyAndHold
)


STRATEGIES = {
    'ma_crossover': MovingAverageCrossover,
    'rsi_mean_reversion': RSIMeanReversion,
    'breakout': BreakoutStrategy,
    'buy_and_hold': BuyAndHold
}

def load_custom_strategy(strategy_id: str) -> TradingStrategy:
    """Load custom strategy from database"""
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        # Fallback to defaults if env vars valid but connection fails?
        # Check if we were passed them via some other way?
        # Assuming run via API which sets them.
        raise ValueError("Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)")
    
    try:
        supabase = create_client(url, key)
        res = supabase.table("algo_strategies").select("code, name").eq("id", strategy_id).execute()
        
        if not res.data:
            raise ValueError(f"Strategy {strategy_id} not found")
            
        strategy_data = res.data[0]
        code = strategy_data.get("code")
        
        if not code:
             raise ValueError(f"Strategy {strategy_data.get('name')} has no code defined")
             
        # Prepare execution context
        # Make sure common libraries are available
        import pandas as pd
        import numpy as np
        try:
            import talib
        except ImportError:
            talib = None
        
        context = {
            'TradingStrategy': TradingStrategy,
            'pd': pd,
            'np': np,
            'talib': talib,
            'datetime': datetime
        }
        
        # Execute code
        exec(code, context)
        
        # Find the strategy class
        strategy_class = None
        for name, obj in context.items():
            if isinstance(obj, type) and issubclass(obj, TradingStrategy) and obj is not TradingStrategy:
                strategy_class = obj
                break
                
        if not strategy_class:
            raise ValueError("No class inheriting from TradingStrategy found in custom code")
            
        # Instantiate
        return strategy_class()
        
    except Exception as e:
        raise ValueError(f"Failed to load custom strategy: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Run backtest on historical data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run MA Crossover strategy on RELIANCE for 2024
  python run_backtest.py --strategy ma_crossover --symbol RELIANCE --start-date 2024-01-01 --end-date 2025-01-01
  
  # Run Custom Strategy by ID
  python run_backtest.py --strategy <UUID> --symbol TCS --start-date 2024-01-01 --end-date 2025-01-01
        """
    )
    
    parser.add_argument(
        '--strategy',
        type=str,
        required=True,
        help='Strategy name (predefined) or UUID (custom)'
    )
    
    # ... rest of arguments ...
    parser.add_argument(
        '--symbol',
        type=str,
        required=True,
        help='Stock symbol (e.g., RELIANCE, TCS, INFY)'
    )
    
    parser.add_argument(
        '--start-date',
        type=str,
        required=True,
        help='Start date (YYYY-MM-DD)'
    )
    
    parser.add_argument(
        '--end-date',
        type=str,
        required=True,
        help='End date (YYYY-MM-DD)'
    )
    
    parser.add_argument(
        '--capital',
        type=float,
        default=100000,
        help='Initial capital (default: 100000)'
    )
    
    parser.add_argument(
        '--commission',
        type=float,
        default=0.001,
        help='Commission rate (default: 0.001 = 0.1%%)'
    )
    
    parser.add_argument(
        '--slippage',
        type=float,
        default=0.0001,
        help='Slippage rate (default: 0.0001 = 0.01%%)'
    )
    
    parser.add_argument(
        '--save',
        action='store_true',
        help='Save results to database'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results in JSON format'
    )
    
    args = parser.parse_args()
    
    # Parse dates
    try:
        start_date = datetime.strptime(args.start_date, '%Y-%m-%d')
        end_date = datetime.strptime(args.end_date, '%Y-%m-%d')
    except ValueError:
        print("Error: Dates must be in YYYY-MM-DD format")
        sys.exit(1)
    
    # Load Strategy
    try:
        if args.strategy in STRATEGIES:
             StrategyClass = STRATEGIES[args.strategy]
             strategy = StrategyClass()
        else:
             # Assume it is a custom strategy ID
             strategy = load_custom_strategy(args.strategy)
             
    except Exception as e:
        if args.json:
             import json
             print(json.dumps({'error': str(e)}))
             sys.exit(1)
        else:
             print(f"Error loading strategy: {e}")
             sys.exit(1)
    
    # Create backtest engine
    engine = BacktestEngine(
        commission=args.commission,
        slippage=args.slippage
    )
    
    print(f"\n{'='*80}")
    print(f"Running Backtest: {strategy.name}")
    print(f"{'='*80}")
    print(f"Symbol: {args.symbol}")
    print(f"Period: {start_date.date()} to {end_date.date()}")
    print(f"Initial Capital: ₹{args.capital:,.2f}")
    print(f"Commission: {args.commission*100}%")
    print(f"Slippage: {args.slippage*100}%")
    print(f"{'='*80}\n")
    
    try:
        # Run backtest
        result = engine.run(
            strategy=strategy,
            symbol=args.symbol,
            start_date=start_date,
            end_date=end_date,
            initial_capital=args.capital
        )
        
        # Custom JSON encoder for datetime objects
        import json
        class DateTimeEncoder(json.JSONEncoder):
            def default(self, o):
                if isinstance(o, (datetime, datetime.date)):
                    return o.isoformat()
                return super().default(o)

        if args.json:
            # Prepare JSON output
            output_data = {
                'status': 'completed',
                'metrics': {
                    'initial_capital': result.initial_capital,
                    'final_capital': result.final_capital,
                    'total_return': result.total_return,
                    'cagr': result.cagr,
                    'sharpe_ratio': result.sharpe_ratio,
                    'max_drawdown': result.max_drawdown,
                    'total_trades': result.total_trades,
                    'winning_trades': result.winning_trades,
                    'losing_trades': result.losing_trades,
                    'win_rate': result.win_rate,
                    'profit_factor': result.profit_factor,
                    'average_win': result.average_win,
                    'average_loss': result.average_loss
                },
                'equity_curve': result.portfolio.equity_curve,
                'trade_log': [
                    {
                        'entry_date': t.entry_date.isoformat(),
                        'exit_date': t.exit_date.isoformat(),
                        'entry_price': t.entry_price,
                        'exit_price': t.exit_price,
                        'quantity': t.quantity,
                        'pnl': t.pnl,
                        'pnl_percent': t.pnl_percent,
                        'holding_days': t.holding_period_days
                    } for t in result.portfolio.trades
                ]
            }
            print(json.dumps(output_data, cls=DateTimeEncoder))
        else:
            # Print results
            print(f"\n{'='*80}")
            print("BACKTEST RESULTS")
            print(f"{'='*80}")
            print(f"\nPerformance Metrics:")
            print(f"  Initial Capital:     ₹{result.initial_capital:,.2f}")
            print(f"  Final Capital:       ₹{result.final_capital:,.2f}")
            print(f"  Total Return:        {result.total_return:+.2f}%")
            print(f"  CAGR:                {result.cagr:+.2f}%")
            print(f"  Sharpe Ratio:        {result.sharpe_ratio:.2f}")
            print(f"  Max Drawdown:        {result.max_drawdown:.2f}%")
            
            print(f"\nTrade Statistics:")
            print(f"  Total Trades:        {result.total_trades}")
            print(f"  Winning Trades:      {result.winning_trades}")
            print(f"  Losing Trades:       {result.losing_trades}")
            print(f"  Win Rate:            {result.win_rate:.2f}%")
            print(f"  Profit Factor:       {result.profit_factor:.2f}")
            print(f"  Average Win:         ₹{result.average_win:,.2f}")
            print(f"  Average Loss:        ₹{result.average_loss:,.2f}")
            print(f"{'='*80}\n")
            
            # Show recent trades
            if result.portfolio.trades:
                print("\nRecent Trades (last 5):")
                print(f"{'Entry Date':<12} {'Exit Date':<12} {'Entry':<10} {'Exit':<10} {'Qty':<6} {'P&L':<12} {'Return':<10}")
                print("-" * 80)
                
                for trade in result.portfolio.trades[-5:]:
                    print(f"{trade.entry_date.strftime('%Y-%m-%d'):<12} "
                        f"{trade.exit_date.strftime('%Y-%m-%d'):<12} "
                        f"₹{trade.entry_price:<9.2f} "
                        f"₹{trade.exit_price:<9.2f} "
                        f"{trade.quantity:<6} "
                        f"₹{trade.pnl:<11,.2f} "
                        f"{trade.pnl_percent:+.2f}%")
            
            # Save to database if requested
            if args.save:
                print("\nSaving results to database...")
                # Note: This requires a strategy_id from the database
                # For demo, we'll skip this step
                print("Note: Save to database requires a strategy_id. Skipping.")
            
            print(f"\n{'='*80}\n")
        
    except Exception as e:
        print(f"\nError running backtest: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
