# hashing, LaTeX escaping, text cleaning

import re
import math
from typing import List
from .embeddings import embed_texts

LATEX_ESC = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}

TECH_REGEX = re.compile(
    r"\b([A-Z][A-Za-z0-9+.#-]{1,}|aws|gcp|azure|sql|nosql|ci/cd|rest|graphql|kafka|kinesis|airflow|spark|hadoop|docker|kubernetes|postgresql|mysql|redis|mongodb|pytorch|tensorflow)\b",
    flags=re.IGNORECASE,
)


def escape_latex(text: str) -> str:
    out = []
    for ch in text:
        out.append(LATEX_ESC.get(ch, ch))
    return "".join(out)


def extract_technologies(text: str) -> List[str]:
    found = TECH_REGEX.findall(text)
    # normalize tokens
    normalized = []
    for f in found:
        if isinstance(f, tuple):
            # when regex groups used, f might be tuple — choose first non-empty
            token = next((s for s in f if s), "")
        else:
            token = f
        token = token.strip()
        if token:
            normalized.append(token)
    # dedupe case-insensitively, preserve original-like formatting
    seen = set()
    out = []
    for t in normalized:
        key = t.lower()
        if key not in seen:
            seen.add(key)
            out.append(t)
    return out


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def semantic_similarity_of_texts(text_a: str, text_b: str) -> float:
    """Convenience wrapper: embed two texts and return cosine similarity."""
    a, b = embed_texts([text_a, text_b])
    return cosine_similarity(a, b)