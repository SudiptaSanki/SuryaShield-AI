def calculate_risk_score(flare_class, probability_5min):
    """
    Computes a composite risk score (0-100) based on predicted flare class and probability.
    """
    base_scores = {
        'A': 5,
        'B': 10,
        'C': 30,
        'M': 65,
        'X': 95
    }
    
    # Base severity of the predicted class
    severity = base_scores.get(flare_class[0], 0) if isinstance(flare_class, str) else base_scores.get(flare_class, 0)
    
    # Scale by probability of occurrence
    risk = severity * probability_5min
    
    return min(100.0, max(0.0, risk))

def get_risk_level(risk_score):
    if risk_score >= 80:
        return "EXTREME"
    elif risk_score >= 50:
        return "HIGH"
    elif risk_score >= 20:
        return "MODERATE"
    else:
        return "LOW"
