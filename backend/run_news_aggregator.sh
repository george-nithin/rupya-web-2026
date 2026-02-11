#!/bin/bash

# News Aggregator Cron Job
# Runs every hour to fetch latest market news and updates

# Activate virtual environment
cd /Users/nithin/Rupya-webapp
source .venv/bin/activate

# Run news aggregator
cd backend
python news_aggregator.py >> /tmp/news_aggregator.log 2>&1

# Deactivate
deactivate
