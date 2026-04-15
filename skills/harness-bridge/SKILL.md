---
name: harness-bridge
description: >
  Dispatches work between Claude Code, K-Dense, ForgeCode, Claw-Code, and other harnesses.
  Reads config/harness-harness-comms.md for routing rules. Sends structured JSON messages between
  harnesses. Monitors completion via neuro-scan. Use when the user says /harness-bridge, "delegate
  to K-Dense", "send to ForgeCode", "bridge task", "route this to", or when the harness-bridge-check
  hook detects a routing match.
metadata:
  openclaw:
    icon: "bridge_at_night"
    requires:
      bins: [python3]
      mcps: []
---

# /harness-bridge

Inter-harness task dispatcher. Routes work to the best available agent harness.

## Subcommands

| Command | Action |
|---------|--------|
| `/harness-bridge dispatch <task>` | Route a task to the best harness |
| `/harness-bridge send <harness> <task>` | Send task to a specific harness |
| `/harness-bridge status` | Show all harness connectivity and pending dispatches |
| `/harness-bridge log` | Show recent inter-harness communication log |
| `/harness-bridge test <harness>` | Test connectivity to a specific harness |

Default (no subcommand): show `status`.

## When to Use

- User says `/harness-bridge` or "delegate to K-Dense" / "send to ForgeCode" / "route this"
- Called by other skills when a task matches a delegation pattern
- Called by `self-improve-recursive` for consortium review requests
- When the `harness-bridge-check.sh` PreToolUse hook suggests delegation

## When NOT to Use

- For work that should stay in Claude Code — just do it directly
- For knowledge base operations — use neuro-link skills
- For background maintenance — use hyper-sleep
- When all non-claude-code harnesses are disabled

## Procedure

### Step 1 — Load harness configuration

1. Read `config/harness-harness-comms.md` frontmatter:
   - `bridge_mode`: mcp2cli | ngrok_api | direct
   - `harnesses`: map of harness definitions with status, role, capabilities
   - `routing_rules`: pattern-matching rules for automatic routing
2. Filter to active harnesses only (`status: active` or `status: disabled` but explicitly targeted)
3. Read pending dispatches from `state/harness-bridge-pending.jsonl` (if exists)

### Step 2 — Route task (for `dispatch`)

1. Extract task description from user input or calling skill
2. Match against `routing_rules` patterns (regex match against task description)
3. If multiple rules match: prefer the harness with the most specific match
4. If no rules match: default to `claude-code` (handle locally)
5. Check target harness status:
   - `active`: proceed to dispatch
   - `disabled`: warn user, offer to handle locally or queue for later
   - Not configured: error, suggest adding to config

Present routing decision:
```
harness-bridge routing
━━━━━━━━━━━━━━━━━━━━━
Task: [description]
Matched rule: [pattern]
Target harness: [name] (role: [role])
Bridge mode: [mcp2cli | ngrok_api | direct]
Capabilities: [list]

Proceed? [y/n]
```

### Step 3 — Format dispatch message

Build the structured JSON message per the protocol in config:

```json
{
  "from": "claude-code",
  "to": "k-dense-byok",
  "type": "task_dispatch",
  "id": "hb-20260415-001",
  "task": {
    "description": "Design an AutoML feature engineering pipeline for exchange order book data",
    "context_refs": [
      "04-KB-agents-workflows/automl.md",
      "02-KB-main/feature-engineering.md"
    ],
    "output_target": "07-neuro-link-task/automl-pipeline-design.md",
    "priority": 2,
    "timeout_hours": 24
  },
  "context": {
    "relevant_wiki_pages": ["list of pages matching task domain"],
    "relevant_ontologies": ["list of ontology files"],
    "recent_session_context": "summary of current session"
  },
  "timestamp": "2026-04-15T10:00:00Z"
}
```

### Step 4 — Execute dispatch

Based on `bridge_mode`:

**mcp2cli:**
1. Use `mcp2cli` to invoke the target harness's MCP server
2. Send the dispatch message as a tool call
3. Capture the response (synchronous or async based on harness type)

**direct (local process):**
1. For ForgeCode: `echo '<json>' | forge --json-input`
2. For Claw-Code: `echo '<json>' | claw --json-input`
3. Capture stdout as response

**ngrok_api (Phase 3):**
1. POST the dispatch message to the harness's ngrok URL
2. Response includes a job ID for async tracking
3. Poll or wait for webhook callback

### Step 5 — Track dispatch

Write to `state/harness-bridge-pending.jsonl`:
```json
{
  "id": "hb-20260415-001",
  "from": "claude-code",
  "to": "k-dense-byok",
  "task_summary": "AutoML pipeline design",
  "dispatched_at": "2026-04-15T10:00:00Z",
  "output_target": "07-neuro-link-task/automl-pipeline-design.md",
  "status": "dispatched",
  "timeout_at": "2026-04-16T10:00:00Z"
}
```

### Step 6 — Monitor completion

For pending dispatches:
1. Check if `output_target` file exists and has been written
2. Check if the target harness has sent a completion message
3. If timeout exceeded: mark as `status: timed_out`, create a remediation task

On completion:
1. Read the output from `output_target`
2. Validate output format (should be valid markdown with frontmatter)
3. Update pending entry: `status: completed`, `completed_at: timestamp`
4. If output is a task file: it enters the normal `07-neuro-link-task/` queue
5. If output is a wiki page or code doc: route to appropriate directory

### Step 7 — Handle `status` subcommand

```
harness-bridge status — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARNESSES
| Name | Role | Status | Capabilities | Last Contact |
|------|------|--------|-------------|--------------|
| claude-code | primary | active | all | now |
| k-dense-byok | research | disabled | sci_review, consortium | never |
| forgecode | impl | disabled | codegen, refactor | never |

PENDING DISPATCHES
| ID | To | Task | Dispatched | Status |
|----|----|----|-----------|--------|
[list from harness-bridge-pending.jsonl]

RECENT COMPLETIONS (last 7 days)
| ID | To | Task | Duration | Result |
|----|----|----|---------|--------|
```

### Step 8 — Handle `log` subcommand

Read and display `06-self-improvement-recursive/comms-log.jsonl` (shared with self-improve-recursive):
```
harness-bridge communication log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[timestamp] claude-code -> k-dense-byok: task_dispatch "AutoML pipeline design"
[timestamp] k-dense-byok -> claude-code: task_complete "AutoML pipeline design" (4.2h)
...
```

### Step 9 — Handle `test` subcommand

For the specified harness:
1. Send a ping message:
   ```json
   {"from": "claude-code", "to": "<harness>", "type": "ping", "timestamp": "..."}
   ```
2. Wait for pong response (5s timeout)
3. Report: latency, capabilities confirmed, version info

### Step 10 — Log all activity

Append every dispatch, completion, and error to `06-self-improvement-recursive/comms-log.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "from": "claude-code",
  "to": "k-dense-byok",
  "type": "task_dispatch",
  "id": "hb-20260415-001",
  "summary": "AutoML pipeline design",
  "status": "dispatched"
}
```

Append to `state/score_history.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "skill": "harness-bridge",
  "dispatches": 1,
  "completions": 0,
  "active_harnesses": 1
}
```
