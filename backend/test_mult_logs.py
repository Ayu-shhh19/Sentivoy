import asyncio
import json
import uuid
import asynchat
import aiohttp
from datetime import datetime, timezone

API_URL = "http://localhost:8000/api/logs"
API_KEY = "sentivoy-dev-api-key-change-me"  # Built-in dev bypass

async def send_log(session: aiohttp.ClientSession, log_data: dict, index: int):
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        async with session.post(API_URL, json=log_data, headers=headers) as response:
            if response.status == 202:
                print(f"[{index}] Successfully ingested log: {log_data['event_type']}")
            else:
                text = await response.text()
                print(f"[{index}] Failed to ingest log. Status {response.status}: {text}")
    except Exception as e:
        print(f"[{index}] Error sending log: {str(e)}")

async def main():
    print("Testing ML Agent integration with multiple logs...")
    
    # Generate some normal and anomalous logs
    logs = [
        {
            "user_id": "user_123",
            "event_type": "login",
            "ip_address": "192.168.1.10",
            "resource_accessed": "/dashboard",
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": "user_123",
            "event_type": "file_download",
            "ip_address": "192.168.1.10",
            "resource_accessed": "/reports/monthly.pdf",
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        # Anomalous behavior (rapid failed logins, different IP)
        {
            "user_id": "admin_456",
            "event_type": "login",
            "ip_address": "45.33.22.11", # Unknown/malicious IP
            "resource_accessed": "/admin",
            "status": "failure",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": "admin_456",
            "event_type": "login",
            "ip_address": "45.33.22.11",
            "resource_accessed": "/admin",
            "status": "failure",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        # Massive data export
        {
            "user_id": "admin_456",
            "event_type": "data_export",
            "ip_address": "45.33.22.11",
            "resource_accessed": "/api/users/export",
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    ]

    async with aiohttp.ClientSession() as session:
        tasks = []
        for i, log in enumerate(logs):
            tasks.append(send_log(session, log, i))
        
        await asyncio.gather(*tasks)
        
    print("Test completed. Check Sentivoy dashboard for agent evaluations.")

if __name__ == "__main__":
    # We can run this to verify the pipeline
    asyncio.run(main())
