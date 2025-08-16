# Orchestration: run(job_desc, full_profile) -> tailored_profile

from typing import Dict, List, Any
from .models import LayerInput, LayerOutput, TailoredProfile, Experience, Project
from .store import upsert_bullets, query_topk
from .rank import keyword_overlap_score, recency_score, combine_scores
from .rewrite import rewrite_bullet
from .embeddings import embed_texts, bullet_fingerprint
from .utils import semantic_similarity_of_texts
from pydantic import parse_obj_as

# Tunable params
TOP_K_RETRIEVAL = 60
SELECT_TOP_N = 20
FINAL_BULLETS_PER_EXPERIENCE = 6


def ingest_profile_to_store(user_id: str, profile: Dict[str, Any]) -> None:
    """
    Convert full profile into (id, text, metadata) tuples and upsert to Pinecone.
    """
    items = []
    # experiences
    for exp in profile.get("experiences", []):
        exp_id = exp.get("id")
        for idx, b in enumerate(exp.get("bullets", [])):
            vid = f"exp::{exp_id}::{idx}"
            md = {
                "type": "experience",
                "experience_id": exp_id,
                "title": exp.get("title"),
                "company": exp.get("company"),
                "start_date": exp.get("start_date"),
                "end_date": exp.get("end_date"),
            }
            items.append((vid, b, md))
    # projects
    for proj in profile.get("projects", []):
        proj_id = proj.get("id")
        for idx, b in enumerate(proj.get("bullets", [])):
            vid = f"proj::{proj_id}::{idx}"
            md = {"type": "project", "project_id": proj_id, "name": proj.get("name")}
            items.append((vid, b, md))
    # skills as mini items
    for s in profile.get("skills", []):
        vid = f"skill::{s}"
        items.append((vid, s, {"type": "skill"}))

    if items:
        upsert_bullets(user_id, items)


def retrieve_and_rank(user_id: str, jd_text: str, jd_keywords: List[str], top_k: int = TOP_K_RETRIEVAL):
    """
    Query Pinecone and return ranked list of matches (with metadata and score)
    """
    res = query_topk(user_id, jd_text, top_k=top_k)
    matches = res.get("matches", []) if isinstance(res, dict) else getattr(res, "matches", [])
    ranked = []
    for m in matches:
        md = m.get("metadata", {}) if isinstance(m, dict) else getattr(m, "metadata", {})
        # obtain vector score if available
        vector_sim = m.get("score", 0.0) if isinstance(m, dict) else getattr(m, "score", 0.0)
        kw = keyword_overlap_score(md.get("title", "") + " " + md.get("company", "") + " " + (md.get("_text", "") if md else ""), jd_keywords)
        rec = recency_score(md)
        combined = combine_scores(vector_sim, kw, rec)
        ranked.append({"id": m.get("id") if isinstance(m, dict) else getattr(m, "id"), "metadata": md, "score": combined, "raw": m})
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked


def decide_intensity(sim_score: float, kw_overlap: float) -> str:
    """
    Decide rewrite intensity for a bullet using thresholds.
    """
    if sim_score >= 0.82 and kw_overlap >= 0.45:
        return "light"
    if sim_score >= 0.68 or kw_overlap >= 0.30:
        return "medium"
    return "heavy"


def tailor_profile(payload: LayerInput) -> LayerOutput:
    """
    Full pipeline function to call from your backend.
    """
    user_id = payload.user_id
    profile = payload.full_profile.model_dump()  # dict
    jd_text = payload.job_description.description

    # 1) ingest into Pinecone (idempotent upserts)
    ingest_profile_to_store(user_id, profile)

    # 2) simple jd keywords
    import re
    jd_keywords = [w.strip() for w in re.split(r"[,\\n]", jd_text) if len(w.strip()) > 2][:50]

    # 3) retrieve and rank
    ranked = retrieve_and_rank(user_id, jd_text, jd_keywords, top_k=TOP_K_RETRIEVAL)

    # pick top N matches to consider heavy rewrite
    top_matches = ranked[:SELECT_TOP_N]

    # map which bullets selected for heavy/medium/light rewrite
    heavy_set = set()
    medium_set = set()
    light_set = set()

    # We'll also collect similarity scores per id for later ordering inside experience
    sim_map = {}

    # For vector similarity we can use semantic_similarity_of_texts as fallback if we don't have raw vectors
    for r in top_matches:
        raw = r["raw"]
        bid = r["id"]
        md = r["metadata"] or {}
        # compute a rough sim between JD and text (embedding)
        text_for_sim = md.get("_text") or md.get("text") or ""
        try:
            sim = semantic_similarity_of_texts(jd_text, text_for_sim)
        except Exception:
            sim = r["score"]
        kw = keyword_overlap_score(text_for_sim, jd_keywords)
        intensity = decide_intensity(sim, kw)
        sim_map[bid] = {"sim": sim, "kw": kw, "intensity": intensity}
        if intensity == "heavy":
            heavy_set.add(bid)
        elif intensity == "medium":
            medium_set.add(bid)
        else:
            light_set.add(bid)

    # 4) rewrite bullets (heavy for selected ones; light for others)
    # We'll rewrite per experience and project bullets
    rewritten_exps: List[Dict[str, Any]] = []
    for exp in profile.get("experiences", []):
        new_bullets = []
        for idx, b in enumerate(exp.get("bullets", [])):
            vid = f"exp::{exp.get('id')}::{idx}"
            mode = "light"
            if vid in heavy_set:
                mode = "heavy"
            elif vid in medium_set:
                mode = "medium"
            # candidate skills: experience skills + profile skills
            candidate_skills = list(set(exp.get("skills", []) + profile.get("skills", [])))
            rewritten = rewrite_bullet(b, jd_text, candidate_skills, mode=mode)
            new_bullets.append(rewritten)
        # optionally trim bullets for final CV
        if len(new_bullets) > FINAL_BULLETS_PER_EXPERIENCE:
            # pick top bullets by sim if available in sim_map, else keep first N
            scored = []
            for idx, text in enumerate(exp.get("bullets", [])):
                vid = f"exp::{exp.get('id')}::{idx}"
                score = sim_map.get(vid, {}).get("sim", 0.0)
                scored.append((score, new_bullets[idx]))
            scored.sort(key=lambda x: x[0], reverse=True)
            kept = [s for _, s in scored[:FINAL_BULLETS_PER_EXPERIENCE]]
        else:
            kept = new_bullets
        rewritten_exps.append(
            {
                "id": exp.get("id"),
                "title": exp.get("title"),
                "company": exp.get("company"),
                "start_date": exp.get("start_date"),
                "end_date": exp.get("end_date"),
                "bullets": kept,
                "skills": exp.get("skills", []),
            }
        )

    # 5) rewrite projects
    rewritten_projects: List[Dict[str, Any]] = []
    for proj in profile.get("projects", []):
        new_bullets = []
        for idx, b in enumerate(proj.get("bullets", [])):
            vid = f"proj::{proj.get('id')}::{idx}"
            mode = "light"
            if vid in heavy_set:
                mode = "heavy"
            elif vid in medium_set:
                mode = "medium"
            candidate_skills = list(set(proj.get("skills", []) + profile.get("skills", [])))
            rewritten = rewrite_bullet(b, jd_text, candidate_skills, mode=mode)
            new_bullets.append(rewritten)
        rewritten_projects.append(
            {
                "id": proj.get("id"),
                "name": proj.get("name"),
                "bullets": new_bullets,
                "skills": proj.get("skills", []),
            }
        )

    # 6) assemble final tailored profile
    tailored = {
        "experiences": rewritten_exps,
        "projects": rewritten_projects,
        "skills": profile.get("skills", []),
        "certifications": profile.get("certifications", []),
    }

    # Validate with Pydantic
    tp = TailoredProfile(**tailored)
    return LayerOutput(user_id=user_id, tailored_profile=tp)