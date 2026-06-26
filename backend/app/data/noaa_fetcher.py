import asyncio
import httpx
from datetime import datetime
from typing import Dict, Any, List

NOAA_XRAY_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json"
NOAA_ALERTS_URL = "https://services.swpc.noaa.gov/products/alerts.json"

# NOAA SWPC product IDs that represent genuine active warnings/alerts.
# See: https://www.swpc.noaa.gov/products-and-data
# We exclude routine summaries (SUMSUD, SRS, FLC), forecasts (OFFPNT, FXXX),
# and watch products — we only show WARNINGS and ALERTS.
ACTIONABLE_PRODUCT_IDS = {
    # Space Weather ALERTS (most severe — immediate impact)
    "ALTK04", "ALTK05", "ALTK06", "ALTK07", "ALTK08", "ALTK09",  # Kp >= 4
    "ALTXMF", "ALTEF3",  # X-ray event, Electron flux
    "ALTTP2", "ALTTP4", "ALTTP5",  # Proton events
    # Space Weather WARNINGS (active expected conditions)
    "WARK04", "WARK05", "WARK06", "WARK07", "WARK08", "WARK09",  # Geomagnetic storm warning
    "WARPC0",  # Proton crossing warning
    "WARSUD",  # Sudden impulse warning
    "WATA20", "WATA50", "WATA99",  # Geomagnetic storm watch
}


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
        await self.fetch_data()
        while self.is_running:
            await asyncio.sleep(interval_seconds)
            await self.fetch_data()

    def stop_polling(self):
        self.is_running = False

    def _parse_noaa_alert(self, raw_alert: Dict[str, Any]):
        """
        Parse a single NOAA SWPC alert object into our Alert format.
        Returns None if the alert is not actionable (routine summary, old, etc).
        """
        product_id = raw_alert.get('product_id', '')
        message_text = raw_alert.get('message', '')
        
        # --- Filter 1: Only actionable product IDs ---
        if product_id not in ACTIONABLE_PRODUCT_IDS:
            return None
            
        # --- Filter 2: Must be recent (within the last 6 hours) ---
        try:
            issue_time = datetime.strptime(
                raw_alert.get('issue_datetime', ''), '%Y-%m-%d %H:%M:%S.%f'
            )
            age_seconds = (datetime.utcnow() - issue_time).total_seconds()
            if age_seconds > 6 * 3600:  # 6 hours
                return None
        except (ValueError, TypeError):
            return None

        # --- Determine severity from the NOAA product naming convention ---
        # Product IDs starting with "ALT" = ALERT (immediate), "WAR" = WARNING, "WAT" = WATCH
        severity = "LOW"
        if product_id.startswith("ALT"):
            severity = "HIGH"
        elif product_id.startswith("WAR"):
            severity = "MODERATE"
        elif product_id.startswith("WAT"):
            severity = "LOW"
            
        # Escalate to EXTREME if the message explicitly says so or if it's a very high Kp
        if "EXTREME" in message_text.upper():
            severity = "EXTREME"
        if product_id in {"ALTK08", "ALTK09"}:
            severity = "EXTREME"

        # --- Extract the first meaningful line of the message as the title ---
        message_lines = [l.strip() for l in message_text.split('\n') if l.strip()]
        title = "Space Weather Event Detected"
        for line in message_lines:
            # Skip header lines like "Space Weather Message Code: ..."
            if line.startswith("Space Weather Message Code"):
                title = f"Space Weather Message Code: {product_id}"
                continue
            # Use the first substantive line as the alert title
            if len(line) > 10 and not line.startswith("Issue Time") and not line.startswith("Serial Number"):
                title = line
                break

        # --- Extract recommended action ---
        action = "Monitor NOAA SWPC for updates."
        for line in message_lines:
            if "potential impacts" in line.lower():
                action = line.split(":", 1)[-1].strip() if ":" in line else line
            elif "impact" in line.lower() and len(line) > 15:
                action = line

        return {
            "id": product_id,
            "timestamp": raw_alert.get('issue_datetime', ''),
            "severity": severity,
            "predicted_class": "M",  # Inferred from NOAA context
            "lead_time_minutes": 0,
            "message": title,
            "recommended_action": action
        }

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
            
            # Find the most recent *actionable* alert
            active_alert = None
            if self.cached_alerts:
                for raw_alert in self.cached_alerts:
                    parsed = self._parse_noaa_alert(raw_alert)
                    if parsed:
                        active_alert = parsed
                        break  # Use the first (most recent) actionable alert
            
            return {
                "timestamp": latest_time,
                "solexs_flux": soft_flux,
                "helios_flux": hard_flux,
                "alert": active_alert
            }

noaa_fetcher = NOAAFetcher()
