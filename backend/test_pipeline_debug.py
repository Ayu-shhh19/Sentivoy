import asyncio
import uuid
from app.models.schemas import LogEntry, EventType, EventStatus
from app.pipeline.orchestrator import process_log_pipeline
from datetime import datetime, timezone

async def test():
    log = LogEntry(
        user_id="admin_root",
        ip_address="46.17.43.12",
        event_type=EventType.LOGIN,
        status=EventStatus.FAILURE,
        timestamp=datetime.now(timezone.utc),
        user_role="admin"
    )
    # Using the exact same dev bypass key we used
    log.tenant_id = "fbe3c162-8e10-4c28-9844-0c5a278913b7"  # Example UUID
    
    await process_log_pipeline(log, str(uuid.uuid4()))
    print("Pipeline executed.")

if __name__ == "__main__":
    asyncio.run(test())
