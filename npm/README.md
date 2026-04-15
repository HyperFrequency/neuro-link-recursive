# neuro-link-recursive

Unified API harness communication, hybrid RAG & LLM-Wiki system — context, memory & behavior control plane for AI agent harnesses.

## Install

```bash
npm install -g neuro-link-recursive
```

Or run directly:

```bash
npx neuro-link-recursive status
```

## Quick Start

```bash
# Check system status
nlr status

# Ingest a source
nlr ingest https://example.com/article

# Scan for pending tasks
nlr scan

# Curate wiki from raw sources
nlr curate
```

## Available Commands

| Command | Description |
|---------|-------------|
| `status` | Show system health (Rust server, Python, Qdrant, Neo4j, hooks, skills) |
| `ingest` | Ingest a URL, repo, or file into 00-raw/ with SHA256 dedup |
| `scan` | Scan for pending tasks, stale pages, gaps, and failures |
| `curate` | Synthesize raw sources into wiki pages (Karpathy LLM-Wiki pattern) |
| `embed` | Rebuild vector embeddings |

## Binary Aliases

Both `nlr` and `neuro-link-recursive` are available after install.

## Development

If installed from the git repo, the shim will find the Cargo build output automatically:

```bash
cd server && cargo build --release
npx nlr status
```

## Documentation

Full docs: [github.com/HyperFrequency/neuro-link-recursive](https://github.com/HyperFrequency/neuro-link-recursive)
