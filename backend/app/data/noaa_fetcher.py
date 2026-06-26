import asyncio
import httpx
from datetime import datetime
import json
from typing import Dict, Any, List

NOAA_XRAY_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json"
NOAA_ALERTS_URL = "https://services.swpc.noaa.gov/products/alerts.json"

class NOAAFetcher:
    def __init__(self):
        self.cached_xray_data: List[Dict[str, Any]] = []
        self.cached_alerts: List[Dict[str, Any]] = []
        self.last_fetch_time = None
        self._lock = asyncio.Lock()
        self.is_running = False

    async def fetch_data(self):
        async with httpx.AsyncClient() as client:
            try:
                # Fetch X-ray flux
                xray_resp = await client.get(NOAA_XRAY_URL, timeout=10.0)
                if xray_resp.status_code == 200:
                    xray_data = xray_resp.json()
                    
                    # Sort by time
                    xray_data.sort(key=lambda x: x['time_tag'])
                    
                    async with self._lock:
                        self.cached_xray_data = xray_data
                        
                # Fetch alerts
                alerts_resp = await client.get(NOAA_ALERTS_URL, timeout=10.0)
                if alerts_resp.status_code == 200:
                    alerts_data = alerts_resp.json()
                    async with self._lock:
                        self.cached_alerts = alerts_data
                        
                self.last_fetch_time = datetime.utcnow()
                print(f"[{datetime.utcnow().isoformat()}] Successfully fetched NOAA data.")
            except Exception as e:
                print(f"Error fetching NOAA data: {e}")

    async def start_polling(self, interval_seconds: int = 60):
        self.is_running = True
        # Initial fetch
        await self.fetch_data()
        while self.is_running:
            await asyncio.sleep(interval_seconds)
            await self.fetch_data()

    def stop_polling(self):
        self.is_running = False

    async def get_latest_data(self):
        async with self._lock:
            if not self.cached_xray_data:
                return None
                
            # NOAA gives two energy bands per minute. 
            # "0.1-0.8nm" = Soft X-ray (SoLEXS equivalent)
            # "0.05-0.4nm" = Hard X-ray (HEL1OS equivalent)
            
            # Get the very last timestamp
            latest_time = self.cached_xray_data[-1]['time_tag']
            
            # Find the soft and hard flux for this time
            soft_flux = 1e-8
            hard_flux = 1e-9
            
            for item in reversed(self.cached_xray_data):
                if item['time_tag'] == latest_time:
                    if item['energy'] == '0.1-0.8nm':
                        soft_flux = item['flux']
                    elif item['energy'] == '0.05-0.4nm':
                        hard_flux = item['flux']
            
            # Find the most recent active alert
            active_alert = None
            if self.cached_alerts:
                # Look for the most recent alert (they are usually sorted descending by issue_datetime)
                recent_alert = self.cached_alerts[0]
                
                # Basic mapping to our Alert format
                message_lines = recent_alert.get('message', '').split('\n')
                action = "Monitor NOAA SWPC for updates."
                for line in message_lines:
                    if "Potential Impacts:" in line:
                        action = line.replace("Potential Impacts:", "").strip()
                
                # Determine severity heuristically from product_id or message
                severity = "LOW"
                if "WARNING" in recent_alert.get('message', ''):
                    severity = "HIGH"
                if "ALERT" in recent_alert.get('message', ''):
                    severity = "MODERATE"
                if "EXTREME" in recent_alert.get('message', ''):
                    severity = "EXTREME"
                    
                # We only pass the alert if it's recent (e.g. issued within the last 24 hours)
                try:
                    issue_time = datetime.strptime(recent_alert.get('issue_datetime', ''), '%Y-%m-%d %H:%M:%S.%f')
                    time_diff = (datetime.utcnow() - issue_time).total_seconds()
                    if time_diff < 86400: # 24 hours
                        active_alert = {
                            "id": recent_alert.get('product_id', 'NOAA-01'),
                            "timestamp": recent_alert.get('issue_datetime', latest_time),
                            "severity": severity,
                            "predicted_class": "M", # Placeholder
                            "lead_time_minutes": 0,
                            "message": message_lines[0] if message_lines else "Space Weather Event Detected",
                            "recommended_action": action
                        }
                except:
                    pass
            
            return {
                "timestamp": latest_time,
                "solexs_flux": soft_flux,
                "helios_flux": hard_flux,
                "alert": active_alert
            }

noaa_fetcher = NOAAFetcher()
