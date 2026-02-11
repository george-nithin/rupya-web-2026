
import yfinance as yf
import pandas as pd
import json

def test_option_chain(ticker_symbol="^NSEI", display_symbol="NIFTY"):
    print(f"\nFetching options for {ticker_symbol} ({display_symbol})...")
    ticker = yf.Ticker(ticker_symbol)
    
    try:
        if not ticker.options:
            print("❌ No expiry dates found.")
            return

        expirations = list(ticker.options)
        print(f"✅ Expiry Dates ({len(expirations)}): {expirations[:3]}...")
        
        # 1. Get Spot Price
        hist = ticker.history(period="1d")
        if hist.empty:
            print("❌ No history for spot price.")
            return
            
        underlying_price = hist['Close'].iloc[-1]
        print(f"Spot Price: {underlying_price}")

        # 2. Get Nearest Expiry Chain
        expiry = expirations[0] 
        # Ideally find nearest future expiry, yfinance usually sorted? Yes.
        
        print(f"Fetching chain for {expiry}...")
        chain = ticker.option_chain(expiry)
        calls = chain.calls
        puts = chain.puts
        
        if calls.empty and puts.empty:
            print("❌ Chain empty.")
            return

        print(f"✅ Calls: {len(calls)}, Puts: {len(puts)}")
        
        # 3. Transform Data
        data_map = {}
        
        # Process Calls
        for _, row in calls.iterrows():
            strike = row['strike']
            if strike not in data_map:
                data_map[strike] = {"strikePrice": strike}
            
            data_map[strike]["CE"] = {
                "strikePrice": strike,
                "expiryDate": expiry,
                "underlying": display_symbol,
                "identifier": row.get('contractSymbol', ''),
                "openInterest": int(row.get('openInterest', 0)),
                "changeinOpenInterest": 0, # Not provided by YF cleanly
                "pchangeinOpenInterest": 0,
                "totalTradedVolume": int(row.get('volume', 0)),
                "impliedVolatility": round(row.get('impliedVolatility', 0) * 100, 2), # YF defines IV as 0.x? check
                "lastPrice": row.get('lastPrice', 0),
                "change": row.get('change', 0),
                "pChange": row.get('percentChange', 0),
                "totalBuyQuantity": 0,
                "totalSellQuantity": 0,
                "bidQty": 0,
                "bidprice": row.get('bid', 0),
                "askQty": 0,
                "askPrice": row.get('ask', 0),
                "underlyingValue": underlying_price
            }

        # Process Puts
        for _, row in puts.iterrows():
            strike = row['strike']
            if strike not in data_map:
                data_map[strike] = {"strikePrice": strike}
            
            data_map[strike]["PE"] = {
                "strikePrice": strike,
                "expiryDate": expiry,
                "underlying": display_symbol,
                "identifier": row.get('contractSymbol', ''),
                "openInterest": int(row.get('openInterest', 0)),
                "changeinOpenInterest": 0,
                "pchangeinOpenInterest": 0,
                "totalTradedVolume": int(row.get('volume', 0)),
                "impliedVolatility": round(row.get('impliedVolatility', 0) * 100, 2),
                "lastPrice": row.get('lastPrice', 0),
                "change": row.get('change', 0),
                "pChange": row.get('percentChange', 0),
                "totalBuyQuantity": 0,
                "totalSellQuantity": 0,
                "bidQty": 0,
                "bidprice": row.get('bid', 0),
                "askQty": 0,
                "askPrice": row.get('ask', 0),
                "underlyingValue": underlying_price
            }

        # Sort by Strike
        all_strikes = sorted(data_map.values(), key=lambda x: x['strikePrice'])
        
        # Filter ATM +/- 20
        # Find index closest to spot
        closest_strike = min(all_strikes, key=lambda x: abs(x['strikePrice'] - underlying_price))
        idx = all_strikes.index(closest_strike)
        
        start = max(0, idx - 15)
        end = min(len(all_strikes), idx + 15)
        filtered_strikes = all_strikes[start:end]
        
        payload = {
            "records": {
                "expiryDates": expirations,
                "underlyingValue": underlying_price,
                "timestamp": str(hist.index[-1]),
                "underlying": display_symbol
            },
            "filtered": {
                "data": filtered_strikes, 
                "CE": {"totOI": sum(c["CE"]["openInterest"] for c in filtered_strikes if "CE" in c), "totVol": sum(c["CE"]["totalTradedVolume"] for c in filtered_strikes if "CE" in c)},
                "PE": {"totOI": sum(c["PE"]["openInterest"] for c in filtered_strikes if "PE" in c), "totVol": sum(c["PE"]["totalTradedVolume"] for c in filtered_strikes if "PE" in c)}
            }
        }
        
        print(f"✅ Payload constructed. Strikes: {len(filtered_strikes)}")
        # print("First Strike:", filtered_strikes[0]['strikePrice'])

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_option_chain("^NSEI", "NIFTY")
    test_option_chain("^NSEBANK", "BANKNIFTY")
