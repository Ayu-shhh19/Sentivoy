"""
Score hand-built feature vectors so attack classes do not depend on Supabase.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.schemas import FeatureVector, SeverityLevel
from app.pipeline.detector import detect_anomaly


def _vector(**overrides) -> FeatureVector:
    values = {
        "log_id": "detector-test",
        "login_frequency": 0.1,
        "failed_login_ratio": 0.0,
        "time_gap": 0.5,
        "geo_distance": 0.02,
        "request_rate": 0.08,
        "ip_change_flag": 0.0,
    }
    values.update(overrides)
    return FeatureVector(**values)


def test_normal_behavior_stays_low():
    _score, is_anomaly, severity = detect_anomaly(_vector())
    assert severity == SeverityLevel.LOW
    assert is_anomaly is False


def test_brute_force_is_an_attack():
    _score, is_anomaly, severity = detect_anomaly(
        _vector(login_frequency=0.85, failed_login_ratio=0.95, time_gap=0.05, request_rate=0.7)
    )
    assert is_anomaly is True
    assert severity in (SeverityLevel.HIGH, SeverityLevel.CRITICAL)


def test_impossible_travel_is_an_attack():
    _score, is_anomaly, severity = detect_anomaly(
        _vector(geo_distance=0.92, ip_change_flag=1.0, time_gap=0.04, login_frequency=0.2)
    )
    assert is_anomaly is True
    assert severity in (SeverityLevel.HIGH, SeverityLevel.CRITICAL)


def test_api_abuse_is_an_attack():
    _score, is_anomaly, severity = detect_anomaly(
        _vector(request_rate=0.95, time_gap=0.02, login_frequency=0.15)
    )
    assert is_anomaly is True
    assert severity in (SeverityLevel.HIGH, SeverityLevel.CRITICAL)


if __name__ == "__main__":
    test_normal_behavior_stays_low()
    test_brute_force_is_an_attack()
    test_impossible_travel_is_an_attack()
    test_api_abuse_is_an_attack()
    print("Detector attack checks passed.")
