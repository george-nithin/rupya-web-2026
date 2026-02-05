import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
# IMPORTANT: Use the "service_role" key from "Legacy/JWT" settings (Starts with "ey...")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Auto-correct URL if user pasted just the ID
if SUPABASE_URL and not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = f"https://{SUPABASE_URL}.supabase.co"

# NSE Configuration
NSE_BASE_URL = "https://www.nseindia.com"
NSE_TIMEOUT = 10  # seconds
NSE_RETRIES = 3
NSE_BACKOFF_FACTOR = 0.5

# Rate Limiting
DELAY_MIN = 0.05  # seconds
DELAY_MAX = 0.1  # seconds