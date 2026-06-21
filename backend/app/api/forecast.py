from fastapi import APIRouter
from ..services.alert_manager import alert_manager

router = APIRouter()

@router.get("/forecast/current")
def get_current_forecast():
    # In a real app, this would fetch the latest prediction from the DB
    return {"message": "Current forecast API endpoint"}

@router.get("/alerts/current")
def get_current_alerts():
    return {"active_alerts": alert_manager.active_alerts}
