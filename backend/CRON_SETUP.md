# News Aggregation Cron Setup Instructions

## Automated News Fetching

The news aggregator now runs automatically to keep your market data fresh.

### What Gets Updated:
- **NSE Data**: Dividends, corporate actions, market holidays, F&O expiry
- **MoneyControl**: Latest stock news and earnings calendar
- **Economic Times**: Market news and economy updates

### Setup Cron Job (macOS/Linux)

1. **Open crontab editor:**
```bash
crontab -e
```

2. **Add one of these schedules:**

**Every hour (recommended):**
```bash
0 * * * * /Users/nithin/Rupya-webapp/backend/run_news_aggregator.sh
```

**Every 6 hours:**
```bash
0 */6 * * * /Users/nithin/Rupya-webapp/backend/run_news_aggregator.sh
```

**Daily at 9 AM (market open):**
```bash
0 9 * * * /Users/nithin/Rupya-webapp/backend/run_news_aggregator.sh
```

**Twice daily (9 AM and 6 PM):**
```bash
0 9,18 * * * /Users/nithin/Rupya-webapp/backend/run_news_aggregator.sh
```

3. **Save and exit** (`:wq` in vim)

### Manual Run

Run immediately to test:
```bash
cd /Users/nithin/Rupya-webapp/backend
./run_news_aggregator.sh
```

### View Logs

Check what the aggregator is doing:
```bash
tail -f /tmp/news_aggregator.log
```

### Verify Cron Job

List all cron jobs to verify:
```bash
crontab -l
```

### Alternative: Run on System Boot

Add to launchd (macOS) for running on startup/schedule.

## Production Deployment

For production, consider:
- **Cloud Functions**: Deploy as Google Cloud Function or AWS Lambda
- **Heroku Scheduler**: Free tier for running tasks
- **Render Cron Jobs**: Deploy and schedule automatically
- **GitHub Actions**: Run on schedule using workflows

The script is already containerization-ready and can be deployed anywhere Python runs.
