import time
import importlib
from supabase_manager import SupabaseManager
from brokers.upstox_broker import UpstoxBroker
from utils import log_info, log_error, log_success
import config

# Map broker names to classes
BROKER_MAP = {
    "upstox": UpstoxBroker,
    # "zerodha": ZerodhaBroker, 
    # Add others here
}

class BrokerSyncService:
    def __init__(self):
        self.db = SupabaseManager()

    def get_connected_accounts(self):
        """
        Fetch all accounts with status 'CONNECTED'.
        """
        if not self.db.supabase: return []
        try:
            # We need to join with broker_tokens to get access tokens?
            # Or just fetch accounts and then fetch tokens one by one (safer?)
            # Let's fetch accounts first.
            res = self.db.supabase.table("broker_accounts").select("*").eq("status", "CONNECTED").execute()
            return res.data
        except Exception as e:
            log_error(f"Error fetching connected accounts: {e}")
            return []

    def get_token_for_account(self, account_id):
        """
        Fetch access/refresh token for account.
        """
        try:
            res = self.db.supabase.table("broker_tokens").select("*").eq("account_id", account_id).single().execute()
            return res.data
        except Exception as e:
            log_error(f"Error fetching token for {account_id}: {e}")
            return None

    def sync_account(self, account):
        account_id = account.get("id")
        user_id = account.get("user_id")
        broker_name = account.get("broker_name")

        log_info(f"Syncing {broker_name} for user {user_id}...")

        token_data = self.get_token_for_account(account_id)
        if not token_data:
            log_error(f"No token found for account {account_id}")
            return

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")

        if broker_name not in BROKER_MAP:
            log_error(f"Broker {broker_name} implementation not found.")
            return

        BrokerClass = BROKER_MAP[broker_name]
        
        # Initialize Broker
        # We might need config for secrets if we implement token refresh
        broker_config = {
            "UPSTOX_CLIENT_ID": getattr(config, "UPSTOX_CLIENT_ID", ""),
            "UPSTOX_CLIENT_SECRET": getattr(config, "UPSTOX_CLIENT_SECRET", ""),
            "REDIRECT_URI": getattr(config, "REDIRECT_URI", "")
        }
        
        broker = BrokerClass(access_token, refresh_token, broker_config)

        # 1. Fetch & Upsert Funds
        funds = broker.get_funds()
        if funds:
            self.db.upsert_portfolio_funds(account_id, user_id, funds)

        # 2. Fetch & Upsert Holdings
        holdings = broker.get_holdings()
        if holdings:
            self.db.upsert_portfolio_holdings(account_id, user_id, holdings)

        # 3. Fetch & Upsert Positions
        positions = broker.get_positions()
        # Even if empty, we might want to clear old ones?
        self.db.replace_portfolio_positions(account_id, user_id, positions)

        # 4. Fetch & Upsert Orders
        orders = broker.get_orders()
        if orders:
            self.db.upsert_portfolio_orders(account_id, user_id, orders)
        
        log_success(f"Synced {broker_name} for user {user_id}")

    def run_sync_cycle(self):
        """
        Run one full sync cycle for all connected users.
        """
        accounts = self.get_connected_accounts()
        log_info(f"Found {len(accounts)} connected accounts to sync.")
        for account in accounts:
            try:
                self.sync_account(account)
            except Exception as e:
                log_error(f"Failed to sync account {account.get('id')}: {e}")

if __name__ == "__main__":
    service = BrokerSyncService()
    service.run_sync_cycle()
