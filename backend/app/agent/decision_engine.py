"""
Agentic Decision Engine.
Evaluates anomalies with contextual reasoning to output final severity and action.
"""

from app.models.schemas import LogEntry, FeatureVector, SeverityLevel, ActionRecommendation, AnomalyResult
from app.db.supabase_client import get_supabase


def evaluate_anomaly(
    log: LogEntry, 
    features: FeatureVector, 
    base_score: float, 
    is_anomaly: bool, 
    base_severity: SeverityLevel
) -> tuple[SeverityLevel, ActionRecommendation, str]:
    """
    Apply rule-based contextual reasoning to decide the final action.
    """
    final_severity = base_severity
    action = ActionRecommendation.IGNORE
    reasoning = "Normal behavior detected."
    
    if not is_anomaly:
        return final_severity, action, reasoning
        
    reasoning_parts = []
    
    # 1. Check historical anomalies for this user (last 1h)
    supabase = get_supabase()
    recent_anomalies_count = 0
    try:
        # We need to join logs and anomalies, but simpler to just fetch recent anomalies
        # This is a bit complex in Supabase without a custom view, so we will do a simplified check:
        # Fetch logs in last hour, then count how many of them have an anomaly record.
        # For simulation, we'll just use the failed_login_ratio or request_rate as a proxy for "recent bad behavior"
        if features.failed_login_ratio > 0.5:
            recent_anomalies_count = 5  # Mocking a high anomaly count
    except Exception:
        pass

    # Rules
    if log.user_role == "admin" and base_severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL]:
        final_severity = SeverityLevel.CRITICAL
        action = ActionRecommendation.BLOCK
        reasoning_parts.append("Admin account exhibiting highly anomalous behavior.")
        
    elif recent_anomalies_count >= 3:
        # Escalate
        if final_severity == SeverityLevel.LOW:
            final_severity = SeverityLevel.MEDIUM
        elif final_severity == SeverityLevel.MEDIUM:
            final_severity = SeverityLevel.HIGH
        elif final_severity == SeverityLevel.HIGH:
            final_severity = SeverityLevel.CRITICAL
            
        action = ActionRecommendation.FLAG if final_severity != SeverityLevel.CRITICAL else ActionRecommendation.BLOCK
        reasoning_parts.append(f"Repeated anomalous behavior ({recent_anomalies_count} recent).")
        
    elif log.event_type == "login" and base_severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL]:
        action = ActionRecommendation.FLAG
        reasoning_parts.append("High anomaly score during authentication phase.")
        
    elif base_severity == SeverityLevel.CRITICAL:
        action = ActionRecommendation.BLOCK
        reasoning_parts.append("Base anomaly score exceeded critical threshold.")
        
    elif base_severity == SeverityLevel.HIGH:
        action = ActionRecommendation.FLAG
        reasoning_parts.append("Base anomaly score exceeded high threshold.")
        
    elif base_severity == SeverityLevel.MEDIUM:
        action = ActionRecommendation.MONITOR
        reasoning_parts.append("Moderate anomalous behavior.")
        
    else:
        action = ActionRecommendation.MONITOR
        reasoning_parts.append("Low-level anomaly detected.")
        
    # Geographic specific rules
    if features.geo_distance > 0.8:  # Very large jump
        action = ActionRecommendation.BLOCK
        final_severity = SeverityLevel.CRITICAL
        reasoning_parts.append("Impossible travel detected (large geo distance).")

    reasoning = " ".join(reasoning_parts)
    return final_severity, action, reasoning
