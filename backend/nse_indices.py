import pandas as pd
from nse_session import NSESession
from utils import log_info, log_error

class NSEIndices:
    def __init__(self, session: NSESession):
        self.session = session

    def fetch_all_indices(self):
        """
        Fetch snapshot of all indices.
        Endpoint: /api/allIndices
        """
        log_info("Fetching All Indices Snapshot...")
        endpoint = "/api/allIndices"
        data = self.session.get(endpoint)
        
        if data and "data" in data:
            indices = data["data"]
            # Map all indices available from NSE
            mapped = [
                {
                    "index": i.get("index"),
                    "last": i.get("last"),
                    "change": i.get("variation"),
                    "pChange": i.get("percentChange"),
                    "open": i.get("open"),
                    "high": i.get("high"),
                    "low": i.get("low"),
                    "previousClose": i.get("previousClose"),
                    "timestamp": data.get("timestamp")
                }
                for i in indices
            ]
            return mapped
        else:
            log_error("Failed to fetch indices data.")
            return []
