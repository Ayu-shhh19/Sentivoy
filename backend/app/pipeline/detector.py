"""
Anomaly detection module.
Runs inference on the PyTorch autoencoder.
"""

import torch
from app.ml.autoencoder import load_model
from app.models.schemas import FeatureVector, SeverityLevel
from app.core.config import get_settings


# Load model globally so it's ready for inference
# In a real app, this might be loaded in a FastAPI lifespan event
# to avoid loading overhead or errors during module import, 
# but this is simple and effective.
try:
    model = load_model()
except Exception as e:
    print(f"Warning: Failed to load ML model: {e}")
    model = None


def detect_anomaly(features: FeatureVector) -> tuple[float, bool, SeverityLevel]:
    """
    Run inference on the feature vector.
    Returns: (anomaly_score, is_anomaly, base_severity)
    """
    if not model:
        # Fallback if model failed to load
        return 0.0, False, SeverityLevel.LOW
        
    settings = get_settings()
    threshold = settings.anomaly_threshold
    
    # Prepare tensor
    feature_list = features.to_list()
    x = torch.tensor([feature_list], dtype=torch.float32)
    
    # Inference
    model.eval()
    with torch.no_grad():
        score_tensor = model.reconstruction_error(x)
        anomaly_score = score_tensor.item()
        
    is_anomaly = anomaly_score > threshold
    
    # Basic severity mapping based on how far above threshold
    if not is_anomaly:
        severity = SeverityLevel.LOW
    elif anomaly_score < threshold * 1.5:
        severity = SeverityLevel.LOW
    elif anomaly_score < threshold * 2.0:
        severity = SeverityLevel.MEDIUM
    elif anomaly_score < threshold * 3.0:
        severity = SeverityLevel.HIGH
    else:
        severity = SeverityLevel.CRITICAL
        
    return anomaly_score, is_anomaly, severity
