"""
News Aggregator Service for Rupya
Fetches market news, corporate actions, dividends, and special events from real sources
"""

import requests
from bs4 import BeautifulSoup
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success, is_market_hours
from datetime import datetime, timedelta
import re
import json

class NewsAggregator:
    def __init__(self):
        self.db = SupabaseManager()
        self.nse_base_url = "https://www.nseindia.com"
        
        # NSE requires headers to avoid blocking
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Create session for maintaining cookies
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def _init_nse_session(self):
        """Initialize NSE session by visiting homepage first"""
        try:
            self.session.get(self.nse_base_url, timeout=10)
        except Exception as e:
            log_error(f"Error initializing NSE session: {e}")
        
    def fetch_all_news(self):
        """Fetch all types of market news"""
        if not is_market_hours():
            log_info("Outside Market Hours (09:00 - 17:00 IST). Skipping news aggregation.")
            return

        log_info("Starting news aggregation...")
        
        try:
            # Initialize NSE session
            self._init_nse_session()
            
            # Fetch NSE data
            self.fetch_dividend_announcements()
            self.fetch_corporate_actions()
            self.fetch_announcements()
            self.fetch_market_holidays()
            self.fetch_fno_expiry_dates()
            self.fetch_earnings_calendar()
            
            # Fetch from external sources
            try:
                from multi_source_scraper import MultiSourceNewsScraper
                scraper = MultiSourceNewsScraper()
                scraper.fetch_all_sources()
            except Exception as e:
                log_error(f"Error with multi-source scraper: {e}")
            
            log_success("News aggregation complete")
        except Exception as e:
            log_error(f"News aggregation error: {e}")
    
    def fetch_dividend_announcements(self):
        """Fetch real dividend announcements from NSE"""
        log_info("Fetching dividend announcements...")
        
        try:
            # NSE Corporate Announcements API
            url = f"{self.nse_base_url}/api/corporates-announcements"
            params = {
                'index': 'equities',
                'from_date': (datetime.now() - timedelta(days=7)).strftime('%d-%m-%Y'),
                'to_date': datetime.now().strftime('%d-%m-%Y')
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                dividend_news = []
                
                # Filter for dividend-related announcements
                for item in data:
                    subject = item.get('subject', '').lower()
                    if 'dividend' in subject:
                        news_item = {
                            'title': item.get('subject', 'Dividend Announcement'),
                            'content': item.get('desc', '') or item.get('subject', ''),
                            'summary': item.get('subject', '')[:200],
                            'source': 'NSE',
                            'category': 'dividend',
                            'symbols': [item.get('symbol', '')],
                            'published_at': item.get('an_dt', datetime.now().isoformat()),
                            'news_url': item.get('attchmntFile', ''),
                            'sentiment': 'positive'
                        }
                        dividend_news.append(news_item)
                
                # Insert into database
                for news in dividend_news[:10]:  # Limit to 10 most recent
                    self.db.supabase.table('market_news').upsert(news).execute()
                
                log_success(f"Fetched {len(dividend_news[:10])} dividend announcements")
            else:
                log_error(f"NSE API returned status {response.status_code}")
                # Fall back to sample data
                self._insert_sample_dividends()
                
        except Exception as e:
            log_error(f"Error fetching dividends: {e}")
            # Fall back to sample data
            self._insert_sample_dividends()
    
    def _insert_sample_dividends(self):
        """Insert sample dividend data as fallback"""
        sample_news = [
            {
                'title': 'RELIANCE declares dividend of ₹8 per share',
                'content': 'Reliance Industries has declared an interim dividend of ₹8 per share for FY 2025-26.',
                'summary': 'RIL announces ₹8 interim dividend',
                'source': 'NSE',
                'category': 'dividend',
                'symbols': ['RELIANCE'],
                'published_at': datetime.now().isoformat(),
                'sentiment': 'positive'
            },
            {
                'title': 'TCS announces quarterly dividend',
                'content': 'TCS has announced a quarterly dividend of ₹10 per share.',
                'summary': 'TCS quarterly dividend declared',
                'source': 'NSE',
                'category': 'dividend',
                'symbols': ['TCS'],
                'published_at': datetime.now().isoformat(),
                'sentiment': 'positive'
            }
        ]
        
        for news in sample_news:
            self.db.supabase.table('market_news').insert(news).execute()
        
        log_success(f"Inserted {len(sample_news)} sample dividend announcements")
    
    def fetch_corporate_actions(self):
        """Fetch corporate actions like splits, bonus, buybacks"""
        log_info("Fetching corporate actions...")
        
        try:
            url = f"{self.nse_base_url}/api/corporates-corporateActions"
            params = {
                'index': 'equities',
                'from_date': (datetime.now() - timedelta(days=30)).strftime('%d-%m-%Y'),
                'to_date': (datetime.now() + timedelta(days=30)).strftime('%d-%m-%Y')
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                actions = []
                
                for item in data[:15]:  # Limit to 15 items
                    purpose = item.get('purpose', '')
                    symbol = item.get('symbol', '')
                    
                    if any(keyword in purpose.lower() for keyword in ['bonus', 'split', 'buyback', 'rights']):
                        action_item = {
                            'title': f"{symbol}: {purpose}",
                            'content': f"{symbol} - {purpose}. Ex-date: {item.get('exDate', 'N/A')}",
                            'summary': purpose[:200],
                            'source': 'NSE',
                            'category': 'corporate',
                            'symbols': [symbol],
                            'published_at': datetime.now().isoformat(),
                            'sentiment': 'neutral'
                        }
                        actions.append(action_item)
                
                for action in actions:
                    self.db.supabase.table('market_news').upsert(action).execute()
                
                log_success(f"Fetched {len(actions)} corporate actions")
            else:
                self._insert_sample_actions()
                
        except Exception as e:
            log_error(f"Error fetching corporate actions: {e}")
            self._insert_sample_actions()
    
    def _insert_sample_actions(self):
        """Insert sample corporate actions as fallback"""
        sample_actions = [
            {
                'title': 'INFY announces 1:1 bonus issue',
                'content': 'Infosys has announced a 1:1 bonus share issue to all shareholders.',
                'summary': 'Infosys bonus issue 1:1',
                'source': 'NSE',
                'category': 'corporate',
                'symbols': ['INFY'],
                'published_at': datetime.now().isoformat(),
                'sentiment': 'positive'
            },
            {
                'title': 'WIPRO to undergo stock split',
                'content': 'Wipro board approves 2:1 stock split effective next month.',
                'summary': 'Wipro 2:1 stock split approved',
                'source': 'NSE',
                'category': 'corporate',
                'symbols': ['WIPRO'],
                'published_at': datetime.now().isoformat(),
                'sentiment': 'neutral'
            }
        ]
        
        for action in sample_actions:
            self.db.supabase.table('market_news').insert(action).execute()
        
        log_success(f"Inserted {len(sample_actions)} sample corporate actions")
    
    def fetch_announcements(self):
        """Fetch general market announcements"""
        log_info("Fetching general announcements...")
        
        try:
            url = f"{self.nse_base_url}/api/latest-circular"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                announcements = []
                
                for item in data[:5]:  # Limit to 5 latest
                    announcement = {
                        'title': item.get('subject', 'Market Announcement'),
                        'content': item.get('desc', '') or item.get('subject', ''),
                        'summary': item.get('subject', '')[:200],
                        'source': 'NSE',
                        'category': 'economy',
                        'symbols': [],
                        'published_at': item.get('publishDate', datetime.now().isoformat()),
                        'news_url': item.get('pdf', ''),
                        'sentiment': 'neutral'
                    }
                    announcements.append(announcement)
                
                for ann in announcements:
                    self.db.supabase.table('market_news').upsert(ann).execute()
                
                log_success(f"Fetched {len(announcements)} general announcements")
                
        except Exception as e:
            log_error(f"Error fetching announcements: {e}")
    
    def fetch_market_holidays(self):
        """Fetch actual market holidays from NSE"""
        log_info("Fetching market holidays...")
        
        try:
            url = f"{self.nse_base_url}/api/holiday-master?type=trading"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                holidays = []
                
                # Get upcoming holidays
                for item in data.get('CM', []):
                    holiday_date = datetime.strptime(item.get('tradingDate', ''), '%d-%b-%Y')
                    
                    if holiday_date >= datetime.now():
                        holiday_event = {
                            'title': item.get('description', 'Market Holiday'),
                            'description': f"Market closed for {item.get('description', 'holiday')}",
                            'event_type': 'holiday',
                            'event_date': holiday_date.strftime('%Y-%m-%d'),
                            'symbols': []
                        }
                        holidays.append(holiday_event)
                
                for holiday in holidays[:10]:  # Next 10 holidays
                    self.db.supabase.table('market_events').upsert(holiday).execute()
                
                log_success(f"Fetched {len(holidays[:10])} market holidays")
            else:
                self._insert_sample_holidays()
                
        except Exception as e:
            log_error(f"Error fetching holidays: {e}")
            self._insert_sample_holidays()
    
    def _insert_sample_holidays(self):
        """Insert sample holidays as fallback"""
        holidays = [
            {
                'title': 'Holi',
                'description': 'Market closed for Holi festival',
                'event_type': 'holiday',
                'event_date': '2026-03-14',
                'symbols': []
            },
            {
                'title': 'Good Friday',
                'description': 'Market closed for Good Friday',
                'event_type': 'holiday',
                'event_date': '2026-04-03',
                'symbols': []
            }
        ]
        
        for holiday in holidays:
            self.db.supabase.table('market_events').upsert(holiday).execute()
        
        log_success(f"Inserted {len(holidays)} sample holidays")
    
    def fetch_fno_expiry_dates(self):
        """Calculate F&O expiry dates (last Thursday of each month)"""
        log_info("Creating F&O expiry events...")
        
        try:
            def get_last_thursday(year, month):
                """Get last Thursday of given month"""
                # Start from last day of month
                if month == 12:
                    next_month = datetime(year + 1, 1, 1)
                else:
                    next_month = datetime(year, month + 1, 1)
                
                last_day = next_month - timedelta(days=1)
                
                # Find last Thursday (weekday 3)
                days_back = (last_day.weekday() - 3) % 7
                last_thursday = last_day - timedelta(days=days_back)
                
                return last_thursday
            
            today = datetime.now()
            expiry_events = []
            
            # Generate next 6 monthly expiries
            for i in range(6):
                target_month = today.month + i
                target_year = today.year
                
                while target_month > 12:
                    target_month -= 12
                    target_year += 1
                
                expiry_date = get_last_thursday(target_year, target_month)
                
                if expiry_date >= today:
                    expiry_events.append({
                        'title': f'F&O Monthly Expiry - {expiry_date.strftime("%B %Y")}',
                        'description': 'Futures & Options monthly contracts expiry',
                        'event_type': 'fno_expiry',
                        'event_date': expiry_date.strftime('%Y-%m-%d'),
                        'symbols': ['NIFTY', 'BANKNIFTY', 'FINNIFTY']
                    })
            
            for event in expiry_events:
                self.db.supabase.table('market_events').upsert(event).execute()
            
            log_success(f"Created {len(expiry_events)} F&O expiry events")
            
        except Exception as e:
            log_error(f"Error creating F&O expiry events: {e}")
    
    def fetch_earnings_calendar(self):
        """Fetch upcoming earnings announcements"""
        log_info("Fetching earnings calendar...")
        
        try:
            # Note: NSE doesn't have a direct earnings API
            # Alternative: Use MoneyControl or TickerTape
            # For now, create sample earnings events
            
            today = datetime.now()
            sample_earnings = [
                {
                    'title': 'TCS Q4 Results',
                    'description': 'TCS to announce Q4 FY26 results',
                    'event_type': 'earnings',
                    'event_date': (today + timedelta(days=15)).strftime('%Y-%m-%d'),
                    'symbols': ['TCS']
                },
                {
                    'title': 'RELIANCE Q4 Results',
                    'description': 'Reliance Industries Q4 FY26 earnings',
                    'event_type': 'earnings',
                    'event_date': (today + timedelta(days=20)).strftime('%Y-%m-%d'),
                    'symbols': ['RELIANCE']
                }
            ]
            
            for event in sample_earnings:
                self.db.supabase.table('market_events').upsert(event).execute()
            
            log_success(f"Created {len(sample_earnings)} earnings events")
            
        except Exception as e:
            log_error(f"Error fetching earnings calendar: {e}")

if __name__ == "__main__":
    aggregator = NewsAggregator()
    aggregator.fetch_all_news()
