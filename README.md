<div align="center">

# ☀️ SuryaShield AI

### *Predicting the Sun's storms before they strike Earth*

An AI-powered space weather early warning system built for **real-time NOAA SWPC** live data integration.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Sun-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Data Pipeline](#-data-pipeline)
- [AI Model Architecture](#-ai-model-architecture)
- [Tech Stack](#-tech-stack)
- [Real-Time Data Flow](#-real-time-data-flow)
- [Web Application Pages](#-web-application-pages)
- [Deployment Guide](#-deployment-guide)
- [Getting Started](#-getting-started)

---

## 🌍 Overview

**SuryaShield AI** is an intelligent, real-time space weather monitoring platform. Solar flares are sudden bursts of energy released from the Sun that can disrupt satellites, GPS, radio communication, power grids, and space missions. Existing monitoring systems often require experts to interpret large volumes of solar X-ray data, and timely forecasting remains challenging.

SURYASHIELD AI solves this problem by combining live satellite observations with AI-powered nowcasting and short-term forecasting of solar flares. The platform transforms complex scientific data into clear, actionable insights for researchers, students, and space-weather analysts.

While conceptualized for ISRO's Aditya-L1 (SoLEXS/HEL1OS), the live application is **fully integrated with 100% real-time NOAA GOES-18 satellite APIs**, providing actual live telemetry and real-world Space Weather Prediction Center (SWPC) warnings.

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph "🛰️ Data Source"
        A["NOAA GOES-18<br/>Geostationary Satellite"] --> B["Primary X-Ray Flux<br/>(1-minute JSON API)"]
        A --> C["SWPC Alerts & Warnings<br/>(Live Dispatch)"]
    end

    subgraph "⚙️ Backend (FastAPI)"
        B --> D["NOAA Fetcher Service<br/>(Async Polling)"]
        C --> D
        D --> E["Data Interpolation<br/>Micro-jitter generation<br/>(1-min to 2-sec cadence)"]
        E --> F["Feature Engineering<br/>Rise Rate | Hardness Ratio"]
        F --> G["🧠 CNN-LSTM Model<br/>+ Attention Mechanism"]
        G --> H["Flare Classifier<br/>GOES A/B/C/M/X"]
        G --> I["Risk Assessor<br/>Score 0-100"]
        H --> J["Alert Manager<br/>Severity + Actions"]
        I --> J
    end

    subgraph "🖥️ Frontend (Next.js)"
        J --> K["WebSocket<br/>Live Stream"]
        K --> L["📊 Plotly Charts<br/>Dual-axis X-ray Flux"]
        K --> M["🌐 Three.js<br/>3D Sun Model"]
        K --> N["⚠️ Alert System<br/>Real-time Warnings"]
        K --> O["📈 AI Forecast<br/>Probability Gauges"]
    end

    style A fill:#ff6b35,color:#fff,stroke:#ff6b35
    style G fill:#7b2ff7,color:#fff,stroke:#7b2ff7
    style K fill:#00d4ff,color:#000,stroke:#00d4ff
```

---

## 🔬 Data Pipeline

The system processes real NOAA X-ray flux data through a multi-stage pipeline:

```mermaid
flowchart LR
    subgraph "Stage 1: Ingestion"
        A["NOAA SWPC APIs"] --> B["X-ray Flux JSON<br/>(Soft & Hard)"]
        A --> C["Latest Flares JSON"]
    end

    subgraph "Stage 2: Interpolation"
        B --> D["Cadence Matching"]
        D --> E["Micro-Jitter Math<br/>(Smooth UI updates)"]
    end

    subgraph "Stage 3: Feature Engineering"
        E --> F["Rise Rate<br/>(1st Derivative)"]
        E --> G["Spectral Hardness<br/>Ratio (H/S)"]
    end

    subgraph "Stage 4: AI Prediction"
        F --> H["CNN-LSTM<br/>+ Attention"]
        G --> H
        H --> I["Flare Class<br/>+ Confidence"]
    end

    style A fill:#ff6b35,color:#fff
    style H fill:#7b2ff7,color:#fff
    style I fill:#00ff88,color:#000
```

### How the Live Interpolation Works
NOAA satellites update their public JSON feeds every 60 seconds. To prevent a "frozen" UI during demonstrations, SuryaShield AI's backend takes the real 60-second data point and streams it out to the frontend via WebSocket every **2 seconds**, applying a microscopic mathematical variance (sine wave) of ~0.5%. This creates a highly realistic, continuously moving live-stream effect that perfectly converges with the actual NOAA data point every minute.

---

## 🧠 AI Model Architecture

```mermaid
graph TD
    subgraph "Input Layer"
        A["Soft X-ray Sequence<br/>(60 pts)"]
        B["Hard X-ray Sequence<br/>(60 pts)"]
    end

    subgraph "1D CNN Feature Extractor"
        A --> D["Conv1D (16 filters)<br/>kernel=3, ReLU"]
        B --> D
        D --> E["MaxPool1D (2)"]
    end

    subgraph "Temporal Memory"
        E --> H["Bidirectional LSTM<br/>hidden=32"]
        H --> I["Attention<br/>Mechanism"]
    end

    subgraph "Fusion & Output"
        I --> K["Dense (64)<br/>ReLU"]
        K --> L["Flare Class<br/>A/B/C/M/X"]
        K --> M["Probability<br/>5/15/30 min"]
    end

    style D fill:#00d4ff,color:#000
    style H fill:#7b2ff7,color:#fff
    style I fill:#ff6b35,color:#fff
    style L fill:#ff2d55,color:#fff
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Engine** | PyTorch | CNN-LSTM model definition, training, and inference |
| **Data Science** | NumPy, Pandas | Array ops, time-series, signal filtering |
| **API Server** | FastAPI + Uvicorn | Async REST API + WebSocket for real-time streaming |
| **Frontend** | Next.js 15 + React 19 | Server-side rendered pages with App Router |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with custom space theme tokens |
| **3D Visualization** | Three.js + React Three Fiber | Shader-powered 3D Sun model with animated corona |
| **Charts** | Plotly.js | Scientific dual-axis logarithmic X-ray flux plots |

---

## 📡 Real-Time Data Flow

```mermaid
sequenceDiagram
    participant N as NOAA API
    participant B as FastAPI Backend
    participant WS as WebSocket
    participant F as Next.js Frontend
    participant U as User Browser

    loop Every 60 seconds
        B->>N: Fetch latest X-ray flux & alerts
        N-->>B: Return live JSON data
    end

    loop Every 2 seconds
        B->>B: Apply micro-jitter interpolation
        B->>B: Run inference (CNN-LSTM)
        B->>WS: Broadcast payload
        WS->>F: Push via active socket
        F->>U: Update Plotly chart & Risk Meter smoothly
    end
```

---

## 🖥 Web Application Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Landing** | `/` | Cinematic hero with 3D Sun, animated star field, mission overview |
| 2 | **Live Dashboard** | `/dashboard` | Live NOAA Plotly charts, Risk Meter, active SWPC alerts |
| 3 | **AI Forecast** | `/forecast` | 5/15/30-min prediction gauges, Explainable AI attention heatmap |
| 4 | **History** | `/history` | Real 7-day NOAA solar flare database with direct SWPC links |

---

## ☁️ Deployment Guide

SuryaShield AI is designed to be easily deployed on modern, free-tier cloud platforms.

### 1. Frontend (Next.js) -> Vercel
1. Import your GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_WEBSOCKET_URL` = `wss://your-backend.onrender.com/ws/live`
4. Deploy!

### 2. Backend (FastAPI + WebSockets) -> Render.com
1. Create a New Web Service on Render and connect the repo.
2. Set the **Root Directory** to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
5. Deploy!

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**

### Quick Start (Windows)
```bash
# Clone the repository
git clone https://github.com/SudiptaSanki/SuryaShield-AI.git
cd SuryaShield-AI

# Run both servers (auto-installs dependencies)
run.bat
```

### Manual Setup

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

---

<div align="center">

**Built with ❤️ for the future of space weather prediction**

*Protecting Earth's technological infrastructure from solar storms*

</div>
