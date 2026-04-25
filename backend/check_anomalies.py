from app.db.supabase_client import get_supabase
import json

def check():
    supabase = get_supabase()
    res = supabase.table("anomalies").select("*").execute()
    data = res.data
    print(f"Total anomalies: {len(data)}")
    
    severities = {}
    for a in data:
        sev = str(a.get("final_severity"))
        severities[sev] = severities.get(sev, 0) + 1
        
    print(f"Severity breakdown: {json.dumps(severities, indent=2)}")

if __name__ == "__main__":
    check()
