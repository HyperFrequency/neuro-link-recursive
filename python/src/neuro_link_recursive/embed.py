"""Embedding pipeline: encode wiki pages and ingest into Qdrant."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import click
import frontmatter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from sentence_transformers import SentenceTransformer

from .config import resolve_nlr_root

COLLECTION = "neuro_link_wiki"
EMBED_DIM = 4096  # Octen 8B default


def _load_model(model_name: str | None = None) -> SentenceTransformer:
    name = model_name or "nomic-ai/nomic-embed-text-v2-moe"
    return SentenceTransformer(name, trust_remote_code=True)


def _page_id(path: str) -> str:
    return hashlib.sha256(path.encode()).hexdigest()[:16]


def embed_wiki(
    root: Path | None = None,
    qdrant_url: str = "http://localhost:6333",
    model_name: str | None = None,
    recreate: bool = False,
) -> int:
    """Embed all wiki pages and upsert into Qdrant. Returns count of pages embedded."""
    root = root or resolve_nlr_root()
    kb = root / "02-KB-main"
    skip = {"schema.md", "index.md", "log.md"}

    model = _load_model(model_name)
    client = QdrantClient(url=qdrant_url)
    dim = model.get_sentence_embedding_dimension()

    if recreate or not client.collection_exists(COLLECTION):
        client.recreate_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )

    points = []
    for md_file in kb.rglob("*.md"):
        if md_file.name in skip:
            continue
        post = frontmatter.load(str(md_file))
        text = post.content[:8000]  # cap for embedding model context
        vec = model.encode(text).tolist()
        rel = str(md_file.relative_to(root))
        points.append(
            PointStruct(
                id=_page_id(rel),
                vector=vec,
                payload={
                    "path": rel,
                    "title": post.get("title", md_file.stem),
                    "domain": post.get("domain", "unknown"),
                    "confidence": post.get("confidence", "medium"),
                    "text_preview": text[:500],
                },
            )
        )

    if points:
        client.upsert(collection_name=COLLECTION, points=points)
    return len(points)


def search_wiki(
    query: str,
    limit: int = 5,
    qdrant_url: str = "http://localhost:6333",
    model_name: str | None = None,
) -> list[dict]:
    """Semantic search across embedded wiki pages."""
    model = _load_model(model_name)
    client = QdrantClient(url=qdrant_url)
    vec = model.encode(query).tolist()
    results = client.query_points(
        collection_name=COLLECTION,
        query=vec,
        limit=limit,
    )
    return [
        {
            "path": r.payload["path"],
            "title": r.payload["title"],
            "domain": r.payload["domain"],
            "score": r.score,
            "preview": r.payload.get("text_preview", ""),
        }
        for r in results.points
    ]


@click.command()
@click.option("--qdrant-url", default="http://localhost:6333")
@click.option("--model", default=None, help="Sentence transformer model name")
@click.option("--recreate", is_flag=True, help="Recreate collection from scratch")
def main(qdrant_url: str, model: str | None, recreate: bool):
    """Embed all wiki pages into Qdrant."""
    root = resolve_nlr_root()
    count = embed_wiki(root, qdrant_url, model, recreate)
    click.echo(f"Embedded {count} wiki pages into Qdrant ({qdrant_url})")
