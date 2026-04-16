#!/usr/bin/env bash
# neuro-link-recursive: full install from scratch on macOS
# Idempotent — safe to re-run. Checks before installing anything.
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

NLR_ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- Parse flags ---
MODE="local"  # local | cloud | hybrid
for arg in "$@"; do
  case "$arg" in
    --mode=local) MODE="local" ;;
    --mode=cloud) MODE="cloud" ;;
    --mode=hybrid) MODE="hybrid" ;;
    --mode) shift; MODE="${1:-local}" ;;
    --help|-h)
      echo "Usage: ./install.sh [--mode local|cloud|hybrid]"
      echo ""
      echo "  local  — run embeddings/Qdrant/Neo4j in Docker on this machine (default)"
      echo "  cloud  — skip Docker, prompt for cloud API keys (Voyage/OpenAI/Qdrant Cloud)"
      echo "  hybrid — per-service config (edit config/neuro-link.md after install)"
      exit 0
      ;;
  esac
done

SUMMARY_OK=()
SUMMARY_WARN=()
SUMMARY_FAIL=()

track_ok()   { SUMMARY_OK+=("$1"); }
track_warn() { SUMMARY_WARN+=("$1"); }
track_fail() { SUMMARY_FAIL+=("$1"); }

die() { fail "$1"; exit 1; }

# ============================================================================
step "1/9  System Tools"
# ============================================================================

# -- Homebrew --
if command -v brew &>/dev/null; then
  ok "Homebrew already installed"
  track_ok "Homebrew"
else
  info "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || die "Homebrew install failed"
  # Add to current session
  if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
  ok "Homebrew installed"
  track_ok "Homebrew"
fi

# -- Git --
if command -v git &>/dev/null; then
  ok "Git $(git --version | awk '{print $3}')"
  track_ok "Git"
else
  info "Installing git via brew..."
  brew install git
  ok "Git installed"
  track_ok "Git"
fi

# -- Rust toolchain --
if command -v rustc &>/dev/null; then
  ok "Rust $(rustc --version | awk '{print $2}')"
  track_ok "Rust"
else
  info "Installing Rust via rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
  ok "Rust installed ($(rustc --version | awk '{print $2}'))"
  track_ok "Rust"
fi
# Ensure cargo is on PATH for rest of script
[[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"

# -- Node.js 20+ --
if command -v node &>/dev/null; then
  NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
  if [[ "$NODE_MAJOR" -ge 20 ]]; then
    ok "Node.js $(node --version)"
    track_ok "Node.js"
  else
    warn "Node.js $(node --version) found but 20+ required. Upgrading..."
    brew install node@20 || brew upgrade node
    ok "Node.js upgraded"
    track_ok "Node.js"
  fi
else
  info "Installing Node.js via brew..."
  brew install node
  ok "Node.js $(node --version) installed"
  track_ok "Node.js"
fi

# ============================================================================
step "2/9  Build neuro-link Binary"
# ============================================================================

BINARY_PATH="${NLR_ROOT}/server/target/release/neuro-link"

if [[ -x "$BINARY_PATH" ]]; then
  ok "neuro-link binary already built"
  track_ok "neuro-link binary"
else
  info "Building neuro-link (cargo build --release)..."
  (cd "${NLR_ROOT}/server" && cargo build --release) || die "cargo build --release failed"
  ok "neuro-link binary built"
  track_ok "neuro-link binary"
fi

# ============================================================================
step "3/9  Build Obsidian Plugin"
# ============================================================================

PLUGIN_DIR="${NLR_ROOT}/obsidian-plugin"
if [[ -f "${PLUGIN_DIR}/main.js" && -f "${PLUGIN_DIR}/manifest.json" ]]; then
  ok "Obsidian plugin already built (main.js exists)"
  track_ok "Obsidian plugin build"
else
  info "Installing npm deps and building plugin..."
  (cd "$PLUGIN_DIR" && npm ci && npm run build) || die "Obsidian plugin build failed"
  ok "Obsidian plugin built"
  track_ok "Obsidian plugin build"
fi

# ============================================================================
step "4/9  External Services (mode: $MODE)"
# ============================================================================

if [[ "$MODE" == "cloud" ]]; then
  info "Cloud mode: skipping Docker + llama.cpp + Octen. Set cloud API keys in secrets/.env."
  track_ok "Cloud mode (services skipped)"
  info "Required cloud keys: OPENAI_API_KEY (embeddings), QDRANT_CLOUD_API_KEY, NEO4J_AURA_PASSWORD"
  # Still install ngrok since it's needed in all modes
  if command -v ngrok &>/dev/null; then
    ok "ngrok $(ngrok version 2>/dev/null | head -1)"
    track_ok "ngrok"
  else
    info "Installing ngrok..."
    brew install ngrok 2>/dev/null || brew install --cask ngrok 2>/dev/null || true
  fi
  # Skip to step 6
  # Write cloud mode to config
  if [[ -f "$NLR_ROOT/config/neuro-link.md" ]]; then
    # sed-compatible replacement
    if grep -q "^services_mode:" "$NLR_ROOT/config/neuro-link.md"; then
      sed -i.bak "s/^services_mode:.*/services_mode: cloud/" "$NLR_ROOT/config/neuro-link.md" && rm -f "$NLR_ROOT/config/neuro-link.md.bak"
    fi
  fi
  echo ""
  info "Skipping steps 4.1-4.3 (Docker-based services) in cloud mode"
fi

# -- Docker Desktop --
if [[ "$MODE" != "cloud" ]]; then
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  ok "Docker Desktop running"
  track_ok "Docker"
  DOCKER_AVAILABLE=true
elif command -v docker &>/dev/null; then
  info "Docker installed but daemon not running. Starting Docker Desktop..."
  open -a Docker 2>/dev/null || true
  # Wait up to 60s for daemon
  DOCKER_AVAILABLE=false
  for i in $(seq 1 30); do
    if docker info &>/dev/null 2>&1; then
      ok "Docker Desktop started"
      track_ok "Docker"
      DOCKER_AVAILABLE=true
      break
    fi
    sleep 2
  done
  if [ "$DOCKER_AVAILABLE" = "false" ]; then
    warn "Docker daemon didn't start in time. Containers will be skipped."
    track_warn "Docker (daemon timeout)"
  fi
else
  warn "Docker Desktop not installed. Install from https://docker.com/products/docker-desktop"
  warn "Qdrant and Neo4j containers will be skipped."
  track_warn "Docker (not installed)"
  DOCKER_AVAILABLE=false
fi

# -- ngrok --
if command -v ngrok &>/dev/null; then
  ok "ngrok $(ngrok version 2>/dev/null | head -1)"
  track_ok "ngrok"
else
  info "Installing ngrok via brew..."
  brew install ngrok 2>/dev/null || brew install --cask ngrok 2>/dev/null || {
    warn "ngrok install failed. Install manually: https://ngrok.com/download"
    track_warn "ngrok (install failed)"
  }
  if command -v ngrok &>/dev/null; then
    ok "ngrok installed"
    track_ok "ngrok"
  fi
fi

# -- llama.cpp (embedding server for Octen-Embedding-8B) --
if command -v llama-server &>/dev/null; then
  ok "llama.cpp (llama-server) installed"
  track_ok "llama.cpp"
else
  info "Installing llama.cpp via brew..."
  brew install llama.cpp 2>/dev/null || {
    warn "llama.cpp install failed. Install from https://github.com/ggerganov/llama.cpp"
    track_warn "llama.cpp (install failed)"
  }
  if command -v llama-server &>/dev/null; then
    ok "llama.cpp installed"
    track_ok "llama.cpp"
  fi
fi

# -- huggingface-cli (for model download) --
if command -v huggingface-cli &>/dev/null; then
  ok "huggingface-cli installed"
else
  info "Installing huggingface-cli..."
  pip3 install -q huggingface_hub 2>/dev/null || python3 -m pip install -q huggingface_hub 2>/dev/null || {
    warn "huggingface-cli install failed — will use direct download"
  }
fi

# -- Download Octen-Embedding-8B GGUF (F16 unquantized) --
MODELS_DIR="$NLR_ROOT/models"
mkdir -p "$MODELS_DIR"
GGUF_FILE="$MODELS_DIR/Octen-Embedding-8B.f16.gguf"
Q8_FILE="$MODELS_DIR/Octen-Embedding-8B.Q8_0.gguf"
HF_REPO="mradermacher/Octen-Embedding-8B-GGUF"

if [ -f "$GGUF_FILE" ]; then
  ok "Octen-Embedding-8B F16 GGUF already downloaded"
  track_ok "Octen-Embedding-8B model"
elif [ -f "$Q8_FILE" ]; then
  ok "Octen-Embedding-8B Q8_0 GGUF already downloaded (near-lossless)"
  track_ok "Octen-Embedding-8B model (Q8)"
else
  info "Downloading Octen-Embedding-8B GGUF (this is ~16GB for F16)..."
  if command -v huggingface-cli &>/dev/null; then
    huggingface-cli download "$HF_REPO" --include "*f16.gguf" \
      --local-dir "$MODELS_DIR" --local-dir-use-symlinks False 2>/dev/null || true
    # Find and rename the downloaded file
    FOUND=$(find "$MODELS_DIR" -name "*f16.gguf" -type f 2>/dev/null | head -1)
    if [ -n "$FOUND" ] && [ "$FOUND" != "$GGUF_FILE" ]; then
      mv "$FOUND" "$GGUF_FILE"
    fi
  fi
  if [ ! -f "$GGUF_FILE" ]; then
    info "F16 not found, trying Q8_0 (~8GB, near-lossless for embeddings)..."
    if command -v huggingface-cli &>/dev/null; then
      huggingface-cli download "$HF_REPO" --include "*Q8_0.gguf" \
        --local-dir "$MODELS_DIR" --local-dir-use-symlinks False 2>/dev/null || true
      FOUND=$(find "$MODELS_DIR" -name "*Q8_0.gguf" -type f 2>/dev/null | head -1)
      if [ -n "$FOUND" ] && [ "$FOUND" != "$Q8_FILE" ]; then
        mv "$FOUND" "$Q8_FILE"
      fi
    fi
  fi
  if [ -f "$GGUF_FILE" ]; then
    ok "Octen-Embedding-8B F16 downloaded"
    track_ok "Octen-Embedding-8B model"
  elif [ -f "$Q8_FILE" ]; then
    ok "Octen-Embedding-8B Q8_0 downloaded"
    track_ok "Octen-Embedding-8B model (Q8)"
  else
    warn "Model download failed. Run: ./scripts/embedding-server.sh (will auto-download)"
    track_warn "Octen-Embedding-8B model (download failed)"
  fi
fi

fi  # end of: if [[ "$MODE" != "cloud" ]]


# ============================================================================
step "5/9  Infrastructure (Docker Containers)"
# ============================================================================

if [[ "$MODE" != "cloud" ]]; then
  source "${NLR_ROOT}/setup-deps.sh" --from-install || true
else
  info "Skipped in cloud mode"
fi

# ============================================================================
step "6/9  Configuration"
# ============================================================================

# -- secrets/.env --
mkdir -p "${NLR_ROOT}/secrets"
if [[ -f "${NLR_ROOT}/secrets/.env" ]]; then
  ok "secrets/.env already exists"
else
  info "Creating secrets/.env from template..."
  if [[ -f "${NLR_ROOT}/secrets/.env.example" ]]; then
    cp "${NLR_ROOT}/secrets/.env.example" "${NLR_ROOT}/secrets/.env"
  else
    cat > "${NLR_ROOT}/secrets/.env" << 'ENVEOF'
# neuro-link-recursive secrets
# Fill in your keys. This file is .gitignored.

# Required
INFRANODUS_API_KEY=
FIRECRAWL_API_KEY=
CONTEXT7_API_KEY=
OPENROUTER_API_KEY=

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Embeddings
EMBEDDING_MODEL=Octen-8B
EMBEDDING_DIM=4096

# Harness Bridge
NGROK_AUTH_TOKEN=
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

# K-Dense
KDENSE_API_KEY=
KDENSE_URL=http://localhost:3000

# Cloud Compute
MODAL_TOKEN_ID=
MODAL_TOKEN_SECRET=

# Auto-generated
NLR_API_TOKEN=
ENVEOF
  fi
  ok "secrets/.env created (fill in your API keys)"
fi

# -- NLR_API_TOKEN --
if grep -q 'NLR_API_TOKEN=.\+' "${NLR_ROOT}/secrets/.env" 2>/dev/null; then
  ok "NLR_API_TOKEN already set"
else
  TOKEN=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))")
  if grep -q 'NLR_API_TOKEN=' "${NLR_ROOT}/secrets/.env"; then
    sed -i '' "s/^NLR_API_TOKEN=.*/NLR_API_TOKEN=${TOKEN}/" "${NLR_ROOT}/secrets/.env"
  else
    echo "NLR_API_TOKEN=${TOKEN}" >> "${NLR_ROOT}/secrets/.env"
  fi
  ok "NLR_API_TOKEN generated"
fi

# -- Persist NLR_ROOT --
mkdir -p "${HOME}/.claude/state"
printf '%s' "${NLR_ROOT}" > "${HOME}/.claude/state/nlr_root"
ok "NLR_ROOT persisted to ~/.claude/state/nlr_root"

# -- Run init.sh (directory structure, skills, hooks) --
info "Running neuro-link init (directory structure, skills, hooks)..."
bash "${NLR_ROOT}/scripts/init.sh" && ok "neuro-link init complete" || warn "init.sh had errors (run manually to debug)"

# ============================================================================
step "7/9  Symlink Binary to PATH"
# ============================================================================

SYMLINK_TARGET="/usr/local/bin/neuro-link"
CARGO_BIN="$HOME/.cargo/bin/neuro-link"

if command -v neuro-link &>/dev/null; then
  ok "neuro-link already on PATH ($(which neuro-link))"
  track_ok "neuro-link on PATH"
elif [[ -x "$BINARY_PATH" ]]; then
  # Try cargo bin first (no sudo needed)
  mkdir -p "$HOME/.cargo/bin"
  if ln -sf "$BINARY_PATH" "$CARGO_BIN" 2>/dev/null; then
    # Make sure cargo bin is on PATH
    if ! echo "$PATH" | grep -q "$HOME/.cargo/bin"; then
      ZSHRC="$HOME/.zshrc"
      if [[ -f "$ZSHRC" ]] && ! grep -q 'cargo/bin' "$ZSHRC"; then
        echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> "$ZSHRC"
        info "Added ~/.cargo/bin to PATH in .zshrc (restart shell or source ~/.zshrc)"
      fi
      export PATH="$HOME/.cargo/bin:$PATH"
    fi
    ok "neuro-link symlinked to ~/.cargo/bin/"
    track_ok "neuro-link on PATH"
  else
    # Fall back to /usr/local/bin (needs sudo)
    printf "${YELLOW}Symlink to /usr/local/bin requires sudo. Proceed? [y/N]: ${NC}"
    read -r REPLY
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      sudo ln -sf "$BINARY_PATH" "$SYMLINK_TARGET"
      ok "neuro-link symlinked to $SYMLINK_TARGET"
      track_ok "neuro-link on PATH"
    else
      warn "Skipped symlink. Add ${BINARY_PATH} to your PATH manually."
      track_warn "neuro-link not on PATH"
    fi
  fi
else
  fail "Binary not found at $BINARY_PATH"
  track_fail "neuro-link binary missing"
fi

# ============================================================================
step "8/9  Obsidian Plugin Installation"
# ============================================================================

PLUGIN_ID="neuro-link-recursive"
PLUGIN_FILES=("main.js" "manifest.json" "styles.css")
INSTALLED_VAULTS=()

# Detect Obsidian vaults
VAULT_SEARCH_DIRS=(
  "$HOME/Vaults"
  "$HOME/Documents"
  "$HOME/Desktop"
  "$HOME/obsidian"
  "$HOME/Obsidian"
  "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents"
)

FOUND_VAULTS=()
for search_dir in "${VAULT_SEARCH_DIRS[@]}"; do
  [[ -d "$search_dir" ]] || continue
  while IFS= read -r -d '' vault_dir; do
    FOUND_VAULTS+=("$(dirname "$vault_dir")")
  done < <(find "$search_dir" -maxdepth 3 -type d -name ".obsidian" -print0 2>/dev/null)
done

# Deduplicate (bash 3 compatible — no associative arrays)
UNIQUE_VAULTS=()
for v in "${FOUND_VAULTS[@]}"; do
  ALREADY=0
  for u in "${UNIQUE_VAULTS[@]+"${UNIQUE_VAULTS[@]}"}"; do
    if [[ "$u" == "$v" ]]; then ALREADY=1; break; fi
  done
  if [[ $ALREADY -eq 0 ]]; then
    UNIQUE_VAULTS+=("$v")
  fi
done

if [[ ${#UNIQUE_VAULTS[@]} -eq 0 ]]; then
  warn "No Obsidian vaults found. Copy plugin manually to <vault>/.obsidian/plugins/${PLUGIN_ID}/"
  track_warn "Obsidian plugin (no vaults found)"
else
  info "Found ${#UNIQUE_VAULTS[@]} Obsidian vault(s):"
  for i in "${!UNIQUE_VAULTS[@]}"; do
    echo "  [$((i+1))] ${UNIQUE_VAULTS[$i]}"
  done

  printf "${CYAN}Install plugin to all vaults? [Y/n/number]: ${NC}"
  read -r VAULT_CHOICE

  INSTALL_TARGETS=()
  if [[ -z "$VAULT_CHOICE" || "$VAULT_CHOICE" =~ ^[Yy]$ ]]; then
    INSTALL_TARGETS=("${UNIQUE_VAULTS[@]}")
  elif [[ "$VAULT_CHOICE" =~ ^[0-9]+$ ]] && [[ "$VAULT_CHOICE" -ge 1 ]] && [[ "$VAULT_CHOICE" -le ${#UNIQUE_VAULTS[@]} ]]; then
    INSTALL_TARGETS=("${UNIQUE_VAULTS[$((VAULT_CHOICE-1))]}")
  else
    warn "Skipping Obsidian plugin install."
    track_warn "Obsidian plugin (user skipped)"
  fi

  for vault in "${INSTALL_TARGETS[@]}"; do
    DEST="${vault}/.obsidian/plugins/${PLUGIN_ID}"
    mkdir -p "$DEST"
    COPIED=0
    for f in "${PLUGIN_FILES[@]}"; do
      SRC="${PLUGIN_DIR}/${f}"
      if [[ -f "$SRC" ]]; then
        cp "$SRC" "$DEST/"
        COPIED=$((COPIED + 1))
      fi
    done
    if [[ $COPIED -gt 0 ]]; then
      ok "Plugin installed to: ${vault}"
      INSTALLED_VAULTS+=("$vault")
    else
      warn "No plugin files found to copy for: ${vault}"
    fi
  done

  if [[ ${#INSTALLED_VAULTS[@]} -gt 0 ]]; then
    track_ok "Obsidian plugin"
    echo ""
    info "To enable the plugin in Obsidian:"
    echo "  1. Open Obsidian Settings > Community plugins"
    echo "  2. Toggle 'Restricted mode' OFF (if enabled)"
    echo "  3. Find 'Neuro-Link Recursive' in the list and enable it"
    echo "  4. Configure the plugin settings (API endpoint, vault path)"
  fi
fi

# ============================================================================
step "9/9  Verification"
# ============================================================================

echo ""

# neuro-link --version
if command -v neuro-link &>/dev/null; then
  VERSION_OUT=$(neuro-link --version 2>&1 || true)
  if [[ -n "$VERSION_OUT" ]]; then
    ok "neuro-link --version: $VERSION_OUT"
    track_ok "neuro-link --version"
  else
    warn "neuro-link found but --version returned nothing"
    track_warn "neuro-link --version"
  fi
elif [[ -x "$BINARY_PATH" ]]; then
  VERSION_OUT=$("$BINARY_PATH" --version 2>&1 || true)
  ok "neuro-link --version: ${VERSION_OUT:-binary exists at $BINARY_PATH}"
  track_ok "neuro-link binary"
else
  fail "neuro-link binary not found"
  track_fail "neuro-link binary"
fi

# neuro-link status
if command -v neuro-link &>/dev/null; then
  STATUS_OUT=$(neuro-link status 2>&1 || true)
  [[ -n "$STATUS_OUT" ]] && ok "neuro-link status: responded" || warn "neuro-link status: no output"
elif [[ -x "$BINARY_PATH" ]]; then
  STATUS_OUT=$("$BINARY_PATH" status 2>&1 || true)
  [[ -n "$STATUS_OUT" ]] && ok "neuro-link status: responded" || warn "neuro-link status: no output"
fi

# Qdrant health
if curl -sf http://localhost:6333/healthz &>/dev/null; then
  ok "Qdrant healthy (localhost:6333)"
  track_ok "Qdrant"
else
  warn "Qdrant not reachable at localhost:6333"
  track_warn "Qdrant"
fi

# Embedding model
if [ -f "$NLR_ROOT/models/Octen-Embedding-8B.f16.gguf" ]; then
  ok "Octen-Embedding-8B F16 GGUF ready"
  track_ok "Embedding model (F16)"
elif [ -f "$NLR_ROOT/models/Octen-Embedding-8B.Q8_0.gguf" ]; then
  ok "Octen-Embedding-8B Q8_0 GGUF ready"
  track_ok "Embedding model (Q8)"
else
  warn "No embedding model found in models/. Run: ./scripts/embedding-server.sh"
  track_warn "Embedding model"
fi

# llama.cpp
if command -v llama-server &>/dev/null; then
  ok "llama-server: $(llama-server --version 2>/dev/null | head -1 || echo 'installed')"
  track_ok "llama.cpp"
else
  warn "llama-server not found (brew install llama.cpp)"
  track_warn "llama.cpp"
fi

# ngrok
if command -v ngrok &>/dev/null; then
  ok "ngrok: $(ngrok version 2>/dev/null | head -1)"
  track_ok "ngrok verified"
else
  warn "ngrok not found"
  track_warn "ngrok"
fi

# Neo4j (optional)
if curl -sf http://localhost:7474 &>/dev/null; then
  ok "Neo4j healthy (localhost:7474)"
  track_ok "Neo4j"
else
  warn "Neo4j not reachable (optional)"
  track_warn "Neo4j"
fi

# ============================================================================
step "Summary"
# ============================================================================

echo ""
printf "${GREEN}${BOLD}Installed:${NC}\n"
for item in "${SUMMARY_OK[@]}"; do
  printf "  ${GREEN}+${NC} %s\n" "$item"
done

if [[ ${#SUMMARY_WARN[@]} -gt 0 ]]; then
  echo ""
  printf "${YELLOW}${BOLD}Warnings:${NC}\n"
  for item in "${SUMMARY_WARN[@]}"; do
    printf "  ${YELLOW}~${NC} %s\n" "$item"
  done
fi

if [[ ${#SUMMARY_FAIL[@]} -gt 0 ]]; then
  echo ""
  printf "${RED}${BOLD}Failed:${NC}\n"
  for item in "${SUMMARY_FAIL[@]}"; do
    printf "  ${RED}x${NC} %s\n" "$item"
  done
fi

echo ""
info "Config: edit ${NLR_ROOT}/secrets/.env with your API keys"
info "Docs:   see INSTALL.md and SETUP.md for full reference"
info "Next:   run 'neuro-link status' to verify all components"
echo ""
