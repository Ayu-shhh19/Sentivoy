import asyncio
from app.api.dashboard import get_dashboard_summary

async def test():
    # Pass a dummy user dict like what Depends(verify_supabase_token) provides
    user = {"sub": "ab3c5c7e-f30d-4171-a980-18f55aea1876"}
    try:
        res = await get_dashboard_summary(user=user)
        print("Success! Metrics:", res.metrics)
    except Exception as e:
        print("Error!", e)

asyncio.run(test())
