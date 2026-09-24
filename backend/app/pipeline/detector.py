"""
Anomaly detection module.
Scores a feature vector with the TensorFlow autoencoder and attack classifier.
"""

import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np

from app.ml.models import CLASS_NAMES, load_models, reconstruction_errors
from app.models.schemas import FeatureVector, SeverityLevel


try:
    _autoencoder, _classifier, _calibration = load_models()
except Exception as exc:
    print(f"Warning: Failed to load ML models: {exc}")
    _autoencoder, _classifier, _calibration = None, None, None


_CRITICAL_CLASSES = {"brute_force", "impossible_travel", "api_abuse"}


def _severity_for_attack(class_name: str, confidence: float) -> SeverityLevel:
    """Map a predicted attack class to a severity. Stronger confidence escalates."""
    if class_name in _CRITICAL_CLASSES and confidence >= 0.8:
        return SeverityLevel.CRITICAL
    if confidence >= 0.7 or class_name in _CRITICAL_CLASSES:
        return SeverityLevel.HIGH
    return SeverityLevel.MEDIUM


def _severity_for_error(error: float, threshold: float) -> SeverityLevel:
    if error < threshold * 1.5:
        return SeverityLevel.LOW
    if error < threshold * 2.0:
        return SeverityLevel.MEDIUM
    if error < threshold * 3.0:
        return SeverityLevel.HIGH
    return SeverityLevel.CRITICAL


def detect_anomaly(features: FeatureVector) -> tuple[float, bool, SeverityLevel]:
    """
    Run both models.
    Returns (anomaly_score, is_anomaly, base_severity).

    A confident attack class wins over reconstruction error so known attacks
    are not missed when they sit near the normal error boundary.
    """
    if _autoencoder is None or _classifier is None or _calibration is None:
        return 0.0, False, SeverityLevel.LOW

    vector = np.asarray([features.to_list()], dtype=np.float32)
    error = float(reconstruction_errors(_autoencoder, vector)[0])
    probabilities = _classifier.predict(vector, verbose=0)[0]
    class_index = int(np.argmax(probabilities))
    confidence = float(probabilities[class_index])
    class_name = CLASS_NAMES[class_index] if class_index < len(CLASS_NAMES) else "normal"

    env_threshold = os.getenv("ANOMALY_THRESHOLD")
    threshold = float(env_threshold) if env_threshold else float(_calibration["reconstruction_threshold"])
    attack_confidence = float(_calibration.get("attack_confidence", 0.6))

    if class_name != "normal" and confidence >= attack_confidence:
        return confidence, True, _severity_for_attack(class_name, confidence)

    is_anomaly = error > threshold
    if not is_anomaly:
        return error, False, SeverityLevel.LOW
    return error, True, _severity_for_error(error, threshold)
