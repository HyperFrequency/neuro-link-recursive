#!/usr/bin/env bash
# neuro-link: external services only (Docker containers for Qdrant/Neo4j)
# For users who already have the binary built. Safe to re-run.
set -euo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { printf "${GREEN}[OK]${NC}   %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC} %s\n" "$1"; }
info() { printf "${CYAN}[INFO]${NC} %s\n" "$1"; }
step() { printf "\n${BOLD}=== %s ===${NC}\n" "$1"; }

# When sourced from install.sh, skip the header
FROM_INSTALL="${1:-}"

if [[ "$FROM_INSTALL" != "--from-install" ]]; then
  echo ""
  printf "${BOLD}neuro-link-recursive — External Services Setup${NC}\n"
  echo ""
fi

# ============================================================================
# Docker containers
# ============================================================================

DOCKER_AVAILABLE=false
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  DOCKER_AVAILABLE=true
elif command -v docker &>/dev/null; then
  info "Docker installed but not running. Starting Docker Desktop..."
  open -a Docker 2>/dev/null || true
  for i in $(seq 1 30); do
    if docker info &>/dev/null 2>&1; then
      ok "Docker Desktop started"
      DOCKER_AVAILABLE=true
      break
    fi
    sleep 2
  done
  if [ "$DOCKER_AVAILABLE" = "false" ]; then
    warn "Docker daemon didn't start in time."
  fi
fi

if [[ "$DOCKER_AVAILABLE" == "true" ]]; then

  # -- Qdrant --
  step "Qdrant Vector DB"

  QDRANT_RUNNING=$(docker ps --filter "ancestor=qdrant/qdrant" --format "{{.ID}}" 2>/dev/null || true)
  QDRANT_STOPPED=$(docker ps -a --filter "ancestor=qdrant/qdrant" --filter "status=exited" --format "{{.ID}}" 2>/dev/null || true)

  if [[ -n "$QDRANT_RUNNING" ]]; then
    ok "Qdrant already running (container: ${QDRANT_RUNNING:0:12})"
  elif [[ -n "$QDRANT_STOPPED" ]]; then
    info "Starting existing Qdrant container..."
    docker start "$QDRANT_STOPPED" >/dev/null
    ok "Qdrant restarted"
  else
    info "Starting Qdrant container..."
    docker run -d \
      --name qdrant-nlr \
      -p 6333:6333 \
      -v qdrant_nlr_storage:/qdrant/storage \
      --restart unless-stopped \
      qdrant/qdrant:latest >/dev/null
    ok "Qdrant started on localhost:6333"
  fi

  # Verify
  sleep 2
  if curl -sf http://localhost:6333/healthz &>/dev/null; then
    ok "Qdrant health check passed"
  else
    warn "Qdrant started but health check failed (may still be initializing)"
  fi

  # -- Neo4j (optional) --
  step "Neo4j Graph DB (optional)"

  NEO4J_RUNNING=$(docker ps --filter "ancestor=neo4j:5" --format "{{.ID}}" 2>/dev/null || true)
  NEO4J_STOPPED=$(docker ps -a --filter "ancestor=neo4j:5" --filter "status=exited" --format "{{.ID}}" 2>/dev/null || true)

  if [[ -n "$NEO4J_RUNNING" ]]; then
    ok "Neo4j already running (container: ${NEO4J_RUNNING:0:12})"
  elif [[ -n "$NEO4J_STOPPED" ]]; then
    info "Starting existing Neo4j container..."
    docker start "$NEO4J_STOPPED" >/dev/null
    ok "Neo4j restarted"
  else
    NLR_ROOT="${NLR_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
    # Read password from .env if available, otherwise use default
    NEO4J_PASS="neurolink1234"
    if [[ -f "${NLR_ROOT}/secrets/.env" ]]; then
      PASS_LINE=$(grep '^NEO4J_PASSWORD=' "${NLR_ROOT}/secrets/.env" 2>/dev/null || true)
      if [[ -n "$PASS_LINE" ]]; then
        EXTRACTED="${PASS_LINE#NEO4J_PASSWORD=}"
        [[ -n "$EXTRACTED" ]] && NEO4J_PASS="$EXTRACTED"
      fi
    fi

    printf "${CYAN}Start Neo4j container? (needed for Graphiti knowledge graphs) [y/N]: ${NC}"
    # Auto-yes when called from install.sh non-interactively
    if [[ "$FROM_INSTALL" == "--from-install" ]]; then
      REPLY="y"
      echo "y (auto)"
    else
      read -r REPLY
    fi

    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      docker run -d \
        --name neo4j-nlr \
        -p 7474:7474 \
        -p 7687:7687 \
        -e NEO4J_AUTH="neo4j/${NEO4J_PASS}" \
        -v neo4j_nlr_data:/data \
        --restart unless-stopped \
        neo4j:5 >/dev/null
      ok "Neo4j started on localhost:7474 (bolt://localhost:7687)"
      info "Neo4j browser: http://localhost:7474  user: neo4j  pass: ${NEO4J_PASS}"
    else
      warn "Neo4j skipped. Start it later with: docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/changeme -v neo4j_nlr_data:/data neo4j:5"
    fi
  fi

else
  if [[ "$FROM_INSTALL" != "--from-install" ]]; then
    warn "Docker not available. Install Docker Desktop to run Qdrant and Neo4j."
    warn "  https://docker.com/products/docker-desktop"
  fi
fi

# ============================================================================
# Summary (only when run standalone)
# ============================================================================

if [[ "$FROM_INSTALL" != "--from-install" ]]; then
  echo ""
  step "External Services Status"

  if curl -sf http://localhost:6333/healthz &>/dev/null; then
    ok "Qdrant: healthy"
  else
    warn "Qdrant: not reachable"
  fi

  if curl -sf http://localhost:7474 &>/dev/null; then
    ok "Neo4j: healthy"
  else
    warn "Neo4j: not reachable"
  fi

  if curl -sf http://localhost:8400/health &>/dev/null; then
    ok "Embedding server (llama.cpp): healthy"
  else
    warn "Embedding server: not running. Start with: ./scripts/embedding-server.sh"
  fi

  echo ""
fi
