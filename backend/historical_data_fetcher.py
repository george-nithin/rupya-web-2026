"""
Historical Data Fetcher
Fetches historical OHLC data from NSE India and Yahoo Finance
Stores data in Supabase market_historical_ohlc table
"""

import os
import sys
import requests
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import time
from supabase import create_client, Client
import yfinance as yf
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('historical_data_fetcher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


class NSEDataFetcher:
    """Fetches historical data from NSE India"""
    
    BASE_URL = "https://www.nseindia.com"
    HISTORICAL_API = f"{BASE_URL}/api/historical/cm/equity"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize session with NSE cookies"""
        try:
            response = self.session.get(self.BASE_URL, timeout=10)
            response.raise_for_status()
            logger.info("NSE session initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize NSE session: {e}")
    
    def fetch_historical_data(
        self, 
        symbol: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> Optional[List[Dict]]:
        """
        Fetch historical data from NSE
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE')
            from_date: Start date
            to_date: End date
            
        Returns:
            List of OHLC records or None if failed
        """
        try:
            # NSE API parameters
            params = {
                'symbol': symbol,
                'series': 'EQ',
                'from': from_date.strftime('%d-%m-%Y'),
                'to': to_date.strftime('%d-%m-%Y')
            }
            
            logger.info(f"Fetching NSE data for {symbol} from {from_date.date()} to {to_date.date()}")
            
            response = self.session.get(
                self.HISTORICAL_API,
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and data['data']:
                    records = []
                    for item in data['data']:
                        try:
                            record = {
                                'symbol': symbol,
                                'timeframe': '1D',
                                'timestamp': datetime.strptime(item['CH_TIMESTAMP'], '%d-%b-%Y').isoformat(),
                                'open': float(item['CH_OPENING_PRICE']),
                                'high': float(item['CH_TRADE_HIGH_PRICE']),
                                'low': float(item['CH_TRADE_LOW_PRICE']),
                                'close': float(item['CH_CLOSING_PRICE']),
                                'volume': int(item['CH_TOT_TRADED_QTY']),
                                'adjusted_close': None  # NSE doesn't provide adjusted close
                            }
                            records.append(record)
                        except (KeyError, ValueError) as e:
                            logger.warning(f"Error parsing record for {symbol}: {e}")
                            continue
                    
                    logger.info(f"Successfully fetched {len(records)} records for {symbol}")
                    return records
                else:
                    logger.warning(f"No data available for {symbol}")
                    return None
            else:
                logger.error(f"NSE API returned status {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching NSE data for {symbol}: {e}")
            return None


class YahooFinanceFetcher:
    """Fetches historical data from Yahoo Finance as fallback"""
    
    @staticmethod
    def fetch_historical_data(
        symbol: str,
        from_date: datetime,
        to_date: datetime
    ) -> Optional[List[Dict]]:
        """
        Fetch historical data from Yahoo Finance
        
        Args:
            symbol: Stock symbol with .NS suffix for NSE (e.g., 'RELIANCE.NS')
            from_date: Start date
            to_date: End date
            
        Returns:
            List of OHLC records or None if failed
        """
        try:
            # Add .NS suffix for NSE stocks if not present
            yahoo_symbol = f"{symbol}.NS" if not symbol.endswith('.NS') else symbol
            
            logger.info(f"Fetching Yahoo Finance data for {yahoo_symbol}")
            
            # Use yfinance to fetch data
            ticker = yf.Ticker(yahoo_symbol)
            df = ticker.history(
                start=from_date.strftime('%Y-%m-%d'),
                end=to_date.strftime('%Y-%m-%d'),
                interval='1d'
            )
            
            if df.empty:
                logger.warning(f"No data available from Yahoo Finance for {symbol}")
                return None
            
            records = []
            for index, row in df.iterrows():
                try:
                    record = {
                        'symbol': symbol.replace('.NS', ''),  # Remove .NS suffix
                        'timeframe': '1D',
                        'timestamp': index.isoformat(),
                        'open': float(row['Open']),
                        'high': float(row['High']),
                        'low': float(row['Low']),
                        'close': float(row['Close']),
                        'volume': int(row['Volume']),
                        'adjusted_close': float(row['Close'])  # Yahoo provides adjusted close
                    }
                    records.append(record)
                except (KeyError, ValueError) as e:
                    logger.warning(f"Error parsing Yahoo Finance record: {e}")
                    continue
            
            logger.info(f"Successfully fetched {len(records)} records from Yahoo Finance")
            return records
            
        except Exception as e:
            logger.error(f"Error fetching Yahoo Finance data for {symbol}: {e}")
            return None


class HistoricalDataManager:
    """Manages historical data fetching and storage"""
    
    def __init__(self):
        self.nse_fetcher = NSEDataFetcher()
        self.yahoo_fetcher = YahooFinanceFetcher()
    
    def get_last_sync_date(self, symbol: str, timeframe: str = '1D') -> datetime:
        """Get the last synced date for a symbol"""
        try:
            result = supabase.table('historical_data_sync_status').select('latest_date').eq(
                'symbol', symbol
            ).eq('timeframe', timeframe).single().execute()
            
            if result.data and result.data.get('latest_date'):
                return datetime.strptime(result.data['latest_date'], '%Y-%m-%d')
            else:
                # Default to 5 years ago if no data
                return datetime.now() - timedelta(days=5*365)
                
        except Exception as e:
            logger.warning(f"Could not get last sync date for {symbol}: {e}")
            return datetime.now() - timedelta(days=5*365)
    
    def store_ohlc_data(self, records: List[Dict]) -> bool:
        """Store OHLC records in database"""
        if not records:
            return False
        
        try:
            # Use upsert to handle duplicates
            response = supabase.table('market_historical_ohlc').upsert(
                records,
                on_conflict='symbol,timeframe,timestamp'
            ).execute()
            
            logger.info(f"Stored {len(records)} OHLC records")
            return True
            
        except Exception as e:
            logger.error(f"Error storing OHLC data: {e}")
            return False
    
    def update_sync_status(
        self,
        symbol: str,
        timeframe: str,
        earliest_date: datetime,
        latest_date: datetime,
        total_records: int,
        status: str = 'completed',
        data_source: str = 'NSE',
        error_message: Optional[str] = None
    ):
        """Update sync status in database"""
        try:
            supabase.rpc('update_sync_status', {
                'p_symbol': symbol,
                'p_timeframe': timeframe,
                'p_earliest_date': earliest_date.strftime('%Y-%m-%d'),
                'p_latest_date': latest_date.strftime('%Y-%m-%d'),
                'p_total_records': total_records,
                'p_status': status,
                'p_data_source': data_source,
                'p_error_message': error_message
            }).execute()
            
            logger.info(f"Updated sync status for {symbol}")
            
        except Exception as e:
            logger.error(f"Error updating sync status: {e}")
    
    def fetch_and_store(
        self,
        symbol: str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        force_refresh: bool = False
    ) -> bool:
        """
        Fetch and store historical data for a symbol
        
        Args:
            symbol: Stock symbol
            from_date: Start date (defaults to last sync date or 5 years ago)
            to_date: End date (defaults to today)
            force_refresh: If True, ignore last sync date
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Determine date range
            if not to_date:
                to_date = datetime.now()
            
            if not from_date:
                if force_refresh:
                    from_date = datetime.now() - timedelta(days=5*365)  # 5 years
                else:
                    # Get last sync date + 1 day
                    last_sync = self.get_last_sync_date(symbol)
                    from_date = last_sync + timedelta(days=1)
            
            # Check if we need to fetch data
            if from_date >= to_date:
                logger.info(f"Data for {symbol} is already up to date")
                return True
            
            logger.info(f"Fetching data for {symbol} from {from_date.date()} to {to_date.date()}")
            
            # Try NSE first
            records = self.nse_fetcher.fetch_historical_data(symbol, from_date, to_date)
            data_source = 'NSE'
            
            # Fallback to Yahoo Finance if NSE fails
            if not records:
                logger.info(f"Falling back to Yahoo Finance for {symbol}")
                records = self.yahoo_fetcher.fetch_historical_data(symbol, from_date, to_date)
                data_source = 'Yahoo Finance'
            
            if not records:
                error_msg = f"No data available from any source for {symbol}"
                logger.error(error_msg)
                self.update_sync_status(
                    symbol, '1D', from_date, to_date, 0, 
                    'failed', data_source, error_msg
                )
                return False
            
            # Store data
            if self.store_ohlc_data(records):
                # Update sync status
                earliest = min(datetime.fromisoformat(r['timestamp']) for r in records)
                latest = max(datetime.fromisoformat(r['timestamp']) for r in records)
                
                self.update_sync_status(
                    symbol, '1D', earliest, latest, len(records),
                    'completed', data_source
                )
                
                logger.info(f"Successfully synced {len(records)} records for {symbol}")
                return True
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error in fetch_and_store for {symbol}: {e}")
            return False


def get_nse_symbols(limit: Optional[int] = None) -> List[str]:
    """Get list of NSE symbols from database"""
    try:
        query = supabase.table('market_equity_quotes').select('symbol')
        
        if limit:
            query = query.limit(limit)
        
        result = query.execute()
        
        if result.data:
            symbols = [item['symbol'] for item in result.data]
            logger.info(f"Found {len(symbols)} symbols to process")
            return symbols
        else:
            logger.warning("No symbols found in database")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching symbols: {e}")
        return []


def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Fetch historical OHLC data')
    parser.add_argument('--symbols', type=str, help='Comma-separated list of symbols')
    parser.add_argument('--days', type=int, default=365, help='Number of days of historical data to fetch')
    parser.add_argument('--limit', type=int, help='Limit number of symbols to process')
    parser.add_argument('--force', action='store_true', help='Force refresh all data')
    
    args = parser.parse_args()
    
    manager = HistoricalDataManager()
    
    # Get symbols to process
    if args.symbols:
        symbols = [s.strip() for s in args.symbols.split(',')]
    else:
        symbols = get_nse_symbols(limit=args.limit)
    
    if not symbols:
        logger.error("No symbols to process")
        return
    
    # Calculate date range
    to_date = datetime.now()
    from_date = to_date - timedelta(days=args.days)
    
    logger.info(f"Starting historical data sync for {len(symbols)} symbols")
    logger.info(f"Date range: {from_date.date()} to {to_date.date()}")
    
    success_count = 0
    failed_symbols = []
    
    for i, symbol in enumerate(symbols, 1):
        logger.info(f"Processing {i}/{len(symbols)}: {symbol}")
        
        if manager.fetch_and_store(symbol, from_date, to_date, force_refresh=args.force):
            success_count += 1
        else:
            failed_symbols.append(symbol)
        
        # Rate limiting - wait between requests
        if i < len(symbols):
            time.sleep(1)  # 1 second delay between symbols
    
    logger.info("=" * 60)
    logger.info(f"Sync completed: {success_count}/{len(symbols)} successful")
    if failed_symbols:
        logger.info(f"Failed symbols: {', '.join(failed_symbols)}")


if __name__ == '__main__':
    main()
