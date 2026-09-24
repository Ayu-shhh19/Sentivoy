"""
TensorFlow detectors for log features.

Two models share the same 6-value feature vector:
- An autoencoder fit only on normal behavior. High reconstruction error
  means the event does not look like the training baseline.
- A classifier trained on the attack shapes this product already handles
  (brute force, impossible travel, API abuse, account takeover), so those
  patterns score as attacks even when a single feature is only moderately high.
"""

import json
import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
from tensorflow import keras
from tensorflow.keras import layers

FEATURE_DIM = 6
CLASS_NAMES = (
    "normal",
    "brute_force",
    "impossible_travel",
    "api_abuse",
    "account_takeover",
)

_ML_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(_ML_DIR, "model_store")
AUTOENCODER_PATH = os.path.join(MODEL_DIR, "autoencoder.keras")
CLASSIFIER_PATH = os.path.join(MODEL_DIR, "attack_classifier.keras")
CALIBRATION_PATH = os.path.join(MODEL_DIR, "calibration.json")


def build_autoencoder(input_dim: int = FEATURE_DIM) -> keras.Model:
    """Encoder 6 -> 32 -> 16 -> 8, decoder back to 6. Sigmoid matches 0-1 features."""
    inputs = keras.Input(shape=(input_dim,))
    encoded = layers.Dense(32, activation="relu")(inputs)
    encoded = layers.Dense(16, activation="relu")(encoded)
    bottleneck = layers.Dense(8, activation="relu")(encoded)
    decoded = layers.Dense(16, activation="relu")(bottleneck)
    decoded = layers.Dense(32, activation="relu")(decoded)
    outputs = layers.Dense(input_dim, activation="sigmoid")(decoded)
    model = keras.Model(inputs, outputs, name="log_autoencoder")
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse")
    return model


def build_attack_classifier(input_dim: int = FEATURE_DIM, num_classes: int = len(CLASS_NAMES)) -> keras.Model:
    """Softmax classifier over normal behavior and the four attack classes."""
    inputs = keras.Input(shape=(input_dim,))
    hidden = layers.Dense(32, activation="relu")(inputs)
    hidden = layers.Dropout(0.1)(hidden)
    hidden = layers.Dense(16, activation="relu")(hidden)
    outputs = layers.Dense(num_classes, activation="softmax")(hidden)
    model = keras.Model(inputs, outputs, name="attack_classifier")
    model.compile(
        optimizer=keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def reconstruction_errors(autoencoder: keras.Model, features: np.ndarray) -> np.ndarray:
    """Mean squared error per row between the input and its reconstruction."""
    reconstructed = autoencoder.predict(features, verbose=0)
    return np.mean(np.square(reconstructed - features), axis=1)


def save_bundle(autoencoder: keras.Model, classifier: keras.Model, calibration: dict) -> None:
    os.makedirs(MODEL_DIR, exist_ok=True)
    autoencoder.save(AUTOENCODER_PATH)
    classifier.save(CLASSIFIER_PATH)
    with open(CALIBRATION_PATH, "w", encoding="utf-8") as handle:
        json.dump(calibration, handle, indent=2)


def models_ready() -> bool:
    return (
        os.path.exists(AUTOENCODER_PATH)
        and os.path.exists(CLASSIFIER_PATH)
        and os.path.exists(CALIBRATION_PATH)
    )


def load_models() -> tuple[keras.Model, keras.Model, dict]:
    """Load saved weights. Train them first when the store is empty."""
    if not models_ready():
        from app.ml.train import train_model

        print("TensorFlow weights not found. Training attack detectors...")
        train_model()

    autoencoder = keras.models.load_model(AUTOENCODER_PATH)
    classifier = keras.models.load_model(CLASSIFIER_PATH)
    with open(CALIBRATION_PATH, encoding="utf-8") as handle:
        calibration = json.load(handle)
    return autoencoder, classifier, calibration
