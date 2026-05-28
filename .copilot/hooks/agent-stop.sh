#!/usr/bin/env bash
# .copilot/hooks/agent-stop.sh
#
# Layer 3: Copilot agentStop hook — post-write lint cycle.
#
# After every agent turn, runs the full lint suite. If anything fails,
# returns a "block" decision with the lint output as the reason, forcing
# the agent to fix the violations before it can stop.
#
# Outputs JSON:
#   { "decision": "allow" }                           — lint passed, agent may stop
#   { "decision": "block", "reason": "..." }          — lint failed, fix and retry

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Run the shared lint script in JSON mode
RESULT=$(node "$REPO_ROOT/scripts/lint-all.js" --json 2>&1) || true

# Pipe result straight to stdout — the JSON already has decision + reason
printf '%s\n' "$RESULT"
