"""
Pipeline orchestrator.
Executes the log processing asynchronously.
"""

from app.models.schemas import LogEntry, AnomalyResult
from app.pipeline.preprocessor import extract_features
from app.pipeline.detector import detect_anomaly
from app.agent.decision_engine import evaluate_anomaly
from app.db.supabase_client import get_supabase


async def process_log_pipeline(log: LogEntry, log_id: str):
    """
    Background task to process a log through the ML/Agent pipeline.
    """
    try:
        supabase = get_supabase()
        
        # 1. Feature Engineering
        features = extract_features(log, log_id)
        
        # Store features
        try:
            supabase.table("features").insert(features.model_dump()).execute()
        except Exception as e:
            print(f"Error storing features: {e}")
            
        # 2. Anomaly Detection Inference
        score, is_anomaly, base_severity = detect_anomaly(features)
        
        # 3. Agentic Decision
        final_severity, action, reasoning = evaluate_anomaly(
            log, features, score, is_anomaly, base_severity
        )
        
        # 4. Construct Result
        result = AnomalyResult(
            log_id=log_id,
            tenant_id=log.tenant_id,
            anomaly_score=score,
            is_anomaly=is_anomaly,
            severity=base_severity,
            final_severity=final_severity,
            action_recommendation=action,
            reasoning=reasoning
        )
        
        # 5. Store Result in Supabase
        if is_anomaly or action != "ignore":
            try:
                # Store the anomaly record
                supabase.table("anomalies").insert(result.model_dump()).execute()
            except Exception as e:
                print(f"Error storing anomaly result: {e}")
                
    except Exception as e:
        print(f"Pipeline error for log {log_id}: {e}")
