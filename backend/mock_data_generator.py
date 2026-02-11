
import random
import datetime

def generate_mock_option_chain(symbol, spot_price):
    """
    Generates a realistic mock Option Chain for NIFTY/BANKNIFTY.
    Used when live data sources (Dhan/NSE) are unavailable/blocked.
    """
    if not spot_price:
        spot_price = 24000 if symbol == "NIFTY" else 52000
        
    step = 50 if symbol == "NIFTY" else 100
    atm_strike = round(spot_price / step) * step
    
    # Generate 20 strikes above and below
    strikes = []
    for i in range(-20, 21):
        strikes.append(atm_strike + (i * step))
        
    expiry = (datetime.date.today() + datetime.timedelta(days=(3 - datetime.date.today().weekday() + 7) % 7)).strftime("%d-%b-%Y")
    
    records_data = []
    
    for strike in strikes:
        # Simple intrinsic + time value simulation
        dist = strike - spot_price
        
        # Call Premium
        ce_intrinsic = max(0, spot_price - strike)
        ce_time_value = max(0, 100 - abs(dist)*0.1) # Decaying time value
        ce_ltp = ce_intrinsic + ce_time_value + random.uniform(-2, 2)
        
        # Put Premium
        pe_intrinsic = max(0, strike - spot_price)
        pe_time_value = max(0, 100 - abs(dist)*0.1)
        pe_ltp = pe_intrinsic + pe_time_value + random.uniform(-2, 2)
        
        # Greeks (simplified but realistic)
        # Delta: -1 to 0 for puts, 0 to 1 for calls
        ce_delta = max(0, min(1, 0.5 + (spot_price - strike) / (step * 4)))
        pe_delta = ce_delta - 1
        
        # Gamma: highest ATM, decays away from ATM
        gamma = max(0, 0.02 - abs(dist) / (step * 100))
        
        # Theta: time decay, higher ATM
        theta = -max(0.5, 5 - abs(dist) / (step * 10))
        
        # Vega: sensitivity to IV, highest ATM
        vega = max(1, 20 - abs(dist) / (step * 5))
        
        records_data.append({
            "strikePrice": strike,
            "expiryDate": expiry,
            "CE": {
                "strikePrice": strike,
                "expiryDate": expiry,
                "lastPrice": round(ce_ltp, 2),
                "change": round(random.uniform(-10, 10), 2),
                "pChange": round(random.uniform(-5, 5), 2),
                "openInterest": random.randint(1000, 100000),
                "changeinOpenInterest": random.randint(-5000, 5000),
                "totalTradedVolume": random.randint(10000, 500000),
                "impliedVolatility": round(random.uniform(10, 20), 2),
                "underlyingValue": spot_price,
                "identifier": f"OPTIDX{symbol}{expiry}{strike}CE",
                "delta": round(ce_delta, 4),
                "gamma": round(gamma, 4),
                "theta": round(theta, 4),
                "vega": round(vega, 2)
            },
            "PE": {
                "strikePrice": strike,
                "expiryDate": expiry,
                "lastPrice": round(pe_ltp, 2),
                "change": round(random.uniform(-10, 10), 2),
                "pChange": round(random.uniform(-5, 5), 2),
                "openInterest": random.randint(1000, 100000),
                "changeinOpenInterest": random.randint(-5000, 5000),
                "totalTradedVolume": random.randint(10000, 500000),
                "impliedVolatility": round(random.uniform(10, 20), 2),
                "underlyingValue": spot_price,
                "identifier": f"OPTIDX{symbol}{expiry}{strike}PE",
                "delta": round(pe_delta, 4),
                "gamma": round(gamma, 4),
                "theta": round(theta, 4),
                "vega": round(vega, 2)
            }
        })
        
    mock_data = {
        "records": {
            "expiryDates": [expiry],
            "data": records_data,
            "timestamp": datetime.datetime.now().strftime("%d-%b-%Y %H:%M:%S"),
            "underlyingValue": spot_price
        },
        "filtered": {
            "data": records_data, # For simplicity, same as records
            "CE": {"totOI": 1000000, "totVol": 5000000},
            "PE": {"totOI": 800000, "totVol": 4000000}
        },
        "symbol": symbol
    }
    
    return mock_data
