import asyncio
import uuid
from app.db.supabase_client import get_supabase

def test_insert():
    supabase = get_supabase()
    payload = {
        'log_id': str(uuid.uuid4()),
        'tenant_id': 'test_tenant',
        'is_anomaly': True,
        'final_severity': 'critical',
        'action_recommendation': 'block'
    }
    
    # Try inserting stripped payload
    try:
        res = supabase.table("anomalies").insert(payload).execute()
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_insert()
