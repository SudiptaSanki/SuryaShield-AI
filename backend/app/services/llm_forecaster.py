import os
import json
import time
import re
import threading
from typing import Dict, Any, Optional

from ..config import settings

# In-memory cache to prevent spamming APIs (expires every 12 hours)
FORECAST_CACHE: Dict[str, Any] = {}
CACHE_TTL = 12 * 60 * 60  # 12 hours
CACHE_LOCK = threading.Lock()

# ---------------------------------------------------------------------------
# JSON extraction helper
# ---------------------------------------------------------------------------
def _extract_json(text: str) -> Dict[str, Any]:
    """Strip markdown fences and parse the first JSON object found."""
    text = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    # Find the first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(match.group())


# ---------------------------------------------------------------------------
# Core generation function with 3-tier fallback
# ---------------------------------------------------------------------------
def generate_llm_forecast(historical_data: str) -> Dict[str, Any]:
    """
    Try APIs in order:
      1. Groq  (llama-3.1-8b-instant – fast, free tier)
      2. Gemini primary   (GEMINI_API_KEY)
      3. Gemini secondary (GEMINI_API_KEY_FALLBACK)
      4. Offline baseline
    """

    prompt = (
        "You are SuryaShield AI, an advanced space weather forecasting engine.\n"
        f"Recent solar activity: {historical_data}\n\n"
        "Predict space weather for the NEXT 12 HOURS.\n"
        "Return ONLY a valid JSON object — no markdown, no extra text — matching:\n"
        "{\n"
        '  "summary": "2-3 sentence overview of expected space weather",\n'
        '  "hourly_forecast": [\n'
        '    {"hour": 1, "predicted_flux": "1.2e-6", "flare_probability_percent": 15, "class_risk": "C"},\n'
        "    ... (hours 1 through 12)\n"
        "  ]\n"
        "}\n"
        "flare_probability_percent must be integer 0-100. class_risk one of B C M X."
    )

    # ── 1. Groq ──────────────────────────────────────────────────────────────
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=1200,
                response_format={"type": "json_object"},
            )
            text = completion.choices[0].message.content
            result = _extract_json(text)
            print("[LLM] Groq success")
            return result
        except Exception as e:
            print(f"[LLM] Groq failed: {e}")

    # ── 2 & 3. Gemini (primary then fallback) ────────────────────────────────
    gemini_keys = [
        k for k in [settings.GEMINI_API_KEY, settings.GEMINI_API_KEY_FALLBACK]
        if k
    ]
    for idx, key in enumerate(gemini_keys, start=1):
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            # Try models in preferred order
            for model_name in ("gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"):
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    result = _extract_json(response.text)
                    print(f"[LLM] Gemini key-{idx} model={model_name} success")
                    return result
                except Exception as model_err:
                    print(f"[LLM] Gemini key-{idx} model={model_name} failed: {model_err}")
                    continue
        except Exception as e:
            print(f"[LLM] Gemini key-{idx} configuration failed: {e}")

    # ── 4. Offline baseline ───────────────────────────────────────────────────
    print("[LLM] All APIs failed – returning offline baseline")
    return _offline_baseline()


# ---------------------------------------------------------------------------
# Offline baseline (shown when all APIs are unavailable)
# ---------------------------------------------------------------------------
def _offline_baseline() -> Dict[str, Any]:
    import math
    hourly = []
    for i in range(1, 13):
        prob = int(10 + 5 * math.sin(i * 0.8))          # gentle sinusoidal variation
        flux_val = round(1.0 + 0.3 * math.sin(i * 0.5), 2)
        hourly.append({
            "hour": i,
            "predicted_flux": f"{flux_val}e-6",
            "flare_probability_percent": prob,
            "class_risk": "C" if prob < 25 else "M",
        })
    return {
        "summary": (
            "Space weather is currently near-baseline with quiet-to-unsettled conditions expected. "
            "Minor C-class activity is possible; no major flare events are forecast at this time. "
            "(Live AI summary unavailable – reconnect your API keys for real-time analysis.)"
        ),
        "hourly_forecast": hourly,
    }


# ---------------------------------------------------------------------------
# Public entry point (with 12-h disk cache)
# ---------------------------------------------------------------------------
CACHE_FILE = os.path.join(os.path.dirname(__file__), "forecast_cache.json")

def _load_cache_from_disk() -> None:
    global FORECAST_CACHE
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                data = json.load(f)
            if "timestamp" in data and "forecast" in data:
                FORECAST_CACHE["timestamp"] = data["timestamp"]
                FORECAST_CACHE["forecast"] = data["forecast"]
        except Exception as e:
            print(f"[LLM] Error reading cache file: {e}")

def _save_cache_to_disk() -> None:
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(FORECAST_CACHE, f)
    except Exception as e:
        print(f"[LLM] Error writing cache file: {e}")

# Load cache on module import
_load_cache_from_disk()

def get_12hr_forecast(
    current_data_summary: str = "Nominal background flux with occasional C-class flaring in the last 24 h.",
) -> Dict[str, Any]:
    global FORECAST_CACHE
    now = time.time()

    # Fast path without lock
    if "forecast" in FORECAST_CACHE and (now - FORECAST_CACHE.get("timestamp", 0)) < CACHE_TTL:
        print("[LLM] Returning cached forecast")
        return FORECAST_CACHE["forecast"]

    with CACHE_LOCK:
        # Double-check inside lock
        if "forecast" in FORECAST_CACHE and (now - FORECAST_CACHE.get("timestamp", 0)) < CACHE_TTL:
            return FORECAST_CACHE["forecast"]

        forecast = generate_llm_forecast(current_data_summary)
        FORECAST_CACHE = {"timestamp": now, "forecast": forecast}
        _save_cache_to_disk()
        return forecast

import asyncio

async def auto_refresh_forecast_loop():
    """Background task to proactively refresh the forecast every 12 hours."""
    while True:
        # Initial wait so we don't block startup, unless cache is missing
        now = time.time()
        if "forecast" not in FORECAST_CACHE or (now - FORECAST_CACHE.get("timestamp", 0)) >= CACHE_TTL:
            # We don't have current data summary in background context easily, 
            # so we just use the default background message
            try:
                # Run sync function in threadpool
                await asyncio.to_thread(get_12hr_forecast)
                print("[LLM] Auto-refresh completed.")
            except Exception as e:
                print(f"[LLM] Auto-refresh failed: {e}")
        
        # Check every hour if we need to refresh (so we don't drift)
        await asyncio.sleep(3600)
