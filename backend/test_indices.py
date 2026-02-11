
import yfinance as yf

# Common Nifty Indices often use specific Ticker formats
indices = [
    "^NSEI",       # Nifty 50
    "^NSEBANK",    # Bank Nifty
    "^BSESN",      # Sensex
    "^CNXIT",      # Nifty IT 
    "^CNXAUTO",    # Nifty Auto 
    "^CNXENERGY",  # Nifty Energy
    "^CNXFMCG",    # Nifty FMCG
    "^CNXMETAL",   # Nifty Metal
    "^CNXPHARMA",  # Nifty Pharma
    "^CNXREALTY",  # Nifty Realty
    "^INDIAVIX"    # India VIX
]

print(f"Testing {len(indices)} symbols...")

# Try batch
data = yf.download(indices, period="1d", group_by='ticker', progress=False)

for symbol in indices:
    try:
        # data format depends on multi-index columns
        if symbol in data.columns.levels[0]:
            stock_data = data[symbol]
            if not stock_data.empty:
                last_price = stock_data['Close'].iloc[-1]
                print(f"✅ {symbol}: {last_price}")
            else:
                print(f"❌ {symbol}: No Data Frame")
        else:
             print(f"❌ {symbol}: No Data Column")

    except Exception as e:
        print(f"❌ {symbol}: Error {e}")
