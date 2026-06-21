def classify_flare_intensity(flux_w_m2):
    """
    Classifies a flare based on its peak X-ray flux (1-8 Angstroms) in W/m^2.
    Follows the GOES classification system.
    """
    if flux_w_m2 >= 1e-4:
        subclass = min(9.9, flux_w_m2 / 1e-4)
        return f"X{subclass:.1f}"
    elif flux_w_m2 >= 1e-5:
        subclass = flux_w_m2 / 1e-5
        return f"M{subclass:.1f}"
    elif flux_w_m2 >= 1e-6:
        subclass = flux_w_m2 / 1e-6
        return f"C{subclass:.1f}"
    elif flux_w_m2 >= 1e-7:
        subclass = flux_w_m2 / 1e-7
        return f"B{subclass:.1f}"
    else:
        subclass = max(1.0, flux_w_m2 / 1e-8)
        return f"A{subclass:.1f}"
