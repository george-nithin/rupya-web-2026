import requests
from .base_broker import BaseBroker
from typing import List, Dict, Any
from utils import log_error

class UpstoxBroker(BaseBroker):
    BASE_URL = "https://api.upstox.com/v2"

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json"
        }

    def get_profile(self) -> Dict[str, Any]:
        try:
            url = f"{self.BASE_URL}/user/profile"
            response = requests.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json().get("data", {})
                return {
                    "user_id": data.get("user_id"),
                    "name": data.get("user_name"),
                    "email": data.get("email"),
                    "broker": "upstox"
                }
            log_error(f"Upstox Profile Error: {response.text}")
        except Exception as e:
            log_error(f"Upstox Profile Exception: {e}")
        return {}

    def get_funds(self) -> Dict[str, Any]:
        try:
            url = f"{self.BASE_URL}/user/get-funds-and-margin"
            response = requests.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json().get("data", {})
                equity = data.get("equity", {}) # usually segregated
                return {
                    "available_cash": float(equity.get("available_margin", 0)),
                    "used_margin": float(equity.get("used_margin", 0)),
                    "total_collateral": float(equity.get("total_collateral", 0))
                }
        except Exception as e:
            log_error(f"Upstox Funds Exception: {e}")
        return {}

    def get_holdings(self) -> List[Dict[str, Any]]:
        holdings_list = []
        try:
            url = f"{self.BASE_URL}/portfolio/long-term-holdings"
            response = requests.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json().get("data", [])
                for h in data:
                    holdings_list.append({
                        "symbol": h.get("trading_symbol"),
                        "quantity": int(h.get("quantity", 0)),
                        "average_price": float(h.get("average_price", 0)),
                        "current_price": float(h.get("last_price", 0)),
                        "exchange": h.get("exchange", "NSE"),
                        "pnl": float(h.get("pnl", 0))
                    })
        except Exception as e:
            log_error(f"Upstox Holdings Exception: {e}")
        return holdings_list

    def get_positions(self) -> List[Dict[str, Any]]:
        positions_list = []
        try:
            url = f"{self.BASE_URL}/portfolio/short-term-positions"
            response = requests.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json().get("data", [])
                for p in data:
                    positions_list.append({
                        "symbol": p.get("trading_symbol"),
                        "product": p.get("product"),
                        "net_quantity": int(p.get("net_quantity", 0)),
                        "buy_price": float(p.get("buy_price", 0)),
                        "sell_price": float(p.get("sell_price", 0)),
                        "current_price": float(p.get("last_price", 0)),
                        "m2m": float(p.get("m2m", 0)),
                        "realized_pnl": float(p.get("realized_profit", 0)),
                        "unrealized_pnl": float(p.get("unrealized_profit", 0))
                    })
        except Exception as e:
            log_error(f"Upstox Positions Exception: {e}")
        return positions_list

    def get_orders(self) -> List[Dict[str, Any]]:
        orders_list = []
        try:
            url = f"{self.BASE_URL}/order/retrieve-all"
            response = requests.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json().get("data", [])
                for o in data:
                    orders_list.append({
                        "order_id": o.get("order_id"),
                        "symbol": o.get("trading_symbol"),
                        "transaction_type": o.get("transaction_type"),
                        "quantity": int(o.get("quantity", 0)),
                        "price": float(o.get("price", 0)),
                        "status": o.get("status"),
                        "timestamp": o.get("order_timestamp")
                    })
        except Exception as e:
            log_error(f"Upstox Orders Exception: {e}")
        return orders_list

    def refresh_access_token(self) -> Dict[str, str]:
        # Implementation depends on Broker API specific endpoint
        # Upstox usually requires client_id/secret for this.
        # These secrets should be in config/env, not passed from frontend.
        # We assume self.config has them.
        try:
            url = "https://api.upstox.com/v2/login/authorization/token"
            payload = {
                "client_id": self.config.get("UPSTOX_CLIENT_ID"),
                "client_secret": self.config.get("UPSTOX_CLIENT_SECRET"),
                "redirect_uri": self.config.get("REDIRECT_URI"),
                "grant_type": "refresh_token",
                "refresh_token": self.refresh_token
            }
            # This is a POST request
            # response = requests.post(url, data=payload)
            # if response.status_code == 200:
            #     return response.json()
            pass
        except Exception:
            pass
        return None
