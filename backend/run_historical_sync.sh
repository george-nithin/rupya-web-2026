#!/bin/bash

# Historical Data Sync Runner
# Fetches historical OHLC data and stores in database

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment
source venv/bin/activate

# Run historical data fetcher
echo "Starting historical data sync..."
python historical_data_fetcher.py "$@" 2>&1 | tee -a historical_data_fetcher.log

echo "Historical data sync completed"
