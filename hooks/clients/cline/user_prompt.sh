#!/usr/bin/env bash
# Cline UserPromptSubmit hook — forward prompt, inject RAG additionalContext if returned.
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../_lib/common.sh
. "${SCRIPT_DIR}/../_lib/common.sh"

input="$(cat)"
session_id="$(printf '%s' "$input" | python3 -c 'import sys,json
try: d=json.load(sys.stdin)
except: d={}
print(d.get("session_id","") or d.get("sessionId","") or "")' 2>/dev/null)"

response="$(printf '%s' "$input" | nlr_post_event "user_prompt" "cline" "$session_id" 2>/dev/null || echo "")"

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
print(json.dumps({"additionalContext": ctx}))
PY
fi
exit 0
