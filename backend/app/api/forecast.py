from fastapi import APIRouter
from ..services.alert_manager import alert_manager
from ..services.llm_forecaster import get_12hr_forecast

router = APIRouter()

@router.get("/forecast/12hr")
def get_12hr_llm_forecast():
    # In a real app, we would pass actual DB history summary here
    summary = "Nominal background flux with occasional C-class flaring in the last 24h."
    return get_12hr_forecast(summary)

@router.get("/forecast/current")
def get_current_forecast():
    # In a real app, this would fetch the latest prediction from the DB
    return {"message": "Current forecast API endpoint"}

@router.get("/alerts/current")
def get_current_alerts():
    return {"active_alerts": alert_manager.active_alerts}
