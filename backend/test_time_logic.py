import datetime

def get_ist_now():
    """Get current time in IST (+5:30) using UTC as base"""
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ist_offset = datetime.timedelta(hours=5, minutes=30)
    return now_utc + ist_offset

def is_market_hours(test_time=None):
    """
    Check if current time is within 09:00 to 17:00 IST, Mon-Fri.
    If test_time is provided (IST), use it for testing.
    """
    now_ist = test_time if test_time else get_ist_now()
    
    # Check weekday (0=Monday, 4=Friday, 5=Saturday, 6=Sunday)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False
        
    start_time = now_ist.replace(hour=9, minute=0, second=0, microsecond=0)
    end_time = now_ist.replace(hour=17, minute=0, second=0, microsecond=0)
    
    return start_time <= now_ist <= end_time

def test():
    # Helper to create IST datetime
    def dt(year, month, day, hour, minute, weekday):
        # We don't need weekday for replace, but we use it for context
        return datetime.datetime(year, month, day, hour, minute)
    
    # Monday 08:59
    assert is_market_hours(datetime.datetime(2026, 3, 2, 8, 59)) == False, "Failed: Monday 08:59"
    # Monday 09:01
    assert is_market_hours(datetime.datetime(2026, 3, 2, 9, 1)) == True, "Failed: Monday 09:01"
    # Monday 16:59
    assert is_market_hours(datetime.datetime(2026, 3, 2, 16, 59)) == True, "Failed: Monday 16:59"
    # Monday 17:01
    assert is_market_hours(datetime.datetime(2026, 3, 2, 17, 1)) == False, "Failed: Monday 17:01"
    # Saturday 12:00
    assert is_market_hours(datetime.datetime(2026, 3, 7, 12, 0)) == False, "Failed: Saturday 12:00"
    
    print("All test_time_logic tests passed! ✅")

if __name__ == "__main__":
    test()
