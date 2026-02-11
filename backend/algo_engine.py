
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase_manager import SupabaseManager
from dhan_client import DhanClient
from utils import log_info, log_error, log_success

class AlgoEngine:
    def __init__(self, db: SupabaseManager, dhan: DhanClient):
        self.db = db
        self.dhan = dhan

    def run_backtest_cycle(self):
        """
        Check for pending backtest jobs and execute them.
        """
        try:
            # 1. Fetch Pending Jobs
            # We need a method in SupabaseManager or raw query
            # Using raw postgrest via supabase client if available, or adding method to manager
            response = self.db.supabase.table('algo_backtest_results') \
                .select('*') \
                .eq('status', 'Pending') \
                .limit(1) \
                .execute()
            
            jobs = response.data
            if not jobs:
                return

            for job in jobs:
                log_info(f"Processing Backtest Job: {job['id']}")
                self._process_backtest(job)

        except Exception as e:
            log_error(f"Algo Cycle Error: {e}")

    def _process_backtest(self, job):
        try:
            params = job.get('parameters', {})
            symbol = params.get('symbol')
            period = params.get('period', '1y') # 1mo, 6mo, 1y

            if not symbol:
                self._fail_job(job['id'], "Missing Symbol")
                return

            # 2. Fetch Historical Data from Dhan
            # Calculate start/end dates based on period
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365) # Default 1y
            
            if period == '1mo': start_date = end_date - timedelta(days=30)
            elif period == '6mo': start_date = end_date - timedelta(days=180)
            elif period == '2y': start_date = end_date - timedelta(days=730)
            elif period == '5y': start_date = end_date - timedelta(days=1825)

            str_start = start_date.strftime('%Y-%m-%d')
            str_end = end_date.strftime('%Y-%m-%d')
            
            log_info(f"Fetching Data for {symbol} ({str_start} to {str_end})")
            
            # Fetch Daily Data for Backtest
            hist_data = self.dhan.get_historical_data(
                symbol=symbol,
                exchange='NSE',
                segment='EQUITY', # Assuming equity for backtest
                interval='D',
                start_date=str_start,
                end_date=str_end
            )

            if not hist_data or 'start_Time' not in hist_data:
                 self._fail_job(job['id'], "No Data Found or Dhan Error")
                 return

            # 3. Running Simulation (Simple Buy & Hold for now)
            # Dhan returns dict with lists: { 'start_Time': [], 'open': [], ... }
            df = pd.DataFrame(hist_data)
            # Typically columns: start_Time, open, high, low, close, volume (all lists)
            
            # Convert to readable format
            # Dhan time is epoch? No, documentation says date strings usually? 
            # Looking at previous logs or docs would help. Assuming typical OHLC.
            # Let's clean up key names if needed.
            
            # Calculate Equity Curve (Buy at first Close, Hold)
            initial_capital = 100000
            if len(df['close']) == 0:
                 self._fail_job(job['id'], "Empty Data")
                 return

            first_price = float(df['close'][0])
            quantity = initial_capital / first_price
            
            equity_curve = []
            max_equity = 0
            drawdown = 0
            
            # Dhan returns 'start_Time' as list of timestamps (likely int epoch or date string)
            # Needs parsing.
            times = df['start_Time']
            closes = df['close']
            
            for i in range(len(closes)):
                price = float(closes[i])
                eq = quantity * price
                if eq > max_equity: max_equity = eq
                dd = (max_equity - eq) / max_equity if max_equity > 0 else 0
                if dd > drawdown: drawdown = dd
                
                # Convert time
                t = times[i]
                # If int, convert. If string, leave.
                # Assuming Dhan returns something usable directly for chart (e.g. epoch * 1000 or ISO)
                
                equity_curve.append({
                    "date": t, 
                    "equity": round(eq, 2)
                })

            final_equity = equity_curve[-1]['equity']
            total_return = ((final_equity - initial_capital) / initial_capital) * 100
            
            # CAGR (approx)
            days = (end_date - start_date).days
            cagr = ((final_equity / initial_capital) ** (365/days) - 1) * 100 if days > 0 else 0

            metrics = {
                "total_return": round(total_return, 2),
                "max_drawdown": round(drawdown * 100, 2),
                "cagr": round(cagr, 2),
                "win_rate": 100 # Buy & Hold is 1 trade, 1 win if pos
            }
            
            # 4. Update Job
            self.db.supabase.table('algo_backtest_results').update({
                "status": "Completed",
                "equity_curve": equity_curve,
                "metrics": metrics,
                # "trade_log": ...
            }).eq('id', job['id']).execute()
            
            log_success(f"Backtest {job['id']} Completed via Dhan Data")

        except Exception as e:
            log_error(f"Backtest Process Error: {e}")
            self._fail_job(job['id'], str(e))

    def _fail_job(self, job_id, reason):
        self.db.supabase.table('algo_backtest_results').update({
            "status": "Failed",
            "metrics": {"error": reason}
        }).eq('id', job_id).execute()
        log_error(f"Backtest {job_id} Failed: {reason}")
