.PHONY: build install test lint embed crawl status clean

build:
	cd server && cargo build --release

install:
	bash scripts/init.sh

test:
	cd server && cargo test
	cd python && uv run pytest -q

lint:
	cd python && uv run ruff check . && uv run ruff format --check .
	cd server && cargo clippy --all-targets -- -D warnings
	shellcheck hooks/*.sh scripts/*.sh

embed:
	cd python && uv run nlr-embed --recreate

crawl:
	@if [ -z "$(URL)" ]; then echo "Usage: make crawl URL=https://example.com"; exit 1; fi
	cd python && uv run nlr-crawl "$(URL)"

status:
	@echo "=== Rust server ==="
	@cd server && cargo check 2>&1 | tail -1
	@echo "=== Python package ==="
	@cd python && uv run nlr --help > /dev/null 2>&1 && echo "OK" || echo "FAIL: run 'cd python && uv sync'"
	@echo "=== Qdrant ==="
	@curl -sf http://localhost:6333/healthz > /dev/null 2>&1 && echo "OK" || echo "NOT RUNNING"
	@echo "=== Neo4j ==="
	@curl -sf http://localhost:7474 > /dev/null 2>&1 && echo "OK" || echo "NOT RUNNING"
	@echo "=== Hooks ==="
	@grep -q "auto-rag-inject" ~/.claude/settings.json 2>/dev/null && echo "OK" || echo "NOT REGISTERED: run 'make install'"
	@echo "=== Skills ==="
	@ls ~/.claude/skills/neuro-link/SKILL.md > /dev/null 2>&1 && echo "OK" || echo "NOT INSTALLED: run 'make install'"

clean:
	cd server && cargo clean
	rm -rf python/.venv python/__pycache__ python/*.egg-info
	find . -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name '*.pyc' -delete 2>/dev/null || true
