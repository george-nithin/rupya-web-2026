
import pandas as pd
import numpy as np
import sys
import os

# Add parent directory to path to import modules from nse_backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success

class PortfolioAnalyzer:
    def __init__(self):
        self.db = SupabaseManager()

    def analyze_user_portfolio(self, user_id: str):
        """
        Full analysis pipeline for a single user.
        1. Fetch Holdings
        2. Enrich with Market Data (Sector, Cap)
        3. Calculate Metrics (HHI, Score)
        4. Upsert to DB
        """
        log_info(f"Analyzing Portfolio for User: {user_id}")
        
        # 1. Fetch Holdings from Webapp Table
        holdings_res = self.db.supabase.table("user_portfolio")\
            .select("symbol, quantity, avg_price")\
            .eq("user_id", user_id)\
            .execute()
            
        holdings = holdings_res.data
        if not holdings:
            log_info("No holdings found.")
            return

        df = pd.DataFrame(holdings)
        # Rename for internal logic if needed, or adjust logic
        df = df.rename(columns={"avg_price": "average_price"})
        
        # 2. Fetch Market Data for these symbols
        symbols = df["symbol"].unique().tolist()
        quotes_res = self.db.supabase.table("market_equity_quotes")\
            .select("symbol, sector, market_cap, last_price, percent_change")\
            .in_("symbol", symbols)\
            .execute()
            
        quotes_map = {q["symbol"]: q for q in quotes_res.data}
        
        # Enrich DataFrame with current prices
        df["current_price"] = df["symbol"].map(lambda x: quotes_map.get(x, {}).get("last_price", 0))
        df["current_value"] = df["quantity"] * df["current_price"]
        
        total_value = df["current_value"].sum()
        if total_value == 0:
            log_error("Total portfolio value is zero. Skipping analysis.")
            return

        # Enrich with metadata
        df["sector"] = df["symbol"].map(lambda x: quotes_map.get(x, {}).get("sector", "Unknown"))
        df["market_cap_val"] = df["symbol"].map(lambda x: quotes_map.get(x, {}).get("market_cap", 0))
        
        # Cap Classification (Simple Heuristic for INR Market Cap)
        # Large: > 20,000 Cr, Mid: 5k-20k, Small: < 5k
        # Assuming market_cap in DB is in Cr? Or full value? 
        # Usually API returns full value or Lakhs. Let's assume Cr for logic or adjust.
        # If unknown, we label "Unknown".
        def classify_cap(val):
            # Checking logic: if value is huge (e.g. Reliance 19L Cr), unit matters.
            # Let's assume input is raw number. If Reliance is ~1.9e13, then:
            # 20,000 Cr = 2e11.
            if val > 200000000000: return "Large Cap" # 20k Cr
            elif val > 50000000000: return "Mid Cap"  # 5k Cr
            else: return "Small Cap"
            
        df["cap_category"] = df["market_cap_val"].apply(classify_cap)

        # 3. Calculations
        
        # A. Diversification Score (HHI)
        # HHI = Sum of (Weight % * 100)^2
        # Range: 0 (Infinite diversity) to 10,000 (Monopoly)
        # We invert it to 0-100 score. 
        # Ideal Portfolio HHI is < 1500. 
        weights = df["current_value"] / total_value
        hhi = (weights ** 2).sum() * 10000
        
        # Score Map: <1500 -> 100, 1500-3000 -> 70, >3000 -> 40, >5000 -> 0
        div_score = max(0, 100 - (hhi / 50)) # Linear decay approximation
        
        # B. Sector Allocation
        sector_weights = df.groupby("sector")["current_value"].sum() / total_value
        top_sector_weight = sector_weights.max()
        # Penalty if top sector > 30%
        sector_penalty = max(0, (top_sector_weight - 0.30) * 100 * 2) 
        
        # C. Valuation / Quality (Placeholder)
        # Ideally fetch PE. For now, random-ish or neutral.
        quality_score = 70 # Neutral start
        val_score = 65 
        
        # D. Momentum
        # % of stocks with positive daily change (Simple momentum proxy)
        # or use Technicals table if available.
        # Let's use simple daily change % positive
        pct_positive = df["symbol"].map(lambda x: quotes_map.get(x, {}).get("percent_change", 0) > 0).mean()
        momentum_score = int(pct_positive * 100)
        
        # Overall Score
        # Weights: Div(30%), Qual(25%), Val(20%), Eff(15%), Mom(10%)
        # Adjust wts for missing Eff
        final_score = (div_score * 0.40) + (quality_score * 0.25) + (val_score * 0.25) + (momentum_score * 0.10)
        final_score = min(100, max(0, int(final_score)))
        
        # Suggestions
        suggestions = []
        if top_sector_weight > 0.35:
            suggestions.append(f"High exposure to {sector_weights.idxmax()} sector ({int(top_sector_weight*100)}%). Consider diversifying.")
        if hhi > 3000:
            suggestions.append("Portfolio is highly concentrated. Add more instruments.")
            
        # 4. Upsert Metrics
        metrics_payload = {
            "user_id": user_id,
            "overall_score": final_score,
            "diversification_score": int(div_score),
            "quality_score": quality_score,
            "valuation_score": val_score,
            "momentum_score": momentum_score,
            "suggestions": suggestions, # JSONB support
            "updated_at": "now()"
        }
        
        self.db.supabase.table("portfolio_metrics").upsert(metrics_payload).execute()
        
        # 5. Snapshot (Optional for EOD)
        # self.db.supabase.table("portfolio_snapshots").insert({...})
        
        log_success(f"Analyzed {user_id}: Score {final_score}")
        
    def run_all(self):
        """Analyze all users with portfolios"""
        # Fetch distinct user_ids from portfolio
        res = self.db.supabase.table("portfolio_holdings").select("user_id").execute()
        users = set(row["user_id"] for row in res.data)
        for uid in users:
            self.analyze_user_portfolio(uid)

if __name__ == "__main__":
    analyzer = PortfolioAnalyzer()
    analyzer.run_all()
