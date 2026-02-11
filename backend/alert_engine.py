"""
Alert Engine for Rupya
Evaluates price alerts and triggers notifications
"""

from supabase_manager import SupabaseManager
from utils import log_info, log_error, log_success
import time

class AlertEngine:
    def __init__(self):
        self.db = SupabaseManager()
    
    def evaluate_all_alerts(self):
        """Main loop to evaluate all active alerts"""
        log_info("Starting alert evaluation...")
        
        try:
            # Get all active alerts using the helper function
            result = self.db.supabase.rpc('get_active_alerts').execute()
            active_alerts = result.data if result.data else []
            
            if not active_alerts:
                log_info("No active alerts to evaluate")
                return
            
            log_info(f"Evaluating {len(active_alerts)} active alerts...")
            
            for alert in active_alerts:
                self.evaluate_alert(alert)
            
            log_success("Alert evaluation complete")
            
        except Exception as e:
            log_error(f"Error evaluating alerts: {e}")
    
    def evaluate_alert(self, alert):
        """Evaluate a single alert"""
        try:
            symbol = alert['symbol']
            alert_type = alert['alert_type']
            target_value = float(alert['target_value'])
            alert_id = alert['alert_id']
            
            # Get current price from market_equity_quotes or market_indices
            current_price = self.get_current_price(symbol)
            
            if current_price is None:
                log_error(f"Could not get current price for {symbol}")
                return
            
            should_trigger = False
            
            # Check alert conditions
            if alert_type == 'price_above' and current_price >= target_value:
                should_trigger = True
            elif alert_type == 'price_below' and current_price <= target_value:
                should_trigger = True
            elif alert_type == 'percent_change_up':
                # Get previous close for percent calculation
                prev_close = self.get_previous_close(symbol)
                if prev_close:
                    percent_change = ((current_price - prev_close) / prev_close) * 100
                    if percent_change >= target_value:
                        should_trigger = True
            elif alert_type == 'percent_change_down':
                prev_close = self.get_previous_close(symbol)
                if prev_close:
                    percent_change = ((current_price - prev_close) / prev_close) * 100
                    if percent_change <= -target_value:
                        should_trigger = True
            elif alert_type == 'volume_spike':
                # Volume spike detection
                avg_volume = self.get_average_volume(symbol)
                current_volume = self.get_current_volume(symbol)
                if avg_volume and current_volume:
                    if current_volume >= avg_volume * (target_value / 100):
                        should_trigger = True
            
            if should_trigger:
                self.trigger_alert(alert_id, current_price)
                log_success(f"✅ Triggered alert for {symbol} at {current_price}")
        
        except Exception as e:
            log_error(f"Error evaluating alert {alert.get('alert_id')}: {e}")
    
    def get_current_price(self, symbol):
        """Get current price from database"""
        try:
            # First try market_equity_quotes
            result = self.db.supabase.table('market_equity_quotes')\
                .select('last_price')\
                .eq('symbol', symbol)\
                .order('last_update_time', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return float(result.data[0]['last_price'])
            
            # Try market_indices if not found in equities
            result = self.db.supabase.table('market_indices')\
                .select('last_price')\
                .ilike('index_name', f'%{symbol}%')\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return float(result.data[0]['last_price'])
            
            return None
        
        except Exception as e:
            log_error(f"Error getting current price for {symbol}: {e}")
            return None
    
    def get_previous_close(self, symbol):
        """Get previous close price"""
        try:
            result = self.db.supabase.table('market_equity_quotes')\
                .select('previous_close')\
                .eq('symbol', symbol)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return float(result.data[0]['previous_close'])
            
            return None
        
        except Exception as e:
            log_error(f"Error getting previous close for {symbol}: {e}")
            return None
    
    def get_average_volume(self, symbol):
        """Get average trading volume (simplified)"""
        try:
            result = self.db.supabase.table('market_equity_quotes')\
                .select('total_traded_volume')\
                .eq('symbol', symbol)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                # In production, this would calculate 30-day average
                # For now, using current volume as baseline
                return float(result.data[0].get('total_traded_volume', 0))
            
            return None
        
        except Exception as e:
            log_error(f"Error getting average volume for {symbol}: {e}")
            return None
    
    def get_current_volume(self, symbol):
        """Get current trading volume"""
        try:
            result = self.db.supabase.table('market_equity_quotes')\
                .select('total_traded_volume')\
                .eq('symbol', symbol)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return float(result.data[0].get('total_traded_volume', 0))
            
            return None
        
        except Exception as e:
            log_error(f"Error getting current volume for {symbol}: {e}")
            return None
    
    def trigger_alert(self, alert_id, current_value):
        """Trigger an alert using the database function"""
        try:
            self.db.supabase.rpc('trigger_alert', {
                'p_alert_id': alert_id,
                'p_current_value': current_value
            }).execute()
        
        except Exception as e:
            log_error(f"Error triggering alert {alert_id}: {e}")

def run_continuous():
    """Run alert engine in continuous loop"""
    engine = AlertEngine()
    
    log_info("Alert Engine started in continuous mode...")
    log_info("Press Ctrl+C to stop")
    
    try:
        while True:
            engine.evaluate_all_alerts()
            time.sleep(2)  # Evaluate every 2 seconds during market hours
    except KeyboardInterrupt:
        log_info("Alert Engine stopped")

if __name__ == "__main__":
    import sys
    
    if "--continuous" in sys.argv:
        run_continuous()
    else:
        # Single run mode
        engine = AlertEngine()
        engine.evaluate_all_alerts()
