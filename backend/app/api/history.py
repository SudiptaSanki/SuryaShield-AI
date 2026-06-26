import httpx
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
import math

router = APIRouter()

NOAA_FLARES_7DAY = "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json"
NOAA_FLARES_LATEST = "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json"

def classify_impact(flare_class: str) -> str:
    """Map flare class to impact level."""
    if not flare_class:
        return "Low"
    c = flare_class[0].upper()
    val = float(flare_class[1:]) if len(flare_class) > 1 else 1.0
    if c == 'X':
        return "Extreme" if val >= 5.0 else "High"
    elif c == 'M':
        return "High" if val >= 5.0 else "Moderate"
    elif c == 'C':
        return "Low"
    else:
        return "Low"

def compute_duration(begin_time: str, end_time: str) -> str:
    """Compute duration string from ISO timestamps."""
    try:
        fmt = "%Y-%m-%dT%H:%M:%SZ"
        begin = datetime.strptime(begin_time, fmt)
        end = datetime.strptime(end_time, fmt)
        minutes = int((end - begin).total_seconds() / 60)
        return f"{minutes} min"
    except:
        return "N/A"

def format_peak_flux(flux_wm2: float) -> str:
    """Format flux in scientific notation."""
    if flux_wm2 is None:
        return "N/A"
    return f"{flux_wm2:.2e} W/m²"

def make_event_id(begin_time: str, max_class: str) -> str:
    """Construct a human-readable event ID."""
    try:
        dt = datetime.strptime(begin_time, "%Y-%m-%dT%H:%M:%SZ")
        return f"FL-{dt.strftime('%Y-%m%d')}-{max_class.replace('.', '')}"
    except:
        return f"FL-UNKNOWN-{max_class}"

def parse_flare(f: dict) -> dict:
    """Convert raw NOAA flare dict to our FlareEvent schema."""
    begin = f.get("begin_time", "")
    end = f.get("end_time", "")
    max_t = f.get("max_time", "")
    max_class = f.get("max_class", "N/A")
    peak_flux = f.get("max_xrlong")

    # Format peak time
    peak_time_str = "N/A"
    try:
        dt = datetime.strptime(max_t, "%Y-%m-%dT%H:%M:%SZ")
        peak_time_str = dt.strftime("%H:%M UTC")
        date_str = dt.strftime("%Y-%m-%d")
    except:
        date_str = begin[:10] if begin else "N/A"

    duration = compute_duration(begin, end)
    
    # Rough rise/decay from begin->max and max->end
    try:
        fmt = "%Y-%m-%dT%H:%M:%SZ"
        rise = int((datetime.strptime(max_t, fmt) - datetime.strptime(begin, fmt)).total_seconds() / 60)
        decay = int((datetime.strptime(end, fmt) - datetime.strptime(max_t, fmt)).total_seconds() / 60)
        rise_str = f"{rise} min"
        decay_str = f"{decay} min"
    except:
        rise_str = "N/A"
        decay_str = "N/A"

    return {
        "id": make_event_id(begin, max_class),
        "date": date_str,
        "class": max_class,
        "beginClass": f.get("begin_class", "N/A"),
        "endClass": f.get("end_class", "N/A"),
        "peakTime": peak_time_str,
        "duration": duration,
        "impact": classify_impact(max_class),
        "peakFlux": format_peak_flux(peak_flux),
        "riseTime": rise_str,
        "decayTime": decay_str,
        "satellite": f"GOES-{f.get('satellite', 18)}",
        "associatedCME": "Check DONKI",
        "description": (
            f"Solar flare recorded by GOES-{f.get('satellite', 18)} satellite. "
            f"Event began as class {f.get('begin_class', '?')} at {begin[11:16]} UTC "
            f"and peaked at {max_class} at {max_t[11:16]} UTC. "
            f"Ended as {f.get('end_class', '?')} at {end[11:16]} UTC. "
            f"Peak soft X-ray flux: {format_peak_flux(peak_flux)}. "
            f"Source: NOAA/SWPC GOES XRS real-time data."
        )
    }


@router.get("/history/flares")
async def get_flare_history(
    days: int = Query(default=7, ge=1, le=7, description="Number of days to fetch (max 7)"),
    class_filter: Optional[str] = Query(default=None, description="Filter by class prefix: B, C, M, X")
):
    """
    Fetch real flare event history from NOAA GOES satellite data.
    Returns up to 7 days of detected solar flare events.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(NOAA_FLARES_7DAY, timeout=10.0)
            resp.raise_for_status()
            raw = resp.json()
            
            if isinstance(raw, dict) and "value" in raw:
                flares = raw["value"]
            elif isinstance(raw, list):
                flares = raw
            else:
                flares = []
                
        except Exception as e:
            return {"error": str(e), "events": [], "source": "NOAA GOES XRS", "count": 0}

    # Filter by time window
    cutoff = datetime.utcnow() - timedelta(days=days)
    events = []
    for f in flares:
        try:
            begin = datetime.strptime(f.get("begin_time", ""), "%Y-%m-%dT%H:%M:%SZ")
            if begin < cutoff:
                continue
        except:
            pass
        
        event = parse_flare(f)
        
        # Apply class filter
        if class_filter and not event["class"].upper().startswith(class_filter.upper()):
            continue
            
        events.append(event)

    # Sort newest first
    events.sort(key=lambda x: x["date"] + x["peakTime"], reverse=True)

    return {
        "events": events,
        "count": len(events),
        "source": "NOAA GOES-18 XRS Real-Time Data",
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "api_url": NOAA_FLARES_7DAY
    }


@router.get("/history/xray")
async def get_xray_history():
    """
    Returns the last 24 hours of X-ray flux readings (1-day file from NOAA).
    Downsampled to one reading per 5 minutes for chart performance.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json",
                timeout=10.0
            )
            resp.raise_for_status()
            raw = resp.json()
        except Exception as e:
            return {"error": str(e), "soft": [], "hard": []}

    # Separate bands
    soft = [r for r in raw if r.get("energy") == "0.1-0.8nm"]
    hard = [r for r in raw if r.get("energy") == "0.05-0.4nm"]

    # Downsample to every 5th point (data comes every 1 min, we want every 5)
    soft_ds = soft[::5]
    hard_ds = hard[::5]

    return {
        "soft": [{"t": r["time_tag"], "v": r["flux"]} for r in soft_ds],
        "hard": [{"t": r["time_tag"], "v": r["flux"]} for r in hard_ds],
        "source": "NOAA GOES-18 XRS",
        "fetched_at": datetime.utcnow().isoformat() + "Z"
    }
