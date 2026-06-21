import numpy as np
import pandas as pd
from scipy.signal import savgol_filter

def filter_noise(flux_array, window_length=11, polyorder=3):
    """
    Applies a Savitzky-Golay filter to smooth out instrumental noise from X-ray signals.
    """
    if len(flux_array) < window_length:
        return flux_array # Not enough data to filter
    return savgol_filter(flux_array, window_length, polyorder)

def normalize_flux(flux_array):
    """
    Log-scales and min-max normalizes the flux for neural network input.
    """
    # X-ray flux spans many orders of magnitude
    log_flux = np.log10(np.clip(flux_array, 1e-10, 1e-2))
    
    # Typical log range from -9 to -3
    min_val = -9.0
    max_val = -3.0
    
    normalized = (log_flux - min_val) / (max_val - min_val)
    return np.clip(normalized, 0, 1)

def preprocess_stream(solexs_history, helios_history):
    """
    Takes historical windows of flux data and returns preprocessed arrays.
    """
    s_filtered = filter_noise(np.array(solexs_history))
    h_filtered = filter_noise(np.array(helios_history))
    
    s_norm = normalize_flux(s_filtered)
    h_norm = normalize_flux(h_filtered)
    
    return s_norm, h_norm
