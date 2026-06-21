import asyncio
import websockets

async def test():
    try:
        ws = await websockets.connect('ws://localhost:8000/ws/live')
        data = await asyncio.wait_for(ws.recv(), timeout=8)
        print("SUCCESS:", data[:200])
        await ws.close()
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")

asyncio.run(test())
