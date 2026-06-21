from datetime import datetime
from .risk_assessor import calculate_risk_score, get_risk_level

class AlertManager:
    def __init__(self):
        self.active_alerts = []
        
    def check_and_generate_alerts(self, prediction_result):
        predicted_class = prediction_result['predicted_class']
        prob_5min = prediction_result['probabilities']['5_min']
        
        risk_score = calculate_risk_score(predicted_class, prob_5min)
        risk_level = get_risk_level(risk_score)
        
        # Generate alert if risk is moderate or higher
        if risk_level in ["MODERATE", "HIGH", "EXTREME"] and prob_5min > 0.4:
            alert = {
                "id": f"ALT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "severity": risk_level,
                "predicted_class": predicted_class,
                "lead_time_minutes": 5,
                "message": f"{risk_level} Risk: {predicted_class}-class solar flare predicted within 5 minutes.",
                "recommended_action": self._get_recommendation(risk_level)
            }
            
            # For MVP, we just keep the latest alert
            self.active_alerts = [alert]
            return alert
            
        # Clear alerts if risk drops
        if risk_level == "LOW":
            self.active_alerts = []
            
        return None
        
    def _get_recommendation(self, level):
        if level == "EXTREME":
            return "Initiate satellite safe mode. Delay aviation polar routes. Alert power grid operators."
        elif level == "HIGH":
            return "Monitor satellite telemetry closely. Warn HF radio operators of potential blackouts."
        elif level == "MODERATE":
            return "Routine monitoring. Minor HF radio degradations possible."
        return "No action required."

alert_manager = AlertManager()
