import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from ..data.generator import generator
from ..data.preprocessor import preprocess_stream
from ..data.feature_engine import prepare_model_input
from ..models.inference import inference_engine
from ..services.alert_manager import alert_manager
from ..services.risk_assessor import get_risk_level, calculate_risk_score

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

# Mock historical buffers for preprocessing
history_solexs = []
history_helios = []

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Generate new data point
            data_point = generator.generate_point()
            
            # Update history buffers
            history_solexs.append(data_point['solexs_flux'])
            history_helios.append(data_point['helios_flux'])
            
            # Keep last 100 points
            if len(history_solexs) > 100:
                history_solexs.pop(0)
                history_helios.pop(0)
                
            # Preprocess and predict
            s_norm, h_norm = preprocess_stream(history_solexs, history_helios)
            model_input = prepare_model_input(s_norm, h_norm)
            prediction = inference_engine.predict(model_input)
            
            # Check for alerts
            alert = alert_manager.check_and_generate_alerts(prediction)
            
            # Calculate current risk score
            risk_score = calculate_risk_score(prediction['predicted_class'], prediction['probabilities']['5_min'])
            
            payload = {
                "type": "LIVE_DATA",
                "timestamp": data_point['timestamp'],
                "flux": {
                    "solexs": data_point['solexs_flux'],
                    "helios": data_point['helios_flux']
                },
                "forecast": prediction,
                "risk": {
                    "score": risk_score,
                    "level": get_risk_level(risk_score)
                },
                "alert": alert
            }
            
            await manager.broadcast(json.dumps(payload))
            await asyncio.sleep(2) # Stream every 2 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
