from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()

class SolarReading(Base):
    __tablename__ = 'solar_readings'
    
    timestamp = Column(DateTime, primary_key=True, index=True)
    solexs_flux = Column(Float, nullable=False)
    helios_flux = Column(Float, nullable=False)

class FlareEvent(Base):
    __tablename__ = 'flare_events'
    
    id = Column(String, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    peak_time = Column(DateTime)
    end_time = Column(DateTime)
    flare_class = Column(String, nullable=False)  # e.g. M2.1
    peak_flux = Column(Float, nullable=False)

class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String, nullable=False)
    predicted_class = Column(String)
    lead_time_minutes = Column(Integer)
    message = Column(String)
