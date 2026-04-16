#!/usr/bin/env bash
# Forge-Code session end hook.
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../_lib/common.sh
. "${SCRIPT_DIR}/../_lib/common.sh"

input=""
if [[ ! -t 0 ]]; then input="$(cat)"; fi
[[ -z "$input" ]] && input='{}'
session_id="$(printf '%s' "$input" | python3 -c 'import sys,json,os
try: d=json.load(sys.stdin)
except: d={}
print(d.get("session_id","") or os.environ.get("FORGE_SESSION_ID","") or "")' 2>/dev/null)"

(printf '%s' "$input" | nlr_post_event "session_end" "forge-code" "$session_id" >/dev/null 2>&1) &
disown 2>/dev/null || true
exit 0
