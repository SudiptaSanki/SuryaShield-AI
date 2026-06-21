import torch
import torch.nn.functional as F
from .cnn_lstm import create_mock_model

class FlareInferenceEngine:
    def __init__(self):
        # In a real app, this would load weights from settings.MODEL_PATH
        self.model = create_mock_model()
        self.classes = ['A', 'B', 'C', 'M', 'X']

    def predict(self, model_input):
        """
        Takes prepared input dictionary and returns predictions.
        """
        # Convert to tensors
        seq_soft = torch.tensor(model_input['sequence_soft'], dtype=torch.float32)
        seq_hard = torch.tensor(model_input['sequence_hard'], dtype=torch.float32)
        feat = torch.tensor(model_input['engineered_features'], dtype=torch.float32)
        
        # Ensure sequence length is padded to 60 if too short
        if seq_soft.shape[0] < 60:
            pad_size = 60 - seq_soft.shape[0]
            seq_soft = F.pad(seq_soft, (pad_size, 0), "constant", 0)
            seq_hard = F.pad(seq_hard, (pad_size, 0), "constant", 0)
            
        # Shape: (batch_size=1, channels=2, seq_len=60)
        x_seq = torch.stack((seq_soft, seq_hard)).unsqueeze(0)
        x_feat = feat.unsqueeze(0)
        
        with torch.no_grad():
            class_logits, time_probs, attn_weights = self.model(x_seq, x_feat)
            
            # For the mock MVP, let's inject some realism based on the features
            # (since an untrained model would just output random noise)
            
            # Feature [0] is rise rate, [4] is max flux
            rise_rate = model_input['engineered_features'][0]
            max_flux = model_input['engineered_features'][4]
            
            # Mocking the output based on actual input data dynamics
            if max_flux > 0.8:
                mock_class_idx = 4 # X
                mock_probs = [0.95, 0.90, 0.85]
            elif max_flux > 0.6:
                mock_class_idx = 3 # M
                mock_probs = [0.80, 0.75, 0.60]
            elif max_flux > 0.4 or rise_rate > 0.1:
                mock_class_idx = 2 # C
                mock_probs = [0.50, 0.40, 0.30]
            else:
                mock_class_idx = 0 # A
                mock_probs = [0.05, 0.05, 0.05]
            
            pred_class = self.classes[mock_class_idx]
            confidence = min(1.0, mock_probs[0] + 0.05) if mock_class_idx > 0 else 0.99
            
            return {
                "predicted_class": pred_class,
                "probabilities": {
                    "5_min": mock_probs[0],
                    "15_min": mock_probs[1],
                    "30_min": mock_probs[2]
                },
                "confidence_score": confidence,
                "attention_weights": attn_weights.squeeze().tolist()
            }

inference_engine = FlareInferenceEngine()
