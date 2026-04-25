import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import os
from typing import Tuple

from app.ml.autoencoder import Autoencoder, get_model_path


def generate_synthetic_normal_data(num_samples: int = 10000) -> torch.Tensor:
    """
    Generate synthetic feature vectors representing 'normal' user behavior.
    Features:
    0: login_frequency (low)
    1: failed_login_ratio (low, mostly 0)
    2: time_gap (moderate to high)
    3: geo_distance (low, usually same city)
    4: request_rate (low to moderate)
    5: ip_change_flag (low probability)
    """
    np.random.seed(42)
    torch.manual_seed(42)
    
    # 0. login_frequency (0 to 3 per hour typically)
    f0 = np.random.poisson(lam=1.0, size=num_samples).astype(np.float32) / 10.0
    # 1. failed_login_ratio (mostly 0)
    f1 = np.random.choice([0.0, 0.1, 0.2], p=[0.9, 0.08, 0.02], size=num_samples).astype(np.float32)
    # 2. time_gap (normalized to 0-1, where 1 is a long time gap)
    f2 = np.random.normal(loc=0.5, scale=0.2, size=num_samples).clip(0, 1).astype(np.float32)
    # 3. geo_distance (normalized 0-1, mostly very low)
    f3 = np.random.exponential(scale=0.05, size=num_samples).clip(0, 1).astype(np.float32)
    # 4. request_rate (normalized 0-1, mostly low)
    f4 = np.random.normal(loc=0.1, scale=0.05, size=num_samples).clip(0, 1).astype(np.float32)
    # 5. ip_change_flag (0 or 1)
    f5 = np.random.choice([0.0, 1.0], p=[0.95, 0.05], size=num_samples).astype(np.float32)
    
    data = np.stack([f0, f1, f2, f3, f4, f5], axis=1)
    return torch.tensor(data, dtype=torch.float32)


def train_model(epochs: int = 50, batch_size: int = 64, learning_rate: float = 0.001) -> Tuple[Autoencoder, float]:
    """Train the autoencoder on synthetic normal data and calculate threshold."""
    print("Generating synthetic normal data...")
    train_data = generate_synthetic_normal_data(10000)
    
    # DataLoader
    dataset = torch.utils.data.TensorDataset(train_data)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    model = Autoencoder(input_dim=6)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    print(f"Starting training for {epochs} epochs...")
    model.train()
    
    for epoch in range(epochs):
        total_loss = 0.0
        for batch in dataloader:
            inputs = batch[0]
            
            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, inputs)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item() * inputs.size(0)
            
        avg_loss = total_loss / len(train_data)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.6f}")
            
    # Calculate threshold (e.g., 95th percentile of training error)
    model.eval()
    with torch.no_grad():
        errors = model.reconstruction_error(train_data).numpy()
        threshold = np.percentile(errors, 95)
        
    print(f"\nTraining completed. Recommended Anomaly Threshold (95th percentile): {threshold:.6f}")
    
    # Save model
    model_path = get_model_path()
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to {model_path}")
    
    return model, threshold


if __name__ == "__main__":
    train_model()
