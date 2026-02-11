
import requests
import time
from utils import log_info, log_error, log_success
from supabase_manager import SupabaseManager
from nse_session import NSESession
from nse_equity import NSEEquity

class SectorFetcher:
    def __init__(self):
        self.session = NSESession()
        self.nse = NSEEquity(self.session)
        self.db = SupabaseManager()
        
        # List of sectoral indices to track
        self.indices = [
            "NIFTY BANK", "NIFTY IT", "NIFTY AUTO", "NIFTY PHARMA", "NIFTY FMCG",
            "NIFTY METAL", "NIFTY REALTY", "NIFTY ENERGY", "NIFTY INFRA",
            "NIFTY PSU BANK", "NIFTY PSE", "NIFTY SERVICE SECTOR", "NIFTY COMMODITIES",
            "NIFTY CONSUMPTION", "NIFTY FIN SERVICE", "NIFTY 50", "NIFTY 500", "NIFTY MIDCAP 100",
            "NIFTY SMLCAP 100"
        ]

    def fetch_index_data(self, index_name):
        """
        Fetch data for a specific index. 
        We can use /api/equity-stockIndices?index={index_name} which returns index level info + components.
        Or /api/allIndices which gives a summary of all.
        Let's use /api/allIndices for efficiency if possible, or individual for components.
        
        For the Sector Page, we primarily need the Index Value, Change, % Change, Volume (if avail).
        """
        try:
            # First, let's try to get a summary of all indices to save requests
            # If that fails or we need components later, we'd loop.
            # But for "Sector Overview", the summary is best.
            pass
        except Exception as e:
            log_error(f"Error fetching {index_name}: {e}")
            return None

    def fetch_all_sectors_summary(self):
        """
        Fetch all indices status from /api/allIndices
        """
        log_info("Fetching All Indices Summary...")
        url = "/api/allIndices"
        data = self.session.get(url)
        
        if not data or "data" not in data:
            log_error("Failed to fetch allIndices or empty response")
            return []
            
        results = []
        for item in data["data"]:
            # item keys: index, last, variation, percentChange, open, high, low, previousClose, yearHigh, yearLow, pe, pb, dy
            index_name = item.get("index")
             # Filter for relevant indices (or keep all if useful)
             # We definitely want the ones in self.indices.
             # Note: NSE API names might differ slightly (e.g. "NIFTY 50" vs "NIFTY 50 Pre Open")
            
            # Normalize check (contains or exact match)
            if any(target in index_name for target in self.indices):
                sector_data = {
                    "symbol": index_name,
                    "last_price": item.get("last"),
                    "change": item.get("variation"),
                    "p_change": item.get("percentChange"),
                    "open": item.get("open"),
                    "high": item.get("high"),
                    "low": item.get("low"),
                    "previous_close": item.get("previousClose"),
                    # "volume" might not be in this summary, usually in individual index quote
                    "trend": "bullish" if (item.get("percentChange") or 0) > 0 else "bearish" if (item.get("percentChange") or 0) < 0 else "neutral",
                    "updated_at": "now()"
                }
                results.append(sector_data)
        
        return results

    def run_update(self):
        log_info("--- Updating Sector Data ---")
        sectors = self.fetch_all_sectors_summary()
        
        if sectors:
            log_info(f"Fetched {len(sectors)} sector indices. Upserting...")
            batch_size = 50
            for i in range(0, len(sectors), batch_size):
                batch = sectors[i:i+batch_size]
                # Upsert to Supabase
                try:
                    res = self.db.supabase.table("market_sectors").upsert(batch, on_conflict="symbol").execute()
                    # log_success(f"Upserted batch {i//batch_size + 1}")
                except Exception as e:
                    log_error(f"Failed to upsert sectors: {e}")
            log_success("Sector Data Updated Successfully")
        else:
            log_error("No sector data fetched.")

if __name__ == "__main__":
    fetcher = SectorFetcher()
    fetcher.run_update()
