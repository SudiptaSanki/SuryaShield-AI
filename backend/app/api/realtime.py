import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from ..data.noaa_fetcher import noaa_fetcher
from ..data.preprocessor import preprocess_stream
from ..data.feature_engine import prepare_model_input
from ..models.inference import inference_engine
from ..services.risk_assessor import get_risk_level, calculate_risk_score
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass # Handle disconnected clients

manager = ConnectionManager()

# Historical buffers for preprocessing
history_solexs = []
history_helios = []

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    last_timestamp = None
    try:
        while True:
            # Get latest data from NOAA fetcher
            data_point = await noaa_fetcher.get_latest_data()
            
            if not data_point:
                # Still initializing
                await asyncio.sleep(2)
                continue
                
            # Only process if we have a new timestamp, otherwise just keep the same prediction
            if data_point['timestamp'] != last_timestamp:
                last_timestamp = data_point['timestamp']
                
                # Update history buffers
                history_solexs.append(data_point['solexs_flux'])
                history_helios.append(data_point['helios_flux'])
                
                # Keep last 100 points
                if len(history_solexs) > 100:
                    history_solexs.pop(0)
                    history_helios.pop(0)
                    
            # We need at least 60 points of history to preprocess; if not enough, pad with the latest value
            temp_history_s = history_solexs if len(history_solexs) >= 60 else ([data_point['solexs_flux']] * 60) + history_solexs
            temp_history_h = history_helios if len(history_helios) >= 60 else ([data_point['helios_flux']] * 60) + history_helios
            
            # Preprocess and predict
            s_norm, h_norm = preprocess_stream(temp_history_s[-60:], temp_history_h[-60:])
            model_input = prepare_model_input(s_norm, h_norm)
            prediction = inference_engine.predict(model_input)
            
            # Only show alerts from the real NOAA feed — no AI-generated fake alerts
            final_alert = data_point['alert']
            
            # Calculate current risk score
            risk_score = calculate_risk_score(prediction['predicted_class'], prediction['probabilities']['5_min'])
            
            # Override risk score if NOAA says there's a severe storm
            if final_alert and final_alert['severity'] in ["HIGH", "EXTREME"]:
                risk_score = max(risk_score, 85)
            
            # For the UI we generate a dynamic current timestamp so the chart moves
            ui_timestamp = datetime.utcnow().isoformat() + "Z"
                
            payload = {
                "type": "LIVE_DATA",
                "timestamp": ui_timestamp, # use ui_timestamp so chart moves every 2s
                "actual_timestamp": data_point['timestamp'], # the real NOAA time
                "flux": {
                    # Add a tiny bit of jitter to keep the UI chart looking "live" 
                    # since NOAA only updates every 60 seconds
                    "solexs": data_point['solexs_flux'] * (1 + (asyncio.get_event_loop().time() % 2 - 1) * 0.01),
                    "helios": data_point['helios_flux'] * (1 + (asyncio.get_event_loop().time() % 2 - 1) * 0.01)
                },
                "forecast": prediction,
                "risk": {
                    "score": risk_score,
                    "level": get_risk_level(risk_score)
                },
                "alert": final_alert,
                "solar_wind": {
                    "speed": data_point.get('solar_wind_speed', 400.0),
                    "density": data_point.get('solar_wind_density', 5.0),
                    "bt": data_point.get('bt', 5.0),
                    "bz": data_point.get('bz', 0.0)
                },
                "ai_scale": data_point.get('ai_scale', 1.0)
            }
            
            await manager.broadcast(json.dumps(payload))
            await asyncio.sleep(2) # Stream every 2 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
