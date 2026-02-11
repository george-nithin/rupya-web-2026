
import os
import pandas as pd
import io
import json
from dhanhq import dhanhq
from dotenv import load_dotenv
import yfinance as yf
from datetime import datetime
from curl_cffi import requests
from utils import log_info, log_error, log_success

load_dotenv()

class DhanClient:
    def __init__(self):
        self.client_id = os.getenv("DHAN_CLIENT_ID")
        self.access_token = os.getenv("DHAN_ACCESS_TOKEN")
        
        self.dhan = None
        if self.client_id and self.access_token:
            try:
                self.dhan = dhanhq(self.client_id, self.access_token)
                
                # Check for Sandbox Environment
                dhan_env = os.getenv("DHAN_ENV", "PRODUCTION").upper()
                if dhan_env == "SANDBOX":
                    self.dhan.base_url = "https://sandbox.dhan.co/v2"
                    log_success("Dhan Client initialized in SANDBOX mode")
                else:
                    log_success("Initialized Dhan Client")
            except Exception as e:
                log_error(f"Failed to init Dhan Client: {e}")
        else:
            log_error("Dhan Credentials missng in .env (DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)")
            
        self.scrip_master = None
        self.id_cache = {}

    def _load_scrip_master(self):
        """Fetch and cache Dhan Scrip Master CSV"""
        if self.scrip_master is not None: return

        log_info("Fetching Dhan Scrip Master...")
        try:
            url = "https://images.dhan.co/api-data/api-scrip-master.csv"
            # create a session with curl_cffi to avoid blocks
            session = requests.Session(impersonate="chrome110")
            response = session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.scrip_master = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
                log_success(f"Loaded Scrip Master: {len(self.scrip_master)} rows")
            else:
                log_error(f"Failed to fetch Scrip Master: {response.status_code}")
        except Exception as e:
            log_error(f"Scrip Master fetch error: {e}")

    def get_security_id(self, symbol, exchange='NSE', instrument='EQUITY'):
        """Find Security ID for a given symbol"""
        if symbol in self.id_cache: return self.id_cache[symbol]
        
        if self.scrip_master is None:
            self._load_scrip_master()
            if self.scrip_master is None: return None

        try:
            # Map common names to Dhan Trading Symbols
            target = symbol
            if symbol == "NIFTY": target = "NIFTY"
            elif symbol == "BANKNIFTY": target = "BANKNIFTY"
            
            # Filter based on Exchange and Instrument
            mask = (self.scrip_master['SEM_EXM_EXCH_ID'] == exchange) & \
                   (self.scrip_master['SEM_TRADING_SYMBOL'] == target)

            if instrument == 'INDEX':
                 mask = mask & (self.scrip_master['SEM_INSTRUMENT_NAME'] == 'INDEX')
            # For Equity, it might be 'EQUITY' or 'EQ' depending on CSV, usually 'EQUITY' in Dhan docs
            
            row = self.scrip_master[mask]
            
            if not row.empty:
                sid = int(row.iloc[0]['SEM_SMST_SECURITY_ID'])
                self.id_cache[symbol] = sid
                log_info(f"Found ID for {symbol}: {sid}")
                return sid
            
            log_error(f"Security ID not found for {target}")
            return None
            
        except Exception as e:
            log_error(f"Error finding Security ID for {symbol}: {e}")
            return None

    def get_expiry_date(self, symbol):
        """Get nearest expiry from yfinance for the underlying"""
        yf_sym = "^NSEI" if symbol == "NIFTY" else "^NSEBANK" if symbol == "BANKNIFTY" else symbol
        try:
            tk = yf.Ticker(yf_sym)
            if not tk.options: 
                # log_error(f"No options found for {symbol} via yfinance")
                return None
            exp = tk.options[0] # YYYY-MM-DD
            # log_info(f"Using Expiry for {symbol}: {exp}")
            return exp
        except:
            return None


    def fetch_option_chain(self, symbol):
        """
        Fetch Option Chain from Dhan using ID and Expiry.
        Returns data in the format expected by frontend.
        """
        if not self.dhan: return None
        
        sec_id = self.get_security_id(symbol, instrument='INDEX') # Assuming Index OC for now
        if not sec_id: return None
            
        expiry = self.get_expiry_date(symbol)
        if not expiry: return None
            
        log_info(f"Fetching Dhan Option Chain for {symbol} (ID: {sec_id}, Exp: {expiry})")
        

        try:
            # Call Dhan API
            response = self.dhan.option_chain(
                under_security_id=str(sec_id),
                under_exchange_segment=self.dhan.INDEX, 
                expiry=expiry
            )
            
            if response['status'] == 'success':
                return self._transform_oc_data(symbol, expiry, response['data'])
            else:
                log_error(f"Dhan API Error: {response.get('remarks', 'Unknown Error')}")
                return None
                
        except Exception as e:
            log_error(f"Dhan Option Chain Exception: {e}")
            return None

    def _transform_oc_data(self, symbol, expiry, raw_data):
        """
        Transform Dhan raw data to expected schema.
        Frontend expects nested objects for CE/PE.
        """
        try:
            return {
                "symbol": symbol,
                "records": {
                    "expiryDates": [expiry],
                    "underlyingValue": 0, 
                    "timestamp": str(datetime.now())
                },
                "filtered": {
                    "data": [] 
                },
                "raw_dhan_data": raw_data 
            }
        except Exception as e:
            log_error(f"Transform Error: {e}")
            return None

    # ==========================================
    # USER PORTFOLIO METHODS
    # ==========================================

    def get_holdings(self):
        """Fetch User Holdings"""
        if not self.dhan: return None
        try:
            response = self.dhan.get_holdings()
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Dhan Holdings Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception fetching holdings: {e}")
            return None

    def get_positions(self):
        """Fetch User Positions"""
        if not self.dhan: return None
        try:
            response = self.dhan.get_positions()
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Dhan Positions Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception fetching positions: {e}")
            return None
            
    def get_funds(self):
        """Fetch User Funds/Margin"""
        if not self.dhan: return None
        try:
            response = self.dhan.get_fund_limits()
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Dhan Funds Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception fetching funds: {e}")
            return None

    def get_order_list(self):
        """Fetch User Orders"""
        if not self.dhan: return None
        try:
            response = self.dhan.get_order_list()
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Dhan Orders Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception fetching orders: {e}")
            return None

    # ==========================================
    # HISTORICAL DATA & ALGO METHODS
    # ==========================================

    def get_historical_data(self, symbol, exchange, segment, interval, start_date=None, end_date=None):
        """
        Fetch historical candle data.
        interval: '1', '5', '15', '30', '60', 'D' (Daily)
        """
        if not self.dhan: return None
        
        # Resolve IDs
        sec_id = self.get_security_id(symbol, exchange=exchange, instrument=segment)
        if not sec_id: return None
            
        try:
            # Map Exchange/Segment Strings to Constants if needed
            exch_code = self.dhan.NSE if exchange == 'NSE' else self.dhan.BSE
            
            if interval == 'D':
                # Daily Data
                response = self.dhan.historical_daily_data(
                    security_id=str(sec_id),
                    exchange_segment=exch_code,
                    instrument_type=segment, # e.g. 'EQUITY', 'INDEX'
                    expiry_code=0,
                    from_date=start_date, # YYYY-MM-DD
                    to_date=end_date
                )
            else:
                # Intraday
                # parse interval to int
                try:
                    int_val = int(interval)
                except:
                    int_val = 1 # Default
                    
                response = self.dhan.intraday_minute_data(
                    security_id=str(sec_id),
                    exchange_segment=exch_code,
                    instrument_type=segment,
                    from_date=start_date, # YYYY-MM-DD
                    to_date=end_date,
                    interval=int_val
                )
                
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Dhan History Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception fetching history: {e}")
            return None

    def place_order(self, symbol, exchange, segment, transaction_type, quantity, order_type, price=0, trigger_price=0, product_type='INTRADAY'):
        """
        Place an Order.
        transaction_type: 'BUY' | 'SELL'
        order_type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_MARKET'
        product_type: 'CNC' | 'INTRADAY' | 'MARGIN' | 'CO' | 'BO'
        """
        if not self.dhan: return None
        
        sec_id = self.get_security_id(symbol, exchange=exchange, instrument=segment)
        if not sec_id: return None
        
        try:
            # Map constants
            # e.g. self.dhan.BUY, self.dhan.NSE, etc.
            # Using strings usually works if SDK supports it, but constants safer.
            # For simplicity, assuming strings work or need mapping.
            # Based on dir(dhan), we have BUY, SELL, CNC, INTRA, LIMIT, MARKET etc.
            
            txn_type = self.dhan.BUY if transaction_type == 'BUY' else self.dhan.SELL
            ord_type = getattr(self.dhan, order_type, self.dhan.MARKET)
            prod_type = getattr(self.dhan, product_type, self.dhan.INTRA) # INTRADAY -> INTRA?
            exch_seg = self.dhan.NSE # default or param
            
            response = self.dhan.place_order(
                security_id=str(sec_id),
                exchange_segment=exch_seg,
                transaction_type=txn_type,
                quantity=quantity,
                order_type=ord_type,
                product_type=prod_type,
                price=price,
                trigger_price=trigger_price
            )
            
            if response['status'] == 'success':
                return response['data']
            else:
                log_error(f"Order Placement Error: {response.get('remarks')}")
                return None
        except Exception as e:
            log_error(f"Exception placing order: {e}")
            return None

