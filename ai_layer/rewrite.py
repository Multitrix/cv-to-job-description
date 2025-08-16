# GPT-4o-mini rewriting + validators

import re
from typing import List
from tenacity import retry, wait_exponential_jitter, stop_after_attempt
from openai import OpenAI
from .prompts import SYSTEM_REWRITE, REWRITE_INSTRUCTION, LIGHT_REWRITE_HINT, HEAVY_REWRITE_HINT
from .utils import extract_technologies, semantic_similarity_of_texts, escape_latex

# instantiate client (OpenAI auto-reads OPENAI_API_KEY env var if using openai.OpenAI)
client = OpenAI()

# adjust minimum semantic similarity you require between original and rewritten
SEMANTIC_THRESHOLD = 0.78


def _build_prompt(original: str, jd: str, skills: List[str], mode: str) -> str:
    base = REWRITE_INSTRUCTION.format(jd=jd, skills=", ".join(skills), bullet=original)
    hint = HEAVY_REWRITE_HINT if mode == "heavy" else LIGHT_REWRITE_HINT
    return base + "\n" + hint


@retry(wait=wait_exponential_jitter(1, 8), stop=stop_after_attempt(4))
def _call_llm(prompt: str) -> str:
    # Use the Chat/Completions interface for now with low temperature.
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_REWRITE},
            {"role": "user", "content": prompt},
        ],
        temperature=0.18,
        max_tokens=160,
    )
    text = resp.choices[0].message.content.strip()
    return text


def _no_new_techs(original: str, rewritten: str, candidate_skills: List[str]) -> bool:
    """
    Ensure that any detected techs in rewritten are present in original OR candidate_skills.
    This is a fast conservative check — it relies on regex tech extraction; not perfect,
    but will catch many hallucinations like adding "Kubernetes" when original didn't mention it.
    """
    orig_tech = set([t.lower() for t in extract_technologies(original)])
    new_tech = set([t.lower() for t in extract_technologies(rewritten)])
    allowed = set([s.lower() for s in candidate_skills] + list(orig_tech))
    return new_tech.issubset(allowed)


def rewrite_bullet(original: str, jd_text: str, candidate_skills: List[str], mode: str = "heavy") -> str:
    """
    Rewrites a single bullet:
      - Builds a prompt including original and JD
      - Calls LLM
      - Validates: semantic similarity + no-new-techs
      - Returns LaTeX-escaped rewritten bullet or original as fallback
    """
    prompt = _build_prompt(original, jd_text, candidate_skills, mode)
    try:
        out = _call_llm(prompt)
    except Exception:
        # LLM failed -> return original
        return escape_latex(original)

    # small cleanup: single-line, trim weird whitespace
    out_single = " ".join(out.splitlines()).strip()

    # semantic check (embedding-based)
    try:
        sim = semantic_similarity_of_texts(original, out_single)
    except Exception:
        sim = 0.0

    if sim < SEMANTIC_THRESHOLD:
        # fallback to original (too semantically different)
        return escape_latex(original)

    # no-new-tech check
    if not _no_new_techs(original, out_single, candidate_skills):
        return escape_latex(original)

    # final escape
    return escape_latex(out_single)