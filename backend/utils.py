import time
import random
import logging
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
