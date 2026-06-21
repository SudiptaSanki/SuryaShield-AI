import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, FlareEvent
from app.config import settings
from datetime import datetime, timedelta
import uuid

# SQLite for local dev
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(FlareEvent).first():
        print("Database already seeded.")
        return
        
    print("Seeding database with historical flare events...")
    now = datetime.utcnow()
    
    flares = [
        FlareEvent(
            id=f"FL-{uuid.uuid4().hex[:8]}",
            start_time=now - timedelta(days=5, hours=2),
            peak_time=now - timedelta(days=5, hours=1, minutes=30),
            end_time=now - timedelta(days=5, hours=1),
            flare_class="X2.8",
            peak_flux=2.8e-4
        ),
        FlareEvent(
            id=f"FL-{uuid.uuid4().hex[:8]}",
            start_time=now - timedelta(days=15, hours=6),
            peak_time=now - timedelta(days=15, hours=5, minutes=10),
            end_time=now - timedelta(days=15, hours=4),
            flare_class="M5.4",
            peak_flux=5.4e-5
        ),
        FlareEvent(
            id=f"FL-{uuid.uuid4().hex[:8]}",
            start_time=now - timedelta(days=22, hours=14),
            peak_time=now - timedelta(days=22, hours=13, minutes=45),
            end_time=now - timedelta(days=22, hours=13),
            flare_class="C9.1",
            peak_flux=9.1e-6
        )
    ]
    
    db.add_all(flares)
    db.commit()
    print("Seed complete.")

if __name__ == "__main__":
    seed_db()
