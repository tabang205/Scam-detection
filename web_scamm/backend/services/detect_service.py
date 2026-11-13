"""
Scam detection orchestration service.
Coordinates preprocessing, calibrated XLM-RoBERTa prediction, and UI indicator extraction.
"""

from services import keyword_service, model_service, preprocess_service
from utils.helpers import confidence_to_threat_level


def detect(text: str) -> dict:
    """Run the full text classification pipeline."""
    cleaned_text = preprocess_service.clean_text(text)
    if not cleaned_text:
        return {
            "prediction": "Safe",
            "confidence": 100.0,
            "threat_level": "Low",
            "keywords": [],
        }

    pred_class, confidence = model_service.predict(cleaned_text)
    conf_percentage = round(confidence * 100.0, 2)
    keywords = keyword_service.extract_keywords(text)

    if pred_class == 1:
        prediction = "Scam"
        threat_level = confidence_to_threat_level(conf_percentage)
    else:
        prediction = "Safe"
        threat_level = "Low"
        keywords = []

    return {
        "prediction": prediction,
        "confidence": conf_percentage,
        "threat_level": threat_level,
        "keywords": keywords,
    }
