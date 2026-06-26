from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .data.noaa_fetcher import noaa_fetcher
import asyncio

from .api import realtime, forecast, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the NOAA background fetcher
    asyncio.create_task(noaa_fetcher.start_polling(interval_seconds=60))
    yield
    # Stop the fetcher on shutdown
    noaa_fetcher.stop_polling()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Space weather early warning system using real-time NOAA data",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(realtime.router)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
