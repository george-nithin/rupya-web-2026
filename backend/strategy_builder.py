
from dhan_client import DhanClient
from utils import log_info, log_error

class StrategyBuilder:
    def __init__(self, dhan_client: DhanClient):
        self.dhan = dhan_client

    def create_straddle(self, symbol, expiry, strike_price, quantity, transaction_type='BUY'):
        """
        Create a Straddle Strategy: Buy/Sell both CE and PE at same strike.
        Returns list of order configs.
        """
        legs = [
            {
                "symbol": symbol,
                "exchange": "NSE",
                "segment": "INDEX", # or NSE_FNO, depends on symbol (Index vs Stock)
                "instrument_type": "OPTIDX", # Option Index or OPTSTK
                "strike": strike_price,
                "option_type": "CE",
                "transaction_type": transaction_type,
                "quantity": quantity,
                "expiry": expiry
            },
            {
                "symbol": symbol,
                "exchange": "NSE",
                "segment": "INDEX",
                "instrument_type": "OPTIDX",
                "strike": strike_price,
                "option_type": "PE",
                "transaction_type": transaction_type,
                "quantity": quantity,
                "expiry": expiry
            }
        ]
        return legs

    def create_strangle(self, symbol, expiry, call_strike, put_strike, quantity, transaction_type='BUY'):
        """
        Create a Strangle: Buy/Sell OTM CE and PE.
        """
        legs = [
            {
                "symbol": symbol,
                "exchange": "NSE",
                "segment": "INDEX",
                "instrument_type": "OPTIDX",
                "strike": call_strike,
                "option_type": "CE",
                "transaction_type": transaction_type,
                "quantity": quantity,
                "expiry": expiry
            },
            {
                "symbol": symbol,
                "exchange": "NSE",
                "segment": "INDEX",
                "instrument_type": "OPTIDX",
                "strike": put_strike,
                "option_type": "PE",
                "transaction_type": transaction_type,
                "quantity": quantity,
                "expiry": expiry
            }
        ]
        return legs

    def execute_strategy(self, legs):
        """
        Execute a list of legs.
        Note: This is sequential. For atomic execution, basket orders are preferred if supported.
        """
        results = []
        for leg in legs:
            # Need to resolve Security ID for the specific Option Contract
            # logic to construct trading symbol / find ID for OPTIDX
            # symbol format e.g. "NIFTY-22FEB-22000-CE"
            # This requires complex lookup in Scrip Master based on strike/expiry/type.
            
            # For now, just logging the intent as full implementation requires 
            # Scrip Master filtering logic for Options which is heavy.
            log_info(f"Preparing to place leg: {leg}")
            
            # Todo: Implement find_option_id(symbol, strike, type, expiry) in DhanClient
            # sid = self.dhan.find_option_id(...)
            # resp = self.dhan.place_order(sid, ...)
            # results.append(resp)
            
        return results
