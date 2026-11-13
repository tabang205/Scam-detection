"""
Preprocessing service.
Applies the exact same normalization used during v2 model training to prevent train-serve skew.
"""

import re

RE_URL = re.compile(
    r"(?:https?://|www\.|t\.me/|bit\.ly/|zalo\.me/)([^\s\]\[\"'<>()]+)|"
    r"\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|vn|net|org|xyz|top|vip|club|info|io|co|me|cc|tk|ml|ga|cf))(?:/[^\s]*)?",
    re.IGNORECASE,
)
RE_UNDERSCORE_JOIN = re.compile(r"(?<=[0-9A-Za-z\u00C0-\u1EF9])_(?=[0-9A-Za-z\u00C0-\u1EF9])")
RE_WHITESPACE = re.compile(r"\s+")


def _replace_url_with_domain(match: re.Match) -> str:
    raw = match.group(0).lower()
    raw = re.sub(r"^https?://", "", raw)
    host = raw.split("/")[0].split("?")[0]
    host_words = re.sub(r"[^a-z0-9\-]+", " ", host).replace("-", " ").strip()
    return f" {host_words} " if host_words else " "


def normalize_text(text: str, has_url_hint: bool | None = None) -> str:
    """Normalize input text identically to the v2 training pipeline."""
    if not isinstance(text, str):
        text = "" if text is None else str(text)

    text = text.replace("\r", " ").replace("\n", " ")
    detected_url = bool(RE_URL.search(text))
    text = RE_URL.sub(_replace_url_with_domain, text)
    text = RE_UNDERSCORE_JOIN.sub(" ", text)
    text = RE_WHITESPACE.sub(" ", text).strip().lower()
    if not text:
        return ""

    has_url = detected_url if has_url_hint is None else (bool(has_url_hint) or detected_url)
    if has_url:
        return f"[url] {text}"
    return text


def clean_text(text: str) -> str:
    """Standardize text before model inference."""
    return normalize_text(text, has_url_hint=None)
