from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseBroker(ABC):
    def __init__(self, access_token: str, refresh_token: str = None, config: Dict = None):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.config = config or {}

    @abstractmethod
    def get_profile(self) -> Dict[str, Any]:
        """Fetch user profile."""
        pass

    @abstractmethod
    def get_funds(self) -> Dict[str, Any]:
        """
        Fetch funds/margin.
        Returns:
            {
                "available_cash": float,
                "used_margin": float,
                "total_collateral": float
            }
        """
        pass

    @abstractmethod
    def get_holdings(self) -> List[Dict[str, Any]]:
        """
        Fetch holdings.
        Returns list of:
            {
                "symbol": str,
                "quantity": int,
                "average_price": float,
                "current_price": float,
                "exchange": str,
                "pnl": float
            }
        """
        pass

    @abstractmethod
    def get_positions(self) -> List[Dict[str, Any]]:
        """
        Fetch positions (intraday/F&O).
        Returns list of:
            {
                "symbol": str,
                "product": str,
                "net_quantity": int,
                "buy_price": float,
                "sell_price": float,
                "current_price": float,
                "m2m": float
            }
        """
        pass

    @abstractmethod
    def get_orders(self) -> List[Dict[str, Any]]:
        """
        Fetch orders for the day.
        Returns list of:
            {
                "order_id": str,
                "symbol": str,
                "transaction_type": str, # BUY/SELL
                "quantity": int,
                "price": float,
                "status": str,
                "timestamp": str
            }
        """
        pass
    
    @abstractmethod
    def refresh_access_token(self) -> Dict[str, str]:
        """
        Use refresh_token to get new access_token.
        Returns: {"access_token": "...", "refresh_token": "...", "expiry": "..."}
        """
        pass
