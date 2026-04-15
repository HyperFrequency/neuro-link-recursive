"""Neo4j/Graphiti wrapper — bi-temporal knowledge graph operations."""

from __future__ import annotations

import json
from datetime import datetime, timezone

import click
from neo4j import GraphDatabase

from .config import read_config, resolve_nlr_root


def _get_driver():
    cfg = read_config("neuro-link-config")
    neo4j_cfg = cfg.get("mcp_servers", {}).get("neo4j", {})
    url = neo4j_cfg.get("url", "bolt://localhost:7687")

    import os

    user = os.environ.get("NEO4J_USER", "neo4j")
    password = os.environ.get("NEO4J_PASSWORD", "neo4j")
    return GraphDatabase.driver(url, auth=(user, password))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def add_episode(text: str, source: str) -> dict:
    """Ingest a text episode as a node with temporal metadata."""
    driver = _get_driver()
    ingestion_time = _now_iso()
    with driver.session() as session:
        result = session.run(
            """
            CREATE (e:Episode {
                text: $text,
                source: $source,
                ingestion_time: $ingestion_time,
                event_time: $ingestion_time
            })
            RETURN elementId(e) AS id, e.ingestion_time AS ingestion_time
            """,
            text=text,
            source=source,
            ingestion_time=ingestion_time,
        )
        record = result.single()
    driver.close()
    return {"id": record["id"], "ingestion_time": record["ingestion_time"]}


def add_fact(
    subject: str,
    predicate: str,
    object_: str,
    valid_from: str | None = None,
    valid_to: str | None = None,
) -> dict:
    """Store a fact triple with bi-temporal model (event time + ingestion time)."""
    driver = _get_driver()
    ingestion_time = _now_iso()
    valid_from = valid_from or ingestion_time
    with driver.session() as session:
        result = session.run(
            """
            MERGE (s:Entity {name: $subject})
            MERGE (o:Entity {name: $object})
            CREATE (s)-[r:FACT {
                predicate: $predicate,
                valid_from: $valid_from,
                valid_to: $valid_to,
                ingestion_time: $ingestion_time
            }]->(o)
            RETURN elementId(r) AS id, r.ingestion_time AS ingestion_time
            """,
            subject=subject,
            object=object_,
            predicate=predicate,
            valid_from=valid_from,
            valid_to=valid_to or "",
            ingestion_time=ingestion_time,
        )
        record = result.single()
    driver.close()
    return {"id": record["id"], "ingestion_time": record["ingestion_time"]}


def query_facts(topic: str, as_of_date: str | None = None) -> list[dict]:
    """Query facts about a topic, optionally filtered to a point in time."""
    driver = _get_driver()
    as_of = as_of_date or _now_iso()
    with driver.session() as session:
        result = session.run(
            """
            MATCH (s:Entity)-[r:FACT]->(o:Entity)
            WHERE (s.name CONTAINS $topic OR o.name CONTAINS $topic)
              AND r.valid_from <= $as_of
              AND (r.valid_to = '' OR r.valid_to >= $as_of)
            RETURN s.name AS subject, r.predicate AS predicate, o.name AS object,
                   r.valid_from AS valid_from, r.valid_to AS valid_to,
                   r.ingestion_time AS ingestion_time
            ORDER BY r.ingestion_time DESC
            """,
            topic=topic,
            as_of=as_of,
        )
        facts = [dict(record) for record in result]
    driver.close()
    return facts


def get_entity_timeline(entity: str) -> list[dict]:
    """Get the full temporal history of facts involving an entity."""
    driver = _get_driver()
    with driver.session() as session:
        result = session.run(
            """
            MATCH (s:Entity)-[r:FACT]->(o:Entity)
            WHERE s.name = $entity OR o.name = $entity
            RETURN s.name AS subject, r.predicate AS predicate, o.name AS object,
                   r.valid_from AS valid_from, r.valid_to AS valid_to,
                   r.ingestion_time AS ingestion_time
            ORDER BY r.valid_from ASC
            """,
            entity=entity,
        )
        timeline = [dict(record) for record in result]
    driver.close()
    return timeline


def find_contradictions() -> list[dict]:
    """Find facts with the same subject-object pair but contradicting predicates or overlapping validity."""
    driver = _get_driver()
    with driver.session() as session:
        result = session.run(
            """
            MATCH (s:Entity)-[r1:FACT]->(o:Entity),
                  (s)-[r2:FACT]->(o)
            WHERE elementId(r1) < elementId(r2)
              AND r1.predicate <> r2.predicate
              AND r1.valid_from <= COALESCE(NULLIF(r2.valid_to, ''), '9999-12-31')
              AND r2.valid_from <= COALESCE(NULLIF(r1.valid_to, ''), '9999-12-31')
            RETURN s.name AS subject, o.name AS object,
                   r1.predicate AS predicate_a, r1.valid_from AS a_from, r1.valid_to AS a_to,
                   r2.predicate AS predicate_b, r2.valid_from AS b_from, r2.valid_to AS b_to
            """
        )
        contradictions = [dict(record) for record in result]
    driver.close()
    return contradictions


# --- CLI ---

@click.group("graph")
def graph_main():
    """Temporal knowledge graph operations (Neo4j)."""
    pass


@graph_main.command("add-episode")
@click.argument("text")
@click.option("--source", required=True)
def cli_add_episode(text: str, source: str):
    """Add an episode to the temporal graph."""
    result = add_episode(text, source)
    click.echo(json.dumps(result, indent=2))


@graph_main.command("add-fact")
@click.argument("subject")
@click.argument("predicate")
@click.argument("object_", metavar="OBJECT")
@click.option("--valid-from", default=None)
@click.option("--valid-to", default=None)
def cli_add_fact(subject: str, predicate: str, object_: str, valid_from: str, valid_to: str):
    """Add a fact triple to the temporal graph."""
    result = add_fact(subject, predicate, object_, valid_from, valid_to)
    click.echo(json.dumps(result, indent=2))


@graph_main.command("query")
@click.argument("topic")
@click.option("--as-of", default=None)
def cli_query(topic: str, as_of: str):
    """Query facts about a topic."""
    results = query_facts(topic, as_of)
    click.echo(json.dumps(results, indent=2))


@graph_main.command("timeline")
@click.argument("entity")
def cli_timeline(entity: str):
    """Get full timeline for an entity."""
    results = get_entity_timeline(entity)
    click.echo(json.dumps(results, indent=2))


@graph_main.command("contradictions")
def cli_contradictions():
    """Find contradicting facts in the graph."""
    results = find_contradictions()
    click.echo(json.dumps(results, indent=2))


def main():
    graph_main()
