"""
Enhanced News Scraper with Multiple Sources
Fetches news from MoneyControl, Economic Times, and other sources
"""

import requests
from bs4 import BeautifulSoup
from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success
from datetime import datetime, timedelta
import re

class MultiSourceNewsScraper:
    def __init__(self):
        self.db = SupabaseManager()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def fetch_all_sources(self):
        """Fetch news from all sources"""
        log_info("Starting multi-source news aggregation...")
        
        try:
            self.fetch_moneycontrol_news()
            self.fetch_et_market_news()
            self.fetch_moneycontrol_earnings()
            
            log_success("Multi-source news aggregation complete")
        except Exception as e:
            log_error(f"Multi-source aggregation error: {e}")
    
    def fetch_moneycontrol_news(self):
        """Fetch latest news from MoneyControl"""
        log_info("Fetching MoneyControl news...")
        
        try:
            url = "https://www.moneycontrol.com/news/business/stocks/"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                news_items = []
                
                # Find news articles
                articles = soup.find_all('li', class_='clearfix', limit=10)
                
                for article in articles:
                    try:
                        title_elem = article.find('h2')
                        link_elem = article.find('a')
                        
                        if title_elem and link_elem:
                            title = title_elem.get_text(strip=True)
                            link = link_elem.get('href', '')
                            
                            # Extract stock symbols from title (basic pattern)
                            symbols = re.findall(r'\b[A-Z]{2,10}\b', title)
                            
                            news_item = {
                                'title': title,
                                'content': title,  # Would need to fetch full article
                                'summary': title[:200],
                                'source': 'MoneyControl',
                                'category': 'stock',
                                'symbols': symbols[:3] if symbols else [],
                                'published_at': datetime.now().isoformat(),
                                'news_url': link,
                                'sentiment': 'neutral'
                            }
                            news_items.append(news_item)
                    except Exception as e:
                        continue
                
                # Insert into database
                for news in news_items[:5]:  # Top 5 news
                    self.db.supabase.table('market_news').upsert(news).execute()
                
                log_success(f"Fetched {len(news_items[:5])} MoneyControl news items")
            else:
                log_error(f"MoneyControl returned status {response.status_code}")
                
        except Exception as e:
            log_error(f"Error fetching MoneyControl news: {e}")
    
    def fetch_et_market_news(self):
        """Fetch latest news from Economic Times"""
        log_info("Fetching Economic Times news...")
        
        try:
            url = "https://economictimes.indiatimes.com/markets"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                news_items = []
                
                # Find news articles
                articles = soup.find_all('div', class_='eachStory', limit=10)
                
                for article in articles:
                    try:
                        title_elem = article.find('h3')
                        link_elem = article.find('a')
                        desc_elem = article.find('p')
                        
                        if title_elem and link_elem:
                            title = title_elem.get_text(strip=True)
                            link = link_elem.get('href', '')
                            description = desc_elem.get_text(strip=True) if desc_elem else title
                            
                            # Make absolute URL
                            if link.startswith('/'):
                                link = f"https://economictimes.indiatimes.com{link}"
                            
                            # Extract symbols
                            symbols = re.findall(r'\b[A-Z]{2,10}\b', title)
                            
                            news_item = {
                                'title': title,
                                'content': description,
                                'summary': description[:200],
                                'source': 'Economic Times',
                                'category': 'economy',
                                'symbols': symbols[:3] if symbols else [],
                                'published_at': datetime.now().isoformat(),
                                'news_url': link,
                                'sentiment': 'neutral'
                            }
                            news_items.append(news_item)
                    except Exception as e:
                        continue
                
                # Insert into database
                for news in news_items[:5]:  # Top 5 news
                    self.db.supabase.table('market_news').upsert(news).execute()
                
                log_success(f"Fetched {len(news_items[:5])} Economic Times news items")
            else:
                log_error(f"Economic Times returned status {response.status_code}")
                
        except Exception as e:
            log_error(f"Error fetching ET news: {e}")
    
    def fetch_moneycontrol_earnings(self):
        """Fetch earnings calendar from MoneyControl"""
        log_info("Fetching earnings calendar from MoneyControl...")
        
        try:
            # MoneyControl earnings calendar URL
            url = "https://www.moneycontrol.com/stocks/earnings/upcoming-results/"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                earnings_events = []
                
                # Find earnings table
                table = soup.find('table', class_='tbldata14')
                
                if table:
                    rows = table.find_all('tr')[1:15]  # Skip header, get 15 rows
                    
                    for row in rows:
                        try:
                            cols = row.find_all('td')
                            if len(cols) >= 3:
                                company_elem = cols[0].find('a')
                                date_elem = cols[1]
                                
                                if company_elem and date_elem:
                                    company_name = company_elem.get_text(strip=True)
                                    date_str = date_elem.get_text(strip=True)
                                    
                                    # Parse date
                                    try:
                                        event_date = datetime.strptime(date_str, '%d-%m-%Y')
                                    except:
                                        event_date = datetime.now() + timedelta(days=7)
                                    
                                    # Extract symbol from company name
                                    symbol = re.sub(r'[^A-Z]', '', company_name.upper())[:10]
                                    
                                    earnings_event = {
                                        'title': f'{company_name} Earnings',
                                        'description': f'{company_name} quarterly results announcement',
                                        'event_type': 'earnings',
                                        'event_date': event_date.strftime('%Y-%m-%d'),
                                        'symbols': [symbol] if symbol else []
                                    }
                                    earnings_events.append(earnings_event)
                        except Exception as e:
                            continue
                    
                    # Insert into database
                    for event in earnings_events[:10]:  # Top 10 upcoming
                        self.db.supabase.table('market_events').upsert(event).execute()
                    
                    log_success(f"Fetched {len(earnings_events[:10])} earnings events")
                else:
                    log_error("Could not find earnings table on MoneyControl")
            else:
                log_error(f"MoneyControl earnings returned status {response.status_code}")
                
        except Exception as e:
            log_error(f"Error fetching earnings calendar: {e}")

if __name__ == "__main__":
    scraper = MultiSourceNewsScraper()
    scraper.fetch_all_sources()
