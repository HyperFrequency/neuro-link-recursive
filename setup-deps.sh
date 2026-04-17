#!/usr/bin/env bash
# neuro-link-recursive — runtime dependency installer.
#
# Brings up everything the neuro-link runtime needs:
#   1. CLI deps:    Homebrew, Docker, jq, ngrok, ollama, llama.cpp
#   2. Containers:  qdrant, neo4j, obsidian-headless (via docker compose)
#   3. Embeddings:  qwen3-embedding (8b-fp16), snowflake-arctic-embed (335m)
#                   plus Octen-Embedding-8B GGUF for llama-server
#   4. Claude:      symlinks 16 skills + 5 hooks into ~/.claude/, registers MCP
#
# Idempotent — every step checks before doing. Safe to re-run.
#
# Usage:
#   ./setup-deps.sh                    # full setup
#   ./setup-deps.sh --from-install     # quiet mode (called by install.sh)
#   ./setup-deps.sh --skip-models      # skip model downloads
#   ./setup-deps.sh --skip-mcp         # skip Claude MCP registration
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

# --- Args ---
FROM_INSTALL=""
SKIP_MODELS=""
SKIP_MCP=""
for arg in "$@"; do
  case "$arg" in
    --from-install) FROM_INSTALL="1" ;;
    --skip-models)  SKIP_MODELS="1" ;;
    --skip-mcp)     SKIP_MCP="1" ;;
  esac
done

NLR_ROOT="${NLR_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
RUNTIME_ROOT="${HOME}/neuro-link"

if [[ -z "$FROM_INSTALL" ]]; then
  echo ""
  printf "${BOLD}neuro-link-recursive — runtime dependency setup${NC}\n"
  printf "  dev source : %s\n" "$NLR_ROOT"
  printf "  runtime    : %s\n" "$RUNTIME_ROOT"
  echo ""
fi

# ============================================================================
step "1/6  CLI dependencies (brew, docker, jq, ngrok, ollama, llama.cpp)"
# ============================================================================

# -- Homebrew --
if command -v brew &>/dev/null; then
  ok "Homebrew $(brew --version | head -1 | awk '{print $2}')"
else
  info "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
  ok "Homebrew installed"
fi

# -- jq (test-runtime.sh requires it) --
if command -v jq &>/dev/null; then
  ok "jq $(jq --version)"
else
  info "Installing jq..."
  brew install jq
  ok "jq installed"
fi

# -- Docker Desktop --
DOCKER_AVAILABLE=false
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  ok "Docker $(docker --version | awk '{print $3}' | tr -d ',') (running)"
  DOCKER_AVAILABLE=true
elif command -v docker &>/dev/null; then
  info "Docker installed but daemon not running — starting Docker Desktop..."
  open -a Docker 2>/dev/null || true
  for i in $(seq 1 30); do
    if docker info &>/dev/null 2>&1; then
      ok "Docker Desktop started"
      DOCKER_AVAILABLE=true
      break
    fi
    sleep 2
  done
  [[ "$DOCKER_AVAILABLE" == "false" ]] && warn "Docker daemon didn't start in 60s — containers will be skipped"
else
  info "Installing Docker Desktop via brew (cask)..."
  brew install --cask docker || warn "Docker install failed — install manually from https://docker.com"
  warn "Open Docker Desktop once to grant permissions, then re-run setup-deps.sh"
fi

# -- ngrok --
if command -v ngrok &>/dev/null; then
  ok "ngrok $(ngrok version 2>/dev/null | head -1)"
else
  info "Installing ngrok..."
  brew install ngrok 2>/dev/null || brew install --cask ngrok 2>/dev/null || \
    warn "ngrok install failed — get it at https://ngrok.com/download"
  command -v ngrok &>/dev/null && ok "ngrok installed"
fi

# -- ollama (local LLM + embedding runtime) --
if command -v ollama &>/dev/null; then
  ok "ollama $(ollama --version 2>/dev/null | head -1)"
else
  info "Installing ollama..."
  brew install ollama 2>/dev/null || brew install --cask ollama 2>/dev/null || \
    curl -fsSL https://ollama.com/install.sh | sh
  command -v ollama &>/dev/null && ok "ollama installed"
fi

# Make sure ollama daemon is reachable (macOS app or `ollama serve`)
if curl -sf http://localhost:11434/api/tags &>/dev/null; then
  ok "ollama daemon reachable on :11434"
else
  info "Starting ollama daemon..."
  if command -v ollama &>/dev/null; then
    nohup ollama serve >/tmp/ollama.log 2>&1 &
    sleep 3
    curl -sf http://localhost:11434/api/tags &>/dev/null && ok "ollama daemon started" \
      || warn "ollama daemon not reachable — start manually: ollama serve"
  fi
fi

# -- llama.cpp (Octen embedding host) --
if command -v llama-server &>/dev/null; then
  ok "llama.cpp (llama-server) installed"
else
  info "Installing llama.cpp via brew..."
  brew install llama.cpp 2>/dev/null || \
    warn "llama.cpp install failed — see https://github.com/ggerganov/llama.cpp"
  command -v llama-server &>/dev/null && ok "llama.cpp installed"
fi

# ============================================================================
step "2/6  Containers (qdrant, neo4j, obsidian-headless)"
# ============================================================================

if [[ "$DOCKER_AVAILABLE" != "true" ]]; then
  warn "Docker not available — skipping all containers"
else
  # Prefer docker-compose if present in the repo.
  if [[ -f "${NLR_ROOT}/docker-compose.yml" ]] && command -v docker &>/dev/null; then
    info "Bringing up containers via docker compose (qdrant, neo4j, obsidian-headless)..."
    # `--no-build` so we don't try to build the neuro-link Rust image here;
    # the binary is built separately in install.sh.
    (cd "$NLR_ROOT" && docker compose up -d qdrant neo4j obsidian-headless 2>&1 | tail -20) || \
      warn "docker compose up failed — falling back to per-container `docker run`"
  fi

  # ── Qdrant fallback ─────────────────────────────────────────────────────
  if ! curl -sf http://localhost:6333/healthz &>/dev/null; then
    QDRANT_RUNNING=$(docker ps --filter "ancestor=qdrant/qdrant" --format "{{.ID}}" 2>/dev/null || true)
    QDRANT_STOPPED=$(docker ps -a --filter "ancestor=qdrant/qdrant" --filter "status=exited" --format "{{.ID}}" 2>/dev/null || true)
    if [[ -n "$QDRANT_RUNNING" ]]; then
      ok "Qdrant already running"
    elif [[ -n "$QDRANT_STOPPED" ]]; then
      info "Starting existing Qdrant container..."
      docker start "$QDRANT_STOPPED" >/dev/null && ok "Qdrant restarted"
    else
      info "Starting Qdrant via docker run..."
      docker run -d --name qdrant-nlr -p 6333:6333 \
        -v qdrant_nlr_storage:/qdrant/storage \
        --restart unless-stopped qdrant/qdrant:latest >/dev/null
      ok "Qdrant started on :6333"
    fi
    sleep 2
  fi
  curl -sf http://localhost:6333/healthz &>/dev/null && ok "Qdrant healthy" || warn "Qdrant health check failed"

  # ── Neo4j fallback ──────────────────────────────────────────────────────
  if ! curl -sf http://localhost:7474 &>/dev/null; then
    NEO4J_RUNNING=$(docker ps --filter "ancestor=neo4j:5" --format "{{.ID}}" 2>/dev/null || true)
    NEO4J_STOPPED=$(docker ps -a --filter "ancestor=neo4j:5" --filter "status=exited" --format "{{.ID}}" 2>/dev/null || true)
    NEO4J_PASS="neurolink1234"
    if [[ -f "${NLR_ROOT}/secrets/.env" ]]; then
      EXTRACTED=$(grep '^NEO4J_PASSWORD=' "${NLR_ROOT}/secrets/.env" 2>/dev/null | cut -d= -f2-)
      [[ -n "$EXTRACTED" ]] && NEO4J_PASS="$EXTRACTED"
    fi
    if [[ -n "$NEO4J_RUNNING" ]]; then
      ok "Neo4j already running"
    elif [[ -n "$NEO4J_STOPPED" ]]; then
      info "Starting existing Neo4j container..."
      docker start "$NEO4J_STOPPED" >/dev/null && ok "Neo4j restarted"
    else
      info "Starting Neo4j via docker run..."
      docker run -d --name neo4j-nlr -p 7474:7474 -p 7687:7687 \
        -e NEO4J_AUTH="neo4j/${NEO4J_PASS}" \
        -v neo4j_nlr_data:/data \
        --restart unless-stopped neo4j:5 >/dev/null
      ok "Neo4j started on :7474 (bolt :7687)"
    fi
  fi
  curl -sf http://localhost:7474 &>/dev/null && ok "Neo4j healthy" || warn "Neo4j health check failed"

  # ── Obsidian headless (optional UI for the runtime vault) ──────────────
  OBS_RUNNING=$(docker ps --filter "name=obsidian-nlr" --format "{{.ID}}" 2>/dev/null || true)
  if [[ -n "$OBS_RUNNING" ]]; then
    ok "obsidian-headless already running on :8501"
  else
    info "obsidian-headless will be available at http://localhost:8501 after first compose up"
  fi
fi

# ============================================================================
step "3/6  Embedding models (ollama + Octen GGUF)"
# ============================================================================

if [[ -n "$SKIP_MODELS" ]]; then
  info "--skip-models set — skipping model pulls"
elif ! command -v ollama &>/dev/null; then
  warn "ollama not on PATH — skipping ollama model pulls"
else
  # Required: qwen3-embedding (primary 4096-dim) + snowflake-arctic-embed (lightweight reranker)
  for model in "qwen3-embedding:8b-fp16" "snowflake-arctic-embed:335m"; do
    if ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$model"; then
      ok "ollama model present: $model"
    else
      info "Pulling $model (this may take a while)..."
      ollama pull "$model" 2>&1 | tail -3 && ok "$model pulled" || warn "$model pull failed"
    fi
  done
fi

# Octen-Embedding-8B GGUF for llama-server
MODELS_DIR="$NLR_ROOT/models"
mkdir -p "$MODELS_DIR"
GGUF_F16="$MODELS_DIR/Octen-Embedding-8B.f16.gguf"
GGUF_Q8="$MODELS_DIR/Octen-Embedding-8B.Q8_0.gguf"
HF_REPO="mradermacher/Octen-Embedding-8B-GGUF"

if [[ -n "$SKIP_MODELS" ]]; then
  :
elif [[ -f "$GGUF_F16" ]]; then
  ok "Octen-Embedding-8B F16 GGUF present"
elif [[ -f "$GGUF_Q8" ]]; then
  ok "Octen-Embedding-8B Q8_0 GGUF present (near-lossless)"
else
  info "Downloading Octen-Embedding-8B GGUF (~16GB F16 / ~8GB Q8)..."
  if command -v huggingface-cli &>/dev/null; then
    huggingface-cli download "$HF_REPO" --include "*f16.gguf" \
      --local-dir "$MODELS_DIR" --local-dir-use-symlinks False 2>/dev/null || true
    FOUND=$(find "$MODELS_DIR" -name "*f16.gguf" -type f 2>/dev/null | head -1)
    [[ -n "$FOUND" && "$FOUND" != "$GGUF_F16" ]] && mv "$FOUND" "$GGUF_F16"
  fi
  if [[ ! -f "$GGUF_F16" ]]; then
    info "F16 unavailable, trying Q8_0..."
    curl -L -o "$GGUF_Q8" \
      "https://huggingface.co/${HF_REPO}/resolve/main/Octen-Embedding-8B.Q8_0.gguf" 2>/dev/null || true
  fi
  [[ -f "$GGUF_F16" ]] && ok "Octen F16 downloaded" || \
    [[ -f "$GGUF_Q8" ]] && ok "Octen Q8 downloaded" || \
    warn "Octen GGUF download failed — run scripts/embedding-server.sh later"
fi

# ============================================================================
step "4/6  Claude Code skills + hooks (16 skills, 5 hooks)"
# ============================================================================

CLAUDE_DIR="${HOME}/.claude"
SKILLS_DIR="${CLAUDE_DIR}/skills"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
mkdir -p "$SKILLS_DIR" "$HOOKS_DIR" "${CLAUDE_DIR}/state"

# All 16 skills under skills/
NLR_SKILLS=(
  auto-rag code-docs crawl-ingest harness-bridge hyper-sleep job-scanner
  knowledge-gap neuro-link neuro-link-setup neuro-scan neuro-surgery
  progress-report reasoning-ontology self-improve-hitl self-improve-recursive wiki-curate
)

for skill in "${NLR_SKILLS[@]}"; do
  src="${NLR_ROOT}/skills/${skill}/SKILL.md"
  dst="${SKILLS_DIR}/${skill}/SKILL.md"
  if [[ ! -f "$src" ]]; then
    warn "skill source missing: $skill"
    continue
  fi
  if [[ -L "$dst" && "$(readlink "$dst")" == "$src" ]]; then
    : # already linked correctly — silent
  else
    mkdir -p "$(dirname "$dst")"
    ln -sf "$src" "$dst"
  fi
done
ok "Symlinked ${#NLR_SKILLS[@]} skills to ${SKILLS_DIR}"

# All 5 hooks under hooks/*.sh
NLR_HOOKS=(
  auto-rag-inject.sh harness-bridge-check.sh neuro-grade.sh
  neuro-log-tool-use.sh neuro-task-check.sh
)
for hook in "${NLR_HOOKS[@]}"; do
  src="${NLR_ROOT}/hooks/${hook}"
  dst="${HOOKS_DIR}/${hook}"
  [[ -f "$src" ]] || { warn "hook source missing: $hook"; continue; }
  if [[ -L "$dst" && "$(readlink "$dst")" == "$src" ]]; then
    :
  else
    ln -sf "$src" "$dst"
    chmod +x "$src"
  fi
done
ok "Symlinked ${#NLR_HOOKS[@]} hooks to ${HOOKS_DIR}"

# Persist NLR_ROOT so installed hooks find the right tree
printf '%s' "$NLR_ROOT" > "${CLAUDE_DIR}/state/nlr_root"

# Register hooks in ~/.claude/settings.json (idempotent — handled by init.sh)
if [[ -f "${NLR_ROOT}/scripts/init.sh" ]]; then
  info "Running scripts/init.sh to register hooks in settings.json..."
  bash "${NLR_ROOT}/scripts/init.sh" 2>&1 | tail -5 || warn "init.sh had errors"
fi

# ============================================================================
step "5/6  Claude Code MCP registration"
# ============================================================================

if [[ -n "$SKIP_MCP" ]]; then
  info "--skip-mcp set — skipping MCP registration"
elif ! command -v claude &>/dev/null; then
  warn "claude CLI not on PATH — register MCP manually:"
  warn "  claude mcp add neuro-link-recursive -- neuro-link mcp"
else
  if claude mcp list 2>/dev/null | grep -q '^neuro-link-recursive'; then
    ok "MCP server 'neuro-link-recursive' already registered"
  else
    info "Registering MCP server with Claude Code..."
    claude mcp add neuro-link-recursive \
      --env "NLR_ROOT=$NLR_ROOT" \
      -- neuro-link mcp 2>&1 | tail -3 \
      && ok "MCP registered" \
      || warn "claude mcp add failed — register manually"
  fi
fi

# ============================================================================
step "6/6  Status"
# ============================================================================

if [[ -z "$FROM_INSTALL" ]]; then
  curl -sf http://localhost:6333/healthz &>/dev/null && ok "Qdrant: healthy" || warn "Qdrant: down"
  curl -sf http://localhost:7474 &>/dev/null         && ok "Neo4j: healthy" || warn "Neo4j: down"
  curl -sf http://localhost:11434/api/tags &>/dev/null && ok "Ollama: reachable" || warn "Ollama: down"
  curl -sf http://localhost:8400/health &>/dev/null && ok "llama-server: healthy" \
    || warn "llama-server: not running — start with: bash scripts/embedding-server.sh"
  curl -sf http://localhost:8501 &>/dev/null && ok "obsidian-headless: web UI up" \
    || info "obsidian-headless: not yet started (compose up to enable)"

  echo ""
  info "Next: NLR_API_TOKEN=\$(grep NLR_API_TOKEN secrets/.env | cut -d= -f2) ./test-runtime.sh"
fi
