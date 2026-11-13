"""
Keyword extraction service.
Extracts high-signal scam indicators using word-boundary matching for UI highlighting.
"""

import re
from typing import List

SCAM_KEYWORDS = [
    # English indicators
    "urgent", "winner", "bitcoin", "click here", "account suspended",
    "gift card", "update password", "login now", "claim reward",
    "claim your", "giveaway", "lottery", "cash prize", "bank details",
    "seed phrase", "recovery phrase", "verification code", "verify your identity",
    "wire transfer", "processing fee", "risk-free", "starter kit",
    "airdrop", "billing failed", "irs final notice", "temporarily locked",

    # Vietnamese indicators
    "khẩn cấp", "trúng thưởng", "trúng giải", "nhấp vào đây", "bấm vào đây",
    "tài khoản bị khóa", "tài khoản ngân hàng", "phần thưởng", "cập nhật mật khẩu",
    "đăng nhập ngay", "nhận quà", "tiền điện tử", "xổ số", "giải thưởng",
    "thông tin tài khoản", "chuyển khoản", "chuyển tiền", "nạp thẻ",
    "mã otp", "cung cấp otp", "khóa thẻ", "cục cảnh sát", "tòa án nhân dân",
    "phạt nguội", "khóa sim", "tiền ảo", "hoàn vốn", "sinh lời", "lợi nhuận",
    "lãi suất 0%", "cộng tác viên", "đơn hàng ảo", "phí làm hồ sơ", "giải ngân",
    "bảo hiểm khoản vay", "kháng nghị", "rút tiền mặt", "mã cvv",
]

_KEYWORD_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (kw, re.compile(rf"(?<!\w){re.escape(kw)}(?!\w)", re.IGNORECASE | re.UNICODE))
    for kw in SCAM_KEYWORDS
]


def extract_keywords(text: str) -> List[str]:
    """Return unique scam indicator phrases matched cleanly on word boundaries."""
    if not text:
        return []

    found: List[str] = []
    seen = set()
    for kw, pattern in _KEYWORD_PATTERNS:
        if pattern.search(text) and kw not in seen:
            seen.add(kw)
            found.append(kw)
    return found
