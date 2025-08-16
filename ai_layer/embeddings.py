# OpenAI embeddings + backoff

import os
import hashlib
from typing import List
from tenacity import retry, wait_exponential_jitter, stop_after_attempt
from openai import OpenAI

_EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
client = OpenAI()

@retry(wait=wait_exponential_jitter(1, 8), stop=stop_after_attempt(5))
def embed_texts(texts: List[str]) -> List[List[float]]:
    # Batch in one call when possible
    resp = client.embeddings.create(model=_EMBED_MODEL, input=texts)
    return [d.embedding for d in resp.data]


def bullet_fingerprint(text: str) -> str:
    return hashlib.sha1(text.strip().encode("utf-8")).hexdigest()