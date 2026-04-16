#!/usr/bin/env bash
# Forge-Code on_user_prompt hook — forward prompt, inject RAG context if available.
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../_lib/common.sh
. "${SCRIPT_DIR}/../_lib/common.sh"

input=""
if [[ ! -t 0 ]]; then
  input="$(cat)"
fi

if [[ -z "$input" ]]; then
  input="$(python3 - <<'PY'
import json, os
payload = {
    "prompt": os.environ.get("FORGE_USER_PROMPT", os.environ.get("FORGE_PROMPT","")),
    "session_id": os.environ.get("FORGE_SESSION_ID",""),
}
print(json.dumps(payload))
PY
)"
fi

session_id="$(printf '%s' "$input" | python3 -c 'import sys,json,os
try: d=json.load(sys.stdin)
except: d={}
print(d.get("session_id","") or os.environ.get("FORGE_SESSION_ID","") or "")' 2>/dev/null)"

response="$(printf '%s' "$input" | nlr_post_event "user_prompt" "forge-code" "$session_id" 2>/dev/null || echo "")"

if [[ -n "$response" ]]; then
  python3 - <<PY "$response"
import json, sys
raw = sys.argv[1] if len(sys.argv) > 1 else ""
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)
ctx = data.get("additionalContext")
if not ctx:
    sys.exit(0)
# Forge expects plain text on stdout to prepend to the prompt context.
print(ctx)
PY
fi
exit 0
