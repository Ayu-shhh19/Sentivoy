"""
Train the TensorFlow autoencoder and attack classifier.

Normal samples follow the same 0-1 ranges as pipeline feature extraction.
Attack samples copy the shapes the decision engine and the synthetic log
script already treat as hostile, so inference recognizes those attacks
instead of only flagging generic reconstruction error.
"""

import os
from typing import Tuple

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
import tensorflow as tf

from app.ml.models import (
    CLASS_NAMES,
    build_attack_classifier,
    build_autoencoder,
    reconstruction_errors,
    save_bundle,
)


def _normal(rng: np.random.Generator, n: int) -> np.ndarray:
    return np.column_stack(
        [
            rng.poisson(1.0, n).astype(np.float32) / 10.0,
            rng.choice([0.0, 0.1, 0.2], n, p=[0.9, 0.08, 0.02]),
            np.clip(rng.normal(0.5, 0.2, n), 0, 1),
            np.clip(rng.exponential(0.05, n), 0, 1),
            np.clip(rng.normal(0.1, 0.05, n), 0, 1),
            rng.choice([0.0, 1.0], n, p=[0.95, 0.05]),
        ]
    ).astype(np.float32)


def _brute_force(rng: np.random.Generator, n: int) -> np.ndarray:
    return np.column_stack(
        [
            rng.uniform(0.45, 1.0, n),
            rng.uniform(0.75, 1.0, n),
            rng.uniform(0.0, 0.2, n),
            rng.uniform(0.0, 0.12, n),
            rng.uniform(0.35, 0.95, n),
            rng.choice([0.0, 1.0], n, p=[0.65, 0.35]),
        ]
    ).astype(np.float32)


def _impossible_travel(rng: np.random.Generator, n: int) -> np.ndarray:
    return np.column_stack(
        [
            rng.uniform(0.05, 0.4, n),
            rng.uniform(0.0, 0.25, n),
            rng.uniform(0.0, 0.15, n),
            rng.uniform(0.75, 1.0, n),
            rng.uniform(0.05, 0.4, n),
            np.ones(n),
        ]
    ).astype(np.float32)


def _api_abuse(rng: np.random.Generator, n: int) -> np.ndarray:
    return np.column_stack(
        [
            rng.uniform(0.05, 0.5, n),
            rng.uniform(0.0, 0.2, n),
            rng.uniform(0.0, 0.2, n),
            rng.uniform(0.0, 0.2, n),
            rng.uniform(0.75, 1.0, n),
            rng.choice([0.0, 1.0], n, p=[0.8, 0.2]),
        ]
    ).astype(np.float32)


def _account_takeover(rng: np.random.Generator, n: int) -> np.ndarray:
    return np.column_stack(
        [
            rng.uniform(0.2, 0.7, n),
            rng.uniform(0.0, 0.3, n),
            rng.uniform(0.0, 0.2, n),
            rng.uniform(0.45, 0.95, n),
            rng.uniform(0.15, 0.6, n),
            np.ones(n),
        ]
    ).astype(np.float32)


ATTACK_BUILDERS = (
    _brute_force,
    _impossible_travel,
    _api_abuse,
    _account_takeover,
)


def generate_training_set(
    n_normal: int = 8000,
    n_per_attack: int = 2000,
    seed: int = 42,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return normal features, all features, and integer class labels."""
    rng = np.random.default_rng(seed)
    tf.random.set_seed(seed)

    normal = _normal(rng, n_normal)
    attack_blocks = [builder(rng, n_per_attack) for builder in ATTACK_BUILDERS]
    attacks = np.vstack(attack_blocks)
    features = np.vstack([normal, attacks])
    labels = np.concatenate(
        [
            np.zeros(n_normal, dtype=np.int32),
            np.repeat(np.arange(1, len(CLASS_NAMES), dtype=np.int32), n_per_attack),
        ]
    )

    order = rng.permutation(len(features))
    return normal, features[order], labels[order]


def train_model(epochs: int = 25, batch_size: int = 64) -> Tuple[tf.keras.Model, tf.keras.Model, float]:
    """Fit both models and write weights plus the reconstruction threshold."""
    print("Generating normal traffic and labeled attack samples...")
    normal, features, labels = generate_training_set()

    autoencoder = build_autoencoder()
    print(f"Training autoencoder for {epochs} epochs on normal behavior...")
    autoencoder.fit(normal, normal, epochs=epochs, batch_size=batch_size, verbose=0)

    errors = reconstruction_errors(autoencoder, normal)
    threshold = float(np.percentile(errors, 95))

    classifier = build_attack_classifier()
    print(f"Training attack classifier for {epochs} epochs...")
    classifier.fit(features, labels, epochs=epochs, batch_size=batch_size, verbose=0)

    calibration = {
        "reconstruction_threshold": threshold,
        "attack_confidence": 0.6,
        "classes": list(CLASS_NAMES),
    }
    save_bundle(autoencoder, classifier, calibration)
    print(f"Reconstruction threshold (95th percentile of normal error): {threshold:.6f}")
    print("Saved autoencoder.keras, attack_classifier.keras, and calibration.json")
    return autoencoder, classifier, threshold


if __name__ == "__main__":
    train_model()
