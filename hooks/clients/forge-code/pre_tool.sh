#!/usr/bin/env bash
# Forge-Code on_before_tool hook — forward tool invocation metadata to neuro-link.
# Forge passes event data either as stdin JSON or via env vars (FORGE_EVENT_*).
# We read stdin if present, otherwise synthesize a payload from env.
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../_lib/common.sh
. "${SCRIPT_DIR}/../_lib/common.sh"

# Read stdin if available (non-blocking)
input=""
if [[ ! -t 0 ]]; then
  input="$(cat)"
fi

if [[ -z "$input" ]]; then
  # Synthesize payload from env vars Forge sets
  input="$(python3 - <<'PY'
import json, os
payload = {
    "tool_name": os.environ.get("FORGE_TOOL_NAME", os.environ.get("FORGE_TOOL","")),
    "tool_input": os.environ.get("FORGE_TOOL_INPUT",""),
    "session_id": os.environ.get("FORGE_SESSION_ID",""),
    "workspace": os.environ.get("FORGE_WORKSPACE",""),
}
print(json.dumps(payload))
PY
)"
fi

session_id="$(printf '%s' "$input" | python3 -c 'import sys,json,os
try: d=json.load(sys.stdin)
except: d={}
print(d.get("session_id","") or os.environ.get("FORGE_SESSION_ID","") or "")' 2>/dev/null)"

(printf '%s' "$input" | nlr_post_event "pre_tool" "forge-code" "$session_id" >/dev/null 2>&1) &
disown 2>/dev/null || true
exit 0
