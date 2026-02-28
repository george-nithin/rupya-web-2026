import time
import random
import logging
import datetime
from colorama import Fore, Style, init

init(autoreset=True)

# Logger Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("NSE_Backend")

def log_info(msg):
    logger.info(f"{Fore.CYAN}{msg}{Style.RESET_ALL}")

def log_success(msg):
    logger.info(f"{Fore.GREEN}✅ {msg}{Style.RESET_ALL}")

def log_warning(msg):
    logger.warning(f"{Fore.YELLOW}⚠️ {msg}{Style.RESET_ALL}")

def log_error(msg):
    logger.error(f"{Fore.RED}❌ {msg}{Style.RESET_ALL}")

def sleep_random(min_seconds=2.0, max_seconds=4.0):
    """
    Sleep for a random duration between min_seconds and max_seconds
    to mimic human behavior and avoid rate limiting.
    """
    delay = random.uniform(min_seconds, max_seconds)
    # log_info(f"Sleeping for {delay:.2f} seconds...") # Optional: verbose
    time.sleep(delay)

def get_ist_now():
    """Get current time in IST (+5:30) using UTC as base"""
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ist_offset = datetime.timedelta(hours=5, minutes=30)
    return now_utc + ist_offset

def is_market_hours():
    """Check if current time is within 09:00 to 17:00 IST (Mon-Fri)"""
    now_ist = get_ist_now()
    
    # Check weekday (0=Monday, 4=Friday, 5=Saturday, 6=Sunday)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False
        
    start_time = now_ist.replace(hour=9, minute=0, second=0, microsecond=0)
    end_time = now_ist.replace(hour=17, minute=0, second=0, microsecond=0)
    
    return start_time <= now_ist <= end_time

def get_seconds_until_market_open():
    """Calculate seconds until the next 09:00 IST market open"""
    now_ist = get_ist_now()
    
    # Target is today at 9 AM
    target = now_ist.replace(hour=9, minute=0, second=0, microsecond=0)
    
    # If it's already past 9 AM today, or it's a weekend, move to next day
    if now_ist >= target or now_ist.weekday() >= 5:
        target += datetime.timedelta(days=1)
        target = target.replace(hour=9, minute=0, second=0, microsecond=0)
    
    # Keep moving to next day if it's a weekend
    while target.weekday() >= 5:
        target += datetime.timedelta(days=1)
    
    delta = target - now_ist
    return int(delta.total_seconds()), target
