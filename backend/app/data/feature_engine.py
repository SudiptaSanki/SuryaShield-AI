import numpy as np

def extract_features(s_norm, h_norm):
    """
    Extracts time-series features from a sliding window for AI model input.
    """
    if len(s_norm) < 2:
        return np.zeros(5)
        
    # 1. Rise rate (first derivative approximation)
    s_diff = np.diff(s_norm)
    recent_rise_rate = np.mean(s_diff[-5:]) if len(s_diff) >= 5 else np.mean(s_diff)
    
    # 2. Spectral Hardness Ratio (Hard X-ray / Soft X-ray)
    # Using normalized values to approximate the ratio dynamics
    hardness_ratio = np.mean(h_norm[-5:]) / (np.mean(s_norm[-5:]) + 1e-6)
    
    # 3. Moving variances (to detect burstiness in HEL1OS)
    h_var = np.var(h_norm[-10:]) if len(h_norm) >= 10 else np.var(h_norm)
    s_var = np.var(s_norm[-10:]) if len(s_norm) >= 10 else np.var(s_norm)
    
    # 4. Maximum recent flux
    s_max = np.max(s_norm[-10:]) if len(s_norm) >= 10 else np.max(s_norm)
    
    return np.array([recent_rise_rate, hardness_ratio, h_var, s_var, s_max])

def prepare_model_input(s_norm, h_norm):
    """
    Combines raw normalized series and engineered features for the CNN-LSTM.
    """
    features = extract_features(s_norm, h_norm)
    
    # In a real model, we'd shape this for (batch, sequence, channels)
    # Here we mock a combined feature vector for the synthetic predictor
    return {
        "sequence_soft": s_norm[-60:].tolist() if len(s_norm) >= 60 else s_norm.tolist(),
        "sequence_hard": h_norm[-60:].tolist() if len(h_norm) >= 60 else h_norm.tolist(),
        "engineered_features": features.tolist()
    }
