"""
Dashboard Summary API Route.
Aggregates live data from the database to feed the frontend dashboard.
"""

from fastapi import APIRouter, Depends, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
import random

from app.models.schemas import DashboardSummaryResponse, TrendPoint, ThreatPattern, GeoOrigin, AlertRow
from app.db.supabase_client import get_supabase
from app.core.security import verify_supabase_token


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

def resolve_country(ip: str) -> tuple[str, str, int, int]:
    """Mock IP to country resolution."""
    # A tiny mock dictionary for realism
    mapping = [
        ("United States", "US", 240, 200),
        ("Russia", "RU", 660, 130),
        ("China", "CN", 760, 200),
        ("Brazil", "BR", 360, 320),
        ("Germany", "DE", 510, 160)
    ]
    # Deterministic based on IP length to keep it consistent
    idx = len(ip) % len(mapping)
    return mapping[idx]


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(user: dict = Depends(verify_supabase_token)):
    supabase = get_supabase()
    tenant_id = user.get("sub")
    
    if not tenant_id:
        raise HTTPException(status_code=401, detail="User ID missing from token")
        
    try:
        # Fetch all anomalies for the tenant
        anom_res = supabase.table("anomalies").select("*").eq("tenant_id", tenant_id).execute()
        anomalies_data = anom_res.data
        
        # Fetch all logs for the tenant
        # Note: In production with millions of logs, you would do a COUNT query.
        # Supabase python client supports count via .execute({count: "exact"})
        # But we also need the actual log details to join with anomalies.
        # We will fetch logs that have anomalies.
        log_ids = [a["log_id"] for a in anomalies_data]
        
        if log_ids:
            logs_res = supabase.table("logs").select("*").in_("id", log_ids).execute()
            logs_data = {log["id"]: log for log in logs_res.data}
        else:
            logs_data = {}
            
        # Also get total log count
        total_logs_res = supabase.table("logs").select("id", count="exact").eq("tenant_id", tenant_id).execute()
        total_logs = total_logs_res.count if total_logs_res.count is not None else 0

        # Metrics
        anomalies_count = len(anomalies_data)
        critical_count = sum(1 for a in anomalies_data if a["final_severity"] == "critical")
        threats_count = sum(1 for a in anomalies_data if a["is_anomaly"])
        blocked_count = sum(1 for a in anomalies_data if a["action_recommendation"] == "block")
        
        metrics = {
            "logs": total_logs,
            "anomalies": anomalies_count,
            "critical": critical_count,
            "threats": threats_count,
            "blocked": blocked_count
        }
        
        # Trend (last 48 half-hours)
        now = datetime.utcnow()
        trend_map = defaultdict(lambda: {"anomalies": 0, "critical": 0})
        
        for a in anomalies_data:
            # Join with log to get timestamp
            log = logs_data.get(a["log_id"])
            if log:
                # Parse timestamp
                ts_str = log["timestamp"].replace("Z", "+00:00")
                ts = datetime.fromisoformat(ts_str).replace(tzinfo=None)
                # Bucket by 30 min intervals
                minutes = ts.minute // 30 * 30
                bucket_time = ts.replace(minute=minutes, second=0, microsecond=0)
                time_label = bucket_time.strftime("%H:%M")
                
                trend_map[time_label]["anomalies"] += 1
                if a["final_severity"] == "critical":
                    trend_map[time_label]["critical"] += 1

        trend = []
        for i in range(47, -1, -1):
            bucket_time = now - timedelta(minutes=30 * i)
            time_label = bucket_time.strftime("%H:%M")
            trend.append(TrendPoint(
                time=time_label,
                anomalies=trend_map[time_label]["anomalies"],
                critical=trend_map[time_label]["critical"]
            ))

        # Threat Patterns
        event_counts = defaultdict(int)
        for a in anomalies_data:
            log = logs_data.get(a["log_id"])
            if log and a["is_anomaly"]:
                event_counts[log["event_type"]] += 1
                
        threat_patterns = [
            ThreatPattern(name=k.replace("_", " ").title(), value=v)
            for k, v in sorted(event_counts.items(), key=lambda item: item[1], reverse=True)
        ]
        # Pad with 0 if empty so chart doesn't crash
        if not threat_patterns:
            threat_patterns = [ThreatPattern(name="No threats yet", value=0)]

        # Geo Origins
        geo_counts = defaultdict(int)
        for a in anomalies_data:
            log = logs_data.get(a["log_id"])
            if log and a["is_anomaly"]:
                country, code, x, y = resolve_country(log["ip_address"])
                geo_counts[code] += 1
                
        geo_origins = []
        for code, count in geo_counts.items():
            # Find the country details
            for country, c_code, x, y in [("United States", "US", 240, 200), ("Russia", "RU", 660, 130), ("China", "CN", 760, 200), ("Brazil", "BR", 360, 320), ("Germany", "DE", 510, 160)]:
                if c_code == code:
                    intensity = "critical" if count > 10 else "high" if count > 5 else "medium"
                    geo_origins.append(GeoOrigin(
                        country=country, code=code, x=x, y=y, threats=count, intensity=intensity
                    ))
                    break
        
        if not geo_origins:
            # Provide at least one empty node for the map
            geo_origins.append(GeoOrigin(country="Monitoring", code="--", x=500, y=250, threats=0, intensity="low"))

        # Alerts (Latest 10)
        alerts = []
        sorted_anomalies = sorted(anomalies_data, key=lambda a: a["id"], reverse=True)[:10]
        for a in sorted_anomalies:
            log = logs_data.get(a["log_id"])
            if log:
                country, code, _, _ = resolve_country(log["ip_address"])
                alerts.append(AlertRow(
                    id=a["log_id"],
                    timestamp=log["timestamp"],
                    user=log["user_id"],
                    ip=log["ip_address"],
                    event=log["event_type"].replace("_", " ").title(),
                    severity=a["final_severity"].capitalize(),
                    status="Open" if a["action_recommendation"] in ["flag", "block"] else "Resolved",
                    country=code,
                    rawLog=f"[{log['timestamp']}] level=warn src_ip={log['ip_address']} user={log['user_id']} event={log['event_type']} action={a['action_recommendation']}"
                ))

        return DashboardSummaryResponse(
            metrics=metrics,
            trend=trend,
            threatPatterns=threat_patterns,
            geoOrigins=geo_origins,
            alerts=alerts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard summary: {str(e)}")
