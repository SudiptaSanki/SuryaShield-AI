import asyncio
import httpx
from datetime import datetime
from typing import Dict, Any, List

NOAA_XRAY_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json"
NOAA_ALERTS_URL = "https://services.swpc.noaa.gov/products/alerts.json"
NOAA_PLASMA_URL = "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"
NOAA_MAG_URL = "https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"

ACTIONABLE_PRODUCT_IDS = {
    "ALTK04", "ALTK05", "ALTK06", "ALTK07", "ALTK08", "ALTK09",
    "ALTXMF", "ALTEF3",
    "ALTTP2", "ALTTP4", "ALTTP5",
    "WARK04", "WARK05", "WARK06", "WARK07", "WARK08", "WARK09",
    "WARPC0",
    "WARSUD",
    "WATA20", "WATA50", "WATA99",
}

class NOAAFetcher:
    def __init__(self):
        self.cached_xray_data: List[Dict[str, Any]] = []
        self.cached_alerts: List[Dict[str, Any]] = []
        self.cached_plasma: List[List[str]] = []
        self.cached_mag: List[List[str]] = []
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

                # Fetch plasma
                plasma_resp = await client.get(NOAA_PLASMA_URL, timeout=10.0)
                if plasma_resp.status_code == 200:
                    plasma_data = plasma_resp.json()
                    async with self._lock:
                        self.cached_plasma = plasma_data

                # Fetch mag
                mag_resp = await client.get(NOAA_MAG_URL, timeout=10.0)
                if mag_resp.status_code == 200:
                    mag_data = mag_resp.json()
                    async with self._lock:
                        self.cached_mag = mag_data
                        
                self.last_fetch_time = datetime.utcnow()
                print(f"[{datetime.utcnow().isoformat()}] Successfully fetched NOAA data including solar wind.")
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
        product_id = raw_alert.get('product_id', '')
        message_text = raw_alert.get('message', '')
        
        if product_id not in ACTIONABLE_PRODUCT_IDS:
            return None
            
        try:
            issue_time = datetime.strptime(
                raw_alert.get('issue_datetime', ''), '%Y-%m-%d %H:%M:%S.%f'
            )
            age_seconds = (datetime.utcnow() - issue_time).total_seconds()
            if age_seconds > 6 * 3600:
                return None
        except (ValueError, TypeError):
            return None

        severity = "LOW"
        if product_id.startswith("ALT"):
            severity = "HIGH"
        elif product_id.startswith("WAR"):
            severity = "MODERATE"
        elif product_id.startswith("WAT"):
            severity = "LOW"
            
        if "EXTREME" in message_text.upper():
            severity = "EXTREME"
        if product_id in {"ALTK08", "ALTK09"}:
            severity = "EXTREME"

        message_lines = [l.strip() for l in message_text.split('\n') if l.strip()]
        title = "Space Weather Event Detected"
        for line in message_lines:
            if line.startswith("Space Weather Message Code"):
                title = f"Space Weather Message Code: {product_id}"
                continue
            if len(line) > 10 and not line.startswith("Issue Time") and not line.startswith("Serial Number"):
                title = line
                break

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
            "predicted_class": "M",
            "lead_time_minutes": 0,
            "message": title,
            "recommended_action": action
        }

    async def get_latest_data(self):
        async with self._lock:
            if not self.cached_xray_data:
                return None
            
            latest_time = self.cached_xray_data[-1]['time_tag']
            
            soft_flux = 1e-8
            hard_flux = 1e-9
            
            for item in reversed(self.cached_xray_data):
                if item['time_tag'] == latest_time:
                    if item['energy'] == '0.1-0.8nm':
                        soft_flux = item['flux']
                    elif item['energy'] == '0.05-0.4nm':
                        hard_flux = item['flux']
            
            active_alert = None
            if self.cached_alerts:
                for raw_alert in self.cached_alerts:
                    parsed = self._parse_noaa_alert(raw_alert)
                    if parsed:
                        active_alert = parsed
                        break

            # Parse latest solar wind plasma
            # NOAA format: ["time_tag", "density", "speed", "temperature"]
            solar_wind_speed = 400.0
            solar_wind_density = 5.0
            if self.cached_plasma and len(self.cached_plasma) > 1:
                try:
                    # Skip header row (index 0)
                    latest_plasma = self.cached_plasma[-1]
                    solar_wind_density = float(latest_plasma[1]) if latest_plasma[1] else 5.0
                    solar_wind_speed = float(latest_plasma[2]) if latest_plasma[2] else 400.0
                except (ValueError, IndexError):
                    pass

            # Parse latest solar wind mag
            # NOAA format: ["time_tag", "bx_gsm", "by_gsm", "bz_gsm", "lon_gsm", "lat_gsm", "bt"]
            bt = 5.0
            bz = 0.0
            if self.cached_mag and len(self.cached_mag) > 1:
                try:
                    latest_mag = self.cached_mag[-1]
                    bz = float(latest_mag[3]) if latest_mag[3] else 0.0
                    bt = float(latest_mag[6]) if latest_mag[6] else 5.0
                except (ValueError, IndexError):
                    pass

            # Derive an AI Prediction Overview Scale (0-10)
            # This is a simple heuristic based on X-ray flux, Bz, and solar wind speed
            ai_scale = 1.0
            if soft_flux > 1e-4:  # X class
                ai_scale = 9.0
            elif soft_flux > 1e-5:  # M class
                ai_scale = 6.0
            elif soft_flux > 1e-6:  # C class
                ai_scale = 3.0
            
            # Increase scale if Bz is strongly negative and wind is fast
            if bz < -5 and solar_wind_speed > 500:
                ai_scale += 2.0
            
            ai_scale = min(10.0, round(ai_scale, 1))

            return {
                "timestamp": latest_time,
                "solexs_flux": soft_flux,
                "helios_flux": hard_flux,
                "alert": active_alert,
                "solar_wind_speed": solar_wind_speed,
                "solar_wind_density": solar_wind_density,
                "bt": bt,
                "bz": bz,
                "ai_scale": ai_scale
            }

noaa_fetcher = NOAAFetcher()
