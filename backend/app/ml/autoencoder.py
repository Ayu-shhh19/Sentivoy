import torch
import torch.nn as nn
import os
from app.core.config import get_settings

class Autoencoder(nn.Module):
    """
    PyTorch Autoencoder for Log Anomaly Detection.
    Expects a 6-dimensional normalized feature vector.
    """
    def __init__(self, input_dim: int = 6):
        super(Autoencoder, self).__init__()
        
        # Encoder: Input -> 32 -> 16 -> 8
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 8)
        )
        
        # Decoder: 8 -> 16 -> 32 -> Output
        self.decoder = nn.Sequential(
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Linear(32, input_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
        
    def reconstruction_error(self, x: torch.Tensor) -> torch.Tensor:
        """Calculate the Mean Squared Error between input and reconstruction."""
        reconstruction = self.forward(x)
        mse_loss = nn.MSELoss(reduction='none')
        # Mean across feature dimension
        error = mse_loss(reconstruction, x).mean(dim=1)
        return error

def get_model_path() -> str:
    """Return the absolute path to the saved model weights."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "model_store", "autoencoder.pt")

def load_model() -> Autoencoder:
    """Initialize and load the model weights if they exist."""
    model = Autoencoder(input_dim=6)
    model_path = get_model_path()
    
    if os.path.exists(model_path):
        # Allow loading on CPU if trained on GPU
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()  # Set to evaluation mode
    else:
        # We start with an untrained model; in production it should be trained
        print(f"Warning: Model weights not found at {model_path}. Using uninitialized model.")
        
    return model
