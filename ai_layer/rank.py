# scoring (vector sim + keyword overlap + recency)

from typing import List, Dict
from rapidfuzz import fuzz

# Basic, fast keyword coverage using fuzzy matching

def keyword_overlap_score(text: str, jd_keywords: List[str]) -> float:
    if not jd_keywords: return 0.0
    scores = []
    low = text.lower()
    for kw in jd_keywords:
        s = fuzz.partial_ratio(low, kw.lower()) / 100.0
        scores.append(s)
    return sum(scores) / max(1, len(scores))


def recency_score(meta: Dict) -> float:
    # crude: favor newer experiences
    year = None
    for k in ("end_date", "start_date"):
        v = meta.get(k)
        if v and len(v) >= 4:
            try:
                year = int(v[:4])
                break
            except Exception:
                pass
    if not year:
        return 0.3
    return min(1.0, max(0.3, (year - 2000) / 30.0))  # ~2000→0.0 .. 2030→1.0


def combine_scores(vector_sim: float, kw_score: float, recency: float) -> float:
    return 0.6 * vector_sim + 0.25 * kw_score + 0.15 * recency