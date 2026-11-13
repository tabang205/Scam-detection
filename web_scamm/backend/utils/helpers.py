"""
Utility helpers for formatting and mapping.
"""


def confidence_to_threat_level(confidence: float) -> str:
    """Map a confidence percentage to a human-readable threat level."""
    if confidence >= 90:
        return "High"
    elif confidence >= 60:
        return "Medium"
    else:
        return "Low"


def format_prediction_response(
    prediction: str,
    confidence: float,
    keywords: list[str],
) -> dict:
    """
    Build the standardised API response for a detection result.

    Returns
    -------
    dict matching the contract:
        {
            "prediction": "Scam" | "Safe",
            "confidence": float,
            "threat_level": "High" | "Medium" | "Low",
            "keywords": list[str]
        }
    """
    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "threat_level": confidence_to_threat_level(confidence) if prediction == "Scam" else "Low",
        "keywords": keywords,
    }
