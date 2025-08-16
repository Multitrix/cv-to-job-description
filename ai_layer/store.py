# Pinecone index helpers (create, upsert, query)

import os
from typing import List, Tuple, Dict, Any, Optional
from tenacity import retry, wait_exponential_jitter, stop_after_attempt
import pinecone
from .embeddings import embed_texts

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT", "us-east1-gcp")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "cv-bullets")

# Initialize Pinecone client (idempotent)
if PINECONE_API_KEY is None:
    raise RuntimeError("PINECONE_API_KEY is not set in environment")

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)


def ensure_index(dimension: int, metric: str = "cosine") -> None:
    """Create index if missing."""
    if PINECONE_INDEX_NAME not in pinecone.list_indexes():
        pinecone.create_index(name=PINECONE_INDEX_NAME, dimension=dimension, metric=metric)


@retry(wait=wait_exponential_jitter(1, 8), stop=stop_after_attempt(5))
def upsert_bullets(user_id: str, items: List[Tuple[str, str, Dict[str, Any]]]) -> None:
    """
    Upsert items into Pinecone.
    items: list of tuples (id, text, metadata)
    We use namespace=user_id for per-user isolation.
    """
    if not items:
        return

    # batch embed
    texts = [t for (_, t, _) in items]
    embeddings = embed_texts(texts)

    # ensure index dimension
    dim = len(embeddings[0])
    ensure_index(dim)

    idx = pinecone.Index(PINECONE_INDEX_NAME)
    vectors = []
    for (vid, _, md), vec in zip(items, embeddings):
        # store original text too in metadata for convenience
        md2 = dict(md)
        md2["_text"] = md2.get("_text") or texts.pop(0)  # if not present, use
        vectors.append((vid, vec, md2))
    # upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        idx.upsert(vectors=batch, namespace=user_id)


@retry(wait=wait_exponential_jitter(1, 8), stop=stop_after_attempt(5))
def query_topk(
    user_id: str,
    query_text: str,
    top_k: int = 25,
    metadata_filter: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Query Pinecone for top_k matches given the query_text.
    Returns the raw Pinecone response dict-like object.
    """
    idx = pinecone.Index(PINECONE_INDEX_NAME)
    qvec = embed_texts([query_text])[0]
    resp = idx.query(vector=qvec, top_k=top_k, include_metadata=True, namespace=user_id, filter=metadata_filter)
    return resp