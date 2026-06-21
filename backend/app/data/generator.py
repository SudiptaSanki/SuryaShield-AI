import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math

class SolarDataGenerator:
    def __init__(self, seed=None):
        if seed:
            np.random.seed(seed)
        self.current_time = datetime.utcnow()
        self.base_flux_soft = 1e-8  # Baseline soft X-ray (A class)
        self.base_flux_hard = 1e-9  # Baseline hard X-ray
        self.flare_active = False
        self.flare_start_time = None
        self.flare_peak_time = None
        self.flare_end_time = None
        self.current_flare_class = 'A'
        self.flare_multiplier = 1.0
        
    def _generate_noise(self, base, volatility=0.1):
        noise = np.random.normal(0, volatility)
        return max(1e-10, base * (1 + noise))

    def _trigger_flare(self):
        # 5% chance of flare every generation cycle if not active
        if not self.flare_active and np.random.random() < 0.05:
            self.flare_active = True
            self.flare_start_time = self.current_time
            # Flare duration between 10 and 60 minutes
            duration = timedelta(minutes=np.random.randint(10, 60))
            self.flare_end_time = self.flare_start_time + duration
            # Peak is somewhere in the first half
            peak_offset = timedelta(seconds=duration.total_seconds() * np.random.uniform(0.1, 0.4))
            self.flare_peak_time = self.flare_start_time + peak_offset
            
            # Determine flare class (C, M, or X)
            rand_val = np.random.random()
            if rand_val < 0.7:
                self.current_flare_class = 'C'
                self.flare_multiplier = np.random.uniform(1e-6, 1e-5) / self.base_flux_soft
            elif rand_val < 0.95:
                self.current_flare_class = 'M'
                self.flare_multiplier = np.random.uniform(1e-5, 1e-4) / self.base_flux_soft
            else:
                self.current_flare_class = 'X'
                self.flare_multiplier = np.random.uniform(1e-4, 1e-3) / self.base_flux_soft

    def _flare_profile(self, t):
        if not self.flare_active:
            return 1.0
            
        if t < self.flare_start_time or t > self.flare_end_time:
            self.flare_active = False
            self.current_flare_class = 'A'
            return 1.0
            
        if t <= self.flare_peak_time:
            # Rise phase (steep)
            progress = (t - self.flare_start_time).total_seconds() / (self.flare_peak_time - self.flare_start_time).total_seconds()
            # Exponential rise
            return 1.0 + (self.flare_multiplier - 1.0) * (progress ** 3)
        else:
            # Decay phase (gradual)
            progress = (t - self.flare_peak_time).total_seconds() / (self.flare_end_time - self.flare_peak_time).total_seconds()
            # Exponential decay
            return 1.0 + (self.flare_multiplier - 1.0) * math.exp(-5 * progress)

    def generate_point(self, time_increment_sec=2):
        self.current_time += timedelta(seconds=time_increment_sec)
        self._trigger_flare()
        
        flare_factor = self._flare_profile(self.current_time)
        
        # Soft X-ray (SoLEXS: 1-8 Angstrom)
        solexs_flux = self._generate_noise(self.base_flux_soft * flare_factor, 0.05)
        
        # Hard X-ray (HEL1OS: 10-100 keV) - peaks slightly earlier and is bursty
        if self.flare_active and self.current_time <= self.flare_peak_time:
            hard_factor = flare_factor * 1.5 * (1 + np.random.normal(0, 0.5))
        else:
            hard_factor = flare_factor * 0.5
        
        helios_flux = self._generate_noise(self.base_flux_hard * max(1, hard_factor), 0.15)
        
        return {
            "timestamp": self.current_time.isoformat() + "Z",
            "solexs_flux": solexs_flux,
            "helios_flux": helios_flux,
            "simulated_class": self.current_flare_class if self.flare_active else 'A'
        }

generator = SolarDataGenerator()
