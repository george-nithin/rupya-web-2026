import json
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success

def seed_strategies():
    db = SupabaseManager()
    
    strategies = [
        # ==========================================
        # BULLISH STRATEGIES
        # ==========================================
        {
            "name": "Long Call",
            "description": "Buy a Call option. Profitable if the stock rises significantly. Defined risk (premium), unlimited profit.",
            "sentiment": "Bullish",
            "risk_profile": "Low Risk / Unlimited Profit",
            "legs_count": 1,
            "legs_config": [{"action": "Buy", "type": "CE", "strike_offset": 0}],
            "payoff_diagram_url": "/strategies/long_call.svg"
        },
        {
            "name": "Bull Call Spread",
            "description": "Buy ATM Call, Sell OTM Call. Cheaper than Long Call, but profit is capped. Good for moderate bullish views.",
            "sentiment": "Bullish",
            "risk_profile": "Defined Risk / Defined Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": 0},
                {"action": "Sell", "type": "CE", "strike_offset": 2}
            ],
            "payoff_diagram_url": "/strategies/bull_call_spread.svg"
        },
        {
            "name": "Bull Put Spread",
            "description": "Sell ATM Put, Buy OTM Put. A credit strategy. Profitable if stock stays flat or rises. Income generation.",
            "sentiment": "Bullish",
            "risk_profile": "Defined Risk / Defined Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "PE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/bull_put_spread.svg"
        },
        {
            "name": "Covered Call",
            "description": "Hold Stock + Sell OTM Call. Generate rental income on your holdings. Caps upside, but cushions downside.",
            "sentiment": "Bullish",
            "risk_profile": "Low Risk / Capped Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "Stock", "strike_offset": 0},
                {"action": "Sell", "type": "CE", "strike_offset": 2}
            ],
            "payoff_diagram_url": "/strategies/covered_call.svg"
        },
        {
            "name": "Protective Put",
            "description": "Hold Stock + Buy Put. Insurance against a crash. Unlimited upside from stock, limited loss from Put.",
            "sentiment": "Bullish",
            "risk_profile": "Low Risk / Unlimited Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "Stock", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": -1}
            ],
            "payoff_diagram_url": "/strategies/protective_put.svg"
        },
        {
            "name": "Call Ratio Backspread",
            "description": "Sell 1 ATM Call, Buy 2 OTM Calls. Unlimited profit if market rallies hard. Loss if market stays slightly up.",
            "sentiment": "Bullish",
            "risk_profile": "Defined Risk / Unlimited Profit",
            "legs_count": 2, # Really 3 contracts, 2 legs
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "CE", "strike_offset": 2}, # Quantity should be x2 in execution
                {"action": "Buy", "type": "CE", "strike_offset": 2}  # Representing 2x buy
            ],
            "payoff_diagram_url": "/strategies/call_ratio_backspread.svg"
        },

        # ==========================================
        # BEARISH STRATEGIES
        # ==========================================
        {
            "name": "Long Put",
            "description": "Buy a Put option. Profitable if stock crashes. Defined risk, massive profit potential.",
            "sentiment": "Bearish",
            "risk_profile": "Low Risk / High Profit",
            "legs_count": 1,
            "legs_config": [{"action": "Buy", "type": "PE", "strike_offset": 0}],
            "payoff_diagram_url": "/strategies/long_put.svg"
        },
        {
            "name": "Bear Put Spread",
            "description": "Buy ATM Put, Sell OTM Put. Cheaper than Long Put. Profit capped, but higher probability of profit.",
            "sentiment": "Bearish",
            "risk_profile": "Defined Risk / Defined Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "PE", "strike_offset": 0},
                {"action": "Sell", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/bear_put_spread.svg"
        },
        {
            "name": "Bear Call Spread",
            "description": "Sell ATM Call, Buy OTM Call. Credit strategy. Profitable if market stays flat or falls.",
            "sentiment": "Bearish",
            "risk_profile": "Defined Risk / Defined Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "CE", "strike_offset": 2}
            ],
            "payoff_diagram_url": "/strategies/bear_call_spread.svg"
        },
        {
            "name": "Put Ratio Backspread",
            "description": "Sell 1 ATM Put, Buy 2 OTM Puts. Profitable if market crashes hard. Loss if market drifts slightly down.",
            "sentiment": "Bearish",
            "risk_profile": "Defined Risk / High Profit",
            "legs_count": 3,
            "legs_config": [
                {"action": "Sell", "type": "PE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": -2},
                {"action": "Buy", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/put_ratio_backspread.svg"
        },
        {
            "name": "Covered Put",
            "description": "Short Stock + Sell OTM Put. Income strategy for bearish outlook. Risky due to short stock.",
            "sentiment": "Bearish",
            "risk_profile": "Unlimited Risk / Capped Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "Stock", "strike_offset": 0},
                {"action": "Sell", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/covered_put.svg"
        },

        # ==========================================
        # NEUTRAL STRATEGIES (Range Bound)
        # ==========================================
        {
            "name": "Short Straddle",
            "description": "Sell ATM Call & Put. Maximum profit if market doesn't move. High risk if market explodes either way.",
            "sentiment": "Neutral",
            "risk_profile": "Unlimited Risk / High Reward",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Sell", "type": "PE", "strike_offset": 0}
            ],
            "payoff_diagram_url": "/strategies/short_straddle.svg"
        },
        {
            "name": "Short Strangle",
            "description": "Sell OTM Call & Put. Wider safety zone than Straddle. Profitable if market stays between strikes.",
            "sentiment": "Neutral",
            "risk_profile": "Unlimited Risk / Moderate Reward",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 2},
                {"action": "Sell", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/short_strangle.svg"
        },
        {
            "name": "Iron Condor",
            "description": "Sell Strangle + Buy Wings. Defined risk, defined profit. The standard income strategy for flat markets.",
            "sentiment": "Neutral",
            "risk_profile": "Defined Risk / Defined Profit",
            "legs_count": 4,
            "legs_config": [
                {"action": "Sell", "type": "PE", "strike_offset": -2},
                {"action": "Buy", "type": "PE", "strike_offset": -4},
                {"action": "Sell", "type": "CE", "strike_offset": 2},
                {"action": "Buy", "type": "CE", "strike_offset": 4}
            ],
            "payoff_diagram_url": "/strategies/iron_condor.svg"
        },
        {
            "name": "Iron Butterfly",
            "description": "Sell Straddle + Buy Wings. Higher max profit than Condor, but narrower peak. Defined risk.",
            "sentiment": "Neutral",
            "risk_profile": "Defined Risk / High Reward",
            "legs_count": 4,
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Sell", "type": "PE", "strike_offset": 0},
                {"action": "Buy", "type": "CE", "strike_offset": 2},
                {"action": "Buy", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/iron_butterfly.svg"
        },
        {
            "name": "Long Call Butterfly",
            "description": "Buy 1 ITM Call, Sell 2 ATM Calls, Buy 1 OTM Call. Profitable if market pins at ATM strike.",
            "sentiment": "Neutral",
            "risk_profile": "Defined Risk / High Reward",
            "legs_count": 4,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": -2},
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Sell", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "CE", "strike_offset": 2}
            ],
            "payoff_diagram_url": "/strategies/long_call_butterfly.svg"
        },
        {
            "name": "Call Calendar Spread",
            "description": "Sell Short-term Call, Buy Long-term Call (same strike). Profitable if market stays near strike and IV rises.",
            "sentiment": "Neutral",
            "risk_profile": "Defined Risk / Moderate Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Sell", "type": "CE", "strike_offset": 0, "expiry": "Near"},
                {"action": "Buy", "type": "CE", "strike_offset": 0, "expiry": "Far"}
            ],
            "payoff_diagram_url": "/strategies/calendar_spread.svg"
        },

        # ==========================================
        # DIRECTIONAL / VOLATILE (Move Expected)
        # ==========================================
        {
            "name": "Long Straddle",
            "description": "Buy ATM Call & Put. Profit from EXPLOSIVE move in EITHER direction. High cost.",
            "sentiment": "Directional",
            "risk_profile": "Defined Risk / Unlimited Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": 0}
            ],
            "payoff_diagram_url": "/strategies/long_straddle.svg"
        },
        {
            "name": "Long Strangle",
            "description": "Buy OTM Call & Put. Cheaper than Straddle. Need even bigger move to profit.",
            "sentiment": "Directional",
            "risk_profile": "Low Risk / Unlimited Profit",
            "legs_count": 2,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": 2},
                {"action": "Buy", "type": "PE", "strike_offset": -2}
            ],
            "payoff_diagram_url": "/strategies/long_strangle.svg"
        },
        {
            "name": "Strap",
            "description": "Buy 2 Calls + 1 Put. Bullish volatility play. Profit if huge move up, small protection if move down.",
            "sentiment": "Directional",
            "risk_profile": "Defined Risk / Unlimited Profit",
            "legs_count": 3,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": 0}
            ],
            "payoff_diagram_url": "/strategies/strap.svg"
        },
        {
            "name": "Strip",
            "description": "Buy 1 Call + 2 Puts. Bearish volatility play. Profit if huge move down, small protection if move up.",
            "sentiment": "Directional",
            "risk_profile": "Defined Risk / Unlimited Profit",
            "legs_count": 3,
            "legs_config": [
                {"action": "Buy", "type": "CE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": 0},
                {"action": "Buy", "type": "PE", "strike_offset": 0}
            ],
            "payoff_diagram_url": "/strategies/strip.svg"
        },
        {
            "name": "Jade Lizard",
            "description": "Sell OTM Put + Sell OTM Call + Buy OTM Call (Spread). Income strategy. No upside risk, only downside risk.",
            "sentiment": "Directional",
            "risk_profile": "High Risk / Moderate Profit",
            "legs_count": 3,
            "legs_config": [
                {"action": "Sell", "type": "PE", "strike_offset": -1},
                {"action": "Sell", "type": "CE", "strike_offset": 2},
                {"action": "Buy", "type": "CE", "strike_offset": 3}
            ],
            "payoff_diagram_url": "/strategies/jade_lizard.svg"
        }
    ]
    
    log_info(f"Seeding {len(strategies)} Strategies (Comprehensive Set)...")
    
    try:
         # Clean existing
         db.supabase.table("trading_strategies").delete().neq("name", "PLACEHOLDER").execute()
    except Exception as e:
         log_error(f"Cleanup error (ignorable): {e}")

    try:
        db.supabase.table("trading_strategies").insert(strategies).execute()
        log_success(f"Seeded {len(strategies)} Strategies Successfully")
    except Exception as e:
        log_error(f"Seeding failed: {e}")

if __name__ == "__main__":
    seed_strategies()
